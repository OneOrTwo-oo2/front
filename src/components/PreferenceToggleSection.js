import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreferenceToggleSection.css';

function PreferenceToggleSection() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/yolo-classes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // 배열인 경우 정상 저장
          setIngredients(data);
        } else if (data.ingredients && Array.isArray(data.ingredients)) {
          // 혹시 data 안에 ingredients 키가 있는 형태일 수도 있음
          setIngredients(data.ingredients);
        } else {
          console.error("🚨 yolo-classes 응답이 배열 형식이 아닙니다:", data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching YOLO classes:", err);
        setIsLoading(false);
      });
  }, []);


  const handleSelectItem = (item) => {
    setSelectedIngredients((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((i) => i !== item)
        : [...prevSelected, item]
    );
  };

  const handleSkip = () => {
    console.log('Skipped');
    navigate('/condition', { state: { selectedIngredients: [] } }); // ← 빈 상태로 이동

    // 건너뛰기 시 처리
  };

  const handleNext = () => {
    console.log('Next, selected ingredients:', selectedIngredients);
    navigate('/condition', { state: { selectedIngredients } });
  };

  return (
    <div className="preference-page">
      <h2>알러지 있는 재료가 있나요?</h2>
      <div className="ingredient-buttons">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          // 👇 변경 전
          // selectedIngredients.includes(ingredient)

          ingredients.slice(0, 20).map((ingredient, index) => (
            <button
              key={index}
              className={`ingredient-btn ${
                selectedIngredients.includes(ingredient) ? 'selected' : ''
              }`}
              onClick={() => handleSelectItem(ingredient)}
            >
              {ingredient}
            </button>
          ))

        )}
      </div>

      <div className="buttons">
        <button className="skip-btn" onClick={handleSkip}>
          건너뛰기
        </button>
        <button className="next-btn" onClick={handleNext}>
          다음
        </button>
      </div>
    </div>
  );
}

export default PreferenceToggleSection;
