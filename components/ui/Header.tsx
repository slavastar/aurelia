'use client';

import Link from "next/link";
import Image from "next/image";
import { BarChart3 } from "lucide-react";

interface HeaderProps {
  showNav?: boolean;
  className?: string;
}

export default function Header({ showNav = true, className = "" }: HeaderProps) {
  return (
    <header className={`container mx-auto px-4 py-6 ${className}`}>
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <Image
            src="/logo.svg"
            alt="Aurelia Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-2xl font-bold gradient-aurelia-text-lime tracking-tight">
            AURELIA
          </h1>
        </Link>
        
        {showNav && (
          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/dashboard" className="text-white/80 hover:text-aurelia-lime transition flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/#how-it-works" className="text-white/80 hover:text-aurelia-lime transition">
              How It Works
            </Link>
            <Link href="/#features" className="text-white/80 hover:text-aurelia-lime transition">
              Features
            </Link>
            <Link href="/#about" className="text-white/80 hover:text-aurelia-lime transition">
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
