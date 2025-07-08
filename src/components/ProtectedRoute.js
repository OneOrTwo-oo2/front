// components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function ProtectedRoute({ element }) {
  const { authorized } = useAuth();

  if (authorized === null) {
    return <p>🔐 인증 확인 중...</p>; // 최초 1회만 표시됨
  }

  return authorized ? element : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
