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
    <div className="font-sans text-gray-800">

      {/* PAGE 1: HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-br from-indigo-200 via-blue-100 to-purple-100">
        
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mt-10">
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
            className="border border-gray-400 px-8 py-3 rounded-xl hover:bg-gray-200 transition bg-white/50 backdrop-blur-sm"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* PAGE 2: FEATURES */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-20">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Everything You Need to Succeed</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the powerful tools designed to simplify your academic journey and maximize your productivity.
          </p>
        </div>

        {/* 5 FEATURE CARDS */}
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl w-full">
          
          {/* Tasks */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 w-full md:w-[30%] text-left border border-gray-100">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Task Management</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Keep track of your assignments, upcoming deadlines, and organize your daily academic goals effortlessly.
            </p>
          </div>

          {/* Resources */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 w-full md:w-[30%] text-left border border-gray-100">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Study Resources</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Access a centralized hub for lecture materials, notes, and shared documents approved by the academic panel.
            </p>
          </div>

          {/* Quizzes */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 w-full md:w-[30%] text-left border border-gray-100">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Interactive Quizzes</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Test your knowledge with automated quizzes, track your past attempts, and get instant performance feedback.
            </p>
          </div>

          {/* Supportive Sessions */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 w-full md:w-[46%] text-left border border-gray-100">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Supportive Sessions</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Browse upcoming schedules and join live peer and tutor sessions to clear doubts and collaborate in real-time.
            </p>
          </div>

          {/* Chatbot */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 w-full md:w-[46%] text-left border border-gray-100">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Community Chatbot</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get instant answers to your platform questions 24/7, powered by our smart AI assistant designed just for students.
            </p>
          </div>

        </div>
      </section>

      {/* PAGE 3: ABOUT */}
      <section
        ref={aboutRef}
        className="min-h-screen flex items-center justify-center bg-white px-6 py-12"
      >
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl items-center">

          <div>
            <h2 className="text-4xl font-bold mb-4">About Our Platform</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Smart Learning is designed to simplify academic life. Whether you're a student looking to track tasks and test your knowledge, or an educator sharing valuable resources, our platform connects the dots efficiently.
            </p>

            <button
              onClick={() => setShowLogin(true)}
              className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-md font-semibold"
            >
              Join Now
            </button>
          </div>

          <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl group">

            {/* VIDEO */}
            <video
              src="/video/preview.mp4"   
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors duration-500 group-hover:bg-black/30">
              <span className="text-white text-2xl font-bold tracking-wide drop-shadow-md">
                🎓 Smart Learning
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* PAGE 4: CONTACT */}
      <section
        ref={contactRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 px-6 py-12"
      >
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-10">

          {/* LEFT SIDE - INFO */}
          <div className="space-y-6 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-gray-800">Get in Touch</h2>
            <p className="text-gray-600 text-lg">
              Have questions or need help? Reach out to us anytime. We're here to support your learning journey.
            </p>

            <div className="space-y-4 mt-4">

              <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-blue-100 text-2xl p-4 rounded-full">📧</div>
                <div>
                  <p className="font-bold text-gray-800">Email</p>
                  <p className="text-gray-500">support@smartlearning.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-green-100 text-2xl p-4 rounded-full">📞</div>
                <div>
                  <p className="font-bold text-gray-800">Phone</p>
                  <p className="text-gray-500">+94 77 123 4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-purple-100 text-2xl p-4 rounded-full">📍</div>
                <div>
                  <p className="font-bold text-gray-800">Location</p>
                  <p className="text-gray-500">Sri Lanka</p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-50">

            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Send a Message
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* NAME */}
              <input
                name="name"
                className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"
                placeholder="Your Name"
                required
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"
                placeholder="Your Email"
                required
              />

              {/* MESSAGE */}
              <textarea
                name="message"
                className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"
                rows="5"
                placeholder="Your Message"
                required
              />

              {/* BUTTON */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg py-4 rounded-xl hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          />
          <Login closeModal={() => setShowLogin(false)} />
        </div>
      )}
    </div>
  );
}