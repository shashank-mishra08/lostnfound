// src/components/ItemCard.jsx
// Reusable card used in lists (Lost / Found).
// - item: object returned by backend (may contain id or _id).
// - type: 'lost' or 'found' (used to build detail link).
// - Shows image (if available), title, short description and date.

import React from "react";
import { Link } from "react-router-dom";

/*
  Note:
  - Backend sometimes returns `id` (public view) or `_id` (private). We support both.
  - For images backend stores path like "uploads/images/123.jpg". To load from browser
    we prefix with VITE_API_HOST (set in frontend .env) or assume same origin.
*/
export default function ItemCard({ item, type = "lost" }) {
  // support both id and _id
  const itemId = item.id || item._id || item._id?.toString();

  // build image URL safely
  const apiHost = import.meta.env.VITE_API_HOST || ""; // e.g. http://localhost:8000
  let imageUrl = null;
  if (item.image) {
    // if image already full URL, use it, else prefix with apiHost
    imageUrl = item.image.startsWith("http") ? item.image : `${apiHost}/${item.image}`;
    console.log("Constructed Image URL:", imageUrl);
  }

  // Choose a date to show: prefer lostDate/foundDate then createdAt
  const rawDate = item.lostDate || item.foundDate || item.createdAt;
  const niceDate = rawDate ? new Date(rawDate).toLocaleDateString() : "";

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.itemName || "item"} className="w-full h-full object-cover" />
        ) : (
          <div className="text-sm text-gray-400">No image</div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold leading-tight">{item.itemName || "Untitled"}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{item.description || "-"}</p>

        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
          <div>{niceDate}</div>
          <Link to={`/items/${type}/${itemId}`} className="text-indigo-600 hover:underline">View</Link>
        </div>
      </div>
    </div>
  );
}