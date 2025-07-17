import React, { useState, useEffect } from "react";
import emojiMap from "../../assets/emojiMap_full_ko";
import ingredientList from "../../assets/ingredientList.json";
import ingredientCategoryMap from './ingredientCategoryMap.json';
import SelectedIngredientsRow from "./SelectedIngredientsRow";
import './IngredientCategorySection.css';
function IngredientCategorySection({ selectedIngredients, setSelectedIngredients, toggleIngredient }) {
  const [displayCountMap, setDisplayCountMap] = useState({});

  useEffect(() => {
    const initialMap = Object.keys(ingredientCategoryMap).reduce((acc, key) => {
      acc[key] = 10;
      return acc;
    }, {});
    setDisplayCountMap(initialMap);
  }, []);

  // cursor 수정 - toggleIngredient prop이 있으면 사용, 없으면 기존 로직 사용
  const handleToggle = (item) => {
    if (toggleIngredient) {
      toggleIngredient(item);
    } else {
      setSelectedIngredients((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  const loadMoreIngredients = (category) => {
    setDisplayCountMap((prev) => ({
      ...prev,
      [category]: (prev[category] || 10) + 10,
    }));
  };

  return (
    <>
    <div className="selected-ingredients-wrapper">
         <div className="selected-ingredients-box">
      <SelectedIngredientsRow ingredients={selectedIngredients} onToggle={handleToggle} />
    </div>
    </div>
      {Object.entries(ingredientCategoryMap).map(([category, label]) => {
        const items = ingredientList[label] || [];
        const displayCount = displayCountMap[category] || 0;

        const displayedItems = [
          ...selectedIngredients.filter((i) => items.includes(i)),
          ...items.filter((i) => !selectedIngredients.includes(i)),
        ];

        return (
          <div className="section" key={category}>
            <h4>{label}</h4>
            <div className="buttons">
              {displayedItems.slice(0, displayCount).map((item) => {
                const info = emojiMap[item] || {
                  emoji: null,
                  name_ko: item.replace(/_/g, " "),
                };

                return (
                  <button
                    key={item}
                    className={selectedIngredients.includes(item) ? "active" : ""}
                    onClick={() => handleToggle(item)}
                  >
                    {info.emoji ? (
                      // cursor 수정 - 이미지 경로 수정 및 안정성 향상
                      <img
                        src={info.emoji}
                        alt={info.name_ko}
                        style={{ width: 25, height: 25, marginRight: 8 }}
                        onError={(e) => {
                          console.error(`Image failed to load: ${info.emoji}`);
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'inline';
                          }
                        }}
                        onLoad={() => {
                          console.log(`Image loaded successfully: ${info.emoji}`);
                        }}
                      />
                    ) : (
                      <span style={{ marginRight: 8 }}>🧂</span>
                    )}
                    {info.emoji && <span style={{ marginRight: 8, display: 'none' }}>🧂</span>}
                    {info.name_ko}
                  </button>
                );
              })}
              {displayCount < items.length && (
                <button className="load-more-btn" onClick={() => loadMoreIngredients(category)}>
                  + 더 보기
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default IngredientCategorySection;
