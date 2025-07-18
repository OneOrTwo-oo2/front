// 귀여운 캐릭터 SVG들 (샘플 이미지 스타일 반영)
export const character1 = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 원 -->
  <circle cx="100" cy="100" r="90" fill="#FFE5F3" stroke="#FF69B4" stroke-width="3"/>
  
  <!-- 귀여운 요리사 캐릭터 -->
  <!-- 머리 -->
  <circle cx="100" cy="85" r="35" fill="#FFE5B4"/>
  
  <!-- 머리카락 (양쪽으로 묶은 머리) -->
  <ellipse cx="75" cy="70" rx="8" ry="12" fill="#8B4513"/>
  <ellipse cx="125" cy="70" rx="8" ry="12" fill="#8B4513"/>
  <ellipse cx="75" cy="75" rx="6" ry="8" fill="#8B4513"/>
  <ellipse cx="125" cy="75" rx="6" ry="8" fill="#8B4513"/>
  
  <!-- 요리사 모자 -->
  <ellipse cx="100" cy="50" rx="40" ry="12" fill="white"/>
  <rect x="70" y="50" width="60" height="25" fill="white"/>
  <ellipse cx="100" cy="50" rx="35" ry="8" fill="#FFE5B4"/>
  
  <!-- 눈 (점 스타일) -->
  <circle cx="90" cy="80" r="3" fill="#333"/>
  <circle cx="110" cy="80" r="3" fill="#333"/>
  
  <!-- 입 (미소) -->
  <path d="M 85 95 Q 100 105 115 95" stroke="#333" stroke-width="2" fill="none"/>
  
  <!-- 뺨 (발그레한 뺨) -->
  <circle cx="80" cy="90" r="6" fill="#FFB3BA" opacity="0.8"/>
  <circle cx="120" cy="90" r="6" fill="#FFB3BA" opacity="0.8"/>
  
  <!-- 요리사 코트 -->
  <rect x="75" y="110" width="50" height="40" rx="10" fill="white"/>
  <rect x="85" y="115" width="30" height="30" rx="5" fill="white"/>
  
  <!-- 스카프/나비넥타이 -->
  <rect x="90" y="105" width="20" height="8" rx="4" fill="#FF6B6B"/>
  <ellipse cx="100" cy="109" rx="8" ry="4" fill="#FF6B6B"/>
  
  <!-- 손 -->
  <circle cx="65" cy="125" r="10" fill="#FFE5B4"/>
  <circle cx="135" cy="125" r="10" fill="#FFE5B4"/>
  
  <!-- 프라이팬 (왼쪽 손) -->
  <ellipse cx="65" cy="140" rx="15" ry="8" fill="#333"/>
  <ellipse cx="65" cy="140" rx="12" ry="5" fill="#666"/>
  <rect x="60" y="125" width="4" height="15" fill="#333"/>
  
  <!-- 뒤집개 (오른쪽 손) -->
  <rect x="125" y="125" width="20" height="3" rx="1" fill="#333"/>
  <rect x="135" y="125" width="3" height="15" fill="#333"/>
  
  <!-- 튀어오르는 음식 (프라이팬에서) -->
  <ellipse cx="65" cy="130" rx="8" ry="4" fill="#FFD700"/>
  <circle cx="62" cy="128" r="2" fill="#90EE90"/>
  <circle cx="68" cy="132" r="2" fill="#90EE90"/>
  
  <!-- 재료 아이콘들 -->
  <circle cx="40" cy="160" r="6" fill="#FF6B6B"/>
  <circle cx="55" cy="165" r="5" fill="#4ECDC4"/>
  <circle cx="70" cy="160" r="6" fill="#FFE66D"/>
  <circle cx="85" cy="165" r="5" fill="#95E1D3"/>
  <circle cx="100" cy="160" r="6" fill="#F8BBD9"/>
  <circle cx="115" cy="165" r="5" fill="#FFB347"/>
  <circle cx="130" cy="160" r="6" fill="#A8E6CF"/>
  <circle cx="145" cy="165" r="5" fill="#FF9AA2"/>
