"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  // Always use static logo and company name, never CMS
  const logoUrl = '/images/logo.png';
  const companyName = 'State101 Travel';
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', match: pathname === '/' },
    { href: '/services', label: 'Services', match: pathname?.startsWith('/services') },
    { href: '/about', label: 'About Us', match: pathname?.startsWith('/about') },
    { href: '/tos', label: 'Terms of Service', match: pathname?.startsWith('/tos') },
  ];

  useEffect(() => {
    // Check if user is logged in as admin
    async function checkAdmin() {
      try {
        const res = await fetch('/api/admin/me');
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  return (
    <header className="bg-white shadow-md px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center">
      {/* Left: Logo + Company Name */}
      <Link href="/" className="flex flex-col md:flex-row md:items-center md:space-x-3 items-center mb-4 md:mb-0">
        <img
          src={logoUrl}
          alt={companyName + ' Logo'}
          className="h-16 w-16 rounded-full object-cover mb-2 md:mb-0 cursor-pointer hover:opacity-80 transition"
        />
        <span className="text-2xl font-bold text-[#00008b] text-center md:text-left cursor-pointer hover:opacity-80 transition">{companyName}</span>
      </Link>
      {/* Navigation */}
      <nav className="flex flex-col md:flex-row items-center md:space-x-8 space-y-2 md:space-y-0 text-lg font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.match ? 'page' : undefined}
            className={[
              'flex min-w-[180px] items-center justify-center px-4 py-2 transition md:min-w-0',
              item.match
                ? 'rounded-md bg-[#8B1E1E] text-white shadow-[0_10px_24px_rgba(139,30,30,0.24)]'
                : 'text-[#00008b] hover:bg-[#eef3ff] hover:text-[#E3342F]',
            ].join(' ')}
          >
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin/dashboard" className="text-white bg-[#00008b] hover:bg-[#000070] px-4 py-2 rounded font-semibold transition">Dashboard</Link>
        )}
      </nav>
    </header>
  );
}
