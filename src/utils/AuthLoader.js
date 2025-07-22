import { useAuth } from '../utils/AuthContext';
import Spinner from '../components/Spinner';

const AuthLoader = ({ children }) => {
  const { isAuthLoaded } = useAuth();

  if (!isAuthLoaded) {
    return <Spinner message="인증 상태를 확인 중입니다..." />;
  }

  return children;
};

export default AuthLoader;