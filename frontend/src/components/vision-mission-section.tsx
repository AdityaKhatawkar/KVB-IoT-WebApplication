import { useEffect, useState } from "react";

// --------------------
// Extracted Component
// --------------------
function CircularProgress({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#bg)"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Gradient */}
          <defs>
            <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{value}%</span>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-700 text-center uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

// ---------------------------
// Main Vision/Mission Section
// ---------------------------
export default function VisionMissionSection() {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues((prev) =>
        prev.map((val) => (val < 100 ? val + 5 : 100))
      );
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Titles */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              Innovative, Design, Commercialize and promote renewable energy
              system for social and environmental gains in commercially
              sustainable manner.
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To be a number one company in renewable energy cooking system in
              India and to promote GO GREEN energy.
            </p>
          </div>
        </div>

        {/* Progress Circles */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
          <CircularProgress value={animatedValues[0]} label="CUSTOMIZED DESIGN" />
          <CircularProgress value={animatedValues[1]} label="24X7 SUPPORT" />
          <CircularProgress value={animatedValues[2]} label="IN-HOUSE R&D" />
        </div>
      </div>
    </section>
  );
}
