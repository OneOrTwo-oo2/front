export const getBaseApi = () => {
    return window._env_?.BASE_API || "http://localhost:8000/api";
};

export const getAiApi = () => {
    return window._env_?.AI_API || "http://localhost:8001/ai";
};