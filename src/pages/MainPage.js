// MainContent.js
import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import img11 from '../assets/img_i4.png';
import img4 from '../assets/img_r4.png';
import img2 from '../assets/img_k4.png';


function MainPage() {
  const imgRefs = [useRef(null), useRef(null), useRef(null)];
  const [clickedIndex, setClickedIndex] = useState(null);
  const navigate = useNavigate();
  const cardMinHeight = 280;

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

    if (index === 0) navigate('/ingredient-search');
    else if (index === 1) navigate('/photo-search');
    else if (index === 2) navigate('/theme');
  };

  return (
    <div className="app">
      <div className="main">
        {[img11, img2, img4].map((imgSrc, i) => (
          <div className="partition" key={i}>
            <div
              ref={imgRefs[i]}
              className="main-img"
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => resetTransform(i)}
              onClick={() => handleClick(i)}
              style={{ background: '#f7f7f7', borderRadius: '12px', minHeight: cardMinHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <img src={imgSrc} alt={`메인${i+1}`} style={{ width: '120%', height: 'auto', borderRadius: '12px', objectFit: 'contain', maxHeight: 250, userSelect: 'none', pointerEvents: 'none' }} />
            </div>
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginTop: 24, userSelect: 'none' }}>
              {i === 0 && '재료 선택'}
              {i === 1 && '사진 검색'}
              {i === 2 && '테마 선택'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainPage;
