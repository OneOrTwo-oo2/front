import React, { useRef, useState } from 'react';
import './App.css';
import logo from './assets/RecipeGo_logo2.svg';
import img1 from './assets/img12.png';
import img2 from './assets/img12.png';
import img3 from './assets/img12.png';

import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import PhotoSearchPage from './PhotoSearchPage';
import IngredientSearchPage from './IngredientSearchPage';
import MyInfo from './myinfo';
import Home from './Home';

function MainContent() {
  console.log('heelo')
  const imgRefs = [useRef(null), useRef(null), useRef(null)];
  const [clickedIndex, setClickedIndex] = useState(null);
  const navigate = useNavigate();

  const handleMouseMove = (e, index) => {
    const card = imgRefs[index].current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 6;
    const rotateY = (x - centerX) / 6;
    const scale = clickedIndex === index ? 1.6 : 1.1;
    const opacity = clickedIndex === index ? 0.7 : 1;
    const lightX = (x / rect.width) * 100;
    const lightY = (y / rect.height) * 100;
    const highlight = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.35), transparent 60%)`;
    card.style.transform = `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.opacity = opacity;
    card.style.backgroundImage = highlight;
  };

  const resetTransform = (index) => {
    const card = imgRefs[index].current;
    if (clickedIndex !== index) {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      card.style.opacity = 1;
      card.style.backgroundImage = 'none';
    }
  };

  const handleClick = (index) => {
    const card = imgRefs[index].current;
    const isAlreadyClicked = clickedIndex === index;
    setClickedIndex(isAlreadyClicked ? null : index);
    if (isAlreadyClicked) {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      card.style.opacity = 1;
      card.style.backgroundImage = 'none';
    } else {
      card.style.transform = 'scale(1.6) rotateX(0deg) rotateY(0deg)';
      card.style.opacity = 0.7;
    }
    if (index === 0) {
      navigate('/ingredient-search');
    } else if (index === 1) {
      navigate('/photo-search');
    }
  };

  return (
    <div className="app">
      <header className="header daangn-style">
        <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="RecipeGo" className="logo-img" />
        </div>

        <nav className="header-center">
          <Link to="/ingredient-search">재료로 검색</Link>
          <Link to="/photo-search">사진으로 검색</Link>
          <Link to="/help">도움말</Link>
        </nav>

        <div className="header-right">
          <button onClick={() => navigate('/login')} className="auth-btn">로그인</button>
          <span className="divider">|</span>
          <button onClick={() => navigate('/signup')} className="auth-btn">회원가입</button>
        </div>
      </header>

      <div className="main">
        {[img1, img2, img3].map((imgSrc, i) => (
          <div className="partition" key={i}>
            <div
              ref={imgRefs[i]}
              className="main-img"
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => resetTransform(i)}
              onClick={() => handleClick(i)}
              style={{ backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
            >
              <img
                src={imgSrc}
                alt={`img${i + 1}`}
                style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
              />
            </div>
            <p>
              {i === 0 && '재료 선택해서 레시피 보기'}
              {i === 1 && '사진으로 검색해서 레시피보기'}
              {i === 2 && '레시피 둘러보기'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/ingredient-search" element={<IngredientSearchPage />} />
        <Route path="/photo-search" element={<PhotoSearchPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myinfo" element={<MyInfo />} />
        {/* 로그인/회원가입 라우트 추가 예정 시 */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
