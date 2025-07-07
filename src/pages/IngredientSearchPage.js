import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from "../assets/emojiMap_full_ko.js";
import DropdownSelector from '../components/DropdownSelector';
import PreferenceToggleSection from '../components/PreferenceToggleSection';
import { kindOptions, situationOptions, methodOptions } from '../components/options.js';

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [ingredientOptions, setIngredientOptions] = useState([]); // 전체 재료 목록
  const [ingredientsToDisplay, setIngredientsToDisplay] = useState(20); // 한 번에 보여줄 재료 개수

  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(null); // 하나의 드롭다운만 열리도록 수정

  const handleToggle = (key) => {
    setOpenDropdown(openDropdown === key ? null : key); // 같은 것을 두 번 클릭하면 닫기
  };

  const handleSelect = (key, opt) => {
    if (key === 'kind') setKind(opt.value);
    if (key === 'situation') setSituation(opt.value);
    if (key === 'method') setMethod(opt.value);
    setOpenDropdown(null); // 선택 후 드롭다운 닫기
  };

  const toggleIngredient = (item) => {
    setIngredients(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
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

  // 모든 필드가 선택되어야만 검색 버튼 활성화
  const isSearchDisabled =
    ingredients.length === 0 || !kind || !situation || !method;

  // "+ 버튼 클릭 시 추가로 20개씩 재료 불러오기"
  const loadMoreIngredients = () => {
    setIngredientsToDisplay(prev => prev + 20); // 20개씩 추가로 보여주기
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

      <div className="section dropdowns">
        <div className="dropdown">
          <DropdownSelector
            label="종류별"
            options={kindOptions}
            selected={kind ? kindOptions.find(opt => opt.value === kind)?.label : ''}
            isOpen={openDropdown === 'kind'}
            onToggle={() => handleToggle('kind')}
            onSelect={(value) => handleSelect('kind', value)}
          />

          <DropdownSelector
            label="상황별"
            options={situationOptions}
            selected={situation ? situationOptions.find(opt => opt.value === situation)?.label : ''}
            isOpen={openDropdown === 'situation'}
            onToggle={() => handleToggle('situation')}
            onSelect={(value) => handleSelect('situation', value)}
          />

          <DropdownSelector
            label="방법별"
            options={methodOptions}
            selected={method ? methodOptions.find(opt => opt.value === method)?.label : ''}
            isOpen={openDropdown === 'method'}
            onToggle={() => handleToggle('method')}
            onSelect={(value) => handleSelect('method', value)}
          />
          <button className="search-btn" onClick={handleSearch} disabled={isSearchDisabled}>검색</button>
        </div>
      </div>
    </div>
  );
}

export default IngredientSearchPage;
