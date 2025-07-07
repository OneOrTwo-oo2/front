import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from "../assets/emojiMap_full_ko.js";
import { kindOptions, situationOptions, methodOptions } from '../components/options.js';

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [ingredientsToDisplay, setIngredientsToDisplay] = useState(20);

  const navigate = useNavigate();

  const toggleIngredient = (item) => {
    setIngredients(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleCategorySelect = (type, value) => {
    if (type === 'kind') setKind(value);
    if (type === 'situation') setSituation(value);
    if (type === 'method') setMethod(value);
  };

  const handleSearch = () => {
    const query = qs.stringify({
      ingredients: ingredients.join(','),
      ...(kind && { kind }),
      ...(situation && { situation }),
      ...(method && { method })
    });
    navigate(`/recipes?${query}`);
  };

  useEffect(() => {
    fetch("/api/yolo-classes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIngredientOptions(data);
        else if (data.ingredients && Array.isArray(data.ingredients))
          setIngredientOptions(data.ingredients);
        else console.error("🚨 재료 형식 이상:", data);
      })
      .catch((err) => console.error("🚨 재료 fetch 실패:", err));
  }, []);

  const isSearchDisabled =
    ingredients.length === 0 || !kind || !situation || !method;

  const loadMoreIngredients = () => {
    setIngredientsToDisplay(prev => prev + 20);
  };

  return (
    <div className="search-buttons-page">
      <h2>선호도 선택</h2>

    <div className="section">
  <h4>재료 선택</h4>
  <div className="buttons">
    {ingredientOptions.slice(0, ingredientsToDisplay).map((item) => {
      const info = emojiMap[item] || {
        emoji: null,
        name_ko: item.replace(/_/g, " "),
      };

      return (
        <button
          key={item}
          className={ingredients.includes(item) ? "active" : ""}
          onClick={() => toggleIngredient(item)}
        >
          {/* ✅ 이 부분이 핵심: 이미지 or 기본 이모지 출력 */}
          {info.emoji ? (
            <img
              src={info.emoji}
              alt={info.name_ko}
              style={{ width: 25, height: 25, marginRight: 8 }}
            />
          ) : (
            <span style={{ marginRight: 8 }}>🧂</span>
          )}

          {info.name_ko}
        </button>
      );
    })}

    {ingredientsToDisplay < ingredientOptions.length && (
      <button className="load-more-btn" onClick={loadMoreIngredients}>
        + 더 보기
      </button>
    )}
  </div>
</div>


      {/* 종류별, 상황별, 방법별 */}
      <div className="section">
        <h4>종류별</h4>
        <div className="buttons">
          {kindOptions.map((opt) => (
            <button
              key={opt.value}
              className={kind === opt.value ? "active" : ""}
              onClick={() => handleCategorySelect('kind', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h4>상황별</h4>
        <div className="buttons">
          {situationOptions.map((opt) => (
            <button
              key={opt.value}
              className={situation === opt.value ? "active" : ""}
              onClick={() => handleCategorySelect('situation', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h4>방법별</h4>
        <div className="buttons">
          {methodOptions.map((opt) => (
            <button
              key={opt.value}
              className={method === opt.value ? "active" : ""}
              onClick={() => handleCategorySelect('method', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 버튼 */}
      <div className="section">
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearchDisabled}
        >
          검색
        </button>
      </div>
    </div>
  );
}

export default IngredientSearchPage;
