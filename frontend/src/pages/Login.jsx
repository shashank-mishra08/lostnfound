// src/pages/Login.jsx

// React hooks: state for form, and navigate for redirect
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// api instance and helper to set token header
import api, { setAuthToken } from "../api/axios";

export default function Login({ setLoggedIn }) {
  // form state: hum email aur password track karenge
  const [form, setForm] = useState({ email: "", password: "" });

  // loading state: request chal rahi hai to button disable / feedback dene ke liye
  const [loading, setLoading] = useState(false);

  // react-router ke hooks: navigate for redirect, location to read "from" state (ProtectedRoute sends us here)
  const navigate = useNavigate();
  const location = useLocation();

  // agar ProtectedRoute ne user ko yahan redirect kiya tha, to wapas us page pe bhejne ke liye
  // location.state?.from?.pathname me original requested path milega (agar exist karta ho)
  const from = location.state?.from?.pathname || "/";

  // input change handler: spread previous state and update single field
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // small client-side validation: email non-empty and password length >= 6
  function validate() {
    if (!form.email.trim()) {
      alert("Email toh dal do pehle");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      alert("Password kam se kam 6 characters hona chahiye");
      return false;
    }
    return true;
  }

  // form submit handler: backend se token lene ka pura flow yahan hai
  const handleSubmit = async (e) => {
    e.preventDefault(); // default form submit (page refresh) roko

    // client-side validate pehle
    if (!validate()) return;

    setLoading(true); // UI feedback: ab hum request bhej rahe hain

    try {
      // POST /api/users/login -> backend jo humne bana rakha hai woh user credentials verify karega
      // aur agar sahi hua to JWT token return karega: { token: "eyJ..." }
      const res = await api.post("/users/login", form);

      // server se token milna chahiye. agar nahi mila to error throw karenge
      const token = res.data?.token;
      if (!token) throw new Error("Server ne token nahi bheja — check backend response");

      // 1) localStorage me token save karo (simple approach)
      //    Note: localStorage is persistent; for better security use httpOnly cookies (server-side) but that's different flow.
      localStorage.setItem("token", token);

      // 2) axios default header me token set karo so future requests automatic attach ho
      setAuthToken(token);

      // 3) Update the loggedIn state in App.jsx
      setLoggedIn(true);

      // 4) redirect user to the page they wanted to visit (or home)
      navigate(from, { replace: true });
    } catch (err) {
      // error handling: agar backend ne validation/credential error bheja to show it
      // err.response?.data?.msg is expected pattern based on our backend code
      const message = err.response?.data?.msg || err.message || "Login failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-indigo-600 text-center">Welcome back</h2>
        <p className="text-sm text-gray-500 text-center">Login to manage items & post lost/found</p>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* helper links */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span>Don't have an account? </span>
            <span className="text-indigo-600 hover:underline cursor-pointer" onClick={() => navigate("/register")}>Register</span>
          </div>
          <div className="text-indigo-600 hover:underline cursor-pointer">Forgot?</div>
        </div>
      </form>
    </div>
  );
}
