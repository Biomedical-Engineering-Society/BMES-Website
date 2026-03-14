"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import eventsDataRaw from "../../../data/events.json";

const eventsData = eventsDataRaw as any[];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  
  const event = eventsData.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Event Not Found</h1>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">
          &larr; Go Back
        </button>
      </div>
    );
  }

  const displayDate = new Date(event.date.replace(/-/g, "/"));
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b pt-12 pb-8 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            &larr; Back to Events
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-4">
                {event.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                {event.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                {event.description}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border min-w-[280px] shrink-0">
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {displayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <p>{event.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Location</p>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                </div>
              </div>
              
              {event.link && event.link !== "#" && (
                <div className="mt-6 pt-6 border-t">
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center px-6 py-3 rounded-lg font-medium shadow-sm transition ${isPast ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {isPast ? "View Details" : "Get Tickets"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Archive (Main Content) */}
      {isPast && (
        <div className="max-w-5xl mx-auto px-6 mt-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Event Archive</h2>
            <p className="text-gray-600">Photos and memories from {event.title}.</p>
          </div>

          {event.images && event.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.images.map((img: string, idx: number) => (
                <div key={idx} className="group overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all">
                  <div className="aspect-[4/3] w-full relative">
                    <img 
                      src={img} 
                      alt={`Event photo ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                We're still gathering photos for this event. Check back soon or upload them to the repository!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
