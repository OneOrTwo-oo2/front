import img1 from '../assets/img11.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img4.png';
import logo from '../assets/recipego_logo.png';

const imageMap = {
  1: img1,
  2: img2,
  3: img3,
  4: logo
};

export const getProjectImages = (index) => imageMap[index];