import React, { useState } from 'react';
import './IngredientSearchPage.css';
import Header from '../components/Header'

const dropdownOptions = {
  식사유형: ['아침', '점심', '저녁', '간식'],
  요리시간: ['10분 이하', '30분 이하', '1시간 이하', '1시간 이상'],
  나라별요리: ['한식', '일식', '중식', '양식', '동남아'],
  인기재료: ['계란', '감자', '치즈', '김치', '닭고기']
};

function IngredientSearchPage() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [preferenceOn, setPreferenceOn] = useState(false);
  const [showPreferenceSettings, setShowPreferenceSettings] = useState(false);

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleSelect = (key, value) => {
    setSelectedOptions({ ...selectedOptions, [key]: value });
    setOpenDropdown(null);
  };

  const handleEditClick = () => {
    setShowPreferenceSettings(!showPreferenceSettings);
  };

  return (
    <div className="ingredient-page-container">
      <Header/>
      <div className="filter-bar">
        <div className="preference-header">
          <span className="toggle-label">선호도 적용?</span>
          <span className="edit-button" onClick={handleEditClick}>편집</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={preferenceOn}
              onChange={() => setPreferenceOn(!preferenceOn)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {showPreferenceSettings && (
          <div className="preference-dropdown">
            <div>식단: 지정해</div>
            <div>피하는 식재료: 우유</div>
            <div>영양</div>
            <div>가구: 1성인</div>
            <div>요리 경험</div>
            <div>좋아하는 요리</div>
          </div>
        )}

        {Object.keys(dropdownOptions).map((key) => (
          <div key={key} className="dropdown">
            <button className="dropdown-btn" onClick={() => toggleDropdown(key)}>
              {selectedOptions[key] || key} <span className="arrow">▼</span>
            </button>
            {openDropdown === key && (
              <ul className="dropdown-menu">
                {dropdownOptions[key].map((option) => (
                  <li key={option} onClick={() => handleSelect(key, option)}>
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IngredientSearchPage;
