// src/Components/NotificationDropdown.jsx
// ------------------------------------------------------------
// Small dropdown preview for notifications:
// - Opens under bell icon
// - Fetches latest notifications on open
// - Mark-one / Mark-all supported
// - "View all" button -> /notifications page
// - Safe for both schemas: {title,message,data} OR {type,message,meta}
//
// Props:
//   open: boolean        // dropdown visible?
//   onClose: () => void  // close callback (outside click / ESC)
//   anchorClassName?: string // optional extra classes for wrapper
//
// NOTE: Axios instance already adds Authorization header.
// ------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function NotificationDropdown({ open, onClose, anchorClassName = "" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [pendingAll, setPendingAll] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside / ESC
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) onClose?.();
    };
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  // Fetch when opened
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/notifications");
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];
        // show latest 8 only (dropdown me concise)
        setRows(list.slice(0, 8));
      } catch (e) {
        console.warn("[notif-dropdown] load failed:", e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  // Deep-link to related page
  function openLink(n) {
    const meta = n.meta || n.data || {};
    if (meta.lostId || meta.lostItem) {
      navigate(`/items/lost/${meta.lostId || meta.lostItem}`);
    } else if (meta.foundId || meta.foundItem) {
      navigate(`/items/found/${meta.foundId || meta.foundItem}`);
    } else {
      navigate(`/matches`);
    }
    onClose?.();
  }

  async function markOne(id) {
    try {
      setPendingId(id);
      await api.patch(`/notifications/${id}`);
      setRows(prev => prev.map(r => (r._id === id ? { ...r, read: true } : r)));
    } catch (e) {
      console.warn("[notif-dropdown] markOne failed:", e?.response?.data?.message || e.message);
    } finally {
      setPendingId(null);
    }
  }

  async function markAll() {
    try {
      setPendingAll(true);
      await api.patch(`/notifications/read-all/all`);
      setRows(prev => prev.map(r => ({ ...r, read: true })));
    } catch (e) {
      console.warn("[notif-dropdown] markAll failed:", e?.response?.data?.message || e.message);
    } finally {
      setPendingAll(false);
    }
  }

  // --- RENDER ---
  return (
    <div className={`absolute right-0 mt-2 w-80 ${anchorClassName}`} ref={boxRef} style={{ zIndex: 60 }}>
      {open && (
        <div className="bg-white text-gray-900 border shadow-lg rounded-xl overflow-hidden">
          <div className="px-3 py-2 flex items-center justify-between border-b">
            <div className="text-sm font-medium">Notifications</div>
            <button
              onClick={markAll}
              disabled={pendingAll}
              className={`text-xs px-2 py-1 border rounded ${pendingAll ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"}`}
              title="Mark all read"
            >
              {pendingAll ? "Marking…" : "Mark all"}
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No notifications</div>
          ) : (
            <ul className="max-h-96 overflow-auto divide-y">
              {rows.map(n => {
                const unread = !n.read;
                const title = n.title || n.type || "Notification";
                const message = n.message || "—";
                const time = n.createdAt ? new Date(n.createdAt).toLocaleString() : "";
                return (
                  <li key={n._id} className={`p-3 ${unread ? "bg-yellow-50" : "bg-white"}`}>
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs text-gray-700">{message}</div>
                    <div className="text-[11px] text-gray-500 mt-1">{time}</div>

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => openLink(n)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">
                        Open
                      </button>
                      {unread && (
                        <button
                          onClick={() => markOne(n._id)}
                          disabled={pendingId === n._id}
                          className={`text-xs px-2 py-1 border rounded ${pendingId === n._id ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-50"}`}
                        >
                          {pendingId === n._id ? "Marking…" : "Mark read"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="px-3 py-2 border-t bg-gray-50">
            <button
              onClick={() => { navigate("/notifications"); onClose?.(); }}
              className="w-full text-center text-sm px-2 py-1 border rounded hover:bg-white"
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
