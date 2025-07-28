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
        {Object.entries(ingredientCategoryMap).map(([category, label]) => {
          const items = ingredientList[label] || [];
          const displayedItems = [
            ...selectedIngredients.filter((i) => items.includes(i)),
            ...items.filter((i) => !selectedIngredients.includes(i)),
          ];
          return (
            <div className="ingredient-section-card" key={category} style={{cursor:'pointer', background:'#e0e0e0', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', borderRadius:'18px', margin:'0 8px', minWidth:'220px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start'}}>
              <div className="category-header" style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                <h3 style={{margin:'0', fontSize:'1.1rem', fontWeight:'600', color:'#333'}}>{label}</h3>
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
              <div className="ingredient-grid" style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px', width:'100%'}}>
                {displayedItems.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleIngredient(item);
                    }}
                    className={`ingredient-item ${selectedIngredients.includes(item) ? 'selected' : ''}`}
                    style={{
                      padding:'8px 12px',
                      border:'1px solid #ddd',
                      borderRadius:'8px',
                      background:selectedIngredients.includes(item) ? '#4CAF50' : '#fff',
                      color:selectedIngredients.includes(item) ? '#fff' : '#333',
                      cursor:'pointer',
                      fontSize:'0.9rem',
                      display:'flex',
                      alignItems:'center',
                      gap:'6px',
                      transition:'all 0.2s ease'
                    }}
                  >
                    <img 
                      src={emojiMap[item]?.emoji || '/default-emoji.png'} 
                      alt={emojiMap[item]?.name_ko || item}
                      style={{width:'20px', height:'20px'}}
                    />
                    <span style={{fontSize:'0.85rem'}}>{emojiMap[item]?.name_ko || item}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
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
