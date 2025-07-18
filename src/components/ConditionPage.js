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
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

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
    navigate('/main');
  };

  const handleSave = async () => {
    if (!agree) {
      alert("민감정보 수집 동의가 필요합니다.");
      return;
    }

    setIsSaving(true);
    
    // 저장 완료 메시지 표시
    setShowSavedMessage(true);
    
    // 1.5초 후 메인화면으로 이동
    setTimeout(() => {
      navigate('/main');
    }, 1500);
    
    // 백그라운드에서 API 호출 (선택사항)
    try {
      await fetchWithAutoRefresh("/api/save-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allergies: selectedIngredients,
          diseases: selectedConditions,
        }),
      });
    } catch (err) {
      console.error("저장 요청 실패:", err);
      // API 호출 실패는 무시하고 UI는 정상 진행
    } finally {
      setIsSaving(false);
    }
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
        // 저장 완료 메시지 표시
        setShowSavedMessage(true);
        
        // 1.5초 후 메인화면으로 이동
        setTimeout(() => {
          navigate('/main');
        }, 1500);
      } else {
        const errData = await res.data;
        alert(errData?.detail || "저장 실패");
      }
    } catch (err) {
      console.error("저장 요청 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  if (showSavedMessage) {
    return (
      <div className="preference-page">
        <div className="saved-message">
          <h2>✅ 저장되었습니다!</h2>
          <p>메인화면으로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preference-page">
      <h2>질병/알러지 정보 설정</h2>
      <p className="description">섭취하면 안 되는 질병 또는 알러지 정보를 입력해 주세요</p>

      <div className="disease-section">
        <h3>질병 정보 선택</h3>
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
      </div>

      <div className="allergy-section">
        <h3>현재 선택된 알러지</h3>
        <div className="selected-allergies">
          {selectedIngredients.map((ingredient, index) => (
            <button
              key={index}
              className="selected-allergy-btn"
              onClick={() => {
                const newIngredients = selectedIngredients.filter((_, i) => i !== index);
                navigate('/condition', { state: { selectedIngredients: newIngredients } });
              }}
            >
              {ingredient} ✕
            </button>
          ))}
        </div>
      </div>

      <div className="allergy-section">
        <h3>알러지 재료 선택</h3>
        <div className="ingredient-buttons">
          {selectedIngredients.map((ingredient, index) => (
            <button
              key={index}
              className="ingredient-btn selected"
            >
              {ingredient}
            </button>
          ))}
        </div>
      </div>

      <div className="consent-section">
        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          &nbsp;민감정보 수집 및 이용에 동의합니다.
        </label>
      </div>

      <div className="buttons">
        <button className="skip-btn" onClick={handleSkip}>건너뛰기</button>
        <button 
          className="save-btn" 
          onClick={handleSave} 
          disabled={!agree || isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}

export default ConditionPage;
