import ChatWidget from "../components/ChatWidget";

export default function EventsPage() {
  return (
    <div className="min-h-screen p-10">
      {/* INSTRUCTIONS FOR YOU (LEAD) */}
      {/* TODO:
        1. Build Interactive Calendar (React-Calendar or FullCalendar).
        2. Fetch events from a database or JSON file.
        3. Ensure the AI Chatbot can read these events later (Future Goal).
      */}
      <h1 className="text-3xl font-bold">Upcoming Events</h1>
      <ChatWidget />
    </div>
  );
}
