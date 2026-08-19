# Déployer Lachger Car sur Netlify + Supabase

Ce projet utilisait Cloudflare (D1 + R2 + Workers). Il a été adapté pour
tourner en Next.js standard, avec Supabase comme base de données et comme
stockage de photos.

## 1. Créer le projet Supabase
1. Sur supabase.com, créez un nouveau projet.
2. Allez dans **SQL Editor**, collez le contenu de `supabase.sql` et exécutez-le.
   Cela crée les tables `cars`, `reservations`, `admin_settings`, et rend le
   bucket `car-photos` public.
3. Récupérez :
   - **Project Settings > Database > Connection string > Transaction pooler** → `DATABASE_URL`
   - **Project Settings > API > Project URL** → `SUPABASE_URL`
   - **Project Settings > API > service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (secrète, jamais côté client)

## 2. Pousser le code sur GitHub
Créez un repo et poussez ce dossier (le mot de passe admin n'est plus dans le
code, donc pas de souci à le rendre public si besoin).

## 3. Créer le site sur Netlify
1. **Add new site > Import an existing project**, choisissez le repo.
2. Netlify détecte Next.js automatiquement (le plugin `@netlify/plugin-nextjs`
   est déjà déclaré dans `netlify.toml`).
3. Dans **Site settings > Environment variables**, ajoutez (voir `.env.example`) :
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_INITIAL_PASSWORD` — mot de passe de premier démarrage, choisissez-en un fort
   - `RESEND_API_KEY` et `MAIL_FROM` (optionnel, pour les e-mails de confirmation)
4. Déployez.

## 4. Premier accès admin
Connectez-vous sur `/admin` avec `ADMIN_INITIAL_PASSWORD`, puis changez-le
immédiatement depuis le panneau admin (Paramètres du compte). Une fois changé,
la variable d'environnement n'est plus utilisée pour se connecter.

## Ce qui a changé par rapport à la version Cloudflare
- Base de données : D1 (SQLite) → **Supabase Postgres** (`db/index.ts`, `db/schema.ts`)
- Photos : R2 → **Supabase Storage**, bucket public `car-photos`
  (`app/api/uploads/route.ts` et `app/api/uploads/[...key]/route.ts`)
- Build : suppression de `vinext`, `wrangler`, `@cloudflare/vite-plugin` —
  c'est maintenant un projet Next.js standard (`next dev` / `next build` / `next start`)
- **Sécurité** : l'ancien code contenait un mot de passe admin de secours en
  clair dans le fichier source (`Lachger2026`), qui fonctionnait même après
  changement du mot de passe. C'était une porte dérobée permanente si le code
  finissait sur un repo public. Il a été remplacé par la variable
  `ADMIN_INITIAL_PASSWORD`, utilisée une seule fois au premier démarrage.
