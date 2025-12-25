"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiBell,
  FiGrid,
  FiUsers,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// SidebarLink component
const SidebarLink = ({
  href,
  icon,
  label,
  collapsed,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  color: string;
}) => (
  <Link
    href={href}
    className={`flex items-center ${
      collapsed ? "justify-center" : "gap-3 px-3"
    } py-2 rounded hover:bg-gray-700 transition-colors`}
  >
    <span className={`w-6 h-6 ${color}`}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </Link>
);

// Sidebar component
const Sidebar = ({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
  <aside
    className={`${
      collapsed ? "w-20" : "w-64"
    } relative bg-gray-800/90 text-white flex flex-col p-4 transition-all duration-300`}
  >
    <div
      className={`mb-9 flex items-center ${
        collapsed ? "justify-center" : "justify-between"
      }`}
    >
      <Link
        href="/homepage"
        className={`flex items-center ${collapsed ? "justify-center" : "gap-4"}`}
      >
        <img src="/immg.png" alt="Logo" className="h-7 w-auto" />
        {!collapsed && (
          <span className="text-xl font-bold text-gray-100">VIVA TMS</span>
        )}
      </Link>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-3 text-gray-400 hover:text-white text-lg"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
    </div>

    <nav className="flex flex-col gap-4 mt-0.5">
      <SidebarLink
        href="/homepage"
        icon={<FiGrid />}
        label="Dashboard"
        collapsed={collapsed}
        color="text-rose-400"
      />
      <SidebarLink
        href="/employee"
        icon={<FiUsers />}
        label="Employee"
        collapsed={collapsed}
        color="text-lime-400"
      />
      <SidebarLink
        href="/about"
        icon={<FiInfo />}
        label="About"
        collapsed={collapsed}
        color="text-violet-400"
      />
    </nav>
  </aside>
);

// LandingLayout component
const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [photo, setPhoto] = useState("/profile.jpg");

  const router = useRouter();

  // Load cookies after client mounts to avoid hydration mismatch
  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (!token) {
      router.replace("/login"); // Redirect to login if not authenticated
    }
     const savedUsername = Cookies.get("username");
  const savedPhoto = Cookies.get("photo");

  if (savedUsername) setUsername(savedUsername);
  if (savedPhoto) setPhoto(savedPhoto);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("username");
    Cookies.remove("photo");
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-md shadow-md py-4 px-6 flex justify-between items-center">
          <h2 className="text-gray-600 font-medium"> Welcome, {username}!</h2>

          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md shadow rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors">
              <FiBell className="w-6 h-6 text-gray-700" />
            </button>

            <div className="relative">
              <img
                src={photo || "/profile.jpg"}
                onClick={() => setOpen(!open)}
                className="w-12 h-12 rounded-full cursor-pointer border-4 border-gray-300 bg-white/80 backdrop-blur-md shadow"
                alt={username}
              />

              {open && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-100 p-6">{children}</main>

        <footer className="bg-gray-800 text-white py-4 px-6 text-center mt-auto shadow-inner">
          © {new Date().getFullYear()} VIVA Construction. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default LandingLayout;
