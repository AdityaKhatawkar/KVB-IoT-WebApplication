"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { ChevronDown, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [language, setLanguage] = useState("English");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{name?: string; role?: string} | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Check authentication status on component mount
  useEffect(() => {
    const token = Cookies.get("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to parse user data:", err);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        Cookies.remove("token");
        Cookies.remove("role");
        Cookies.remove("email");
      }
    }
  }, []);

  // Auth state update on custom event or storage change
  useEffect(() => {
    const updateAuthState = () => {
      const token = Cookies.get("token");
      const storedUser = localStorage.getItem("user");
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    window.addEventListener("authChanged", updateAuthState);
    window.addEventListener("storage", updateAuthState);
    return () => {
      window.removeEventListener("authChanged", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-hide navbar on scroll (disabled for admin pages)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsNavVisible(false); // scrolling down
      } else {
        setIsNavVisible(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    
    // Disable auto-hide on admin dashboard pages
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin-dashboard')) {
      setIsNavVisible(true);
      return; // Don't add scroll listener for admin pages
    }
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("email");
    Cookies.remove("phone");
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setUserDropdownOpen(false);
    // Notify other tabs/components
    window.dispatchEvent(new Event("authChanged"));
    // Redirect to home page
    router.push("/");
  };

  const handleDashboardClick = () => {
    if (user?.role === "admin") {
      router.push("/admin-dashboard");
    } else {
      router.push("/user-dashboard");
    }
    setUserDropdownOpen(false);
  };

  const languages = [
    "English",
    "Hindi",
    "Kannada",
  ];

  // Language code mapping for Google Translate
  const languageCodeMap: { [key: string]: string } = {
    English: "",
    Hindi: "hi",
    Kannada: "kn",
  };

  // Product dropdown state
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement | null>(null);
  // Product list
  const productLinks = [
    { name: "Solar Tunnel Dryer", slug: "solar-tunnel-dryer" },
    { name: "Scheffler Dish", slug: "scheffler-dish" },
    { name: "Parabolic Cooker", slug: "parabolic-cooker" },
    { name: "Solar Concentrator", slug: "solar-concentrator" },
    { name: "Parabolic Trough", slug: "parabolic-trough" },
  ];

  // Remove 'Products' from navLinks
  const navLinks: { name: string; href: string }[] = [
    { name: "About Us", href: "/about" },
  ];

  // Handle scroll to products section
  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/#products');
    setProductsDropdownOpen(false);
  };

  // Close desktop products dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!productsRef.current) return;
      if (!productsRef.current.contains(e.target as Node)) {
        setProductsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className={`bg-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ${isNavVisible ? '' : '-translate-y-full'} w-screen max-w-none`}>
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo and Company Name */}
          <Link href="/" className="flex items-center space-x-3 mr-6">
            <Image
              src="/images/kvbLogo.png"
              alt="KVB Logo"
              width={45}
              height={45}
              className="object-contain"
            />
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
              KVB Green Energies
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-6">
            {/* Products Dropdown */}
            <div className="relative" ref={productsRef}>
              <button
                onClick={() => setProductsDropdownOpen((v) => !v)}
                className="relative text-gray-700 font-medium transition duration-200 hover:text-green-600 hover:scale-105 flex items-center space-x-1"
                aria-haspopup="true"
                aria-expanded={productsDropdownOpen}
                type="button"
              >
                Products <ChevronDown className="w-4 h-4 inline ml-1" />
              </button>
              {/* Dropdown menu */}
              <div
                className={`absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-50 transition-all duration-200 ${productsDropdownOpen ? 'block' : 'hidden'}`}
              >
                {productLinks.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="block px-5 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all rounded-md"
                    onClick={() => setProductsDropdownOpen(false)}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
            {/* About Us */}
            <Link
              href="/about"
              className="relative text-gray-700 font-medium transition duration-200 hover:text-green-600 hover:scale-105"
            >
              About Us
            </Link>
            {isAuthenticated && user?.role !== "admin" && (
              <>
                <Link
                  href="/user-dashboard"
                  className="relative text-gray-700 font-medium transition duration-200 hover:text-green-600 hover:scale-105"
                >
                  My Devices
                </Link>
                <Link
                  href="/user-dashboard/records"
                  className="relative text-gray-700 font-medium transition duration-200 hover:text-green-600 hover:scale-105"
                >
                  Device Records
                </Link>
                <Link
                  href="/user-dashboard/config-logs"
                  className="relative text-gray-700 font-medium transition duration-200 hover:text-green-600 hover:scale-105"
                >
                  Config Logs
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center ml-auto mr-2">
            <button
              aria-label="Menu"
              className="p-2 rounded-md border border-gray-300"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
              <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
              <span className="block w-5 h-0.5 bg-gray-700"></span>
            </button>
          </div>

          {/* Language Dropdown + Auth Section (far right) */}
          <div className="flex items-center space-x-4 relative dropdown-container ml-auto">
            {/* Language Dropdown */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 border border-gray-300 px-3 py-1 rounded-md bg-transparent hover:bg-green-50 hover:border-green-600 transition-all duration-200"
            >
              🌐 <span>{language}</span> ▼
            </button>

            {dropdownOpen && (
              <div className="absolute top-12 right-28 bg-white shadow-lg rounded-md w-32 border border-gray-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setDropdownOpen(false);
                      // Trigger Google Translate
                      const langCode = languageCodeMap[lang];
                      
                      const triggerTranslation = () => {
                        const selectElement = document.querySelector(
                          ".goog-te-combo"
                        ) as HTMLSelectElement;
                        
                        if (lang === "English") {
                          // Reset to English using the reset function
                          const resetFn = (window as any).resetTranslation;
                          if (resetFn && typeof resetFn === "function") {
                            resetFn();
                            // Reload after a short delay to ensure reset is complete
                            setTimeout(() => {
                              window.location.reload();
                            }, 300);
                          } else {
                            // Fallback: manual reset
                            if (selectElement) {
                              selectElement.value = "";
                              selectElement.dispatchEvent(new Event("change", { bubbles: true }));
                            }
                            // Remove translation classes
                            document.documentElement.classList.remove(
                              "translated-ltr",
                              "translated-rtl",
                              "translated-lr",
                              "translated-rl"
                            );
                            // Clear cookies
                            document.cookie.split(";").forEach(cookie => {
                              const eqPos = cookie.indexOf("=");
                              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                              if (name.includes("googtrans")) {
                                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                              }
                            });
                            // Reload
                            setTimeout(() => {
                              window.location.reload();
                            }, 200);
                          }
                        } else if (selectElement && langCode) {
                          // Change language
                          selectElement.value = langCode;
                          const changeEvent = new Event("change", { bubbles: true });
                          selectElement.dispatchEvent(changeEvent);
                        } else if (window.changeLanguage && langCode) {
                          // Fallback: use global function
                          window.changeLanguage(langCode);
                        } else {
                          // Wait for Google Translate to load
                          setTimeout(triggerTranslation, 300);
                        }
                      };
                      
                      // Try immediately, then retry if needed
                      triggerTranslation();
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-green-100 transition"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            {/* User Section */}
            {isAuthenticated ? (
              <div className="relative">
                {/* User Name with Dropdown */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200 hover:bg-green-100 transition-all duration-200 max-w-[160px]"
                >
                  <User className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-green-700 font-medium truncate" title={user?.name}>{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-green-600 shrink-0" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md w-48 border border-gray-200 z-50">
                    <button
                      onClick={handleDashboardClick}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition flex items-center space-x-2"
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition flex items-center space-x-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons for non-authenticated users */
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="border border-gray-300 px-4 py-1 rounded-md transition-all duration-200 hover:bg-green-50 hover:text-green-700 hover:border-green-600 hover:scale-105">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-green-600 text-white px-4 py-1 rounded-md transition-transform duration-200 hover:bg-green-700 hover:scale-110">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile collapsible menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white border-t border-gray-200 shadow-inner">
          <div className="px-4 py-3 space-y-2">
            {/* Products collapsible */}
            <button
              className="w-full flex items-center justify-between text-gray-700 font-medium py-2"
              onClick={() => setMobileProductsOpen((v) => !v)}
            >
              <span>Products</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileProductsOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileProductsOpen && (
              <div className="pl-3 pb-2 space-y-1">
                {productLinks.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="block px-2 py-2 text-gray-700 rounded hover:bg-green-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileProductsOpen(false);
                    }}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/about"
              className="block w-full text-left text-gray-700 font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            {isAuthenticated && user?.role !== "admin" && (
              <>
                <Link
                  href="/user-dashboard"
                  className="block w-full text-left text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Devices
                </Link>
                <Link
                  href="/user-dashboard/records"
                  className="block w-full text-left text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Device Records
                </Link>
                <Link
                  href="/user-dashboard/config-logs"
                  className="block w-full text-left text-gray-700 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Config Logs
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
