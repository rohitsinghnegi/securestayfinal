// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BookmarkProvider } from "./contexts/BookmarkContext";
import { ChatProvider } from "./contexts/ChatContext";
import Header from "./components/Header";

import FindHomePage from "./pages/FindHomePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import BookingPage from "./pages/BookingPage";
import ChatPage from "./pages/ChatPage";
import Chatbot from "./pages/Chatbot";
import HelpPage from "./pages/HelpPage";
import StudentVerificationPage from "./pages/StudentVerificationPage";
import NotFoundPage from "./pages/NotFoundPage";
import LandlordReviewPage from "./pages/LandlordReviewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import BookmarksPage from "./pages/BookmarksPage";
import SecureSpherePage from "./pages/SecureSpherePage";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <ChatProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/find-homes" element={<FindHomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/property/:id"
                    element={<PropertyDetailsPage />}
                  />
                  <Route
                    path="/property/:id/securesphere"
                    element={
                      <ProtectedRoute>
                        <SecureSpherePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/help" element={<HelpPage />} />
                  <Route
                    path="/landlord/:id/reviews"
                    element={<LandlordReviewPage />}
                  />
                  {/* Protected Routes */}
                  <Route
                    path="/student-dashboard"
                    element={
                      <ProtectedRoute>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookmarks"
                    element={
                      <ProtectedRoute>
                        <BookmarksPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/landlord-dashboard"
                    element={
                      <ProtectedRoute>
                        <LandlordDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/:id"
                    element={
                      <ProtectedRoute>
                        <BookingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chatbot"
                    element={
                      <ProtectedRoute>
                        <Chatbot />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/verify"
                    element={
                      <ProtectedRoute>
                        <StudentVerificationPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ChatProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
}

export default App;
