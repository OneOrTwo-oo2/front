import React from 'react';
import './DropdownSelector.css'; // 필요 시 스타일 분리

function DropdownSelector({ label, options, selected, isOpen, onToggle, onSelect }) {
  return (
    <div className="dropdown">
      <button className="dropdown-btn" onClick={onToggle}>
        {selected || label} <span className="arrow">▼</span>
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((opt) => (
            <li key={opt.value} onClick={() => onSelect(opt)}>
              {opt.label} {/* 객체의 label을 렌더링 */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DropdownSelector;
