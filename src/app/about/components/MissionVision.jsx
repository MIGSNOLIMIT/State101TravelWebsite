export default function MissionVision() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        {/* Mission */}
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700">Our Mission</h2>
          <div className="w-full h-1 bg-red-500 mb-6"></div>
          <p className="text-gray-700 leading-relaxed">
            To provide reliable and transparent assistance in securing U.S. and Canada visas 
            for travel, work, visiting family, or migration. We aim to make the application 
            process clear, smooth, and stress-free for every client.
          </p>
        </div>

        {/* Vision */}
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700">Our Vision</h2>
          <div className="w-full h-1 bg-red-500 mb-6"></div>
          <p className="text-gray-700 leading-relaxed">
            To be the most trusted partner in U.S. and Canada visa assistance, helping people 
            achieve their goals abroad through professional service, integrity, and dedication.
          </p>
        </div>
      </div>
    </section>
  );
}
