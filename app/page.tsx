import ChatWidget from "./components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      {/* INSTRUCTIONS FOR HASSAN */}
      {/* HASSAN: This is your workspace!
        1. Create a Hero Section (Big image, 'Welcome to BMES', Call to Action button).
        2. Create a 'Highlights' section showing 3 main pillars (Community, Professional, Academic).
        3. Use Tailwind CSS for styling.
      */}
      <h1 className="text-4xl font-bold mb-4">Welcome to BMES TMU</h1>
      <p className="text-xl text-gray-600">
        Community of Biomedical Engineering.
      </p>

      {/* The Chatbot, floating on top */}
      <ChatWidget />
    </main>
  );
}
