import ChatWidget from "../components/ChatWidget";

export default function TeamPage() {
  return (
    <div className="min-h-screen p-10">
      {/* INSTRUCTIONS FOR AYDIN */}
      {/* AYDIN: This is the Exec Team Gallery.
        1. Create a grid layout (3 columns).
        2. Add 'TeamCard' components for each exec (Image, Name, Role, LinkedIn link).
        3. Add a section for 'Past Execs' or 'Gallery' of event photos at the bottom.
      */}
      <h1 className="text-3xl font-bold">Meet the Team</h1>
      <ChatWidget />
    </div>
  );
}
