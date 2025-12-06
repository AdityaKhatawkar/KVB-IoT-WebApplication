import { Facebook, Instagram, Youtube, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About KVB
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/clients" className="text-gray-300 hover:text-white transition-colors">
                  Clients
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Hybrid Solar Tunnel Dryer
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Scheffler Dish
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Parabolic Cooker
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Solar Concentrator
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Parabolic Trough
                </a>
              </li>
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in touch</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  R16, KSIDC, 3rd Cross Belur
                  <br />
                  Industrial Estate Dharwad-
                  <br />
                  580011.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <p className="text-gray-300">+91 954 5529 950</p>
              </div>
            </div>
          </div>

          {/* Contact us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact us</h3>
            <div className="space-y-3">

              <a
                href="https://www.instagram.com/kvbgreenenergies/?igsh=MXdxa2JqMXpoamVvMQ%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>FOLLOW US ON INSTAGRAM</span>
              </a>

              <a
                href="https://www.youtube.com/channel/UCB1lMrzFkZjs7qu4jxl32zA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
                <span>FOLLOW US ON YOUTUBE</span>
              </a>

              <a
                href="https://www.facebook.com/people/KVB-green-Energies/100075492057443/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span>FOLLOW US ON FACEBOOK</span>
              </a>

            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-green-700 text-center">
          <p className="text-gray-300">© 2024 KVB Green Energies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ADMIN FOOTER
export function AdminFooterCopyright() {
  return (
    <footer className="w-full fixed bottom-0 left-0 bg-white border-t border-gray-200 py-3 z-50">
      <p className="text-center text-gray-500 text-sm">
        © 2026 KVB Green Energies. All rights reserved.
      </p>
    </footer>
  );
}
