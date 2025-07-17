import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from '../assets/emojiMap_full_ko.js';
import {
  preferOptions,
  kindOptions,
  levelOptions
} from '../components/options.js';
import IngredientCategorySection from '../components/categorys/IngredientCategorySection';

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [preference, setPreference] = useState('');
  const [kind, setKind] = useState('');
  const [level, setLevel] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { labels } = location.state || { labels: [] };
  const [isRestored, setIsRestored] = useState(false);


  const getOptionValue = (options, label) => {
  const match = options.find(opt => opt.label === label);
  return match ? match.value : label;
  };

  // 캐시 저장
  useEffect(() => {
      const saved = sessionStorage.getItem("searchInputs");
      if (saved) {
        const parsed = JSON.parse(saved);
        setIngredients(Array.isArray(parsed.ingredients) ? parsed.ingredients : []);
        setPreference(parsed.preference || '');
        setKind(parsed.kind || '');
        setLevel(parsed.level || '');
      } else if (labels.length > 0) {
        setIngredients(labels);
      }

      // ✅ 복원 완료 플래그 설정
      setIsRestored(true);
    }, []);

    // ✅ 복원이 완료된 경우에만 sessionStorage에 저장
    useEffect(() => {
      if (!isRestored) return;

      const ingredientNamesInKorean = ingredients.map((item) => {
        const info = emojiMap[item];
        return info?.name_ko || item.replace(/_/g, ' ');
      });

      sessionStorage.setItem("searchInputs", JSON.stringify({
        ingredients: ingredientNamesInKorean,
        preference,
        kind,
        level
      }));
    }, [ingredients, preference, kind, level, isRestored]);

  const handleCategorySelect = (type, value) => {
    if (type === 'preference') setPreference(value);
    if (type === 'kind') setKind(value);
    if (type === 'level') setLevel(value);
  };

  // 고정 박스에 들어갈 항목들만 정리
  const getSelectedMeta = () => {
    const result = [];

    if (preference) result.push({ type: '선호도', value: preference });
    if (kind) result.push({ type: '종류', value: kind });
    if (level) result.push({ type: '난이도', value: level });

    return result;
  };

  // type + value 조합으로 한글 라벨 가져오기
  const getLabelText = (type, value) => {
    const optionMap = {
      선호도: preferOptions,
      종류: kindOptions,
      난이도: levelOptions
    };

    const matched = optionMap[type]?.find((opt) => opt.value === value);
    const label = matched ? matched.label : value;

    return `[${type}] ${label}`;
  };

  // ❌ 버튼 처리
  const handleToggle = (type, value) => {
    if (type === '선호도') setPreference('');
    else if (type === '종류') setKind('');
    else if (type === '난이도') setLevel('');
  };

  const handleSearch = () => {
    const ingredientNamesInKorean = ingredients.map((item) => {
      const info = emojiMap[item];
      return info?.name_ko || item.replace(/_/g, ' ');
    });
    // ✅ label → value 변환
    const kindValue = getOptionValue(kindOptions, kind);

    sessionStorage.setItem("searchInputs", JSON.stringify({
    ingredients: ingredientNamesInKorean,
    preference,
    kind,
    level
    }));

    const query = qs.stringify({
      ingredients: ingredientNamesInKorean.join(','),
      ...(kind && { kind: kindValue }),
      //...(situation && { situation }),
      //...(method && { method }),
    });
    navigate(`/recipes?${query}`);

    console.log("recipe 전달 data:", query)
    };

//  const searchData = {
//    ingredients,
//    kind,
//    preference,
//    level,
//  };
//
//  // 👉 sessionStorage 저장
//  sessionStorage.setItem('recipeSearchState', JSON.stringify(searchData));
//
//  // 👉 location.state로도 함께 전달
//  navigate('/RecipeListPage', { state: searchData });

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
            className={preference === opt.label ? 'active' : ''}
            onClick={() => handleCategorySelect('preference', opt.label)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* 종류 / 난이도 */}
      <div className="section">
        <h4>종류별</h4>
        <div className="buttons">
          {kindOptions.map((opt) => (
            <button
              key={opt.value}
              className={kind === opt.label ? 'active' : ''}
              onClick={() => handleCategorySelect('kind', opt.label)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h4>난이도별</h4>
        <div className="buttons">
          {levelOptions.map((opt) => (
            <button
              key={opt.value}
              className={level === opt.label ? 'active' : ''}
              onClick={() => handleCategorySelect('level', opt.label)}
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
