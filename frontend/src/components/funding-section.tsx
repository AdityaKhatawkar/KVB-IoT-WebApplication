import { useState } from "react";

export default function FundingSection() {
  const [headingClicked, setHeadingClicked] = useState(false);

  const funding = [
    {
      src: "/images/funding_Images/pusakrushi.png",
      name: "Pusa Krushi ICAR, Delhi",
      link: "https://pusakrishi.in/",
    },
    {
      src: "/images/funding_Images/UHS.png",
      name: "University of Horticulture Sciences, Bagalkot",
      link: "https://uhsbagalkot.karnataka.gov.in/en",
    },
  ];

  const handleHeadingClick = () => {
    setHeadingClicked(!headingClicked);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className={`text-3xl font-extrabold text-center mb-12 cursor-pointer transition-colors duration-300 hover:text-blue-500 ${
            headingClicked ? "text-pink-500" : ""
          }`}
          onClick={handleHeadingClick}
        >
          <span className="text-green-700">We have received </span>
          <span className="text-blue-600">funding </span>{" "}
          <span className="text-green-700">from </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {funding.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={item.src}
                alt={item.name}
                className="w-[240px] h-[150px] object-contain"
              />
              <span className="mt-4 text-lg font-semibold text-purple-700 hover:text-blue-500 transition-colors duration-300">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
