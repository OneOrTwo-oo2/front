import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PreferenceToggleSection.css';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';

function PreferenceToggleSection() {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ingredientRes, prefRes] = await Promise.all([
          fetchWithAutoRefresh("/api/allergies"),
          fetchWithAutoRefresh("/api/preferences")
        ]);

        setIngredients(ingredientRes.data || []);
        setSelectedIngredients(prefRes.data?.allergies || []);
      } catch (err) {
        console.error("❌ 초기 알러지 불러오기 실패:", err);
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

  const handleSkip = () => {
    navigate('/condition', { state: { selectedIngredients: [] } });
  };

  const handleNext = () => {
    navigate('/condition', { state: { selectedIngredients } });
  };

  return (
    <div className="preference-page">
      <h2>알러지 있는 재료가 있나요?</h2>

      <div className="ingredient-buttons">
        {isLoading ? (
          <div>Loading...</div>
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

      <div className="buttons">
        <button className="skip-btn" onClick={handleSkip}>건너뛰기</button>
        <button className="next-btn" onClick={handleNext}>다음</button>
      </div>
    </div>
  );
}

export default PreferenceToggleSection;
