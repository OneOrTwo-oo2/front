import React from "react";
import emojiMap from "../../assets/emojiMap_full_ko.js";

function SelectedIngredientsRow({ ingredients, onToggle }) {
  if (!ingredients || ingredients.length === 0) return null;

  return (
    <div className="section selected-ingredients-row">
      <div className="buttons horizontal-scroll">
        {ingredients.map((item) => {
          const info = emojiMap[item] || {
            emoji: null,
            name_ko: item.replace(/_/g, " "),
          };

          return (
            <button
              key={item}
              className="active"
              onClick={() => onToggle(item)}
            >
              {info.emoji ? (
                <img
                  src={info.emoji}
                  alt={info.name_ko}
                  style={{ width: 25, height: 25, marginRight: 8 }}
                />
              ) : (
                <span style={{ marginRight: 8 }}>🧂</span>
              )}
              {info.name_ko}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SelectedIngredientsRow;
