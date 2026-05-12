# Configuration Google OAuth pour PostureAtWork

## 1. Google Cloud Console

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet "PostureAtWork" ou utiliser l'existant
3. Activer "Google+ API" et "Google Identity"
4. Aller dans "Identifiants" → "Créer des identifiants" → "ID client OAuth"
5. Type : Application Web
6. Origines autorisées :
   - http://localhost:3000
   - https://posture-at-work.vercel.app
7. URI de redirection autorisés :
   - http://localhost:3000/auth/callback
   - https://posture-at-work.vercel.app/auth/callback
   - https://[ton-projet].supabase.co/auth/v1/callback
8. Copier Client ID et Client Secret

## 2. Supabase Dashboard

1. Authentication → Providers → Google
2. Activer Google
3. Coller Client ID et Client Secret
4. Redirect URL à utiliser : `https://[ton-projet].supabase.co/auth/v1/callback`

## 3. Variables d'environnement (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://[ton-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ta-clé-anon]
NEXT_PUBLIC_APP_URL=https://posture-at-work.vercel.app
```

## 4. Vercel

Ajouter les mêmes variables dans Settings → Environment Variables du projet Vercel.
