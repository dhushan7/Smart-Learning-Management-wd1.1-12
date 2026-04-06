import React, { useRef, useState, useEffect } from "react";
import Login from "../users/Login";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  // SECTION REFS
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleAbout = () => scrollToSection(aboutRef);
    const handleContact = () => scrollToSection(contactRef);

    window.addEventListener("scroll-about", handleAbout);
    window.addEventListener("scroll-contact", handleContact);

    return () => {
      window.removeEventListener("scroll-about", handleAbout);
      window.removeEventListener("scroll-contact", handleContact);
    };
  }, []);

  return (
    <div className="min-h-screen">

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-gray-100 p-10 text-center">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to Smart Learning
        </h1>

        <p className="text-lg text-gray-700 max-w-xl mx-auto">
          A centralized platform for students to manage learning effectively.
        </p>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => scrollToSection(aboutRef)}
            className="border px-6 py-3 rounded-xl"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section ref={aboutRef} className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-3xl bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-4">About Us</h1>
          <p className="text-gray-600 leading-relaxed">
            Welcome to our platform! We help students, admins, and academic staff
            manage learning activities efficiently. Our system provides task
            management, resources, analytics, and more in one place.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section ref={contactRef} className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent successfully!");
            }}
            className="space-y-4"
          >
            <input className="w-full border p-3 rounded-lg" placeholder="Name" required />
            <input className="w-full border p-3 rounded-lg" placeholder="Email" required />
            <textarea className="w-full border p-3 rounded-lg" rows="5" placeholder="Message" required />

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />
          <Login closeModal={() => setShowLogin(false)} />
        </div>
      )}
    </div>
  );
}