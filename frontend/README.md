# Cliprol frontend

The frontend is a React, TypeScript, and Vite application. Run it alongside the
backend described in [backend/README.md](../backend/README.md).

## Configure Supabase and the backend

Create `frontend/.env` with the public Supabase project URL and publishable key:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
VITE_API_BASE_URL=http://127.0.0.1:8000
```

`VITE_API_BASE_URL` is optional when the backend is available at
`http://127.0.0.1:8000`. Only use a Supabase publishable/anon key in frontend
configuration; never put a service-role or secret key in a `VITE_` variable.

In Supabase Auth, allow the frontend URL (for local development,
`http://localhost:5173/login`) as a redirect URL. Google sign-in also requires
the Google provider and its OAuth credentials to be configured in Supabase.

## Install and run

From the `frontend` directory:

```sh
npm install
npm run dev
```

Vite prints the local URL when the development server starts. The backend must
also be running, and its CORS allowlist must include the frontend origin.

## Available commands

```sh
npm run build
npm run lint
npm run test
```