</svg>
`;

export const character2 = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 원 -->
  <circle cx="100" cy="100" r="90" fill="#E3F2FD" stroke="#2196F3" stroke-width="3"/>
  
  <!-- 귀여운 카메라맨 캐릭터 -->
  <!-- 머리 -->
  <circle cx="100" cy="80" r="30" fill="#FFE5B4"/>
  
  <!-- 머리카락 -->
  <ellipse cx="85" cy="65" rx="6" ry="10" fill="#8B4513"/>
  <ellipse cx="115" cy="65" rx="6" ry="10" fill="#8B4513"/>
  
  <!-- 모자 (카메라맨 캡) -->
  <ellipse cx="100" cy="55" rx="25" ry="8" fill="#FF6B6B"/>
  <rect x="80" y="55" width="40" height="12" fill="#FF6B6B"/>
  
  <!-- 눈 -->
  <circle cx="92" cy="75" r="3" fill="#333"/>
  <circle cx="108" cy="75" r="3" fill="#333"/>
  
  <!-- 입 -->
  <path d="M 92 85 Q 100 90 108 85" stroke="#333" stroke-width="2" fill="none"/>
  
  <!-- 뺨 -->
  <circle cx="85" cy="80" r="4" fill="#FFB3BA" opacity="0.8"/>
  <circle cx="115" cy="80" r="4" fill="#FFB3BA" opacity="0.8"/>
  
  <!-- 카메라 바디 -->
  <rect x="70" y="100" width="60" height="45" rx="8" fill="#424242"/>
  <rect x="75" y="105" width="50" height="35" rx="4" fill="#212121"/>
  
  <!-- 카메라 렌즈 -->
  <circle cx="100" cy="122" r="15" fill="#1A1A1A"/>
  <circle cx="100" cy="122" r="12" fill="#333"/>
  <circle cx="100" cy="122" r="8" fill="#666"/>
  <circle cx="100" cy="122" r="4" fill="#999"/>
  
  <!-- 플래시 -->
  <rect x="85" y="95" width="20" height="6" rx="3" fill="#FFD700"/>
  
  <!-- 카메라 그립 -->
  <rect x="130" y="110" width="12" height="30" rx="6" fill="#424242"/>
  
  <!-- 손 -->
  <circle cx="65" cy="115" r="8" fill="#FFE5B4"/>
  <circle cx="135" cy="115" r="8" fill="#FFE5B4"/>
  
  <!-- 사진 아이콘들 (더 귀엽게) -->
  <rect x="30" y="150" width="18" height="14" rx="3" fill="#FFF"/>
  <rect x="32" y="152" width="14" height="10" rx="2" fill="#E3F2FD"/>
  <circle cx="39" cy="157" r="2" fill="#2196F3"/>
  <circle cx="39" cy="157" r="1" fill="white"/>
  
  <rect x="55" y="155" width="18" height="14" rx="3" fill="#FFF"/>
  <rect x="57" y="157" width="14" height="10" rx="2" fill="#E3F2FD"/>
  <circle cx="64" cy="162" r="2" fill="#2196F3"/>
  <circle cx="64" cy="162" r="1" fill="white"/>
  
  <rect x="80" y="150" width="18" height="14" rx="3" fill="#FFF"/>
  <rect x="82" y="152" width="14" height="10" rx="2" fill="#E3F2FD"/>
  <circle cx="89" cy="157" r="2" fill="#2196F3"/>
  <circle cx="89" cy="157" r="1" fill="white"/>
  
  <rect x="105" y="155" width="18" height="14" rx="3" fill="#FFF"/>
  <rect x="107" y="157" width="14" height="10" rx="2" fill="#E3F2FD"/>
  <circle cx="114" cy="162" r="2" fill="#2196F3"/>
  <circle cx="114" cy="162" r="1" fill="white"/>
  
  <rect x="130" y="150" width="18" height="14" rx="3" fill="#FFF"/>
  <rect x="132" y="152" width="14" height="10" rx="2" fill="#E3F2FD"/>
  <circle cx="139" cy="157" r="2" fill="#2196F3"/>
  <circle cx="139" cy="157" r="1" fill="white"/>
  
  <rect x="155" y="155" width="18" height="14" rx="3" fill="#FFF"/>
  <rect x="157" y="157" width="14" height="10" rx="2" fill="#E3F2FD"/>
  <circle cx="164" cy="162" r="2" fill="#2196F3"/>
  <circle cx="164" cy="162" r="1" fill="white"/>
</svg>
`;

