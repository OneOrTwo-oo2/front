// 개발 환경에서는 localhost 사용, 프로덕션에서는 환경변수 사용
const isDevelopment = process.env.NODE_ENV === 'development';

export const BASE_API = isDevelopment 
  ? (process.env.REACT_APP_BASE_API || "http://localhost:8000")
  : process.env.REACT_APP_BASE_API;

export const AI_API = isDevelopment 
  ? (process.env.REACT_APP_AI_API || "http://localhost:8001")
  : process.env.REACT_APP_AI_API;