import Image from "next/image";

export default function OurStory() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title + Icon */}
        <div className="flex items-center mb-2">
          <Image
            src="/icons/Airplane.png"
            alt="Airplane Icon"
            width={40}
            height={40}
            className="mr-3"
          />
          <h2 className="text-3xl font-bold text-gray-800">Our Story</h2>
        </div>

        {/* Subtext + Divider */}
        <div className="mb-10">
          <p className="text-gray-600 mb-2">2017, 8 years ago</p>
          <div className="h-1 bg-blue-500 w-full"></div>
        </div>

        {/* Two-column content */}
        <div className="grid md:grid-cols-2 gap-10 text-gray-700 leading-relaxed">
          <p>
            State101 Travel has been a trusted expert in visa consultancy since
            2017, helping individuals and families achieve their dreams of
            traveling, working, and migrating to the United States and Canada.
            What began as a small team with a passion for service has grown into
            a reliable partner for countless clients who need clear, honest, and
            professional guidance. We know the visa process can be overwhelming,
            which is why we make it simple, transparent, and stress-free.
          </p>
          <p>
            Through the years, we’ve also guided many clients in exploring
            training opportunities in the U.S., especially in the caregiving
            field, where they gain valuable skills and experience for their
            future careers. With over eight years of service, our reputation is
            built on trust, integrity, and proven results. Whether you’re
            visiting loved ones, pursuing new opportunities, or starting a new
            life abroad, State101 Travel is here to guide you every step of the
            way.
          </p>
        </div>
      </div>
    </section>
  );
}
