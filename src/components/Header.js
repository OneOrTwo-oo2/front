import './Header.css';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/RecipeGo_logo2.svg';

function Header() {
  const navigate = useNavigate();

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
      </div>
    </header>
  );
}

export default Header;
