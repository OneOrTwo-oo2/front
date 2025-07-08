import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from '../assets/emojiMap_full_ko.js';
import { preferOptions, kindOptions, situationOptions, methodOptions } from '../components/options.js';
import IngredientCategorySection from '../components/categorys/IngredientCategorySection';

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [preference, setPreference] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { labels } = location.state || { labels: [] };

  useEffect(() => {
    if (labels.length > 0) setIngredients(labels);
  }, [labels]);

  const handleCategorySelect = (type, value) => {
    if (type === 'preference') setPreference(value);
    if (type === 'kind') setKind(value);
    if (type === 'situation') setSituation(value);
    if (type === 'method') setMethod(value);
  };

  const handleSearch = () => {
    const ingredientNamesInKorean = ingredients.map((item) => {
      const info = emojiMap[item];
      return info?.name_ko || item.replace(/_/g, ' ');
    });

    const query = qs.stringify({
      ingredients: ingredientNamesInKorean.join(','),
      ...(kind && { kind }),
      ...(situation && { situation }),
      ...(method && { method }),
    });

    navigate(`/recipes?${query}`);
  };

  const isSearchDisabled = ingredients.length === 0 || !kind || !situation || !method;

  return (
    <div className="search-buttons-page">
      <h4>선호도 선택</h4>
      <div className="buttons">
        {preferOptions.map((opt) => (
          <button
            key={opt.value}
            className={preference === opt.value ? 'active' : ''}
            onClick={() => handleCategorySelect('preference', opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="section">
        <h4>재료 선택</h4>
        <IngredientCategorySection
          selectedIngredients={ingredients}
          setSelectedIngredients={setIngredients}
        />
      </div>

      <div className="section">
        <h4>종류별</h4>
        <div className="buttons">
          {kindOptions.map((opt) => (
            <button
              key={opt.value}
              className={kind === opt.value ? 'active' : ''}
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
              className={situation === opt.value ? 'active' : ''}
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
              className={method === opt.value ? 'active' : ''}
              onClick={() => handleCategorySelect('method', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

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
