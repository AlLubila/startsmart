"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Menu, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { FavoritesProvider } from "../context/FavoritesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex justify-between items-center p-4 h-16 border-b border-gray-700 bg-gray-800 lg:justify-end">
      <div className="lg:hidden">
        <button onClick={onMenuClick}>
          <Menu className="text-white w-6 h-6" />
        </button>
      </div>
      <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton>
            <button className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-purple-600 text-white rounded-full px-4 py-2 hover:bg-purple-700 transition">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <ClerkProvider>
      <FavoritesProvider>
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
          <body className="antialiased bg-gray-900 text-gray-100">
            {/* 🔥 Toast system */}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <aside
                className={`fixed z-40 top-0 left-0 h-full w-64 bg-gray-800 shadow-md flex flex-col transform transition-transform duration-300 ease-in-out ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 lg:static`}
              >
                <div className="p-6 text-2xl font-bold border-b border-gray-700 flex justify-between items-center">
                  StartSmart
                  <button
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-4">
                  <Link
                    href="/"
                    className="block px-3 py-2 rounded hover:bg-indigo-600 hover:text-white transition"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded hover:bg-indigo-600 hover:text-white transition"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/favorites"
                    className="block px-3 py-2 rounded hover:bg-indigo-600 hover:text-white transition"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Favorites
                  </Link>
                </nav>
              </aside>

              {/* Overlay for mobile */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* Main content */}
              <main className="flex-1 flex flex-col overflow-auto ml-0 lg:ml-64">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-8 flex-1 overflow-auto">{children}</div>
              </main>
            </div>
          </body>
        </html>
      </FavoritesProvider>
    </ClerkProvider>
  );
}
