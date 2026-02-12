"use client";

import { useState } from "react";
import ChatWidget from "../components/ChatWidget";

const images = [
  
 


  "/media/Group_photo.jpg",
  "/media/DSC_0154.JPG",
  "/media/cubec.jpg", 
];

export default function AboutPage() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <div
        className="relative h-[55vh] w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/media/Group_photo.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-white text-5xl md:text-6xl font-bold tracking-wide">
          About Us
        </h1>
      </div>

      {/* ===== PAGE CONTENT ===== */}
      <div className="relative z-10 max-w-4xl mx-auto p-10 text-black">
        {/* Who We Are */}
        <h2 className="text-xl font-semibold mt-8 mb-2">Who We Are</h2>
        <p className="leading-relaxed text-gray-700">
The Biomedical Engineering Society (BMES) at Toronto Metropolitan University is a student-led organization dedicated to fostering innovation at the intersection of engineering and healthcare. We provide a collaborative platform for students passionate about biomedical engineering to connect, develop their skills, and grow both academically and professionally.        </p>

        {/* Mission */}
        <h2 className="text-xl font-semibold mt-8 mb-2">Mission Statement</h2>
        <p className="leading-relaxed text-gray-700">
          Our mission is to support and empower biomedical engineering students at TMU
          by promoting community, career development, and wellness. We aim to provide
          accessible opportunities for skill-building, networking, mentorship, and
          leadership through innovative programming that reflects the needs and values
          of our student body. We believe in fostering inclusive and collaborative
          spaces for all members, bridging the gap between academia and industry,
          prioritizing mental health and holistic student well-being, and encouraging
          technical exploration and creative problem-solving.
        </p>
{/* Why Join */}
<div className="flex flex-col md:flex-row items-center gap-8 my-10">

  {/* Text (LEFT) */}
  <div className="md:w-1/2">
    <h2 className="text-xl font-semibold mb-3">Why Join?</h2>

    <ul className="list-disc pl-5 space-y-2 text-gray-700 leading-relaxed">
      <li>Participate in hands-on technical workshops that complement coursework</li>
      <li>Attend career-focused events, panels, and networking sessions with industry professionals</li>
      <li>Gain mentorship and guidance from upper-year students and alumni</li>
      <li>Develop leadership, collaboration, and communication skills through involvement in projects</li>
      <li>Join a supportive, student-driven community within biomedical engineering</li>
    </ul>
  </div>

  {/* Image  */}
  <img
    src="/media/BMESConf.png"
    alt="BMES TMU event"
    className="md:w-7/12 h-80 rounded-xl shadow-md object-cover"
  />
</div>


        {/* History */}
        <h2 className="text-xl font-semibold mt-10 mb-2">History</h2>
        <p className="leading-relaxed text-gray-700">
        Founded in 2010, BMES at Toronto Metropolitan University serves as the official student chapter of the Biomedical Engineering Society, a global organization focused on advancing healthcare through engineering innovation. Since its establishment at TMU, the chapter has grown into an active student-led community that continues to evolve alongside the biomedical engineering program, adapting its initiatives to meet the changing academic, professional, and community needs of its members.
        </p>

        {/* Events */}
        <h2 className="text-xl font-semibold mt-10 mb-2">
          Events, Panels, Design Competitions, and Networking
        </h2>
        <p className="leading-relaxed text-gray-700">
          Throughout the academic year, BMES TMU hosts workshops, industry
          panels, design competitions, and networking sessions with
          professionals and alumni to help students explore career pathways and
          develop technical and professional skills.
        </p>
      </div>

      {/*SLIDESHOW SECTION  */}
      <div className="bg-white py-16">
        <h2 className="text-3xl font-semibold text-black text-center mb-8">
          Moments from BMES TMU
        </h2>

        <div className="relative max-w-5xl mx-auto px-6">
          <img
            src={images[current]}
            alt="BMES moment"
            className="w-full h-[500px] object-cover rounded-xl shadow-lg"
          />

          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 
                       bg-black/60 text-white p-3 rounded-full hover:bg-black"
          >
            ‹
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 
                       bg-black/60 text-white p-3 rounded-full hover:bg-black"
          >
            ›
          </button>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
