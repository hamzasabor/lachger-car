import { isAdminAuthenticated } from "../../admin-auth";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "car-photos";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans les variables d'environnement.");
  }
  return createClient(url, key);
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("photos").filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) return Response.json({ error: "Aucune photo sélectionnée" }, { status: 400 });

  const supabase = supabaseAdmin();
  const urls: string[] = [];
  for (const file of files.slice(0, 12)) {
    if (!file.type.startsWith("image/")) continue;
    if (file.size > 8_000_000) return Response.json({ error: `${file.name} dépasse 8 Mo` }, { status: 400 });
    const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const key = `cars/${filename}`;
    const { error } = await supabase.storage.from(BUCKET).upload(key, await file.arrayBuffer(), { contentType: file.type });
    if (error) return Response.json({ error: "Échec de l'upload : " + error.message }, { status: 500 });
    urls.push(`/api/uploads/cars/${filename}`);
  }
  if (!urls.length) return Response.json({ error: "Format de photo non accepté" }, { status: 400 });
  return Response.json({ urls });
}
