import ChatWidget from "../components/ChatWidget";

export default function ContactPage() {
  return (
    <div className="min-h-screen p-10">
      {/* INSTRUCTIONS FOR HARIS */}
      {/* HARIS: Create a Contact Form here.
        1. Fields: Name, Email, Subject, Message.
        2. Add our contact info (Email: bmes@torontomu.ca, Social links).
        3. Embed a Google Map of TMU (optional).
      */}
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <ChatWidget />
    </div>
  );
}
