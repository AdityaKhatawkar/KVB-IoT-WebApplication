import { Users, Lightbulb, Shield, Award } from "lucide-react";

export default function AboutSection() {
  const values = [
    {
      icon: Users,
      title: "Customer Satisfaction",
      description:
        "We strive to exceed our customers expectations and ensure their complete satisfaction.",
    },
    {
      icon: Lightbulb,
      title: "Continuous Innovations",
      description:
        "Innovations and Exploring new technologies to provide cutting-edge solutions for our customers.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We prioritize maintaining data integrity through robust security measures and quality control.",
    },
    {
      icon: Award,
      title: "Passion for Excellence",
      description:
        "We are committed to delivering Hybrid Solar solutions that exceed expectations.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* About Text */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-blue-600">ABOUT</span>{" "}
              <span className="text-green-600">KVB GREEN ENERGIES</span>
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              "We pride ourselves on being at the forefront of innovation,
              continually delivering cutting-edge Hybrid Solar Intelligent
              Solutions since our establishment in 2019. Our commitment extends
              beyond mere product delivery; we provide comprehensive end-to-end
              solutions, from conceptualization through meticulous design and
              fabrication to seamless on-site installation. With a relentless
              dedication to excellence, we harness the latest advancements in
              technology to empower our clients with sustainable, efficient, and
              intelligent energy solutions that pave the way towards a brighter,
              greener future.".
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
