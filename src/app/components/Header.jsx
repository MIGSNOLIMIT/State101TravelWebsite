export default function Header({ data }) {
  // Fallbacks for logo and nav items
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';
  const isAbsolute = (u) => typeof u === 'string' && /^https?:\/\//i.test(u);
  const toImageSrc = (maybePath) => {
    if (!maybePath || typeof maybePath !== 'string') return '';
    if (isAbsolute(maybePath)) return maybePath;
    const base = (CMS_URL || '').replace(/\/$/, '');
    const path = maybePath.startsWith('/') ? maybePath : `/${maybePath}`;
    return `${base}${path}`;
  };
  let logoRaw = '';
  if (data?.logo && typeof data.logo === 'object') {
    logoRaw =
      data.logo.sizes?.square?.url ||
      data.logo.sizes?.thumbnail?.url ||
      data.logo.url ||
      '';
  }
  const logoUrl = toImageSrc(logoRaw) || '/images/logo.png';
  const companyName = data?.companyName || 'State101 Travel';
  // Parse nav items from CMS structure; guard against null data
  const navLinks = Array.isArray(data?.navItems)
    ? data.navItems.map((item) => {
        let href = '/';
        const refValue = item.link?.reference?.value;
        if (refValue && typeof refValue === 'object' && 'slug' in refValue) {
          const slug = String(refValue.slug).trim().toLowerCase().replace(/\s+/g, '-');
          href = slug === 'home' ? '/' : `/${slug}`;
        } else if (item.link?.url) {
          href = item.link.url;
        }
        return {
          label: item?.link?.label || (refValue && refValue.title) || '',
          href,
          newTab: !!item.link.newTab,
        };
      })
    : [];

  return (
    <header className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center">
      {/* Left: Logo + Company Name */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-3 items-center mb-4 md:mb-0">
        <img
          src={logoUrl}
          alt={companyName + ' Logo'}
          className="h-16 w-16 rounded-full object-cover mb-2 md:mb-0"
        />
        <span className="text-2xl font-bold text-[#0F4695] text-center md:text-left">{companyName}</span>
      </div>
      {/* Navigation */}
      <nav className="flex flex-col md:flex-row items-center md:space-x-8 space-y-2 md:space-y-0 text-lg font-medium">
        {navLinks.length > 0 ? (
          navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab ? 'noopener noreferrer' : undefined}
              className="text-[#0F1E5A] hover:text-[#E3342F]"
            >
              {link.label}
            </a>
          ))
        ) : (
          <>
            <a href="/" className="text-[#0F1E5A] hover:text-[#E3342F]">Home</a>
            <a href="/services" className="text-[#0F1E5A] hover:text-[#E3342F]">Services</a>
            <a href="/about" className="text-[#0F1E5A] hover:text-[#E3342F]">About Us</a>
            <a href="/tos" className="text-[#0F1E5A] hover:text-[#E3342F]">Terms of Services</a>
          </>
        )}
      </nav>
    </header>
  );
}
