export const getBaseApi = () => {
    return window._env_?.API_BASE_URL || "http://localhost:8000";
};

export const getAiApi = () => {
    return window._env_?.AI_API_URL || "http://localhost:8001";
};