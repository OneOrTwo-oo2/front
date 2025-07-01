import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConditionPage.css';

function ConditionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedIngredients } = location.state || {};
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [agree, setAgree] = useState(false); // ✅ 민감정보 수집 동의 상태

  const conditions = [
    '위 건강',
    '장 건강',
    '스트레스 해소',
    '피로회복',
    '혈액순환',
    '호흡기 건강',
    '혈당조절',
    '노화방지',
    '암 예방',
    '간 건강',
    '치매예방',
  ];

  const handleSelectCondition = (item) => {
    setSelectedConditions((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  const handleSkip = () => {
    console.log('Condition skipped');
    navigate('/myinfo');
  };

  const handleNext = () => {
    console.log('Selected Conditions:', selectedConditions);
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
            className={`ingredient-btn ${
              selectedConditions.includes(condition) ? 'selected' : ''
            }`}
            onClick={() => handleSelectCondition(condition)}
          >
            {condition}
          </button>
        ))}
      </div>

      {/* ✅ 민감정보 수집 동의 체크박스 */}
      <div className="consent-section">
        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          &nbsp;민감정보수집 동의. (필수)
        </label>
      </div>

      <div className="buttons">
        <button className="skip-btn" onClick={handleSkip}>
          건너뛰기
        </button>
        <button className="next-btn" onClick={handleNext} disabled={!agree}>
          다음
        </button>
      </div>
    </div>
  );
}

export default ConditionPage;
