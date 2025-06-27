import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecipeListPage.css'; // ⬅️ CSS 따로 분리
import qs from 'qs';

function RecipeListPage() {
  const [ingredients, setIngredients] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const ing = query.get('ingredients');
    if (ing) {
      setIngredients(ing);
      fetchRecipes(ing);
    }
  }, []);

  const fetchRecipes = async (ing) => {
   try{
      const res = await axios.get('http://localhost:8000/recipes', {
          params: {
            ingredients: ing.split(',').map(i => i.trim())
          },
          paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
        });
      console.log("📦 백엔드에서 받은 결과:", res.data);
      setResults(res.data.results);
    }catch(err){
    console.log(err)
  }
  };



  const handleSearch = () => {
    fetchRecipes(ingredients);
  };

  return (
    <div className="recipe-list-page">
      <h2 className="title">재료 기반 레시피 검색</h2>
      <div className="search-bar">
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="예: 김치, 돼지고기"
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      <div className="recipe-grid">
        {results.length === 0 ? (
          <p className="no-results">레시피가 없습니다.</p>
        ) : (
          results.map((recipe, idx) => (
            <div key={idx} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
              <a href={recipe.link} target="_blank" rel="noopener noreferrer">
                레시피 보기
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecipeListPage;
