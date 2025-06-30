import React from 'react';
import './PreferenceToggleSection.css';

function PreferenceToggleSection({ preferenceOn, setPreferenceOn, onEditClick }) {
  return (
    <div className="preference-header">
      <span className="toggle-label">선호도 적용?</span>
      <span className="edit-button" onClick={onEditClick}>편집</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={preferenceOn}
          onChange={() => setPreferenceOn((prev) => !prev)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default PreferenceToggleSection;
