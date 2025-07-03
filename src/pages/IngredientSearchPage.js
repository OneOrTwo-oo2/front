import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [ingredientOptions, setIngredientOptions] = useState([]);

  const navigate = useNavigate();

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

  return (
    <div className="search-buttons-page">
      <h2>레시피 검색</h2>

      <div className="section">
        <h4>재료 선택</h4>
        <div className="buttons">
          {ingredientOptions.slice(0, 20).map((item) => (
            <button
              key={item}
              className={ingredients.includes(item) ? "active" : ""}
              onClick={() => toggleIngredient(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="section dropdowns">
        <div className="dropdown">
          <label>종류별</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">선택 없음</option>
            <option value="63">밑반찬</option>
            <option value="56">메인반찬</option>
            <option value="54">국/탕</option>
            <option value="55">찌개</option>
            <option value="60">디저트</option>
          </select>
        </div>

        <div className="dropdown">
          <label>상황별</label>
          <select value={situation} onChange={(e) => setSituation(e.target.value)}>
            <option value="">선택 없음</option>
            <option value="12">일상</option>
            <option value="18">초스피드</option>
            <option value="13">손님접대</option>
            <option value="21">다이어트</option>
          </select>
        </div>

        <div className="dropdown">
          <label>방법별</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">선택 없음</option>
            <option value="6">볶음</option>
            <option value="1">끓이기</option>
            <option value="7">부침</option>
            <option value="36">조림</option>
          </select>
        </div>
      </div>

      <button className="search-btn" onClick={handleSearch}>검색</button>
    </div>
  );
}

export default IngredientSearchPage;
