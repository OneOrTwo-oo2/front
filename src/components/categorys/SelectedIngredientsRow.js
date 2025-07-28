import React from "react";
import emojiMap from "../../assets/emojiMap_full_ko.js";

function SelectedIngredientsRow({ ingredients, onToggle, ingredientsWithConfidence, confidenceThreshold = 0.5 }) {
  if (!ingredients || ingredients.length === 0) return null;

  // 정확도에 따른 색상 결정 함수
  const getIngredientStyle = (item) => {
    if (!ingredientsWithConfidence) return {};
    
    const ingredientInfo = ingredientsWithConfidence.find(ing => ing.label === item);
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
          backgroundColor: '#f44336', // 빨간색 (낮은 정확도: 30% 미만)
          color: 'white',
          border: '1px solid #d32f2f'
        };
      }
    }
    return {};
  };

  return (
    <div className="section selected-ingredients-row">
      {ingredients.map((item) => {
          const info = emojiMap[item] || {
            emoji: null,
            name_ko: item.replace(/_/g, " "),
          };

          const buttonStyle = getIngredientStyle(item);
          const isLowConfidence = buttonStyle.backgroundColor === '#ff9800' || buttonStyle.backgroundColor === '#f44336';

          return (
            <button
              key={item}
              className="active"
              onClick={() => onToggle(item)}
              style={buttonStyle}
              title={ingredientsWithConfidence?.find(ing => ing.label === item) ? 
                `정확도: ${(ingredientsWithConfidence.find(ing => ing.label === item).confidence * 100).toFixed(1)}%` : 
                undefined}>
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
    </div>
  );
}

export default SelectedIngredientsRow;
