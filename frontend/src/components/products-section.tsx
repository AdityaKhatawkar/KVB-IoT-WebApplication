"use client";

import { useState } from "react";
// import Image from "next/image";

export default function ProductsSection() {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const products = [
    { image: "images/service1.png", title: "Hybrid Solar Tunnel Dryer" },
    { image: "images/service2.png", title: "Solar Scheffler Dish" },
    { image: "images/service3.png", title: "Parabolic Cooker" },
    { image: "images/service4.png", title: "Solar Concentrator" },
    { image: "images/service5.png", title: "Solar Parabolic Trough" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          <span className="text-blue-600">KVB </span>
          <span className="text-green-600">PRODUCTS AND SERVICES</span>
        </h2>
        <p className="text-base text-gray-600 mt-2">
          Producing world-class Solar Energy Systems for harnessing power from
          the Sun
        </p>
      </div>

      {/* Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6">
        {products.map((product, index) => (
          <div
            key={index}
            className="relative group flex justify-center items-center"
            onMouseEnter={() => setHoveredProduct(index)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Image wrapper */}
            <div className="w-full h-[350px] flex justify-center items-center bg-white rounded-xl shadow-md overflow-hidden relative">
              <img
                src={`/${product.image}`}
                alt={product.title}
                width={500}
                height={500}
                className={`object-contain w-full h-full transition-transform duration-500 ease-in-out ${
                  hoveredProduct === index
                    ? "scale-105 blur-[3px]"
                    : "scale-100 blur-0"
                }`}
              />

              {/* Overlay Text + Button */}
              <div
                className={`absolute inset-0 flex flex-col justify-center items-center text-center transition-all duration-500 ${
                  hoveredProduct === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {/* Product title */}
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-4">
                  {product.title}
                </h3>

                {/* Know More button */}
                <button className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:scale-105 transition">
                  Know More →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
