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

  // ✅ 질환 목록 + 기존 선택값 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const diseaseRes = await fetchWithAutoRefresh("/api/diseases");
        const diseases = await diseaseRes.data;
        setConditions(diseases);
      } catch (err) {
        console.error("질환 목록 로딩 실패:", err);
      }

      try {
        const prefRes = await fetchWithAutoRefresh("/api/preferences");
        const prefData = await prefRes.data;
        setSelectedConditions(prefData.diseases || []);
      } catch (err) {
        console.error("사용자 선호 불러오기 실패:", err);
      }
    };

    fetchData();
  }, []);

  const handleSelectCondition = (name) => {
    setSelectedConditions(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const handleSkip = () => {
    navigate('/myinfo');
  };

  const handleNext = async () => {
    try {
      const res = await fetchWithAutoRefresh("/api/save-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allergies: selectedIngredients,
          diseases: selectedConditions,
        }),
      });

      if (res.status === 200) {
        navigate('/myinfo', { state: { isNewUser: true } });
      } else {
        const errData = await res.data;
        alert(errData?.detail || "저장 실패");
      }
    } catch (err) {
      console.error("저장 요청 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
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
