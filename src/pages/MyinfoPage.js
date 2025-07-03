import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import confetti from 'canvas-confetti';
import './MyinfoPage.css';

Modal.setAppElement('#root');

const dummyRecipes = [
  {
    id: 1,
    title: "에어프라이어 콘치즈 토스트 만들기!중독성 강하네요!",
    image: "https://recipe1.ezmember.co.kr/cache/recipe/2023/12/11/7b654e1d2271e224ce39de9d8cf9fce51.jpg",
    ingredientsCount: 5,
    time: 15,
  },
  {
    id: 2,
    title: "소고기 된장찌개 저녁국거리 쌈장 넣은 레시피",
    image: "https://recipe1.ezmember.co.kr/cache/recipe/2023/10/26/93c588ea24b94f2b9f8bcf5a1e12a64b1.jpg",
    ingredientsCount: 14,
    time: 25,
  },
];

function MyinfoPage() {
  const location = useLocation();
  const isNewUser = location.state?.isNewUser || false;

  const [isOpen, setIsOpen] = useState(isNewUser);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = dummyRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isNewUser) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 1.0 },
        angle: 90,
        startVelocity: 45,
      });
    }
  }, [isNewUser]);

  return (
    <div className="myinfo-page">
      {/* ✅ 신규 유저용 모달 */}
      {isNewUser && (
        <Modal
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(false)}
          style={{
            content: {
              width: '400px',
              height: '200px',
              margin: 'auto',
              textAlign: 'center',
              borderRadius: '12px',
              paddingTop: '40px',
            },
          }}
        >
          <h2 style={{ fontSize: '28px' }}>🎉 프로필 설정 완료!</h2>
          <p style={{ fontSize: '20px' }}>이제 추천 레시피를 만나보세요.</p>
          <button onClick={() => setIsOpen(false)} style={{ marginTop: '20px' }}>
            닫기
          </button>
        </Modal>
      )}

      {/* 저장된 레시피 및 검색 기능 */}
      <div className="myinfo-content">
        <h2 className="section-title">저장된 레시피</h2>

        {/* 🔎 검색창 */}
        <input
          className="search-input"
          type="text"
          placeholder="레시피 검색"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* 🍽️ 레시피 리스트 */}
        <div className="recipe-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} className="recipe-img" />
              <div className="recipe-info">
                <h4>{recipe.title}</h4>
                <p>재료 {recipe.ingredientsCount}가지 · {recipe.time}분</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyinfoPage;