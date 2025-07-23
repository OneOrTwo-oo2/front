import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreferenceToggleSection.css';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';
import Modal from 'react-modal';

function PreferenceToggleSection() {
  const [ingredients, setIngredients] = useState([]);
  const [diseases, setDiseases] = useState([]); // ChronicDisease 전체 리스트
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ingredientRes, diseaseRes, prefRes] = await Promise.all([
          fetchWithAutoRefresh("/allergies"),
          fetchWithAutoRefresh("/diseases"),
          fetchWithAutoRefresh("/preferences")
        ]);
        setIngredients(ingredientRes.data || []);
        setDiseases(diseaseRes.data?.map(d => d.name) || []);
        setSelectedIngredients(prefRes.data?.allergies || []);
        setSelectedDiseases(prefRes.data?.diseases || []);
      } catch (err) {
        console.error("❌ 초기 데이터 불러오기 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSelectItem = (itemName) => {
    setSelectedIngredients((prev) =>
      prev.includes(itemName)
        ? prev.filter((i) => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleRemoveSelected = (itemName) => {
    setSelectedIngredients((prev) => prev.filter((i) => i !== itemName));
  };

  // 질병 토글
  const handleSelectDisease = (disease) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const handleSave = async () => {
    if (!consent && (selectedDiseases.length > 0 || selectedIngredients.length > 0)) {
      alert('민감정보 수집 및 이용에 동의해야 저장할 수 있습니다.');
      return;
    }
    try {
      await fetchWithAutoRefresh("/save-preference", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergies: selectedIngredients, diseases: selectedDiseases })
      });
      alert("정보가 저장되었습니다!");
      navigate('/myinfo');
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSkip = () => {
    navigate('/myinfo');
  };

  // 둘 중 하나라도 입력됐는지
  const hasInput = selectedDiseases.length > 0 || selectedIngredients.length > 0;

  return (
    <div className="preference-page">
      <div className="preference-header">
        <h2>질병/알러지 정보 설정</h2>
        <p className="preference-subtitle">섭취하면 안 되는 질병 또는 알러지 정보를 입력해 주세요</p>
      </div>

      {/* 질병 버튼 선택 */}
      <div className="disease-section">
        <h3>질병 정보 선택</h3>
        <div className="disease-buttons">
          {diseases.map((disease) => (
            <button
              key={disease}
              className={`disease-btn${selectedDiseases.includes(disease) ? ' selected' : ''}`}
              onClick={() => handleSelectDisease(disease)}
            >
              {disease}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 알러지 표시 */}
      {selectedIngredients.length > 0 && (
        <div className="selected-allergies-section">
          <h3>현재 선택된 알러지</h3>
          <div className="selected-allergies-list">
            {selectedIngredients.map((ingredient) => (
              <div key={ingredient} className="selected-allergy-badge">
                <span>{ingredient}</span>
                <button
                  className="remove-allergy-btn"
                  onClick={() => handleRemoveSelected(ingredient)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 알러지 목록 */}
      <div className="allergies-section">
        <h3>알러지 재료 선택</h3>
        <div className="ingredient-buttons">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>로딩 중...</p>
            </div>
          ) : (
            ingredients.map((ingredient) => (
              <button
                key={ingredient.id}
                className={`ingredient-btn ${
                  selectedIngredients.includes(ingredient.name) ? 'selected' : ''
                }`}
                onClick={() => handleSelectItem(ingredient.name)}
              >
                {ingredient.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 민감정보 동의 */}
      {hasInput && (
        <div className="consent-section">
          <label className="consent-label">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
            />
            <span className="consent-link" onClick={() => setShowConsentModal(true)}>
              민감정보 수집 및 이용에 동의합니다.
            </span>
          </label>
          <p className="consent-desc">입력하신 질병/알러지 정보는 맞춤형 레시피 추천에만 사용되며, 언제든 수정/삭제할 수 있습니다.</p>
        </div>
      )}
      {/* 민감정보 동의 전문 모달 */}
      {showConsentModal && (
        <Modal
          isOpen={showConsentModal}
          onRequestClose={() => setShowConsentModal(false)}
          className="consent-modal"
          overlayClassName="folder-modal-overlay"
        >
          <div className="consent-modal-content">
            <h3>민감정보 수집·이용 동의</h3>
            <div className="consent-modal-body" style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left', fontSize: '15px', color: '#333', margin: '20px 0' }}>
              <p><b>수집·이용 목적:</b> 맞춤형 레시피 추천 및 건강관리 서비스 제공</p>
              <p><b>수집 항목:</b> 질병 정보, 알러지 정보 등 건강 관련 민감정보</p>
              <p><b>보유 및 이용기간:</b> 회원 탈퇴 또는 동의 철회 시까지</p>
              <p><b>동의 거부 권리 및 불이익:</b> 동의를 거부할 수 있으나, 맞춤형 추천 등 일부 서비스 이용이 제한될 수 있습니다.</p>
              <hr />
              <p>본인은 위의 민감정보 수집·이용에 동의합니다.</p>
              <p style={{ color: '#007bff', fontSize: '13px' }}>
                (예시: 네이버, 카카오 등 주요 서비스의 민감정보 동의 전문 참고)
              </p>
            </div>
            <button onClick={() => setShowConsentModal(false)} style={{ width: '120px', padding: '10px', borderRadius: '8px', background: '#007bff', color: 'white', border: 'none', fontWeight: 600, fontSize: '16px', margin: '0 auto', display: 'block' }}>닫기</button>
          </div>
        </Modal>
      )}

      {/* 하단 버튼 */}
      <div className="action-buttons">
        <button className="skip-btn" onClick={handleSkip}>
          건너뛰기
        </button>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={hasInput && !consent}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

export default PreferenceToggleSection;
