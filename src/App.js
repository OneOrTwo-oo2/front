import React, { useRef, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';

// page import
import PhotoSearchPage from './pages/PhotoSearchPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import MyInfo from './pages/MyinfoPage';
import Home from './pages/Home';
import MainPage from './pages/MainPage'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/ingredient-search" element={<IngredientSearchPage />} />
        <Route path="/photo-search" element={<PhotoSearchPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myinfo" element={<MyInfo />} />
        {/* 로그인/회원가입 라우트 추가 예정 시 */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