export const character3 = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 원 -->
  <circle cx="100" cy="100" r="90" fill="#F3E5F5" stroke="#9C27B0" stroke-width="3"/>
  
  <!-- 귀여운 레시피 캐릭터 -->
  <!-- 머리 -->
  <circle cx="100" cy="75" r="30" fill="#FFE5B4"/>
  
  <!-- 머리카락 -->
  <ellipse cx="85" cy="60" rx="6" ry="10" fill="#8B4513"/>
  <ellipse cx="115" cy="60" rx="6" ry="10" fill="#8B4513"/>
  
  <!-- 요리사 모자 -->
  <ellipse cx="100" cy="50" rx="25" ry="8" fill="#FF6B6B"/>
  <rect x="80" y="50" width="40" height="12" fill="#FF6B6B"/>
  
  <!-- 눈 -->
  <circle cx="92" cy="70" r="3" fill="#333"/>
  <circle cx="108" cy="70" r="3" fill="#333"/>
  
  <!-- 입 -->
  <path d="M 92 80 Q 100 85 108 80" stroke="#333" stroke-width="2" fill="none"/>
  
  <!-- 뺨 -->
  <circle cx="85" cy="75" r="4" fill="#FFB3BA" opacity="0.8"/>
  <circle cx="115" cy="75" r="4" fill="#FFB3BA" opacity="0.8"/>
  
  <!-- 레시피 카드 -->
  <rect x="60" y="95" width="80" height="70" rx="10" fill="#FFF" stroke="#9C27B0" stroke-width="3"/>
  
  <!-- 카드 제목 -->
  <rect x="70" y="105" width="60" height="12" rx="5" fill="#9C27B0"/>
  <text x="100" y="114" text-anchor="middle" fill="white" font-size="10" font-weight="bold">RECIPE</text>
  
  <!-- 레시피 라인들 -->
  <rect x="75" y="125" width="50" height="3" rx="1" fill="#E1BEE7"/>
  <rect x="75" y="135" width="40" height="3" rx="1" fill="#E1BEE7"/>
  <rect x="75" y="145" width="45" height="3" rx="1" fill="#E1BEE7"/>
  <rect x="75" y="155" width="35" height="3" rx="1" fill="#E1BEE7"/>
  
  <!-- 손 -->
  <circle cx="55" cy="110" r="8" fill="#FFE5B4"/>
  <circle cx="145" cy="110" r="8" fill="#FFE5B4"/>
  
  <!-- 요리 아이콘들 -->
  <circle cx="40" cy="160" r="6" fill="#FF6B6B"/>
  <circle cx="55" cy="165" r="5" fill="#4ECDC4"/>
  <circle cx="70" cy="160" r="6" fill="#FFE66D"/>
  <circle cx="85" cy="165" r="5" fill="#95E1D3"/>
  <circle cx="100" cy="160" r="6" fill="#F8BBD9"/>
  <circle cx="115" cy="165" r="5" fill="#FFB347"/>
  <circle cx="130" cy="160" r="6" fill="#A8E6CF"/>
  <circle cx="145" cy="165" r="5" fill="#FF9AA2"/>
  <circle cx="160" cy="160" r="6" fill="#FFD93D"/>
</svg>
`;

// SVG를 Data URL로 변환하는 함수
export const svgToDataUrl = (svgString) => {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

// 캐릭터 이미지들을 Data URL로 변환
export const characterImages = {
  1: svgToDataUrl(character1),
  2: svgToDataUrl(character2),
  3: svgToDataUrl(character3)
}; 