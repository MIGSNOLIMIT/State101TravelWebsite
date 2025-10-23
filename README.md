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

Travel visa assistance website built with Next.js, Tailwind CSS, Payload CMS, Cloudinary for media, and Tiptap for rich text editing.

## Requirements
- Node.js 18+
- Payload CMS instance (for content management)
- Cloudinary account (for media uploads)

## Quick Start
1. Clone the repo:
	```powershell
	git clone <repo-url>
	cd State101TravelWebsite
	```

2. Install dependencies:
	```powershell
	npm install
	```

3. Install Tiptap and Prisma dependencies:
	```powershell
	npm install @tiptap/core @tiptap/react @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-color @tiptap/extension-heading @tiptap/extension-bold @tiptap/extension-underline @prisma/client
	npx prisma generate
	npx prisma migrate dev
	```

4. Configure environment variables:
	```powershell
	Copy-Item .env.example .env.local
	# Edit .env.local with your CMS and Cloudinary credentials
	```

5. Run the dev server:
	```powershell
	npm run dev
	```

6. Start your Payload CMS backend and ensure it matches the frontend config.

## Environment Variables
- `NEXT_PUBLIC_CMS_URL`: Base URL of your Payload CMS (e.g., http://localhost:3001)
- `PREVIEW_SECRET`: Secret string for preview mode
- Cloudinary credentials (as required by your backend)

## Media Library
- Media uploads are handled via Cloudinary.
- Use the Media Library picker to select/upload images and videos.
- For carousels (e.g., homepage hero), select multiple images.

## Rich Text Editor
- Uses Tiptap with extensions for bold, underline, font family, font size, color, and headings.
- If you see errors about missing mark types, ensure all Tiptap extensions are installed and added to the editor config.

## Troubleshooting
- **Nested <form> error:** Do not nest <form> elements. See `MediaLibraryPicker.jsx` for correct usage.
- **Tiptap errors:** Install all required extensions and check your editor config.
- **Images not loading:** Add your image host to `images.remotePatterns` in `next.config.mjs`.

## Project Structure
```
src/app/
  layout.js
  page.js
  api/
	 preview/route.js
	 topbar/route.js
  components/
  home/
  services/
  about/
  terms-of-service/
public/
prisma/
```

## Learn More
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs


