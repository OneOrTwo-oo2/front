import React, { useState, useEffect } from "react";
import emojiMap from "../../assets/emojiMap_full_ko";
import ingredientList from "../../assets/ingredientList.json";
import ingredientCategoryMap from './ingredientCategoryMap.json';
import SelectedIngredientsRow from "./SelectedIngredientsRow";
import './IngredientCategorySection.css';

function IngredientCategorySection({ selectedIngredients, setSelectedIngredients, toggleIngredient, ingredientsWithConfidence, confidenceThreshold = 0.5 }) {
  const [displayCountMap, setDisplayCountMap] = useState({});

  useEffect(() => {
    const initialMap = Object.keys(ingredientCategoryMap).reduce((acc, key) => {
      acc[key] = 10;
      return acc;
    }, {});
    setDisplayCountMap(initialMap);
  }, []);

  // 선택된 재료들을 confidence 형식으로 변환
  const getMergedIngredientsWithConfidence = () => {
    const existingConfidence = ingredientsWithConfidence || [];
    
    // 현재 선택된 재료들만 confidence 정보를 유지
    const selectedWithConfidence = selectedIngredients.map(ingredient => {
      // 이미 confidence가 있는 재료는 그대로 사용
      const existing = existingConfidence.find(item => item.label === ingredient);
      if (existing) {
        return existing;
      }
      // 사용자가 직접 선택한 재료는 높은 confidence(0.9)로 설정
      return {
        label: ingredient,
        confidence: 1.0
      };
    });
    
    // 선택되지 않은 재료들은 confidence 정보에서 제외
    return selectedWithConfidence;
  };

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

  // 정확도에 따른 색상 결정 함수
  const getIngredientStyle = (item) => {
    const mergedConfidence = getMergedIngredientsWithConfidence();
    const ingredientInfo = mergedConfidence.find(ing => ing.label === item);
    
    if (ingredientInfo) {
      const confidencePercent = ingredientInfo.confidence * 100;
      
      if (confidencePercent >= 70) {
        return {
          backgroundColor: '#4CAF50', // 초록색 (높은 정확도: 70% 이상)
          color: 'white',
          border: '1px solid #45a049'
        };
      } else if (confidencePercent >= 20) {
        return {
          backgroundColor: '#ff9800', // 주황색 (중간 정확도: 20~70%)
          color: 'white',
          border: '1px solid #e68900'
        };
      } else {
        return {
          backgroundColor: '#f44336', // 빨간색 (낮은 정확도: 20% 미만)
          color: 'white',
          border: '1px solid #d32f2f'
        };
      }
    }
    return {};
  };

  return (
    <>
    <div className="selected-ingredients-wrapper">
      <SelectedIngredientsRow 
        ingredients={selectedIngredients} 
        onToggle={handleToggle} 
        ingredientsWithConfidence={getMergedIngredientsWithConfidence()}
        confidenceThreshold={confidenceThreshold}
      />
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

                const buttonStyle = getIngredientStyle(item);
                const isLowConfidence = buttonStyle.backgroundColor === '#ff9800' || buttonStyle.backgroundColor === '#f44336';

                return (
                  <button
                    key={item}
                    className={selectedIngredients.includes(item) ? "active" : ""}
                    onClick={() => handleToggle(item)}
                    style={buttonStyle}
                    title={(() => {
                      const mergedConfidence = getMergedIngredientsWithConfidence();
                      const ingredientInfo = mergedConfidence.find(ing => ing.label === item);
                      return ingredientInfo ? 
                        `정확도: ${(ingredientInfo.confidence * 100).toFixed(1)}%` : 
                        undefined;
                    })()}
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
