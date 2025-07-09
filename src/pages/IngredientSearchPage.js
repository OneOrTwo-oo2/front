import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from '../assets/emojiMap_full_ko.js';
import {
  preferOptions,
  kindOptions,
  situationOptions,
  methodOptions,
} from '../components/options.js';
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

  // 고정 박스에 들어갈 항목들만 정리
  const getSelectedMeta = () => {
    const result = [];

    if (preference) result.push({ type: '선호도', value: preference });
    if (kind) result.push({ type: '종류', value: kind });
    if (situation) result.push({ type: '상황', value: situation });
    if (method) result.push({ type: '방법', value: method });

    return result;
  };

  // type + value 조합으로 한글 라벨 가져오기
  const getLabelText = (type, value) => {
    const optionMap = {
      선호도: preferOptions,
      종류: kindOptions,
      상황: situationOptions,
      방법: methodOptions,
    };

    const matched = optionMap[type]?.find((opt) => opt.value === value);
    const label = matched ? matched.label : value;

    return `[${type}] ${label}`;
  };

  // ❌ 버튼 처리
  const handleToggle = (type, value) => {
    if (type === '선호도') setPreference('');
    else if (type === '종류') setKind('');
    else if (type === '상황') setSituation('');
    else if (type === '방법') setMethod('');
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

  const isSearchDisabled = ingredients.length === 0;

  return (
    <div className="ingredient-search-layout">
      {/* 좌측 고정 선택 박스 */}
      <div className="selected-ingredients-fixed">
        <p className="text-prefer">😀 선택된 선호도 또는 타입 </p>
        <div className="selected-ingredients-row buttons">
          {getSelectedMeta().map(({ type, value }) => (
            <button key={type + value} onClick={() => handleToggle(type, value)}>
              <span>{getLabelText(type, value)}</span>
               <span>✖</span>
            </button>
          ))}
        </div>
      </div>
     <div className="ingredient-search-content">
      {/* 재료 */}
      <div className="section">
        <h4>선택된 재료</h4>
        <IngredientCategorySection
          selectedIngredients={ingredients}
          setSelectedIngredients={setIngredients}
        />
      </div>
              {/* 선호도 */}
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
      {/* 종류 / 상황 / 방법 */}
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
    </div>
<div className="search-sticky-btn">
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearchDisabled}
        >
         🔍검색
        </button>
      </div>
    </div>
  );
}

export default IngredientSearchPage;
