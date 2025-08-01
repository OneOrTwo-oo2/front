import React, { useState, useEffect } from "react";
import emojiMap from "../../assets/emojiMap_full_ko";
import ingredientList from "../../assets/ingredientList.json";
import ingredientCategoryMap from './ingredientCategoryMap.json';
import SelectedIngredientsRow from "./SelectedIngredientsRow";
import './IngredientCategorySection.css';

function IngredientCategorySection({ selectedIngredients, setSelectedIngredients, toggleIngredient, ingredientsWithConfidence, confidenceThreshold = 0.5 }) {
  const [modalCategory, setModalCategory] = useState(null);
  const [displayCountMap, setDisplayCountMap] = useState({});
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const initialMap = Object.keys(ingredientCategoryMap).reduce((acc, key) => {
      acc[key] = 3; // 기본 3개만 미리보기
      return acc;
    }, {});
    setDisplayCountMap(initialMap);
    // 모든 카테고리 접힌 상태로 시작
    setOpenCategories(Object.keys(ingredientCategoryMap).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {}));
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

  const handleAccordionToggle = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const loadMoreIngredients = (category, totalCount) => {
    setDisplayCountMap((prev) => ({
      ...prev,
      [category]: totalCount,
    }));
    setOpenCategories((prev) => ({
      ...prev,
      [category]: true,
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
      } else if (confidencePercent >= 30) {
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

  // 모달 오픈/닫기
  const openModal = (category) => setModalCategory(category);
  const closeModal = () => setModalCategory(null);

  // 긴 텍스트 처리 함수 (4글자 이상이면 ... 추가)
  const truncateText = (text, maxLength = 4) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // 모든 카테고리를 한 줄에 배치
  const categories = Object.keys(ingredientCategoryMap);
  // 모든 카테고리를 한 줄에 배치: 탄수화물, 단백질, 소스류, 유제품, 야채류, 과일류, 가공품, 음료, 기타
  const reorderedCategories = [
    'carbohydrate', 'protein', 'sauce', 'dairy', 
    'vegetable', 'fruit', 'processed', 'beverage', 'etc'
  ];
  
  const allCategories = reorderedCategories; // 모든 카테고리를 한 줄에

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
      <div className="ingredient-sections-wrapper">
        {/* 모든 카테고리를 한 줄에 배치 */}
        <div className="category-row">
          {allCategories.map((category) => {
            const items = ingredientList[ingredientCategoryMap[category]] || [];
            const selectedItems = items.filter(item => selectedIngredients.includes(item));
            const unselectedItems = items.filter(item => !selectedIngredients.includes(item));
            const displayedItems = [...selectedItems, ...unselectedItems];

            return (
              <div key={category} className="ingredient-section-card">
                <div className="category-header">
                  <h3>{ingredientCategoryMap[category]}</h3>
                  <button 
                    className="toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(category);
                    }}
                    style={{
                      width:'32px',
                      height:'32px',
                      borderRadius:'50%',
                      border:'none',
                      background:'linear-gradient(135deg, #007bff, #28a745)',
                      color:'white',
                      fontSize:'18px',
                      fontWeight:'bold',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      boxShadow:'0 2px 8px rgba(0,123,255,0.3)',
                      transition:'all 0.2s ease'
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="ingredient-grid">
                  {displayedItems.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleIngredient(item);
                      }}
                      className={`ingredient-item ${selectedIngredients.includes(item) ? 'selected' : ''}`}
                      style={{
                        padding:'6px 8px',
                        border:'1px solid #ddd',
                        borderRadius:'8px',
                        background:selectedIngredients.includes(item) ? '#4CAF50' : '#fff',
                        color:selectedIngredients.includes(item) ? '#fff' : '#333',
                        cursor:'pointer',
                        fontSize:'0.8rem',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:'4px',
                        transition:'all 0.2s ease',
                        width:'100%',
                        minHeight:'40px'
                      }}
                    >
                      <img 
                        src={emojiMap[item]?.emoji || '/default-emoji.png'} 
                        alt={emojiMap[item]?.name_ko || item}
                        style={{width:'18px', height:'18px', flexShrink:0}}
                      />
                      <span style={{fontSize:'0.75rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={emojiMap[item]?.name_ko || item}>
                        {truncateText(emojiMap[item]?.name_ko || item, 3)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 모달 */}
      {modalCategory && (
        <div className="ingredient-modal-overlay" onClick={closeModal}>
          <div className="ingredient-modal" onClick={e => e.stopPropagation()}>
            <div className="ingredient-modal-header">
              <span>{ingredientCategoryMap[modalCategory]}</span>
              <button className="ingredient-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="ingredient-modal-list">
              {(() => {
                const allItems = ingredientList[ingredientCategoryMap[modalCategory]] || [];
                const selected = allItems.filter(item => selectedIngredients.includes(item));
                const unselected = allItems.filter(item => !selectedIngredients.includes(item));
                const sortedItems = [...selected, ...unselected];
                return sortedItems.map(item => {
                  const info = emojiMap[item] || {
                    emoji: null,
                    name_ko: item.replace(/_/g, " "),
                  };
                  const buttonStyle = getIngredientStyle(item);
                  return (
                    <button
                      key={item}
                      className={selectedIngredients.includes(item) ? "active" : ""}
                      onClick={() => handleToggle(item)}
                      style={buttonStyle}
                    >
                      {info.emoji ? (
                        <img
                          src={info.emoji}
                          alt={info.name_ko}
                          style={{ width: 25, height: 25, marginRight: 8 }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'inline';
                            }
                          }}
                        />
                      ) : (
                        <span style={{ marginRight: 8 }}>🧂</span>
                      )}
                      {info.emoji && <span style={{ marginRight: 8, display: 'none' }}>🧂</span>}
                      {info.name_ko}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default IngredientCategorySection;
