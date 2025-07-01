import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './RandomRecipePage.css';

function RandomRecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastRecipeRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

const fetchRandomRecipes = async (pageNum) => {
  setLoading(true);
  try {
    const page = Math.floor(Math.random() * 10) + 1;
    const res = await axios.get(`/random-recipes?page=${page}`);
    if (res.data.results.length === 0) {
      setHasMore(false);
    } else {
      setRecipes(prev => [...prev, ...res.data.results]);
    }
  } catch (error) {
    console.error('❌ 랜덤 레시피 불러오기 실패:', error);
  }
  setLoading(false);
};


  useEffect(() => {
    fetchRandomRecipes(page);
  }, [page]);

  return (
    <div className="random-container">
      <h2>랜덤 추천 레시피</h2>
      <div className="card-grid">
        {recipes.map((item, idx) => {
          if (recipes.length === idx + 1) {
            return (
              <div className="recipe-card" key={idx} ref={lastRecipeRef}>
                <img src={item.image} alt={item.title} />
                <h3>{item.title}</h3>
                <a href={item.link} target="_blank" rel="noopener noreferrer">레시피 보기</a>
              </div>
            );
          } else {
            return (
              <div className="recipe-card" key={idx}>
                <img src={item.image} alt={item.title} />
                <h3>{item.title}</h3>
                <a href={item.link} target="_blank" rel="noopener noreferrer">레시피 보기</a>
              </div>
            );
          }
        })}
      </div>
      {loading && <div className="loader"></div>}
    </div>
  );
}

export default RandomRecipePage;
