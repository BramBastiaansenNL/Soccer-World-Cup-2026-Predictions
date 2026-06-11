# World Cup Fame Picks

A small hosted prediction platform for Teams. Colleagues open one HTTPS link, enter their name, submit predictions once, and watch the leaderboard update as results are entered.

## What You Need

- A Vercel account for hosting.
- A Supabase project for the database.
- The environment variables from `.env.example`.

No colleague needs to install anything.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Copy your project URL and service role key.

Keep the service role key private. It belongs only in Vercel environment variables.

## Vercel Setup

1. Import this folder into a Git repository.
2. Create a new Vercel project from that repository.
3. Add these environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSPHRASE`
4. Deploy.
5. Share the production URL in Teams.

Suggested Teams post:

> World Cup Fame Picks is live. Enter your name, make your picks, and submit once. Picks are locked after submission.

## Local Preview

The frontend can be previewed without Supabase by serving the folder statically. API calls will show setup guidance until the Vercel/Supabase environment is configured.

With Python available:

```powershell
python -m http.server 8765
```

Then open `http://127.0.0.1:8765`.

## Admin

Open the deployed site and use the Admin panel. Enter the passphrase stored in `ADMIN_PASSPHRASE`.

Admin can:

- Lock or unlock prediction cards.
- Enter or clear results.
- Delete a mistaken submission.
- Export leaderboard and prediction data as CSV.

## Scoring

- World Cup winner: 100 points.
- Correct finalist pick: 60 points each.
- Correct semi-finalist pick: 35 points each.
- Correct knockout match winner: 15 points.
- Correct group-stage match winner: 8 points.
- Correct group-stage draw: 12 points.
