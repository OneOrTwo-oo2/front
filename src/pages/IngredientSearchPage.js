import React, { useState } from 'react';
import './IngredientSearchPage.css';

import Header from '../components/Header';
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
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [preferenceOn, setPreferenceOn] = useState(false);
  const [showPreferenceSettings, setShowPreferenceSettings] = useState(false);

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
      <Header />
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
        </div>

        {showPreferenceSettings && <PreferenceDetailPanel />}
      </div>
      <ChatBox/>
    </div>
  );
}

export default IngredientSearchPage;
