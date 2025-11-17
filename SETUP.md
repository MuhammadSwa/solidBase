# Quick Setup Guide

This guide will help you get the template up and running quickly.

## Prerequisites

- Node.js 18+ installed
- pnpm (recommended) or npm
- PocketBase downloaded

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Download PocketBase

If you don't have PocketBase yet:

1. Visit [pocketbase.io/docs](https://pocketbase.io/docs/)
2. Download the appropriate version for your OS
3. Extract the executable to your project root or a preferred location

### 3. Start PocketBase

```bash
# From the directory containing pocketbase executable
./pocketbase serve
```

PocketBase will start on `http://127.0.0.1:8090`

### 4. Create Admin Account

1. Open `http://127.0.0.1:8090/_/` in your browser
2. Create an admin account (first time only)

### 5. Create Users Collection (If not exists)

The template expects a `users` auth collection:

1. Go to Collections in PocketBase Admin
2. Click "New Collection"
3. Choose "Auth collection"
4. Name it `users`
5. Add any additional fields you need
6. Enable "Email/Password" authentication
7. Save the collection

### 6. Create a Test User

Option A - Via Admin UI:
1. Go to the `users` collection
2. Click "New record"
3. Enter email and password
4. Save

Option B - Via API (after starting dev server):
- Use the registration feature in your app (if implemented)
- Or use PocketBase API directly

### 7. Create Example Collections (Optional)

For the todos example to work:

1. Create a new "Base collection" named `todos`
2. Add fields
  - `title` (text, required)
  - `completed` (bool, default: false)
3. Set appropriate API rules (e.g., `@request.auth.id != ""` for authenticated access)

### 8. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit if needed (default PocketBase URL is already correct):

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

### 9. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:5173`

### 10. Test Authentication

1. Click "Login" button
2. Enter the email/password you created in step 6
3. You should be redirected to the dashboard

## Troubleshooting

### "Connection refused" or PocketBase errors

- Make sure PocketBase is running (`./pocketbase serve`)
- Check that the URL in `.env` matches your PocketBase instance

### "Invalid credentials" on login

- Verify you created a user in the `users` collection
- Check email/password are correct
- Ensure the `users` collection has email/password auth enabled

### TypeScript errors

- Run `pnpm install` to ensure all dependencies are installed
- Check that your TypeScript version is up to date

### Routes not working

- The TanStack Router plugin auto-generates routes
- Make sure the dev server is running (routes are generated on file changes)
- Check `src/routeTree.gen.ts` to see generated routes

## Next Steps

1. Customize the User interface in `src/lib/pocketbase.ts` to match your user fields
2. Create additional PocketBase collections for your app
3. Add new routes under `src/routes/`
4. Implement additional features using the patterns in the template

## Production Deployment

### Build the App

```bash
pnpm build
```

### Deploy PocketBase

1. Follow PocketBase deployment guides: [pocketbase.io/docs/going-to-production](https://pocketbase.io/docs/going-to-production/)
2. Update `VITE_POCKETBASE_URL` to your production PocketBase URL
3. Rebuild the app with the production URL

### Deploy Frontend

Deploy the `dist/` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

## Resources

- [PocketBase Docs](https://pocketbase.io/docs/)
- [SolidJS Docs](https://docs.solidjs.com/)
- [TanStack Router Docs](https://tanstack.com/router)
