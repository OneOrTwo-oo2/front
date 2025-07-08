import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from "../assets/emojiMap_full_ko.js";
import { preferOptions, kindOptions, situationOptions, methodOptions } from '../components/options.js';
import ingredientList from '../assets/ingredientList.json';

const ingredientCategoryMap = {
  carbohydrate: "탄수화물",
  protein: "단백질",
  sauce: "소스류",
  dairy: "유제품",
  vegetable: "야채류",
  fruit: "과일류",
  processed: "가공품",
  beverage: "음료",
  etc: "기타"
};

const groupedIngredients = Object.entries(ingredientCategoryMap).map(([key, label]) => ({
  category: key,
  label,
  ingredients: ingredientList[label] || [],
}));

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [preference, setPreference] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [ingredientsToDisplayMap, setIngredientsToDisplayMap] = useState(() =>
    Object.keys(ingredientCategoryMap).reduce((acc, key) => {
      acc[key] = 10;
      return acc;
    }, {})
  );

  const location = useLocation();
  const { labels } = location.state || { labels: [] };

  const navigate = useNavigate();

  const toggleIngredient = (item) => {
    setIngredients((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleCategorySelect = (type, value) => {
    if (type === 'preference') setPreference(value);
    if (type === 'kind') setKind(value);
    if (type === 'situation') setSituation(value);
    if (type === 'method') setMethod(value);
  };

  const handleSearch = () => {
    const ingredientNamesInKorean = ingredients.map((item) => {
      const info = emojiMap[item];
      return info?.name_ko || item.replace(/_/g, " ");
    });

    const query = qs.stringify({
      ingredients: ingredientNamesInKorean.join(','),
      ...(kind && { kind }),
      ...(situation && { situation }),
      ...(method && { method }),
    });

    navigate(`/recipes?${query}`);
  };

  useEffect(() => {
    if (labels.length > 0) {
      setIngredients(labels);
    }
  }, [labels]);

  const isSearchDisabled =
    ingredients.length === 0 || !kind || !situation || !method;

  const loadMoreIngredients = (category) => {
    setIngredientsToDisplayMap((prev) => ({
      ...prev,
      [category]: prev[category] + 10,
    }));
  };

  return (
    <div className="search-buttons-page">
      <h4>선호도 선택</h4>
      <div className="buttons">
        {preferOptions.map((opt) => (
          <button
            key={opt.value}
            className={preference === opt.value ? "active" : ""}
            onClick={() => handleCategorySelect('preference', opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="section">
        <h4>재료 선택</h4>
        {ingredients.length > 0 && (
          <div className="section selected-ingredients-row">
            <div className="buttons horizontal-scroll">
              {ingredients.map((item) => {
                const info = emojiMap[item] || {
                  emoji: null,
                  name_ko: item.replace(/_/g, " "),
                };

                return (
                  <button
                    key={item}
                    className="active"
                    onClick={() => toggleIngredient(item)}
                  >
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
            </div>
          </div>
        )}

        {/* 카테고리별 출력 */}
        {groupedIngredients.map(({ category, label, ingredients: items }) => {
          const displayed = [
            ...ingredients.filter((i) => items.includes(i)),
            ...items.filter((i) => !ingredients.includes(i)),
          ];
          const count = ingredientsToDisplayMap[category] || 20;

          return (
            <div className="section" key={category}>
              <h4>{label}</h4>
              <div className="buttons">
                {displayed.slice(0, count).map((item) => {
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
                {count < items.length && (
                  <button
                    className="load-more-btn"
                    onClick={() => loadMoreIngredients(category)}
                  >
                    + 더 보기
                  </button>
                )}
              </div>
            </div>
          );
        })}
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
