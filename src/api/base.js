export const getBaseApi = () => {
    // return window._env_?.BASE_API || "http://localhost:8000/";
    return "http://localhost:8000/api" // 로컬용
};

export const getAiApi = () => {
    // return window._env_?.AI_API || "http://localhost:8001/";
    return "http://localhost:8001/ai" //로컬용
};