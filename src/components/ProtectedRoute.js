// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ element }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      // 토큰 만료됨
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }

    // 토큰 유효 → 컴포넌트 렌더링
    return element;
  } catch (err) {
    // 디코딩 실패 → 비정상 토큰
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;