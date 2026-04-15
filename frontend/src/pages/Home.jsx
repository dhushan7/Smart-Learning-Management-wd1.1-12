import React, { useRef, useState, useEffect } from "react";
import Login from "../users/Login";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

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

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = {
    name: e.target.name.value,
    email: e.target.email.value,
    message: e.target.message.value,
  };

  try {
    const res = await fetch("http://localhost:8086/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Message sent successfully!");
    } else {
      alert("Failed to send message");
    }
  } catch (error) {
    console.error(error);
    alert("Error sending message");
  }
};

  return (
    <div className="min-h-screen font-sans text-gray-800">

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-100">
        
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
          Smart <span className="text-purple-600">Learning Platform</span>
        </h1>

        <p className="mt-4 text-lg text-gray-600 max-w-xl">
          Organize your studies, track tasks, manage resources, and boost your productivity — all in one place.
        </p>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-purple-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => scrollToSection(aboutRef)}
            className="border border-gray-400 px-8 py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Learn More
          </button>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl">
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📚 Task Management</h3>
            <p className="text-gray-600 text-sm">
              Keep track of assignments, deadlines, and priorities easily.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📊 Analytics</h3>
            <p className="text-gray-600 text-sm">
              Visualize your progress and improve your performance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📂 Resources</h3>
            <p className="text-gray-600 text-sm">
              Store and access all your study materials in one place.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        ref={aboutRef}
        className="min-h-screen flex items-center justify-center bg-white px-6"
      >
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl items-center">

          <div>
            <h2 className="text-4xl font-bold mb-4">About Our Platform</h2>
            <p className="text-gray-600 leading-relaxed">
              Smart Learning is designed to simplify academic life. Whether you're a student or educator, our platform helps manage tasks, organize learning resources, and track performance efficiently.
            </p>

            <button
              onClick={() => setShowLogin(true)}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Join Now
            </button>
          </div>

          <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg group">

          {/* VIDEO */}
          <video
            src="/video/preview.mp4"   
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xl font-semibold tracking-wide">
              🎓 Smart Learning
            </span>
          </div>

        </div>

        </div>
      </section>

      {/* CONTACT */}
      <section
        ref={contactRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-6"
      >
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10">

          {/* LEFT SIDE - INFO */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Get in Touch</h2>
            <p className="text-gray-600">
              Have questions or need help? Reach out to us anytime. We're here to support your learning journey.
            </p>

            <div className="space-y-4">

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                <div className="bg-blue-100 p-3 rounded-full">📧</div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600 text-sm">support@smartlearning.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                <div className="bg-green-100 p-3 rounded-full">📞</div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-gray-600 text-sm">+94 77 123 4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                <div className="bg-purple-100 p-3 rounded-full">📍</div>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-gray-600 text-sm">Sri Lanka</p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="bg-white shadow-2xl rounded-2xl p-8">

            <h3 className="text-2xl font-semibold mb-6 text-center">
              Send a Message
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}
              <input
                name="name"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                placeholder="Your Name"
                required
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                placeholder="Your Email"
                required
              />

              {/* MESSAGE */}
              <textarea
                name="message"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
                rows="5"
                placeholder="Your Message"
                required
              />

              {/* BUTTON */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition shadow-lg">
                Send Message 🚀
              </button>
            </form>

          </div>
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