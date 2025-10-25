// src/pages/Home.jsx
// Home page: hero, quick action buttons, featured cards, and footer import
// Comments: bahut explanatory — copy/paste karo is file ko as-is.

import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../Components/SiteFooter";
import RecentItems from "../Components/RecentItems";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HERO */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Lost & Found — Fast. Simple. Local.
              </h1>
              <p className="mt-4 text-indigo-50 text-lg">
                Post lost items, report found items, get matched and reconnect safely — sab kuch ek jagah.
              </p>

              {/* Primary CTA buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/upload" className="inline-block px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg shadow hover:opacity-95">
                  Add an item
                </Link>

                <Link to="/lost" className="inline-block px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/5">
                  Browse Lost
                </Link>

                <Link to="/found" className="inline-block px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/5">
                  Browse Found
                </Link>
              </div>

              {/* short features */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 rounded p-3">
                  <div className="text-sm font-semibold">Auto Matching</div>
                  <div className="text-xs text-indigo-100 mt-1">App suggests potential matches for your item.</div>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <div className="text-sm font-semibold">Privacy-first</div>
                  <div className="text-xs text-indigo-100 mt-1">Contact details are shared only after approval.</div>
                </div>
                <div className="bg-white/10 rounded p-3">
                  <div className="text-sm font-semibold">Easy verification</div>
                  <div className="text-xs text-indigo-100 mt-1">Owner verifies with a secret identifier.</div>
                </div>
              </div>
            </div>

            {/* Visual / quick links */}
            <div className="w-full md:w-80">
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="text-sm text-gray-500">Quick actions</div>

                <div className="mt-3 space-y-3">
                  <Link to="/upload" className="block w-full text-left px-4 py-3 rounded-md bg-indigo-300 hover:bg-indigo-400 text-white">
                    Report lost item
                    <div className=" text-xs text-gray-500">Tell us what you lost and where</div>
                  </Link>

                  <Link to="/found" className="block w-full text-left px-4 py-3 rounded-md bg-green-200 hover:bg-green-300">
                    Report found item
                    <div className="text-xs text-gray-500">Found something? Let the owner know</div>
                  </Link>

                  <Link to="/matches" className="block w-full text-left px-4 py-3 rounded-md bg-yellow-200 hover:bg-yellow-300">
                    My matches
                    <div className="text-xs text-gray-500">See potential matches and verify</div>
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-xs text-green-800 bg-green-100 p-3 rounded-lg">
                <span className="text-black font-bold text-xl">Tip :</span> Make sure to add a clear photo and a short secret identifier when posting a lost item.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN: small featured section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">How it works</div>
            <ol className="mt-3 text-sm text-gray-600 space-y-2">
              <li><strong>1.</strong> Post your lost or found item with image.</li>
              <li><strong>2.</strong> App searches for potential matches automatically.</li>
              <li><strong>3.</strong> Owner verifies using secret identifier; contact is shared securely.</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Safety tips</div>
            <ul className="mt-3 text-sm text-gray-600 space-y-2">
              <li>Meet in a public place.</li>
              <li>Ask for a unique secret identifier you provided earlier.</li>
              <li>Share contact only after verification.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-lg font-semibold">Search by category</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Link to="/lost?category=electronics" className="px-2 py-2 border rounded text-gray-700 text-left">Electronics</Link>
              <Link to="/lost?category=wallets" className="px-2 py-2 border rounded text-gray-700 text-left">Wallets</Link>
              <Link to="/lost?category=clothes" className="px-2 py-2 border rounded text-gray-700 text-left">Clothes</Link>
              <Link to="/lost?category=other" className="px-2 py-2 border rounded text-gray-700 text-left">Other</Link>
            </div>
          </div>
        </section>

        {/* Recent items preview — optional: fetch real items later */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recent Reports</h3>
            <Link to="/lost" className="text-sm text-indigo-600">View all</Link>
          </div>

          {/* placeholder cards */}
         {/* REAL recent items (API-driven) */}
<div className="mt-4">
  <RecentItems maxItems={6} />
</div>

        </section>
      </main>

      {/* Footer component with contact + map */}
      <SiteFooter />
    </div>
  );
}
