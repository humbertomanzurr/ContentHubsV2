# TheContentHub — REVO Labs

## Login
- Email: humberto@revolabsmedia.com
- Password: Revo2026!

## Deploy to Vercel
1. Upload this folder to a GitHub repository
2. Go to vercel.com → New Project → Import from GitHub
3. Select the repository → Deploy (no settings needed, Vercel auto-detects Vite)
4. Add custom domain: contenthubs.com

## Squarespace DNS Settings (for contenthubs.com)
After deploying to Vercel, go to:
Vercel → Project Settings → Domains → Add "contenthubs.com"
Vercel will show you the exact DNS values. In Squarespace Domains:
- Add an A record pointing to Vercel's IP
- Add a CNAME for www
