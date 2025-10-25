// src/pages/Register.jsx

// React se useState import kar rahe hain form ki state handle karne ke liye
import { useState } from "react";

// backend ke API ko hit karne ke liye apna custom axios instance use karenge
import api from "../api/axios";

// navigate use hota hai successful register ke baad dusre page par bhejne ke liye
import { useNavigate } from "react-router-dom";

export default function Register() {
  // form ke andar teen input fields hain: name, email, password
  // useState ke through ek object bana rahe hain jo in teeno ko track karega
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // loading state banayi hai, taki jab request backend pe ja rahi ho to button disable ho jaye aur UI user ko bataye ki process chal rahi hai
  const [loading, setLoading] = useState(false);

  // navigate hook: successful register ke baad user ko /login page pe bhejne ke liye
  const nav = useNavigate();

  // ye function har baar chalega jab user input field me kuchh likhega
  // yahan ...form (spread operator) ka matlab hai ki purane saare values safe rahenge,
  // sirf jis input ka naam match karega uska value update hoga
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ye function form submit hone par chalega
  const submit = async (e) => {
    e.preventDefault(); // default page reload hone se rokta hai

    setLoading(true); // abhi loading true kar diya taki button disable ho jaye

    try {
      // backend ko POST request bhej rahe hain
      // route: /api/users/register
      // data: { name, email, password }
      const res = await api.post("/users/register", form);

      // agar backend se success aaya to alert dikha dete hain
      // backend usually { msg: "User created" } ya similar response bhejta hai
      alert(res.data.msg || "Registered successfully!");

      // ab user ko login page pe bhej denge
      nav("/login");
    } catch (err) {
      // agar backend se error aaya (jaise email already exists, password short, etc.)
      // to uska error message show kar dete hain
      alert(err.response?.data?.msg || err.message);
    } finally {
      // request complete ho gayi, chahe success ya fail
      setLoading(false);
    }
  };

  // ab return me UI banate hain (modern Tailwind design)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4"
      >
        {/* Heading */}
        <h2 className="text-2xl font-bold text-indigo-600 text-center">
          Create an Account
        </h2>
        <p className="text-gray-500 text-center text-sm">
          Fill the details below to join Lost &amp; Found
        </p>

        {/* Name input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={onChange}
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>

        {/* Email input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={onChange}
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>

        {/* Password input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter a strong password"
            value={form.password}
            onChange={onChange}
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* Small link to login */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => nav("/login")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}