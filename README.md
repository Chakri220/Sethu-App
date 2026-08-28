# Sethu — customer ordering app

This is the customer ordering app (Food / Clothing request forms + wallet +
order tracking). When someone submits an order, it SAVES into your Supabase
database — so the ops dashboard can read it.

This is a SEPARATE site from your landing page (trysethu.com). Deploying this
does not touch your landing page.

Your Supabase database is already connected (keys are in src/supabase.js).

---

## Deploy (same flow as your landing page)

### Step 1 — Put on GitHub
1. Go to github.com → New repository → name it 'sethu-app' → Create.
2. Click 'uploading an existing file'.
3. Upload the top-level files: index.html, package.json, package-lock.json,
   vite.config.js, README.md
4. Then Add file → Create new file → name it 'src/App.jsx', paste the App.jsx
   contents, commit. Repeat for 'src/main.jsx' and 'src/supabase.js'.
   (Or drag the whole 'src' folder in one upload.)
5. Commit.

### Step 2 — Deploy on Vercel
1. vercel.com → Add New → Project → import 'sethu-app'.
2. It auto-detects Vite. Don't change settings. Deploy.
3. You get a new URL like sethu-app-xxxx.vercel.app — that's your ordering app.

### Step 3 — Test the loop
1. Open your new app URL.
2. Place a test order (pick Food, fill it in, send).
3. Go to Supabase → Table Editor → 'orders' table → you'll see your order there.
4. (Once the ops dashboard is built, it'll show there too.)

---

## Note
The wallet balance is currently a demo (starts at $150, resets on refresh) —
real payment comes later. What matters now: orders save to the database.
