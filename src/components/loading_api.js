import React, { useEffect, useState } from 'react';

const LoadingAnimation = () => {
  const frames = [
    '/emojis/strawberry_milk.png',
    '/emojis/red_chili_paste.png',
    '/emojis/cucumber.png',
    '/emojis/dumpling.png',
    '/emojis/tomato.png',
    '/emojis/pineapple.png',
    '/emojis/avocado.png',
    '/emojis/seaweed.png',
    '/emojis/radish.png',
    '/emojis/octopus.png',
    '/emojis/chicken_drumstick.png',
    '/emojis/garlic.png',
    '/emojis/instant_rice.png',
    '/emojis/potato.png',
    '/emojis/carrot.png',
    '/emojis/mango.png'
  ]; // 원하는 이미지 경로로 수정

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 300); // 0.3초 간격으로 이미지 전환

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="emoji-spinner">
        <img src={frames[index]} alt="loading" className="emoji-frame" />
      </div>
      <p className="loading-message">검색 중입니다...</p>
    </div>
  );
};

export default LoadingAnimation;
