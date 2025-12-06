import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const clients = [
    "images/client1.png",
    "images/client2.png",
    "images/client3.png",
    "images/client4.png",
    "images/client5.png",
    "images/client6.png",
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % clients.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + clients.length) % clients.length);
  };

  const getVisibleClients = () => {
    const visible = [];
    for (let i = 0; i < 4; i++) {
      visible.push(clients[(currentIndex + i) % clients.length]);
    }
    return visible;
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          <span className="text-green-600">OUR CLIENTS</span>
        </h2>

        <div className="relative">
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full w-12 h-12 border-gray-300 hover:border-green-600 bg-white shadow-md transition duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="grid grid-cols-4 gap-10 flex-1 max-w-5xl transition-transform duration-500 ease-in-out">
              {getVisibleClients().map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm transform transition-all duration-500 ease-out hover:scale-110 hover:shadow-xl"
                >
                  <img
                    src={client}
                    alt={`Client ${index + 1}`}
                    className="w-[220px] h-[140px] object-contain"
                  />
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full w-12 h-12 border-gray-300 hover:border-green-600 bg-white shadow-md transition duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
