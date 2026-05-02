export default function AboutPreview({ aboutData }) {
  const heading = aboutData?.heading || "Who Are We?";
  const imageUrl = aboutData?.image?.url || "/images/logo.png";
  const missionTitle = aboutData?.missionTitle || "Our Mission";
  const missionDescription =
    aboutData?.missionDescription ||
    "To provide reliable and transparent assistance in securing U.S. and Canada visas for travel, work, visiting family, or migration. We aim to make the application process clear, smooth, and stress-free for every client.";
  const visionTitle = aboutData?.visionTitle || "Our Vision";
  const visionDescription =
    aboutData?.visionDescription ||
    "To be the most trusted partner in U.S. and Canada visa assistance, helping people achieve their goals abroad through professional service, integrity, and dedication.";

  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      {/* Top Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
        {heading}
      </h2>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Logo */}
        <img
          src={imageUrl}
          alt="About State101 Travel"
          className="w-56 h-56 md:w-72 md:h-72 rounded-full shadow-lg mx-auto"
        />

        {/* Mission / Vision Text */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-2xl font-semibold mb-3 text-gray-900">{missionTitle}</h3>
          <p className="text-gray-700 mb-8 leading-relaxed max-w-lg">
            {missionDescription}
          </p>

          <h3 className="text-2xl font-semibold mb-3 text-gray-900">{visionTitle}</h3>
          <p className="text-gray-700 leading-relaxed max-w-lg">
            {visionDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
