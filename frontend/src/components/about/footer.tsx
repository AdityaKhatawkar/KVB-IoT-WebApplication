import { Facebook, Instagram, Youtube, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About KVB
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/clients"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Clients
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Hybrid Solar Tunnel Dryer
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Scheffler Dish
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Parabolic Cooker
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Solar Concentrator
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-white transition-colors">
                  Parabolic Trough
                </Link>
              </li>
            </ul>
          </div>

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

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact us</h3>
            <div className="space-y-3">
              <Link
                to="https://www.instagram.com/kvbgreenenergies/?igsh=MXdxa2JqMXpoamVvMQ%3D%3D"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>FOLLOW US ON INSTAGRAM</span>
              </Link>
              <Link
                to="https://www.youtube.com/channel/UCB1lMrzFkZjs7qu4jxl32zA"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
                <span>FOLLOW US ON YOUTUBE</span>
              </Link>
              <Link
                to="https://www.facebook.com/people/KVB-green-Energies/100075492057443/"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span>FOLLOW US ON FACEBOOK</span>
              </Link>
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