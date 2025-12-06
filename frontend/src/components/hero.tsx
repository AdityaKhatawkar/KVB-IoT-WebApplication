import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const slides = [
  {
    src: "/images/solarTunnel3.png",
    title: "KVB GREEN ENERGIES",
    subtitle:
      "LEADING MANUFACTURER AND SUPPLIERS OF CONCENTRATED SOLAR TECHNOLOGY AND SOLAR GREEN HOUSE DRIERS",
  },
  {
    src: "/images/drying_fruits.png",
    title: "Hybrid Solar Tunnel Dryer",
    subtitle: "POLYCARBONATE DRYER SUITABLE FOR DRYING MOST OF THE FOOD CROPS",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={slides[current].src}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <img
            src={slides[current].src}
            alt={slides[current].title}
            className="object-cover object-center w-full h-full"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              {slides[current].title}
            </h1>

            <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl">
              {slides[current].subtitle}
            </p>

            <Button className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-lg px-8 py-3 rounded-xl shadow-lg">
              Know More
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path
            d="M12 2.25c-5.385 0-9.75..."
          />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path d="..." />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 w-full flex justify-center space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${
              current === idx ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
