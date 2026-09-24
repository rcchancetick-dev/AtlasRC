# AtlasRC — guide simple

Le site affiche uniquement les publications **avec fichier** de la chaîne [@AtlasRC_canal](https://t.me/AtlasRC_canal) : documents (PDF, Word, ZIP…), images, vidéos et audios. Une légende sert de titre/description, mais un message texte seul n'apparaît pas sur le site. Les visiteurs peuvent ouvrir la fiche ou télécharger directement le fichier. Les anciens messages texte restent enregistrés dans Supabase, mais sont masqués sur le site.

Il faut relier **3 choses** : Telegram (où tu publies), Supabase (qui garde les fichiers et les informations) et le site (que les visiteurs consultent).

> **Important :** le code présent sur GitHub n'est pas encore un site en ligne. Le simple lien de la chaîne ne synchronise rien : il faut configurer un **bot Telegram** et son **webhook**. Un webhook est simplement une adresse à laquelle Telegram envoie les nouveaux messages. Ne m'envoie jamais ton token de bot, ton secret de webhook, ni la clé secrète Supabase.

## 1. Préparer Supabase

1. Crée un projet sur [Supabase](https://supabase.com/dashboard). Note son **Project ref** (identifiant du projet, visible dans son adresse). Tu l'utiliseras à la place de `PROJECT_REF` dans les commandes ci-dessous.
2. Dans le dépôt GitHub, ouvre [`supabase/migrations/20260924000000_init.sql`](supabase/migrations/20260924000000_init.sql), copie tout le contenu. Dans Supabase, ouvre **SQL Editor → New query**, colle le texte et clique sur **Run**. Cela crée la table `posts`, l'espace public `content` pour les fichiers et la mise à jour en direct.
3. Dans Supabase, ouvre **Project Settings → API Keys** (ou **Connect**). Récupère l'**URL du projet** et la **clé publique / publishable**. Garde-les pour l'étape 5. N'utilise pas la clé secrète dans le site.

## 2. Créer le bot Telegram

1. Dans Telegram, ouvre [@BotFather](https://t.me/BotFather), envoie `/newbot` et suis les instructions pour choisir un nom et un identifiant se terminant par `bot`.
2. BotFather te donnera un **token** : conserve-le en privé. Son nom dans ce guide est `TELEGRAM_CHANNEL_TOKEN`. Le bouton « Rejoindre sur Telegram » du site mène à **la chaîne**, pas au bot.
3. Dans les paramètres de ta chaîne `@AtlasRC_canal`, ajoute ce bot comme **administrateur**. Publie ensuite un nouveau message dans la chaîne pour tester ; les anciennes publications ne seront pas récupérées automatiquement.
4. Pour obtenir l'identifiant numérique de la chaîne, utilise le token uniquement dans ton terminal personnel (ne colle pas l'URL avec le token dans une conversation ou une capture) :

```bash
curl -sS --get "https://api.telegram.org/bot${TELEGRAM_CHANNEL_TOKEN}/getChat" --data-urlencode 'chat_id=@AtlasRC_canal'
```

Dans la réponse, relève le nombre sous `result.id` (généralement négatif) : c'est `TELEGRAM_CHANNEL_ID`. Si `${TELEGRAM_CHANNEL_TOKEN}` est vide, définis d'abord cette variable dans ton terminal avec ton token, sans le publier.

Pour obtenir ton propre `ADMIN_IDS`, envoie `/start` en **message privé** à ton bot **avant** d'activer le webhook, puis utilise la commande suivante dans le terminal :

```bash
curl -sS "https://api.telegram.org/bot${TELEGRAM_CHANNEL_TOKEN}/getUpdates"
```

Dans le résultat, cherche `message.from.id` de ton message privé (pas `chat.id` de la chaîne). Si le résultat est vide, renvoie `/start` ou vérifie qu'aucun webhook n'est déjà actif : `getUpdates` ne fonctionne pas quand un webhook est actif. Ne partage pas la sortie complète : elle peut contenir des messages privés.

## 3. Activer la fonction Telegram → Supabase

Il te faut un ordinateur avec un terminal, Node.js et un accès à ton compte Supabase. Dans le terminal, télécharge le dépôt et place-toi dedans :

```bash
git clone https://github.com/rcchancetick-dev/AtlasRC.git
cd AtlasRC
npx supabase login
npx supabase link --project-ref PROJECT_REF
```

Crée un **secret de webhook** aléatoire de 32 caractères environ avec seulement des lettres, chiffres, `_` et `-`. Note-le en privé : tu devras saisir **exactement le même** dans Supabase et dans `setWebhook`.

Dans Supabase, ouvre **Edge Functions → Secrets** et ajoute ces quatre paires de nom/valeur, une par une (bouton **Save**) :

| Nom à saisir | Valeur à saisir |
| --- | --- |
| `TELEGRAM_CHANNEL_TOKEN` | Le token envoyé par BotFather |
| `WEBHOOK_SECRET` | Ton secret aléatoire personnel |
| `TELEGRAM_CHANNEL_ID` | Le nombre `result.id` obtenu avec `getChat` |
| `ADMIN_IDS` | Ton nombre `message.from.id` obtenu en privé ; plusieurs IDs séparés par des virgules |

**Ne mets aucun de ces quatre secrets dans GitHub, Vercel, `.env.local` du site ou une variable `VITE_`.** `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont normalement injectés automatiquement dans la fonction par Supabase : ne mets jamais la seconde dans le navigateur.

Toujours depuis le dossier `AtlasRC` dans ton terminal, lance :

```bash
npx supabase functions deploy telegram-webhook --no-verify-jwt
```

Telegram ne possède pas de connexion Supabase et ne peut pas fournir un JWT Supabase. C'est pour cela que la fonction accepte les requêtes sans JWT **mais vérifie elle-même le secret Telegram**. Vérifie dans Supabase que la fonction `telegram-webhook` apparaît comme déployée.

## 4. Brancher le webhook

Dans ton terminal personnel, vérifie que les variables `TELEGRAM_CHANNEL_TOKEN` et `WEBHOOK_SECRET` contiennent les **mêmes valeurs** que dans Supabase. Remplace `PROJECT_REF` par l'identifiant du projet dans la commande suivante, puis exécute-la sans publier la commande renseignée ni la réponse si elle contient des informations privées :

```bash
curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_CHANNEL_TOKEN}/setWebhook" \
  --data-urlencode "url=https://PROJECT_REF.supabase.co/functions/v1/telegram-webhook" \
  --data-urlencode "secret_token=${WEBHOOK_SECRET}" \
  --data-urlencode 'allowed_updates=["channel_post","edited_channel_post","message"]'
```

Une réponse avec `"ok":true` signifie que Telegram a enregistré l'adresse. Pour vérifier ensuite la connexion :

```bash
curl -sS "https://api.telegram.org/bot${TELEGRAM_CHANNEL_TOKEN}/getWebhookInfo"
```

Contrôle `result.url` et, si besoin, `result.last_error_message`. **Ne partage pas ces sorties brutes** si elles comportent des données sensibles. Publie un nouveau petit fichier de test dans la chaîne, puis regarde **Table Editor → posts** dans Supabase : une nouvelle ligne doit apparaître. Si oui, la connexion Telegram → Supabase fonctionne.

> Si tu as déployé la fonction depuis le Dashboard sous un autre nom (par exemple `bright-handler`), le webhook doit pointer vers l'**URL exacte affichée dans Supabase**, et non obligatoirement vers `/telegram-webhook`. Modifier GitHub ne redéploie pas cette fonction Dashboard : copie le nouveau code depuis [`supabase/functions/telegram-webhook/index.ts`](supabase/functions/telegram-webhook/index.ts) dans **Edge Functions → bright-handler → Code**, puis clique **Deploy updates**. Ne change ni les secrets ni l'URL du webhook si `bright-handler` reste son nom.

## 5. Mettre le site en ligne

Sur [Vercel](https://vercel.com), importe le dépôt `rcchancetick-dev/AtlasRC`. Ajoute ces deux variables d'environnement dans les réglages du projet Vercel, avec les valeurs de l'étape 1 :

```text
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=TA_CLE_PUBLIQUE
```

Déploie le site puis ouvre l'accueil et la bibliothèque. Le lien Telegram du bouton est déjà configuré vers [@AtlasRC_canal](https://t.me/AtlasRC_canal). Pour tester sur ton ordinateur plutôt que Vercel : `npm install`, copie `.env.example` vers `.env.local`, remplis **uniquement** ces deux variables publiques et lance `npm run dev`. Ne publie pas `.env.local`.

## 6. Créer ton compte administrateur

Dans Supabase, ouvre **Authentication → Users** et crée un utilisateur avec ton e-mail et un mot de passe. Copie l'**UUID** de ce compte (ce n'est pas ton ID Telegram). Dans **SQL Editor**, remplace `UUID_DU_COMPTE` puis exécute :

```sql
insert into public.admins(user_id) values ('UUID_DU_COMPTE');
```

Ouvre ensuite `/admin` sur ton site et connecte-toi avec cet e-mail et ce mot de passe. Seuls les comptes présents dans `admins` peuvent modifier, masquer ou supprimer des contenus ; Telegram envoie les nouvelles publications via la fonction. Si le formulaire refuse ta connexion, vérifie que l'utilisateur est bien créé et confirmé dans Supabase Auth.

## À savoir avant de commencer

- Une publication **modifiée** dans la chaîne peut mettre à jour sa fiche sur le site. Une publication **supprimée directement** dans Telegram n'envoie pas d'événement de suppression classique au bot : supprime-la dans `/admin`, ou envoie au bot en privé `/delete ID_DU_MESSAGE_DE_LA_CHAINE`.
- Pour retrouver cet ID sur une chaîne publique, le lien d'un post se termine habituellement par son numéro : `t.me/AtlasRC_canal/123` → `/delete 123`. Seuls les IDs personnels listés dans `ADMIN_IDS` peuvent utiliser cette commande privée.
- Telegram n'indique souvent **pas l'identité réelle** de la personne qui publie au nom d'une chaîne. La fonction vérifie donc le secret Telegram et l'ID de **cette** chaîne, mais ne peut pas comparer chaque auteur de publication à `ADMIN_IDS` : limite les droits de publication des administrateurs de la chaîne. `ADMIN_IDS` s'applique aux commandes privées.
- La limite de téléchargement de `getFile` sur l'API Telegram hébergée est de **20 Mo**. Au-delà, cette version ne peut pas importer le fichier et il faut prévoir une autre solution.
- Cette version lit les PDF, vidéos, audios et textes sur le site ; l'audio n'a pas encore de waveform. Elle ne génère pas encore d'aperçu Open Graph propre à chaque fiche pour Telegram et WhatsApp. L'importation rétroactive des anciens posts n'est pas prévue.
- Si le test Telegram n'ajoute rien à `posts`, vérifie dans cet ordre : présence du bot dans la chaîne, `TELEGRAM_CHANNEL_ID`, secrets, statut de la fonction dans Supabase, réponse de `getWebhookInfo`, puis journaux de la fonction dans **Edge Functions → Logs**.
