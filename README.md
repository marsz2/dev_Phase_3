
# 1.5



# J S K Enterprises — GitHub + Supabase Marketplace

This package separates the storefront, admin login, admin masters and blog into four HTML pages. `App.js` is the shared browser-side application module. Supabase provides hosted authentication and database services.

## Files (root only)
- `index.html` — public marketplace landing page
- `admin.html` — Supabase admin login
- `masters.html` — protected product, blog, inquiry and store-settings dashboard
- `blog.html` — public blog listing and article view
- `App.js` — shared browser JavaScript and Supabase client
- `supabase.sql` — tables, indexes/constraints, RLS and policies
- `README.md` — this guide

## Important security note about administrator credentials
There is **no admin email/password in HTML or App.js**. A browser-delivered JavaScript file is public and anyone can inspect it. Do not place the supplied password, any password, or a Supabase `service_role` key in GitHub. The password you shared in chat is not embedded in this package; create/set the account password privately in Supabase Authentication. For safety, use a new unique password rather than reusing a password that has been shared in a chat.

`App.js` contains only the Supabase project URL and publishable/anon key placeholders. The publishable key is designed to be public when Row Level Security (RLS) is correctly configured.

## 1. Create Supabase project
1. Open https://supabase.com/ and sign in.
2. Select **New project**, choose an organization, project name and a strong database password. Save the database password privately.
3. Choose a region close to your customers (India region if available in your plan).
4. Wait until the project is ready.
5. Open **Project Settings → API** (or **Connect**) and copy:
   - Project URL
   - Publishable key (or legacy `anon` public key)
6. Open `App.js` and replace:
   - `YOUR_SUPABASE_PROJECT_URL`
   - `YOUR_SUPABASE_PUBLISHABLE_KEY`
   Do not use the `service_role` / secret key.

## 2. Create database and security policies
1. In Supabase, open **SQL Editor → New query**.
2. Open `supabase.sql`, copy the entire file and paste it into SQL Editor.
3. Click **Run**. Confirm that tables `products`, `blogs`, `inquiries`, `store_settings`, and `admin_users` exist under **Table Editor**.
4. The script enables RLS and adds public read/submit policies and administrator-only management policies.

## 3. Create the administrator account
1. Open **Authentication → Users → Add user**.
2. Create the user with this admin email: `sumeetkhatri@gmail.com`. Set the password directly in Supabase; do not put it in code.
3. Copy the user's UUID from the Users table.
4. In SQL Editor run this statement after replacing the UUID:
   ```sql
   insert into public.admin_users(user_id)
   values ('PASTE-AUTH-USER-UUID-HERE')
   on conflict (user_id) do nothing;
   ```
5. The admin can now sign in at `admin.html`. The login flow checks both Supabase Auth and `public.admin_users`. A valid Auth user not in this allow-list is denied.

## 4. Test locally
For ES modules, open the folder using a local web server rather than `file://`.
- In VS Code, install/use **Live Server**, then right-click `index.html` → Open with Live Server.
- Or use Python from the project folder: `python -m http.server 5500`, then visit `http://localhost:5500`.

Test:
- Public product list and search/filter
- General inquiry submission and product-level Request Call submissions
- Blog listing
- Admin login, then Masters product/blog editing and inquiry status changes
- Log out and confirm Masters requires login

## 5. Publish with GitHub Pages
1. Create/open your GitHub repository (for example `dev.sumanvi`).
2. Upload these seven files to the repository root (not inside another folder).
3. Commit/push the changes.
4. In GitHub open **Settings → Pages**.
5. Under Build and deployment choose **Deploy from a branch**; select `main` and `/ (root)`, then Save.
6. Wait for deployment. Open the Pages URL and test the site.
7. If using a custom domain such as `sumanvi.in`, configure it in GitHub Pages and update DNS records as GitHub instructs. Enforce HTTPS after DNS validation.

## 6. Supabase Auth URL configuration
In Supabase open **Authentication → URL Configuration**:
- Site URL: your deployed website origin, e.g. `https://your-account.github.io` or `https://sumanvi.in`
- Add Redirect URLs for the exact deployed admin page and local test URL, e.g. `https://sumanvi.in/**` and `http://localhost:5500/**`.
The current password login does not require an email redirect, but correct site URL settings are still recommended.

## Data and current scope
- Products and blogs are stored in Supabase and shared across visitors/devices.
- General inquiry form writes to `inquiries`, visible in Masters.
- Admin can add/edit/delete products and blogs, show/hide products, update inquiry status, export inquiries as CSV and change WhatsApp settings.
- Product/blog images are URL fields. This starter package does not implement Supabase Storage uploads.
- The earlier single-file localStorage data is not automatically migrated. Re-enter products/blogs in Masters or import them separately.
- `App.js` is frontend code, not a private Node.js server. With GitHub Pages, Supabase is the hosted backend. If you later need server-only secrets, payments, privileged operations or custom APIs, add a separate server/Edge Function; never expose a service key in the browser.

## Troubleshooting
- **Invalid login / 400 token error:** verify the email/password in Supabase Authentication > Users; ensure the user is confirmed if email confirmation is enabled.
- **Not authorised as administrator:** insert that Auth user's UUID into `public.admin_users`.
- **Table not found / schema cache error:** run the full `supabase.sql`, then refresh the page.
- **Permission denied:** check RLS policies in Supabase Table Editor and ensure the signed-in user is present in `admin_users`.
- **Products don't show:** verify the products table contains rows and `is_active = true`; confirm URL and publishable key in `App.js`.
