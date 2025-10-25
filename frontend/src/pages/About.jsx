// src/pages/About.jsx
// Self-contained About page implemented using React + Tailwind only.
// - No external UI libs required
// - Inline SVG icons used (simple)
// - Accessible accordion implemented with keyboard support
//
// Copy-paste this file to src/pages/About.jsx and add route /about in App.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ------------------------------
   Small inline SVG icon helpers
   (kept minimal so no external icons required)
   -------------------------------*/
const IconSearch = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconShield = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 3l7 3v5c0 5-3.5 9.5-7 10-3.5-.5-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCloud = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 17.5A4.5 4.5 0 0015.5 13h-1.05A6 6 0 004 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 17.5H6a4 4 0 010-8c0-1.1.45-2.1 1.18-2.82" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBell = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14V11a6 6 0 00-12 0v3c0 .5-.2 1-.6 1.4L4 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconUsers = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M16 11a4 4 0 10-8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 20a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 20a4 4 0 00-3-3.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMail = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconCode = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M10 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDatabase = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ------------------------------
   Small presentational pieces:
   Card, Button — simple wrappers using Tailwind
   -------------------------------*/
const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const CTAButton = ({ children, to = "#", variant = "solid", className = "" }) => {
  const base = "inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition";
  if (variant === "solid") {
    return (
      <Link to={to} className={`${base} bg-indigo-600 text-white hover:bg-indigo-700 ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <Link to={to} className={`${base} border border-gray-200 text-gray-800 hover:bg-gray-50 ${className}`}>
      {children}
    </Link>
  );
};

/* ------------------------------
   Lightweight accessible accordion
   - simple stateful component
   -------------------------------*/
function AccordionItem({ id, title, children, open, onToggle }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        aria-expanded={open}
        aria-controls={`acc-${id}`}
        onClick={() => onToggle(id)}
        className="w-full text-left px-5 py-4 flex items-center justify-between bg-white dark:bg-gray-800"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-gray-500">{open ? "−" : "+"}</span>
      </button>
      <div
        id={`acc-${id}`}
        role="region"
        style={{ display: open ? "block" : "none" }}
        className="p-5 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------
   The main About component
   -------------------------------*/
export default function About() {
  // state for accordion items
  const [openAccordions, setOpenAccordions] = useState({ "item-1": false, "item-2": false, "item-3": false });

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-500">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Lost &amp; Found</h1>
              <p className="text-lg text-indigo-50/90 mb-6">
                Helping people reconnect with their things — fast, private and local.
                Post lost items, report found items, get smart matches and share contact only when both sides agree.
              </p>

              <div className="flex flex-wrap gap-3">
                <CTAButton to="/upload" variant="solid" className="">
                  <IconSearch className="w-5 h-5" />
                  Report Lost Item
                </CTAButton>

                <CTAButton to="/found" variant="outline" className="bg-white/10 text-white border-white/20">
                  <IconCloud className="w-5 h-5" />
                  Report Found Item
                </CTAButton>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white/10 rounded">Auto Matching</div>
                <div className="p-3 bg-white/10 rounded">Secure Contact Sharing</div>
                <div className="p-3 bg-white/10 rounded">Image Uploads</div>
              </div>
            </div>

            <div>
              <Card className="shadow-lg">
                <h3 className="text-xl font-bold mb-4">Core Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-indigo-50 flex items-center justify-center text-indigo-700">
                      <IconSearch className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">Smart matching</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Category + date + name similarity</div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-green-50 flex items-center justify-center text-green-700">
                      <IconShield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">Privacy-first</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Contact shared only after approval</div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-blue-50 flex items-center justify-center text-blue-700">
                      <IconCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">Image & verification</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Upload photos and use secret identifier</div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-yellow-50 flex items-center justify-center text-yellow-700">
                      <IconBell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">In-app updates for matches and requests</div>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How it works — 3 simple steps</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">Getting reunited with your lost items is straightforward and secure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative">
              <Card className="h-full">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <IconSearch className="w-6 h-6 text-indigo-700" />
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">Post</div>
                <p className="text-gray-600 dark:text-gray-300">Add a clear photo, date & rough location. For lost items include a secret identifier you remember.</p>
              </Card>
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
            </div>

            <div className="relative">
              <Card className="h-full">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <IconBell className="w-6 h-6 text-amber-700" />
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">Match</div>
                <p className="text-gray-600 dark:text-gray-300">Our backend finds potential matches based on category, date window and name similarity. You'll receive matches in your dashboard.</p>
              </Card>
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">2</div>
            </div>

            <div className="relative">
              <Card className="h-full">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <IconCheck className="w-6 h-6 text-green-700" />
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">Verify & Connect</div>
                <p className="text-gray-600 dark:text-gray-300">Owner verifies using the secret identifier. On approval the finder's contact (email/phone) is shared securely.</p>
              </Card>
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & PRIVACY */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Trust & Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-3xl mx-auto">
              We do not share personal contact details until the finder approves a contact request.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <IconShield className="w-8 h-8 text-indigo-700" />
              </div>
              <h3 className="font-semibold mb-2">Verification</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Only item owners can accept matches using their secret identifier.</p>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <IconUsers className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="font-semibold mb-2">Controlled Sharing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Contact details are shared only when the finder approves a request.</p>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <IconUsers className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="font-semibold mb-2">Moderation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Report abuse or suspicious posts — we'll review and take action.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Tech Stack</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Built with modern, reliable technologies</p>

          <div className="flex flex-wrap justify-center gap-3">
            <Card className="px-5 py-3">
              <div className="flex items-center gap-3">
                <IconCode className="w-5 h-5 text-indigo-600" />
                <div className="font-medium">React + Vite</div>
              </div>
            </Card>

            <Card className="px-5 py-3">
              <div className="flex items-center gap-3">
                <IconCode className="w-5 h-5 text-gray-700" />
                <div className="font-medium">Express</div>
              </div>
            </Card>

            <Card className="px-5 py-3">
              <div className="flex items-center gap-3">
                <IconDatabase className="w-5 h-5 text-green-600" />
                <div className="font-medium">MongoDB</div>
              </div>
            </Card>

            <Card className="px-5 py-3">
              <div className="flex items-center gap-3">
                <IconCloud className="w-5 h-5 text-sky-600" />
                <div className="font-medium">Cloudinary</div>
              </div>
            </Card>

            <Card className="px-5 py-3">
              <div className="flex items-center gap-3">
                <IconShield className="w-5 h-5 text-yellow-600" />
                <div className="font-medium">JWT Auth</div>
              </div>
            </Card>

            <Card className="px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-sm" />
                <div className="font-medium">Tailwind CSS</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Meet the Team</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Passionate about helping people reconnect with their belongings</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { initials: "SK", name: "Shashank Kumar", role: "Founder & Full-Stack", desc: "Leads backend & matching logic", color: "bg-gradient-to-br from-indigo-500 to-indigo-400" },
              { initials: "AB", name: "Aarti B", role: "Frontend & UX", desc: "Builds clean and accessible UI", color: "bg-gradient-to-br from-pink-500 to-pink-400" },
              { initials: "ML", name: "M. L.", role: "Data & Matching Specialist", desc: "Improves scoring & fuzzy search", color: "bg-gradient-to-br from-green-500 to-green-400" }
            ].map((m) => (
              <Card key={m.name} className="text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold ${m.color}`}>
                  {m.initials}
                </div>
                <h3 className="font-semibold">{m.name}</h3>
                <div className="text-sm text-indigo-600 mb-2">{m.role}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{m.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Accordion */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <AccordionItem
              id="item-1"
              title="How do I verify a match?"
              open={openAccordions["item-1"]}
              onToggle={toggleAccordion}
            >
              Owner enters the secret identifier they set when posting the lost item. If it matches, the finder's contact is shared securely.
            </AccordionItem>

            <AccordionItem
              id="item-2"
              title="What if the finder doesn't respond?"
              open={openAccordions["item-2"]}
              onToggle={toggleAccordion}
            >
              You can message them via the contact request feature. If they don't respond, leave the match pending or reject it.
            </AccordionItem>

            <AccordionItem
              id="item-3"
              title="Can I edit my post?"
              open={openAccordions["item-3"]}
              onToggle={toggleAccordion}
            >
              Yes — go to My Lost/My Found and use edit/delete options. For image changes we support re-upload.
            </AccordionItem>
          </div>
        </div>
      </section>

      {/* CTA / Roadmap */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">What's next</h3>
            <p className="text-indigo-100/90 mt-2">Match confidence scores, richer notifications, email alerts and better fuzzy matching.</p>
          </div>
          <div className="flex gap-3">
            <CTAButton to="/upload" variant="solid"><IconSearch className="w-5 h-5" /> Report Lost</CTAButton>
            <CTAButton to="/found" variant="outline" className="bg-white/10 text-white border-white/20"><IconCloud className="w-5 h-5" /> Report Found</CTAButton>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <Card className="p-10 inline-block">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <IconMail className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Get in touch</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Questions, feedback or want to contribute?</p>
            <a href="mailto:support@lostnfound.app" className="text-indigo-600 font-medium">support@lostnfound.app</a>
          </Card>
        </div>
      </section>
    </div>
  );
}
