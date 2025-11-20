export default function YoutubeSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            <span className="text-blue-600">Checkout </span>
            <span className="text-green-600">Our YouTube Channel</span>
          </h2>
          <p className="text-lg text-gray-600 mt-2">
            Explore Our Products with a closer View.
          </p>
        </div>

        {/* Videos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="aspect-video transform transition duration-500 hover:scale-105 rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/tE3VPiiU0WQ"
              title="Siddarath Matha solar steam cooking"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="aspect-video transform transition duration-500 hover:scale-105 rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/wCM_D2bMMRY"
              title="Siddaganga Math Tumkur Solar Steam"
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
