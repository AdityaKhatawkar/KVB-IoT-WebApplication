export default function InsightsSection() {
  const insights = [
    {
      title:
        '"IoT Revolutionizes Solar Tunnel Dryer: Improving Efficiency and Performance"',
      image: "images/stayUpdated1.png",
    },
    {
      title:
        '"Sustainable Cooking at Anganwadi Centers with a 4 Square Meter Parabolic Cooker"',
      image: "images/stayUpdated2.png",
    },
    {
      title:
        '"Scheffler Dish Direct Cooking: Overview, Functionality, and Automation"',
      image: "images/stayUpdated3.png",
    },
    {
      title: "Optimizing Solar Tunnel Dryers with Artificial Intelligence",
      image: "images/stayUpdated4.png",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <p className="text-sm text-green-600 font-semibold mb-2 tracking-wide">
            GET THE LATEST INSIGHTS
          </p>
          <h2 className="text-3xl font-bold text-gray-800">
            Stay updated with the latest trends and benefits
            <br />
            of Solar Technology
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden transform transition-transform duration-500 hover:scale-105 flex flex-col"
            >
              
              <img
                src={insight.image}
                alt={insight.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-6 flex flex-col flex-1 text-center">
                <h3 className="font-semibold text-gray-700 mb-6 text-sm leading-relaxed transition-colors duration-300 hover:text-blue-800">
                  {insight.title}
                </h3>

                <div className="mt-auto">
                  <button
                    className="
                      group relative inline-flex items-center justify-center
                      px-6 py-2 text-sm font-medium rounded-full overflow-hidden
                      border border-green-600 text-green-600
                      focus:outline-none
                    "
                  >
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                      READ MORE
                    </span>

                    <span
                      className="
                        absolute inset-0 bg-green-600 transform scale-x-0 origin-left
                        transition-transform duration-300 ease-out rounded-full z-0 pointer-events-none
                        group-hover:scale-x-100
                      "
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
