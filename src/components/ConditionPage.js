import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './ConditionPage.css';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';

function ConditionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedIngredients = [] } = location.state || {};
  const [conditions, setConditions] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [agree, setAgree] = useState(false);

  // ✅ 질환 목록 서버에서 가져오기
  useEffect(() => {
    fetch("/api/diseases")
      .then((res) => res.json())
      .then(setConditions)
      .catch(console.error);

    fetchWithAutoRefresh("/api/preferences", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setSelectedConditions(data.diseases || []);
      })
      .catch(console.error);
  }, []);

  const handleSelectCondition = (name) => {
    setSelectedConditions((prev) =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleSkip = () => {
    navigate('/myinfo');
  };

  const handleNext = async () => {
    try {
      const res = await fetch("/api/save-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ 쿠키 인증 기반
        body: JSON.stringify({
          allergies: selectedIngredients,
          diseases: selectedConditions,
        }),
      });

      if (res.ok) {
        navigate('/myinfo');
      } else {
        alert("저장 실패");
      }
    } catch (err) {
      console.error("저장 요청 실패:", err);
      alert("저장 중 오류 발생");
    }
  };

  return (
    <div className="preference-page">
      <h2>앓고 계신 질환이 있으신가요?</h2>

      <div className="ingredient-buttons">
        {conditions.map((condition) => (
          <button
            key={condition.id}
            className={`ingredient-btn ${selectedConditions.includes(condition.name) ? 'selected' : ''}`}
            onClick={() => handleSelectCondition(condition.name)}
          >
            {condition.name}
          </button>
        ))}
      </div>

      {/* 민감정보 동의 */}
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
