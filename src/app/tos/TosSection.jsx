"use client";

export default function TosSection() {
  return (
    <section className="mb-16">
      {/* Title */}
  <h1 className="text-4xl font-bold mb-4 text-blue-700">Terms of Service</h1>

      {/* Intro */}
      <p className="text-gray-700 mb-8">
        By engaging with State101 Travel, you agree to the following terms and
        conditions.
      </p>

      {/* Sections */}
  <div className="space-y-8">
        {/* Our Services */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">1. Our Services</h2>
          <p className="text-red-600">
            State101 Travel provides professional visa consultancy and guidance
            for individuals and families seeking to travel, work, or migrate to
            the United States and Canada. Our services include, but are not
            limited to, eligibility checks, document preparation, and guidance
            through the application process.
          </p>
          <p className="mt-2 text-red-600">
            <strong className="text-blue-700">For Canada:</strong> We assist clients with the Permanent
            Residency application via the Express Entry system. We guide you
            from profile creation and document preparation through to final
            submission.
          </p>
          <p className="mt-2 text-red-600">
            <strong className="text-blue-700">For the United States:</strong> We offer visa consultancy
            for those interested in travel, work, or training opportunities,
            including caregiver training programs. We provide guidance on
            requirements and orientation to help you prepare for your journey.
          </p>
        </div>

        {/* Our Role */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">2. Our Role</h2>
          <p className="text-red-600">
            State101 Travel acts as a consultant and guide. While we use our
            experience and expertise to assist you, we cannot guarantee the
            outcome of any visa application. The final decision rests solely
            with the respective government authorities of the United States and
            Canada. Our reputation is built on providing honest and reliable
            support, not on guaranteeing results.
          </p>
        </div>

        {/* Client Responsibilities */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">
            3. Client Responsibilities
          </h2>
          <ul className="list-disc list-inside space-y-1 text-red-600">
            <li>Provide accurate, complete, and truthful information.</li>
            <li>Cooperate fully with our team and respond in a timely manner.</li>
            <li>
              Understand responsibility for fees charged by government agencies,
              third-party services, or other organizations.
            </li>
          </ul>
        </div>

        {/* Limitation of Liability */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">
            4. Limitation of Liability
          </h2>
          <p className="text-red-600">State101 Travel is not liable for damages including:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-red-600">
            <li>Visa application rejections or delays.</li>
            <li>Changes in immigration laws or policies.</li>
            <li>Errors or omissions in the information you provide.</li>
            <li>Loss of income, opportunity, or travel plans.</li>
          </ul>
        </div>

        {/* Changes */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">
            5. Changes to Our Services and Terms
          </h2>
          <p className="text-red-600">
            We reserve the right to update or change these terms and conditions
            at any time. We may also modify our service offerings to adapt to
            changes in immigration regulations or business operations. Any
            significant changes will be communicated to our clients.
          </p>
          <p className="mt-2 text-red-600">
            By continuing to use our services, you accept and agree to the
            latest version of these terms.
          </p>
        </div>
      </div>
    </section>
  );
}
