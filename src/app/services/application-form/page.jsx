export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function ApplicationFormPage({ searchParams }) {
  const submitted = searchParams?.submitted === "1";
  const error = searchParams?.error;

  const requirements = await prisma.requirementItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/images/logo.png" width={48} height={48} alt="Logo" />
            <h1 className="text-2xl font-bold text-blue-700">Apply Now</h1>
          </div>

          {submitted && (
            <div className="mb-6 rounded bg-green-100 text-green-800 px-4 py-3">
              Thank you! Your application has been submitted.
            </div>
          )}
          {error && (
            <div className="mb-6 rounded bg-red-100 text-red-800 px-4 py-3">{error}</div>
          )}

          <form
            action="/api/application/submit"
            method="POST"
            encType="multipart/form-data"
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="fullName"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phone"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="0917 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  name="address"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="City / Province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visa Type</label>
                <input
                  name="visaType"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="Canadian, Australian, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input type="number" name="age" min={1} required className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Time</label>
                <input
                  name="availableTime"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="9AM - 12PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Day</label>
                <input
                  name="availableDay"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="Monday"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Files (Valid passport (Photocopy), Updated Resume, etc.)</label>
              <input
                type="file"
                name="files"
                multiple
                className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold px-6 py-2 rounded hover:from-blue-700 hover:to-red-700"
            >
              Submit Application
            </button>
          </form>
        </div>

        <section className="mt-10 bg-white/95 rounded-xl shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Initial Requirements</h2>
          {requirements.length === 0 ? (
            <p className="text-gray-600">No requirements available at the moment.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {requirements.map((item) => (
                <li key={item.id} className="border rounded p-4">
                  <div className="flex items-start gap-3">
                    {item.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.icon} alt="" className="h-6 w-6 mt-1" />
                    ) : (
                      <span className="h-2 w-2 mt-2 rounded-full bg-blue-600 inline-block" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.title}
                        {item.isRequired && (
                          <span className="ml-2 text-xs font-medium text-red-600">Required</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
