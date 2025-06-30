import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IngredientSearchPage.css';

import DropdownSelector from '../components/DropdownSelector';
import PreferenceToggleSection from '../components/PreferenceToggleSection';
import PreferenceDetailPanel from '../components/PreferenceDetailPanel';
import ChatBox from '../components/ChatWatsonx_tmp';



const dropdownOptions = {
  식사유형: ['아침', '점심', '저녁', '간식'],
  요리시간: ['10분 이하', '30분 이하', '1시간 이하', '1시간 이상'],
  나라별요리: ['한식', '일식', '중식', '양식', '동남아'],
  인기재료: ['계란', '감자', '치즈', '김치', '닭고기']
};

function IngredientSearchPage() {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [preferenceOn, setPreferenceOn] = useState(false);
  const [showPreferenceSettings, setShowPreferenceSettings] = useState(false);

  const goToRecipePage = () => {
     const ingredients = selectedOptions['인기재료'];
      if (ingredients) {
        const ingredientList = ingredients.split(',').map(item => item.trim());
        const query = ingredientList.join(','); // 쉼표로 연결된 문자열
        navigate(`/recipes?ingredients=${encodeURIComponent(query)}`);
      } else {
        alert('인기재료를 선택해주세요!');
      }
  };

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleSelect = (key, value) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }));
    setOpenDropdown(null);
  };

  const togglePreferenceSettings = () => {
    setShowPreferenceSettings((prev) => !prev);
  };

  return (
    <div className="ingredient-page-container">
      <div className="filter-bar">
        <div className="filter-row">
          <PreferenceToggleSection
            preferenceOn={preferenceOn}
            setPreferenceOn={setPreferenceOn}
            onEditClick={togglePreferenceSettings}
          />
          <div className="dropdown-container">
            {Object.entries(dropdownOptions).map(([key, options]) => (
              <DropdownSelector
                key={key}
                label={key}
                options={options}
                selected={selectedOptions[key]}
                isOpen={openDropdown === key}
                onToggle={() => toggleDropdown(key)}
                onSelect={(value) => handleSelect(key, value)}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={goToRecipePage} style={{ padding: '10px 20px', fontSize: '16px' }}>
                재료 선택하고 레시피 보기
                </button>
           </div>
        </div>

        {showPreferenceSettings && <PreferenceDetailPanel />}
      </div>
      <ChatBox/>
    </div>
  );
}

export default IngredientSearchPage;
