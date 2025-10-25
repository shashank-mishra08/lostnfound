import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";        // abhi agar file missing ho to aage me dunga
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import About from "./pages/About";
import UploadItem from "./pages/UploadItem";
import ProtectedRoute from "./Components/ProtectedRoute";
import ItemDetail from "./pages/ItemDetail";
import MyLostItems from "./pages/MyLostItems";
import MyFoundItems from "./pages/MyFoundItems";
import EditItem from "./pages/EditItem";
import MyMatches from "./pages/MyMatches";
import Notifications from "./pages/Notifications.jsx";
import ContactRequests from "./pages/ContactRequests.jsx";
 import MyContactRequests from "./pages/MyContactRequests.jsx";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lost" element={<LostItems />} />
          <Route path="/found" element={<FoundItems />} />
          <Route path="/about" element={<About />} />
          <Route path="/items/:type/:id" element={<ItemDetail />} />
          <Route path="/my-lost" element={<MyLostItems />} />
          <Route path="/my-found" element={<MyFoundItems />} />
          <Route path="/items/edit/:type/:id" element={<EditItem />} /> 
          <Route path="/matches" element={<MyMatches />} />
          <Route path="/notifications" element={<Notifications />} />
           <Route path="/contact-requests" element={<ContactRequests />} />
           <Route path="/my-contact-requests" element={<MyContactRequests />} />
          {/* yaha naya route add karo */}
        {/* type aur :id ye URL parameters hain */}
        {/* Example: /items/edit/lost/6500abcd1234 OR /items/edit/found/6500abcd5678 */}
        <Route path="/items/edit/:type/:id" element={<EditItem />} />    
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadItem />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}