import img1 from '../assets/img11.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img4.png';
import logo from '../assets/recipego_logo.png';
import { characterImages } from '../assets/characters';

const imageMap = {
  1: img1,
  2: img2,
  3: img3,
  4: logo
};

// 캐릭터 이미지 맵 추가
const characterImageMap = {
  1: characterImages[1],
  2: characterImages[2],
  3: characterImages[3]
};

export const getProjectImages = (index) => imageMap[index];

// 캐릭터 이미지 가져오기 함수 추가
export const getCharacterImages = (index) => characterImageMap[index];