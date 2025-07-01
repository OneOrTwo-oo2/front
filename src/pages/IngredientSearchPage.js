import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IngredientSearchPage.css';
import DropdownSelector from '../components/DropdownSelector';
import PreferenceToggleSection from '../components/PreferenceToggleSection';
import ChatBox from '../components/ChatWatsonx_tmp';

// dropdownOptions을 객체 형식으로 수정
const dropdownOptions = {
  식사유형: [
    { value: '아침', label: '아침' },
    { value: '점심', label: '점심' },
    { value: '저녁', label: '저녁' },
    { value: '간식', label: '간식' },
  ],
  요리시간: [
    { value: '10분 이하', label: '10분 이하' },
    { value: '30분 이하', label: '30분 이하' },
    { value: '1시간 이하', label: '1시간 이하' },
    { value: '1시간 이상', label: '1시간 이상' },
  ],
  나라별요리: [
    { value: '한식', label: '한식' },
    { value: '일식', label: '일식' },
    { value: '중식', label: '중식' },
    { value: '양식', label: '양식' },
    { value: '동남아', label: '동남아' },
  ],
  인기재료: [
    { value: '계란', label: '계란' },
    { value: '감자', label: '감자' },
    { value: '치즈', label: '치즈' },
    { value: '김치', label: '김치' },
    { value: '닭고기', label: '닭고기' },
  ],
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
      const ingredientList = ingredients.split(',').map((item) => item.trim());
      const query = ingredientList.join(','); // 쉼표로 연결된 문자열
      navigate(`/recipes?ingredients=${encodeURIComponent(query)}`);
    } else {
      alert('인기재료를 선택해주세요!');
    }
  };

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleSelect = (key, selectedItem) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: selectedItem.value }));
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
                onSelect={(value) => handleSelect(key, value)} // 선택된 값을 전달
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={goToRecipePage}
              style={{ padding: '10px 20px', fontSize: '16px' }}
            >
              재료 선택하고 레시피 보기
            </button>
          </div>
        </div>

        {showPreferenceSettings}
      </div>
      <ChatBox />
    </div>
  );
}

export default IngredientSearchPage;
