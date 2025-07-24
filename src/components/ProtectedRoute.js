import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Spinner from './Spinner'; // ✅ 스피너 컴포넌트 import

function ProtectedRoute({ element }) {
  const { authorized } = useAuth();

  if (authorized === null) {
    return <Spinner message="인증 상태를 확인 중입니다..." />;
  }

  return authorized ? element : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
