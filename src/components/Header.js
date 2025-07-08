import './Header.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext'; // ✅ 인증 상태 갱신용
import logo from '../assets/RecipeGo_logo2.svg';

function Header() {
  const navigate = useNavigate();
  const { fetchAuthUser } = useAuth(); // ✅ 인증 초기화용

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include", // ✅ 쿠키 삭제를 위해 필요
      });

      await fetchAuthUser(); // ✅ 인증 상태 초기화
      alert("로그아웃 되었습니다.");
      navigate("/login");
    } catch (err) {
      alert("로그아웃에 실패했습니다.");
      console.error("❌ 로그아웃 에러:", err.message);
    }
  };

  return (
    <header className="header">
      <div className="header-left" onClick={() => navigate('/main')}>
        <img src={logo} alt="RecipeGo" className="logo-img" />
      </div>
      <nav className="header-center">
        <Link to="/ingredient-search">재료로 검색</Link>
        <Link to="/photo-search">사진으로 검색</Link>
        <Link to="/help">도움말</Link>
      </nav>
      <div className="header-right">
        <button onClick={() => navigate('/myinfo')} className="auth-btn">내 정보</button>
        <button onClick={handleLogout} className="auth-btn logout-btn">로그아웃</button>
      </div>
    </header>
  );
}

export default Header;
