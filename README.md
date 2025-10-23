src/app/
	layout.js                 # Fetches Header/Footer globals; base layout
	page.js                   # Home page: fetch by slug=home, render Hero + blocks
	api/
		preview/route.js        # Enables Next preview mode, forwards Payload JWT
		topbar/route.js         # Proxies TopBar global from CMS
	components/               # Reusable UI and block renderers
	home/                     # Home-specific components
	services/                 # Services page and components
	about/                    # About page and components
	terms-of-service/         # Terms of service page
public/                     # Static assets

# State101TravelWebsite
State101TravelWebsite

Travel visa assistance website built with Next.js, Tailwind CSS, Prisma ORM, Supabase (Postgres), Supabase Storage, Cloudinary, and Tiptap rich text editor.

---

## Developer Setup & Installation

### Requirements
- Node.js 18+
- Git
- Supabase account (for database and storage)
- Cloudinary account (for media uploads)

### 1. Clone the repository
```powershell
git clone <repo-url>
cd State101TravelWebsite
```

### 2. Install dependencies
```powershell
npm install
```

### 3. Set up environment variables
- Copy `.env.example` to `.env.local` (or create `.env.local`)
- Fill in:
	- `DATABASE_URL` (Supabase Postgres connection string, e.g. `postgresql://...@...:5432/postgres?sslmode=require`)
	- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase project settings)
	- Cloudinary credentials (if using Cloudinary)
	- SMTP credentials (for password reset)

### 4. Set up the database schema
```powershell
npx prisma generate
npx prisma migrate deploy
# OR, if you have no migrations:
npx prisma db push
```

### 5. (Optional) Migrate existing data
- Use pgAdmin, TablePlus, DBeaver, or a Prisma script to copy data from your local DB to Supabase.

### 6. Run the development server
```powershell
npm run dev
```

### 7. Build and run for production
```powershell
npm run build
npm start
```

### 8. Deployment
- Recommended: Deploy to Vercel, Netlify, or Render (free tiers available)
- Set all environment variables in the hosting dashboard
- Connect your GitHub repo and follow platform instructions

---

## Environment Variables
- `DATABASE_URL`: Supabase Postgres connection string
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase project settings
- `JWT_SECRET`: For authentication
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`: For password reset emails
- Cloudinary credentials (if using Cloudinary)

---

## Project Structure
```
src/app/
	layout.js           # Root layout, fetches global header/footer
	page.js             # Home page
	api/                # API routes for admin, CMS, media, etc.
	components/         # Reusable UI components
	home/               # Homepage components
	services/           # Services page/components
	about/              # About page/components
	terms-of-service/   # Terms of service page/components
public/               # Static assets (images, icons, videos)
prisma/               # Prisma schema and migration scripts
```

---

## Documentation: What This App Does

**State101TravelWebsite** is a full-featured travel visa assistance platform. It provides:
- A public-facing website for users to learn about services, view testimonials, and contact the agency.
- An admin dashboard for editing homepage, footer, header, top bar, services, about page, terms of service, users, and media library.
- Rich text editing (Tiptap) for content blocks.
- Media library integration with Supabase Storage and Cloudinary for images/videos.
- Authentication for admin/editor users, with password reset via email.
- All content is stored in a Supabase Postgres database and can be managed via the admin UI.
- Dynamic rendering for all admin/CMS pages to avoid build timeouts.

---

## User Manual / Guide

### For Admins/Editors
1. **Login:** Go to `/admin/login` and sign in with your credentials.
2. **Dashboard:** Access all editable sections from the admin dashboard.
3. **Edit Content:**
	 - Homepage, About, Services, Terms of Service, Footer, Header, Top Bar: Use the provided forms and rich text editors.
	 - Media Library: Upload/select images and videos for use in content blocks.
	 - Users: Add, edit, or remove admin/editor accounts.
4. **Save Changes:** All edits are live and update the database instantly.
5. **Password Reset:** Use the forgot password link to reset your password via email.

### For End Users
1. **Browse Services:** View visa assistance services for Canada and the US.
2. **Read About Us:** Learn about the agency’s mission, vision, and story.
3. **View Testimonials:** See successful client stories and media.
4. **Contact:** Use provided contact info or forms to inquire about services.

---

## Troubleshooting
- **Build timeouts:** All admin/CMS pages use dynamic rendering. If you see build errors, check for missing `export const dynamic = "force-dynamic";` in page/layout files.
- **Database errors:** Ensure your Supabase database is running and your `DATABASE_URL` is correct.
- **Media issues:** Make sure Supabase Storage and/or Cloudinary credentials are set and valid.
- **Email issues:** Check SMTP credentials in `.env.local`.

---

## Learn More
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs



