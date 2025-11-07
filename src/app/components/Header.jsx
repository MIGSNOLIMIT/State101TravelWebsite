
export default function Header() {
  // Always use static logo and company name, never CMS
  const logoUrl = '/images/logo.png';
  const companyName = 'State101 Travel';
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
        <a href="/" className="text-[#0F1E5A] hover:text-[#E3342F]">Home</a>
        <a href="/services" className="text-[#0F1E5A] hover:text-[#E3342F]">Services</a>
        <a href="/about" className="text-[#0F1E5A] hover:text-[#E3342F]">About Us</a>
        <a href="/tos" className="text-[#0F1E5A] hover:text-[#E3342F]">Terms of Services</a>
      </nav>
    </header>
  );
}
