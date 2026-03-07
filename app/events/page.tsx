"use client";

import { useState } from "react";
import ChatWidget from "../components/ChatWidget";

// 1. The Manual Event Database
const eventsData = [
  {
    id: 1,
    title: "BMES Synapse Conference 2026",
    date: "2026-02-14",
    time: "10:30 AM - 6:00 PM EST",
    location: "Daphne Cockwell Complex (DCC), 288 Church Street",
    description:
      "Toronto's biggest Biomedical Engineering Conference! Join us as we fire the next signal in healthcare innovation. Includes complimentary meals, LinkedIn headshots, and a Case Competition.",
    category: "Science & Tech",
    link: "https://www.eventbrite.ca/e/bmes-synapse-conference-2026-tickets-1981463940987",
  },
  {
    id: 2,
    title: "BME Unfiltered: Career Panel",
    date: "2026-02-04",
    time: "6:00 PM - 8:00 PM EST",
    location:
      "George Vari Engineering and Computing Centre, ENG (Sears Atrium)",
    description:
      "Get ready to hear real talk from professionals in BME Unfiltered. Current trends, raw advice, and networking. Collab event with MUES. Food provided!",
    category: "Career",
    link: "#",
  },
  {
    id: 3,
    title: "Industry Night & Networking",
    date: "2026-03-15",
    time: "5:30 PM - 8:30 PM EST",
    location: "Student Learning Centre (SLC)",
    description:
      "Meet industry professionals from leading biotech firms in Toronto. Bring your resume and your best elevator pitch!",
    category: "Networking",
    link: "#",
  },
];

export default function EventsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");

  // --- NEW: Interactive Calendar States ---
  // Tracks which month the calendar is currently showing
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  // Tracks which event the user clicked on
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // List View Logic
  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = eventsData
    .filter((event) => event.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = eventsData
    .filter((event) => event.date < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- CALENDAR ENGINE LOGIC ---
  const currentYear = currentCalendarDate.getFullYear();
  const currentMonth = currentCalendarDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = Array(firstDayOfMonth)
    .fill(null)
    .concat(
      Array.from({ length: daysInMonth }, (_, i) => {
        const monthStr = String(currentMonth + 1).padStart(2, "0");
        const dayStr = String(i + 1).padStart(2, "0");
        return `${currentYear}-${monthStr}-${dayStr}`;
      }),
    );

  // Calendar Navigation Functions
  const prevMonth = () => {
    setCurrentCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const nextMonth = () => {
    setCurrentCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };
  const goToToday = () => {
    setCurrentCalendarDate(new Date());
  };

  // Reusable Event Card (For List View)
  const EventCard = ({ event, isPast }: { event: any; isPast: boolean }) => {
    // FIX: Force JS to read this as a local time zone date
    const displayDate = new Date(event.date.replace(/-/g, "/"));

    return (
      <div
        className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${isPast ? "opacity-75 grayscale-[20%]" : "border-blue-100"}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {event.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-3">
              {event.title}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-800">
              {/* Use displayDate here */}
              {displayDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-sm text-gray-500">
              {/* Use displayDate here */}
              {displayDate.getFullYear()}
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p className="flex items-center gap-2"> {event.time}</p>
          <p className="flex items-center gap-2">📍 {event.location}</p>
        </div>
        <p className="text-gray-600 text-sm mb-6 line-clamp-3">
          {event.description}
        </p>
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-block px-5 py-2 rounded-lg text-sm font-medium transition ${isPast ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {isPast ? "View Details" : "Get Tickets"}
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER & TOGGLE */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              EVENTS
            </h1>
            <p className="text-gray-600 mt-2">
              Join us at our upcoming workshops, panels, and conferences.
            </p>
          </div>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${view === "list" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"}`}
            >
              List View
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${view === "calendar" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"}`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        {view === "list" ? (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* ... (List View stays exactly the same) ... */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Upcoming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} isPast={false} />
                  ))
                ) : (
                  <p className="text-gray-500 italic bg-white p-6 rounded-xl border">
                    No upcoming events right now. Check back soon!
                  </p>
                )}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-t pt-10 flex items-center gap-2">
                Past Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} isPast={true} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* FUNCTIONAL & INTERACTIVE CALENDAR VIEW */
          <div className="bg-white rounded-xl shadow-sm border p-6 animate-in fade-in duration-300">
            {/* Calendar Header with Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={prevMonth}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-200 font-bold transition"
              >
                ← Prev
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {currentCalendarDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={goToToday}
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  Go to Today
                </button>
              </div>
              <button
                onClick={nextMonth}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-200 font-bold transition"
              >
                Next →
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center font-bold text-gray-400 text-sm mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dateStr, index) => {
                if (!dateStr)
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-24 md:h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200"
                    ></div>
                  );

                const dayNumber = parseInt(dateStr.split("-")[2]);
                const dayEvents = eventsData.filter((e) => e.date === dateStr);
                const isToday = dateStr === today;

                return (
                  <div
                    key={dateStr}
                    className={`h-24 md:h-32 rounded-lg border p-1 md:p-2 flex flex-col ${isToday ? "bg-blue-50 border-blue-300" : "bg-white border-gray-100 hover:bg-gray-50"} transition overflow-hidden`}
                  >
                    <span
                      className={`text-sm font-medium ${isToday ? "text-blue-600 font-bold" : "text-gray-500"}`}
                    >
                      {dayNumber}
                    </span>

                    {/* Event Pills Area - NOW CLICKABLE */}
                    <div className="flex-1 overflow-y-auto mt-1 space-y-1 scrollbar-hide">
                      {dayEvents.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="text-[10px] md:text-xs bg-blue-600 text-white rounded px-1.5 py-1 truncate cursor-pointer hover:bg-blue-700 hover:shadow-md transition active:scale-95"
                          title={e.title}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- EVENT MODAL POPUP --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
            >
              ✕
            </button>

            {/* Modal Content */}
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
              {selectedEvent.category}
            </span>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedEvent.title}
            </h3>

            <div className="space-y-1 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border">
              <p>
                📅 <strong>Date:</strong>{" "}
                {/* FIX: Add the replace trick here too! */}
                {new Date(
                  selectedEvent.date.replace(/-/g, "/"),
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p>
                🕒 <strong>Time:</strong> {selectedEvent.time}
              </p>
              <p>
                📍 <strong>Location:</strong> {selectedEvent.location}
              </p>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-6">
              {selectedEvent.description}
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              <a
                href={selectedEvent.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
              >
                View Full Details
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI CHATBOT INTEGRATION */}
      <ChatWidget />
    </div>
  );
}
