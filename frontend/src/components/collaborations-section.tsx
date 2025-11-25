export default function CollaborationsSection() {
  const collaborations = [
    {
      src: "/images/collaboration/fpo.png",
      name: "Ministry of New & Renewable Energy, New Delhi",
      link: "https://mnre.gov.in/",
    },
    {
      src: "/images/collaboration/goa_energy_development_agency.png",
      name: "United Nation Industrial Development Organization",
      link: "https://www.unido.org/",
    },
    {
      src: "/images/collaboration/khd.jpeg",
      name: "Maharastra Energy Development Agency",
      link: "https://www.mahaurja.com/meda/",
    },
    {
      src: "/images/collaboration/mhaenergy.png",
      name: "Goa Energy Development Agency, Goa",
      link: "https://goasolar.in/",
    },
    {
      src: "/images/collaboration/ministry.png",
      name: "Karnataka Horticultural Department, Bangalore",
      link: "https://horticulturesec.karnataka.gov.in/en",
    },
    {
      src: "/images/collaboration/unido.png",
      name: "Farmer Producer Organization, Uttar Pradesh",
      link: "https://farmerconnect.apeda.gov.in/Home/",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12 cursor-pointer transition-colors duration-300 hover:text-blue-500">
          <span className="text-blue-600">Collaboration</span>{" "}
          <span className="text-green-700">Partners</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
          {collaborations.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={item.src}
                alt={item.name}
                className="w-[240px] h-[150px] object-contain"
              />
              <span className="mt-4 text-lg font-semibold text-purple-700 text-center hover:text-blue-500 transition-colors duration-300">
                {item.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}