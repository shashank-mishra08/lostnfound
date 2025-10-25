import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Notifications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null); // <-- jis pe click hua uska loader/disable
  const [pendingAll, setPendingAll] = useState(false);
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications"); // /api prefix axios base se aayega
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[notif] load failed:", e?.response?.status, e?.response?.data || e);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      setPendingAll(true);
      // NOTE: backend route hamne /read-all/all banaya tha
      const res = await api.patch("/notifications/read-all/all");
      // optimistic local update
      setRows(prev => prev.map(n => ({ ...n, read: true })));
      // console.log("markAllRead OK:", res.status);
    } catch (e) {
      console.error("[notif] markAllRead failed:", e?.response?.status, e?.response?.data || e);
      alert(e?.response?.data?.message || "Could not mark all as read");
    } finally {
      setPendingAll(false);
    }
  }

  async function markOne(id) {
    try {
      setPendingId(id);
      // ⚠️ route must be PATCH /api/notifications/:id (server.js me mount hona chahiye)
      const res = await api.patch(`/notifications/${id}`);
      // console.log("markOne OK:", res.status, res.data);

      // optimistic local update (even if backend returns doc ya empty)
      setRows(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error("[notif] markOne failed:", e?.response?.status, e?.response?.data || e);
      alert(e?.response?.data?.message || "Could not mark as read");
    } finally {
      setPendingId(null);
    }
  }

  function openLink(n) {
    const meta = n.meta || n.data || {};
    if (meta.lostId || meta.lostItem) {
      navigate(`/items/lost/${meta.lostId || meta.lostItem}`);
      return;
    }
    if (meta.foundId || meta.foundItem) {
      navigate(`/items/found/${meta.foundId || meta.foundItem}`);
      return;
    }
    navigate("/matches");
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <button
          onClick={markAllRead}
          disabled={pendingAll}
          className={`px-3 py-1.5 border rounded-md text-sm ${pendingAll ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"}`}
        >
          {pendingAll ? "Marking…" : "Mark all read"}
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center border rounded-xl">
          <div className="text-lg font-medium">No notifications</div>
          <div className="text-sm text-gray-500">You’re all caught up.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(n => {
            const isUnread = !n.read;
            const title = n.title || n.type || "Notification";
            const message = n.message || "—";

            const time = n.createdAt ? new Date(n.createdAt).toLocaleString() : "";
           const meta = n.meta || n.data || {};
            const contact = meta.contact; // { email, phone, note } present only on approval


            return (
              <div
                key={n._id}
                className={`border rounded-xl p-3 md:p-4 flex items-start justify-between ${isUnread ? "bg-yellow-50" : "bg-white"}`}
              >
                <div className="pr-3">
                  <div className="text-sm md:text-base font-medium">{title}</div>
                  <div className="text-xs md:text-sm text-gray-700 mt-0.5">{message}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{time}</div>
                  {/* If finder approved, show shared details */}
               {contact && (
                  <div className="mt-2 text-xs space-y-1">
                    {contact.email && (
                      <div>
                        Email:{" "}
                        <a href={`mailto:${contact.email}`} className="text-indigo-600 underline">
                          {contact.email}
                        </a>
                      </div>
                   )}
                   {contact.phone && (
                      <div>
                        Phone:{" "}
                        <a href={`tel:${contact.phone}`} className="text-indigo-600 underline">
                          {contact.phone}
                        </a>
                    </div>
                    )}
                    {contact.note && <div>Note: {contact.note}</div>}
                 </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openLink(n)}
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                    >
                      Open
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isUnread && (
                    <button
                      onClick={() => markOne(n._id)}
                      disabled={pendingId === n._id}
                      className={`text-xs px-2 py-1 border rounded ${pendingId === n._id ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"}`}
                    >
                      {pendingId === n._id ? "Marking…" : "Mark read"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
