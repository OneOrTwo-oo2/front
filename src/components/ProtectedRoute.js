// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ element }) {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
