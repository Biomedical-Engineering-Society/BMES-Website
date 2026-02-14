import ChatWidget from "../components/ChatWidget";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import ContactForm from "../components/ContactForm";

function Banner() {
  return (
    <div className="bg-[#2a296b] py-10 px-4 text-white text-center">
      <h1 className="text-2xl font-bold">Get In Touch</h1>
      <h2 className="mt-2">We would love to hear from you! Reach out with any questions or feedback.</h2>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="w-full flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">Contact Information</h2>
      <div className="flex items-center space-x-4 border border-gray-300 p-4 rounded-xl">
        <EnvelopeIcon className="size-7.25 text-[#2a296b]" />
        <div>
          <h3 className="font-semibold text-lg">Email Us</h3>
          <div>
            <p>General Inquiries: bmes@torontomu.ca</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 border border-gray-300 p-4 rounded-xl">
        <Image src="/icons/Instagram_Glyph_Gradient.png" alt="Instagram Logo" width={29} height={29} />
        <div>
          <h3 className="font-semibold text-lg">Instagram</h3>
          <div>
            <p><a href="https://www.instagram.com/bmes.tmu/" target="_blank" rel="noopener noreferrer">@bmes.tmu</a></p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 border border-gray-300 p-4 rounded-xl">
        <Image src="/icons/LI-In-Bug.png" alt="LinkedIn Logo" width={29} height={29} />
        <div>
          <h3 className="font-semibold text-lg">LinkedIn</h3>
          <div>
            <p><a href="https://www.linkedin.com/company/bmes-tmu/" target="_blank" rel="noopener noreferrer">BMES TMU Chapter</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Location() {
  return (
    <div className="p-4 flex flex-col sm:flex-row gap-10 justify-center items-center">
      <div>
        <h2 className="text-xl font-semibold">Visit Us</h2>
        <p>Toronto Metropolitan University</p>
        <p>350 Victoria Street</p>
        <p>Toronto, ON M5B 2K3</p>
      </div>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.541015998281!2d-79.38181142382295!3d43.65771687110197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cb35431c1395%3A0xe8ed8bd69125d6f4!2sToronto%20Metropolitan%20University!5e0!3m2!1sen!2sca!4v1769862199506!5m2!1sen!2sca"
        width="70%"
        height="300"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* INSTRUCTIONS FOR HARIS */}
      {/* HARIS: Create a Contact Form here.
        1. Fields: Name, Email, Subject, Message.
        2. Add our contact info (Email: bmes@torontomu.ca, Social links).
        3. Embed a Google Map of TMU (optional).
      */}

      <Banner />
      <div className="p-6 2xl:py-10 mx-auto w-5/6 2xl:w-300 flex flex-col space-y-6 2xl:space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:gap-20">
          <ContactForm />
          <ContactInfo />
        </div>
        <Location />
      </div>
      <ChatWidget />
    </div>
  );
}
