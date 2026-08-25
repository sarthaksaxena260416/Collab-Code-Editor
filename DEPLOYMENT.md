# Deploying Collab Code Editor without Railway

This app is split into two deployments:

- `client`: Next.js frontend on Vercel
- `server`: Express and Socket.IO API on Render

## 1. Create a Postgres database

Create a free Postgres project with Neon, then copy its pooled connection string.
It must be available as `DATABASE_URL` in the Render server environment.

## 2. Deploy the backend on Render

1. In Render, select **New +** → **Blueprint** and connect the GitHub repository.
2. Select `render.yaml`; this creates the server from the `server` directory.
3. Set `DATABASE_URL` to the Neon connection string.
4. Deploy. Render runs the Prisma migrations during startup.
5. Copy the public backend URL, such as `https://collab-code-editor-server.onrender.com`.

Optionally set `CLIENT_ORIGIN` to the final Vercel URL. The server also permits Vercel preview and production domains.

## 3. Deploy the frontend on Vercel

1. Import the same GitHub repository in Vercel.
2. Set **Root Directory** to `client`.
3. Add these environment variables:
   - `NEXT_PUBLIC_SOCKET_URL`: the Render backend URL from step 2 (no trailing slash)
   - `NEXTAUTH_URL`: your Vercel production URL
   - `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`: copy their existing values from the old frontend deployment.
4. Deploy and then update the Google OAuth authorised redirect URI to:
   `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google`

After deployment, open the backend URL first; it should respond with `Server is running ✅`. Then open the Vercel URL and create a room to verify API and Socket.IO connectivity.
