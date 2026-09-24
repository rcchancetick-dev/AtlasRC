# AtlasRC

Bibliothèque React + TypeScript + Tailwind CSS + composants shadcn-style (Button basé sur Radix/variants) + Framer Motion, alimentée par Telegram et Supabase.

## Installation

1. `npm install` puis `cp .env.example .env.local` et renseigner `VITE_SUPABASE_URL` ainsi que `VITE_SUPABASE_ANON_KEY` (clé publishable/anon uniquement).
2. `npm run dev`. Pour Vercel, importer le dépôt, choisir Vite, déclarer les deux variables `VITE_...`, et déployer. La réécriture SPA est dans `vercel.json`.
3. Créer un projet Supabase et exécuter `supabase/migrations/20260924000000_init.sql` dans SQL Editor, ou utiliser `supabase db push` après `supabase link --project-ref PROJECT_REF`. Cela crée `posts`, le bucket public `content`, les policies et la publication Realtime.
4. Dans Supabase Auth, créer le compte de l'administrateur, relever son UUID, puis dans SQL Editor : `insert into public.admins(user_id) values ('UUID_DU_COMPTE');`. L'espace `/admin` est protégé par Auth ET par RLS, pas par un simple mot de passe client. Les admin authentifiés peuvent modifier/masquer/supprimer, le service role reçoit les publications Telegram.
5. Ajouter le bot comme administrateur de la chaîne `@AtlasRC_canal`. Créer un secret aléatoire (lettres, chiffres, `_` ou `-`) et utiliser le même pour le webhook et `WEBHOOK_SECRET`. Dans un fichier local non versionné, définir `TELEGRAM_CHANNEL_TOKEN`, `WEBHOOK_SECRET`, `ADMIN_IDS` (IDs numériques séparés par des virgules) et `TELEGRAM_CHANNEL_ID` (ID numérique de la chaîne, souvent négatif). Appliquer avec `supabase secrets set --env-file supabase/.env.production`. Ne jamais committer le fichier ou divulguer le token du bot / service role.
6. `supabase functions deploy telegram-webhook --no-verify-jwt`. Telegram n'envoie pas de JWT Supabase ; la fonction exige le header secret. Pour enregistrer le webhook (remplacer les valeurs dans votre terminal local, ne pas committer la commande renseignée) :

```bash
curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_CHANNEL_TOKEN}/setWebhook" -H 'Content-Type: application/json' -d "{\"url\":\"https://PROJECT_REF.supabase.co/functions/v1/telegram-webhook\",\"secret_token\":\"${WEBHOOK_SECRET}\",\"allowed_updates\":[\"channel_post\",\"edited_channel_post\",\"message\"]}"
```

`ADMIN_IDS` contrôle les commandes privées `/delete ID_DU_MESSAGE_DE_LA_CHAINE`. Un post de chaîne anonyme ne fournit généralement **pas** le vrai user ID de son auteur : la fonction ne peut pas appliquer `ADMIN_IDS` à ces messages, et n'accepte donc que les publications de `TELEGRAM_CHANNEL_ID` avec le header secret. Limitez les administrateurs autorisés à publier dans la chaîne. Telegram n'envoie pas de notification standard quand un post de chaîne est supprimé directement : utilisez `/delete ID` en message privé au bot ou l'admin du site. Les modifications de posts arrivent via `edited_channel_post`. Une suppression de ligne admin suivie d'une rediffusion Telegram peut recréer le post.

**Limites** : l'API Bot Telegram hébergée limite `getFile` à 20 Mo ; les fichiers plus gros exigent une autre stratégie (Bot API local / hébergement adapté). Les vidéos se lisent en streaming si le format navigateur le permet ; les PDF s'affichent via iframe, l'audio via lecteur natif (pas de waveform), et le texte est rendu en texte brut pour éviter les injections. Le site est une SPA : les balises Open Graph propres à chaque contenu nécessitent un rendu serveur ou une fonction de génération de métadonnées en complément. Le bouton Telegram pointe vers la chaîne `https://t.me/AtlasRC_canal`, pas vers le bot (son nom n'a pas été fourni). Les contenus antérieurs à l'installation du webhook ne sont pas importés automatiquement.
