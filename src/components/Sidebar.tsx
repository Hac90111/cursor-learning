"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "@/contexts/SidebarContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "API Playground",
      href: "/dashboard/playground",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 6L2 12L8 18" />
          <path d="M16 6L22 12L16 18" />
        </svg>
      ),
    },
    {
      label: "Use Cases",
      href: "/dashboard/use-cases",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
        </svg>
      ),
    },
    {
      label: "Certification",
      href: "/dashboard/certification",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      ),
    },
    {
      label: "Documentation",
      href: "https://docs.example.com",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      external: true,
    },
    {
      label: "Dattus MCP",
      href: "https://mcp.example.com",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      external: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Toggle button when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Open sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Icon - Three arrows from center point */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {/* Center point */}
                <circle cx="12" cy="12" r="1.5" fill="#000" />
                {/* Blue arrow pointing up */}
                <path
                  d="M12 4L10 10H12H14L12 4Z"
                  fill="#3B82F6"
                />
                {/* Red arrow pointing left */}
                <path
                  d="M4 12L10 10V12V14L4 12Z"
                  fill="#EF4444"
                />
                {/* Yellow arrow pointing right */}
                <path
                  d="M20 12L14 10V12V14L20 12Z"
                  fill="#EAB308"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold text-black">Dattus</span>
          </div>
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Account Selector */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
        >
          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">f</span>
          </div>
          <span className="text-sm font-medium text-blue-600 flex-1">Personal</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-blue-600 transition-transform ${isAccountDropdownOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const content = (
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                active
                  ? "text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={active ? "text-blue-600" : "text-gray-400"}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.external && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-400"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              )}
            </div>
          );

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className="block">
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
    </>
  );
}

