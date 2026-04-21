import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");

  // 1. If the user is not logged in at all, kick them to the Home page
  if (!role) {
    alert("Please log in to access this page.");
    return <Navigate to="/" replace />;
  }

  // 2. If the route requires specific roles, and the user's role isn't in the list, kick them out
  if (allowedRoles && !allowedRoles.includes(role)) {
    alert("Unauthorized: You do not have permission to view this page.");
    // Redirect them to their respective dashboard instead
    return <Navigate to="/dashboard" replace />;
  }

  // 3. If they are logged in AND have the right role, let them see the page!
  return children;
}