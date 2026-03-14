"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatWidget from "../components/ChatWidget";
import eventsDataRaw from "../../data/events.json";

// The Event Database is now managed in data/events.json
const eventsData = eventsDataRaw as any[];

export default function EventsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");

  const router = useRouter();
  
  // --- NEW: Interactive Calendar States ---
  // Tracks which month the calendar is currently showing
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
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
        onClick={() => {
          if (isPast) router.push(`/events/${event.id}`);
        }}
        className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md flex flex-col ${isPast ? "opacity-75 grayscale-[20%] cursor-pointer hover:grayscale-0 hover:opacity-100" : "border-blue-100"}`}
      >
        {/* Optional Event Thumbnail - Only show if the event is in the past */}
        {isPast && event.images && event.images.length > 0 && (
          <div className="w-full h-48 bg-gray-100 relative border-b">
            <img 
              src={event.images[0]} 
              alt={event.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {event.category}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-3">
                {event.title}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-gray-800 leading-tight">
                {displayDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-sm text-gray-500">
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
          <div className="mt-auto flex flex-wrap gap-2">
            {isPast ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/events/${event.id}`);
                }}
                className="inline-block px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                View Archive
              </button>
            ) : (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-block px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Get Tickets
              </a>
            )}
          </div>
        </div>
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
                          onClick={() => {
                            setSelectedEvent(e);
                          }}
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
              {new Date(selectedEvent.date) < new Date() ? (
                <button
                  onClick={() => router.push(`/events/${selectedEvent.id}`)}
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition shadow-sm"
                >
                  View Archive
                </button>
              ) : (
                <a
                  href={selectedEvent.link && selectedEvent.link !== "#" ? selectedEvent.link : "/contact"}
                  target={selectedEvent.link && selectedEvent.link !== "#" ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                >
                  {selectedEvent.link && selectedEvent.link !== "#" ? "Get Tickets" : "Learn More"}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI CHATBOT INTEGRATION */}
      <ChatWidget />
    </div>
  );
}
