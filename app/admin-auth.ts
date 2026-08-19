import { cookies } from "next/headers";
import { getDb } from "../db";
import { adminSettings } from "../db/schema";

const COOKIE = "lachger_admin";
const PASSWORD_VERSION = "5";

export async function digest(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function passwordVersion() {
  return PASSWORD_VERSION;
}

async function initialPasswordHash() {
  const initial = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initial) {
    throw new Error(
      "ADMIN_INITIAL_PASSWORD manquant. Définissez cette variable d'environnement (mot de passe admin de premier démarrage) sur Netlify, puis changez-le depuis l'espace admin."
    );
  }
  return digest(`password:${initial}`);
}

async function configuredHash() {
  try {
    const db = await getDb();
    const rows = await db.select().from(adminSettings);
    const savedHash = rows.find(row => row.key === "password_hash");
    const savedVersion = rows.find(row => row.key === "password_version");
    if (savedHash && savedVersion?.value === passwordVersion()) return savedHash.value;
  } catch {
    // DB not reachable yet (e.g. first boot) — fall back to the initial password.
  }
  return initialPasswordHash();
}

async function sessionToken() {
  return digest(`session:${await configuredHash()}`);
}

export async function verifyAdminPassword(password: string) {
  const clean = password.trim();
  return (await digest(`password:${clean}`)) === (await configuredHash());
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === (await sessionToken());
}

export async function setAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE, await sessionToken(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
}

export async function changeAdminPassword(newPassword: string) {
  const db = await getDb();
  const value = await digest(`password:${newPassword}`);
  const updatedAt = new Date().toISOString();
  await db.insert(adminSettings).values({ key: "password_hash", value })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value, updatedAt } });
  await db.insert(adminSettings).values({ key: "password_version", value: passwordVersion() })
    .onConflictDoUpdate({ target: adminSettings.key, set: { value: passwordVersion(), updatedAt } });
  await setAdminSession();
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
