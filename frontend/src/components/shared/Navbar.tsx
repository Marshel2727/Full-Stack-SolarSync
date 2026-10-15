'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sun, Menu, X, ArrowRight, LayoutDashboard, Shield, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/calculator', label: 'Solar Calculator' },
    { href: '/packages', label: 'Katalog Paket' },
    { href: '/knowledge', label: 'Knowledge Center' },
    { href: '/faq', label: 'FAQ' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-surface-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-solar shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-primary-dark font-heading">
                Solar<span className="text-solar-dark">Sync</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Lumina
              </span>
            </div>
            <p className="text-[10px] text-slateText-muted hidden sm:block">Clean Energy Ecosystem Platform</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slateText-muted hover:text-slateText hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {role === 'customer' ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-primary border border-emerald-200 text-sm font-semibold hover:bg-emerald-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard ({user?.name.split(' ')[0]})</span>
            </Link>
          ) : role === 'admin' ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-sm font-semibold hover:bg-purple-100 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slateText hover:text-primary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </Link>
          )}

          <Link href="/calculator">
            <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              <span className="hidden sm:inline">Hitung Kebutuhan</span>
              <span className="sm:hidden">Hitung</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/calculator">
            <Button variant="secondary" size="sm">
              Hitung
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Buka Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden border-t border-surface-border bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white font-bold'
                    : 'text-slateText hover:bg-surface-muted'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {role === 'customer' && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-primary font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Customer Dashboard</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {role === 'admin' && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 text-purple-700 font-semibold text-sm"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin Workspace</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {role === 'visitor' && (
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slateText"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
