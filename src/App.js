import React, { useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ingredients })
      });

      if (!res.ok) {
        throw new Error("서버 응답 오류");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (error) {
      console.error("요청 실패:", error);
      setResult("요청 중 오류가 발생했습니다. 서버 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>🥦 식재료 기반 요리 추천 시스템</h1>
      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="예: 계란, 양파, 당근"
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '로딩 중...' : '레시피 추천받기'}
      </button>
      <div className="result">
        {result && <pre>{result}</pre>}
      </div>
    </div>
  );
}

export default App;