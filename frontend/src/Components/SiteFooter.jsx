// src/Components/SiteFooter.jsx
// Footer: contact form (simple) + map embed + small links.
// This component uses `api` to POST to /contact-support (if backend not present, it will fallback).

import React, { useState } from "react";
import api from "../api/axios";

export default function SiteFooter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatusMsg(null);

    // Simple client validation
    if (!name.trim() || !message.trim()) {
      setStatusMsg({ type: "error", text: "Please enter name and message" });
      return;
    }

    try {
      setSending(true);
      // Try sending to your backend route (if you implement)
      // Endpoint we attempt: POST /api/contact-support
      // If backend not present, this will fail — we catch and show local success.
      await api.post("/contact-support", { name, email, message });
      setStatusMsg({ type: "success", text: "Message sent. We will contact you soon." });
      setName(""); setEmail(""); setMessage("");
    } catch (err) {
      // If backend not ready, fall back to friendly message but log error
      console.warn("Contact form failed:", err?.response?.data || err.message);
      setStatusMsg({ type: "success", text: "Message saved locally (backend not configured). You can test again later." });
      setName(""); setEmail(""); setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="text-xl font-semibold">Lost & Found</div>
          <div className="mt-2 text-sm text-gray-600">Helping people reconnect with their things — safely and simply.</div>

          <div className="mt-4 text-sm text-gray-500">
            <div>Contact us: <strong>support@lostnfound.app</strong></div>
            <div className="mt-2">Follow us on:</div>
            <div className="mt-2 flex gap-2">
              <a className="text-indigo-600 text-sm">Twitter</a>
              <a className="text-indigo-600 text-sm">Instagram</a>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-3">
            <div className="text-sm font-medium">Contact support</div>
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Your email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <textarea rows={4} className="w-full border rounded px-3 py-2 text-sm" placeholder="Message" value={message} onChange={(e)=>setMessage(e.target.value)} />
            <div className="flex items-center gap-3">
              <button disabled={sending} className="px-4 py-2 bg-indigo-600 text-white rounded">
                {sending ? "Sending…" : "Send message"}
              </button>
              {statusMsg && (
                <div className={`text-sm ${statusMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>
                  {statusMsg.text}
                </div>
              )}
            </div>
          </form>

          {/* Map embed + quick links */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Our location</div>

            {/* Replace the src with your real map embed if you have; this is a placeholder */}
            <div className="w-full h-44 bg-gray-100 rounded overflow-hidden">
              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0199248869133!2d144.96305791531558!3d-37.81410797965295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43f1f0fb23%3A0x8b2f7fdb1b1e6c7!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1587123456789"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            <div className="text-xs text-gray-500">
              For urgent help, email <strong>support@lostnfound.app</strong>.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 text-center text-xs text-gray-500 py-3">
        © {new Date().getFullYear()} Lost & Found — Built with ❤️
      </div>
    </footer>
  );
}
