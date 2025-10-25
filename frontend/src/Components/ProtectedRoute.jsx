// src/Components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api, { setAuthToken } from "../api/axios";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);   // while we verify token
  const [ok, setOk] = useState(false);            // is token valid?
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setOk(false);
      return;
    }

    // attach token to axios default headers for this session
    setAuthToken(token);

    // verify token by hitting backend /users/me (or similar)
    (async () => {
      try {
        const res = await api.get("/users/me");  // backend should return user info or 401
        if (res?.data) {
          setOk(true);
        } else {
          setOk(false);
          setAuthToken(null);
          localStorage.removeItem("token");
        }
      } catch (err) {
        // token invalid or network error
        setOk(false);
        setAuthToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // while checking show a centered spinner so user doesn't see flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.15"></circle>
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
        </svg>
      </div>
    );
  }

  // if authenticated allow children, otherwise redirect to login and remember where we came from
  if (ok) return children;
  return <Navigate to="/login" state={{ from: location }} replace />;
}