import { Eye, Target, Shield, Award } from "lucide-react";
import Footer from "@/components/about/footer";

export default function AboutPage() {
  const values = [
    {
      icon: Eye,
      title: "Vision",
      description:
        "Innovative, Design, Commercialize and promote renewable energy system for social and environmental gains in commercially sustainable manner.",
    },
    {
      icon: Target,
      title: "Mission",
      description:
        "To be a number one company in renewable energy cooking system in India and to promote GO GREEN energy.",
    },
    {
      icon: Shield,
      title: "Values",
      description:
        "We prioritize client satisfaction and provide best quality service.",
    },
    {
      icon: Award,
      title: "Goals",
      description:
        "Promote environmental solutions which utilize natural resource to replace electricity and LPG.",
    },
  ];

  return (
    <main className="w-full relative">
      <header className="relative w-full h-[80vh] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/AboutHeader.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl font-bold text-[rgb(216,242,134)] drop-shadow-lg">
            KVB GREEN ENERGIES
          </h1>
          <p className="text-lg text-[rgb(216,242,134)] mt-4 max-w-3xl drop-shadow-md">
            Leading manufacturer and suppliers of concentrated solar technology
            <br />
            and Solar Green House Driers
          </p>
        </div>
      </header>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-blue-600">ABOUT</span>{" "}
                <span className="text-green-600">KVB GREEN ENERGIES</span>
              </h2>
              <p className="text-gray-700 leading-relaxed text-justify">
                The KVB Green Energies founded in 2020. KVB GREEN ENERGIES is
                registered with MNRE for manufacturing and supply solar
                concentrated solar technology. The idea of evolving company is
                to go green and environment friendly by utilizing natural
                resource which could save electricity with affordable cost. The
                company is evolved with technical professionals to utilize
                sunlight in daily life of individual family or larger group. We
                endeavor to provide best quality with high standards of service
                in our solar products. Though company is new but employees have
                got more than 30 year experience in solar business.
              </p>

              <div className="text-center mt-6">
                <a
                  href="/videos/Company Profile.pdf"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  download
                  target="_blank"
                >
                  Download Company Profile
                </a>
              </div>
            </div>

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

      <section className="py-20 bg-gray-50 text-center relative">
        <h2 className="text-4xl md:text-5xl font-bold mb-12">
          <span className="text-blue-600">OUR</span>{" "}
          <span className="text-green-600">RECENT WORKS</span>
        </h2>

        <div className="relative w-full h-[80vh] overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/videos/KVB.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 -mt-24 flex justify-center">
          <div className="bg-white shadow-2xl rounded-2xl p-12 max-w-6xl w-[92%] flex flex-col md:flex-row items-center md:items-center gap-12">
            <div className="flex items-center text-center md:text-left">
              <span className="text-8xl font-extrabold text-blue-600">[</span>
              <div className="mx-6 flex flex-col items-center">
                <span className="text-8xl font-extrabold text-gray-900">
                  30+
                </span>
                <span className="text-xl text-gray-600 font-medium mt-2">
                  years of solar expertise
                </span>
              </div>
              <span className="text-8xl font-extrabold text-blue-600">]</span>
            </div>

            <div className="flex-1 text-left">
              <h4 className="bg-black text-white px-6 py-2 rounded mb-6 inline-block text-sm font-semibold uppercase tracking-wide">
                Recently Installed Some Solar Tunnel Dryers At:
              </h4>
              <ul className="list-disc pl-6 space-y-3 text-gray-700 text-base">
                {[
                  "Agricultural University, Godhra, Gujarat",
                  "Agricultural University, Dantiwada, Gujarat",
                  "University of Agricultural Sciences (UAS), Bangalore – Chamarajanagar",
                  "Keladi Shivappa Nayaka Agricultural and Horticultural Sciences, Shivamogga (Mudagiri)",
                  "University of Horticultural Sciences (UHS), Bagalkot – Devihosur",
                  "Biodiversity , Goa",
                  "Goa Energy Development Agency(GEDA), Goa",
                  "Central Coastal Agricultural Research Institute(ICAR), Old Goa",
                  "IIT Dharwad, Karnataka",
                ].map((client, i) => (
                  <li key={i}>{client}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            <span className="text-blue-600">Working</span>{" "}
            <span className="text-green-600">of Solar Dryers Explained</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-6">
              <img
                src="/images/applications/betelNut.png"
                alt="Betel Nut Drying"
                className="rounded-lg shadow-md"
              />
              <img
                src="/images/applications/fishDrying.png"
                alt="Fish Drying"
                className="rounded-lg shadow-md"
              />
              <img
                src="/images/applications/gingerDrying.png"
                alt="Ginger Drying"
                className="rounded-lg shadow-md"
              />
              <img
                src="/images/applications/paddyDrying.png"
                alt="Turmeric Drying"
                className="rounded-lg shadow-md"
              />
              <img
                src="/images/applications/redChilliDrying.png"
                alt="Chili Drying"
                className="rounded-lg shadow-md"
              />
              <img
                src="/images/applications/spices.png"
                alt="Fruit Drying"
                className="rounded-lg shadow-md"
              />
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed text-justify text-lg">
                &nbsp; &nbsp;KVB Solar’s Driers are built using high-quality
                polycarbonate sheets that come with UV-protective coatings on
                both sides. These sheets ensure that the colors of the drying
                materials are not damaged and can also withstand high
                temperatures. The solar greenhouse uses this design to dry
                materials efficiently by utilizing hot air produced from
                radiated solar energy, while the Cuddappa flooring further
                absorbs solar radiation.
                <br />
                &nbsp; &nbsp; &nbsp;The multiwall polycarbonate sheet cover
                allows transmission of solar energy while preventing reflected
                and diffused radiation from escaping. This effect increases the
                temperature inside the drying chamber, creating the right
                conditions for effective drying. The hot air inside the chamber
                absorbs the moisture from the materials kept inside.
                <br />
                &nbsp; &nbsp; &nbsp;Once the air becomes humid, it is exhausted
                through DC and AC fans, which are controlled by a temperature
                and humidity controller. Users can set the desired temperature
                and humidity levels, and during non-sunny periods, electric
                heaters along with AC/DC fans maintain the required conditions.
                This ensures that the drying process continues smoothly even
                when sunlight is unavailable.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}