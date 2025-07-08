import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './ConditionPage.css';

function ConditionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedIngredients } = location.state || {};
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [agree, setAgree] = useState(false);

  const conditions = [
    '위 건강', '장 건강', '스트레스 해소', '피로회복', '혈액순환',
    '호흡기 건강', '혈당조절', '노화방지', '암 예방', '간 건강', '치매예방',
  ];

  const handleSelectCondition = (item) => {
    setSelectedConditions(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleSkip = () => {
    navigate('/myinfo');
  };

  const handleNext = () => {
    navigate('/myinfo', {
      state: {
        selectedIngredients,
        selectedConditions,
      },
    });
  };

  return (
    <div className="preference-page">
      <h2>앓고 계신 질환이 있으신가요?</h2>

      <div className="ingredient-buttons">
        {conditions.map((condition, index) => (
          <button
            key={index}
            className={`ingredient-btn ${selectedConditions.includes(condition) ? 'selected' : ''}`}
            onClick={() => handleSelectCondition(condition)}
          >
            {condition}
          </button>
        ))}
      </div>

      {/* ✅ 민감정보 수집 동의 영역 */}
      <div className="consent-section">
        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          &nbsp;[필수] 민감정보수집 동의 (<Link to="/privacy" target="_blank" className="link-text">보기</Link>)
        </label>
      </div>

      <div className="buttons">
        <button className="skip-btn" onClick={handleSkip}>건너뛰기</button>
        <button className="next-btn" onClick={handleNext} disabled={!agree}>다음</button>
      </div>
    </div>
  );
}

export default ConditionPage;
