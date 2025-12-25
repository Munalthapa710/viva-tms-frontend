"use client";
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-6">
      {/* Header */}
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6 text-center">
        About Us
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-3xl text-center mb-12">
        Welcome to{" "}
        <span className="font-semibold text-indigo-600">VIVA TMS System</span>,
        where passion meets innovation. Our mission is to deliver quality,
        reliability, and creativity in everything we do.
      </p>

      {/* Mission Section */}
      <div className="grid sm:grid-cols-2 gap-10 max-w-5xl">
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600">
            We aim to empower our clients with exceptional solutions and
            services, focusing on innovation, integrity, and customer
            satisfaction.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Values
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              <strong>Innovation:</strong> Constantly evolving to provide modern
              solutions.
            </li>
            <li>
              <strong>Integrity:</strong> Honesty and transparency in
              everything.
            </li>
            <li>
              <strong>Excellence:</strong> Striving for quality in all we do.
            </li>
            <li>
              <strong>Customer Focus:</strong> Your satisfaction is our
              priority.
            </li>
          </ul>
        </div>
      </div>

      {/* Closing */}
      <p className="mt-12 text-center text-gray-600 max-w-2xl">
        Join us on our journey as we grow, innovate, and create something
        amazing together. Thank you for visiting our platform!
      </p>
    </div>
  );
}
