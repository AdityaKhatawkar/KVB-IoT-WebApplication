import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { ChevronDown, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [language, setLanguage] = useState("English");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  /** Load User Auth State */
useEffect(() => {
  const token = Cookies.get("token");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    try {
      const userData = JSON.parse(storedUser);

      Promise.resolve().then(() => {
        setUser(userData);
        setIsAuthenticated(true);
      });

    } catch {
      localStorage.removeItem("user");
      Cookies.remove("token");
      Cookies.remove("role");
      Cookies.remove("email");
    }
  }
}, []);


  /** Listen for cross-tab or manual auth changes */
  useEffect(() => {
    const updateAuthState = () => {
      const token = Cookies.get("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
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

  /** Hide Navbar on Scroll */
useEffect(() => {
  if (location.pathname.startsWith("/admin-dashboard")) {
    Promise.resolve().then(() => setIsNavVisible(true));
    return;
  }

  const handleScroll = () => {
    const current = window.scrollY;

    if (current < 10) setIsNavVisible(true);
    else if (current > lastScrollY.current) setIsNavVisible(false);
    else setIsNavVisible(true);

    lastScrollY.current = current;
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [location.pathname]);


  /** Click outside to close dropdowns */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Logout */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("email");

    setUser(null);
    setIsAuthenticated(false);
    setUserDropdownOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/");
  };

  /** Dashboard Nav */
  const handleDashboardClick = () => {
    if (user?.role === "admin") navigate("/admin-dashboard");
    else navigate("/user-dashboard");

    setUserDropdownOpen(false);
  };

  /** Translate */
  const languages = ["English", "Hindi", "Kannada"];
  const languageCodeMap: Record<string, string> = {
    English: "",
    Hindi: "hi",
    Kannada: "kn",
  };

  /** Products dropdown */
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement | null>(null);

  const productLinks = [
    { name: "Solar Tunnel Dryer", slug: "solar-tunnel-dryer" },
    { name: "Scheffler Dish", slug: "scheffler-dish" },
    { name: "Parabolic Cooker", slug: "parabolic-cooker" },
    { name: "Solar Concentrator", slug: "solar-concentrator" },
    { name: "Parabolic Trough", slug: "parabolic-trough" },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav
      className={`bg-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        isNavVisible ? "" : "-translate-y-full"
      } w-full`}
    >
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-16 w-full">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 mr-6">
            <img
              src="/images/kvbLogo.png"
              alt="KVB Logo"
              className="w-[45px] h-[45px] object-contain"
            />
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
              KVB Green Energies
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-6">
            {/* PRODUCTS DROPDOWN */}
            <div className="relative" ref={productsRef}>
              <button
                onClick={() => setProductsDropdownOpen((v) => !v)}
                className="relative text-gray-700 font-medium transition duration-200 hover:text-green-600 hover:scale-105 flex items-center space-x-1"
              >
                Products <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-50 ${
                  productsDropdownOpen ? "block" : "hidden"
                }`}
              >
                {productLinks.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/products/${product.slug}`}
                    className="block px-5 py-3 text-gray-700 hover:bg-green-50 transition"
                    onClick={() => setProductsDropdownOpen(false)}
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/about"
              className="text-gray-700 font-medium hover:text-green-600 hover:scale-105 transition"
            >
              About Us
            </Link>

            {isAuthenticated && user?.role !== "admin" && (
              <>
                <Link to="/user-dashboard" className="nav-link">
                  My Devices
                </Link>
                <Link to="/user-dashboard/records" className="nav-link">
                  Device Records
                </Link>
                <Link to="/user-dashboard/config-logs" className="nav-link">
                  Config Logs
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-md border border-gray-300"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
            <span className="block w-5 h-0.5 bg-gray-700 mb-1"></span>
            <span className="block w-5 h-0.5 bg-gray-700"></span>
          </button>

          {/* RIGHT SIDE: LANG + USER */}
          <div className="flex items-center gap-4 relative dropdown-container">
            {/* LANGUAGE DROPDOWN */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded-md hover:bg-green-50 hover:border-green-600 transition"
            >
              🌐 {language} ▼
            </button>

            {dropdownOpen && (
              <div className="absolute top-12 right-24 bg-white shadow-lg rounded-md w-32 border border-gray-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setDropdownOpen(false);

                      const langCode = languageCodeMap[lang];

                      if (lang === "English" && window.resetTranslation) {
                        window.resetTranslation();
                        setTimeout(() => window.location.reload(), 300);
                      } else if (window.changeLanguage) {
                        window.changeLanguage(langCode);
                      }
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-green-100 transition"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            {/* USER MENU */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 border border-green-200 hover:bg-green-100 transition max-w-[160px]"
                >
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-green-600" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md w-48 border border-gray-200 z-50">
                    <button
                      onClick={handleDashboardClick}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 flex gap-2"
                    >
                      <User className="w-4 h-4 text-gray-600" /> Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="border border-gray-300 px-4 py-1 rounded-md hover:bg-green-50 hover:border-green-600 hover:scale-105 transition">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 hover:scale-110 transition">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white border-t border-gray-200 shadow-inner">
          <div className="px-4 py-3 space-y-2">
            {/* PRODUCTS MOBILE */}
            <button
              onClick={() => setMobileProductsOpen((v) => !v)}
              className="w-full flex items-center justify-between text-gray-700 font-medium py-2"
            >
              <span>Products</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  mobileProductsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileProductsOpen && (
              <div className="pl-3 pb-2 space-y-1">
                {productLinks.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/products/${p.slug}`}
                    className="block px-2 py-2 text-gray-700 rounded hover:bg-green-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileProductsOpen(false);
                    }}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            )}

            {/* ABOUT */}
            <Link
              to="/about"
              className="block py-2 text-gray-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>

            {isAuthenticated && user?.role !== "admin" && (
              <>
                <Link
                  to="/user-dashboard"
                  className="block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Devices
                </Link>
                <Link
                  to="/user-dashboard/records"
                  className="block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Device Records
                </Link>
                <Link
                  to="/user-dashboard/config-logs"
                  className="block py-2"
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
