import apiClient from "../api/apiClient";

export async function fetchWithAutoRefresh(url, options = {}) {
  const method = options.method || "GET";

  const config = {
    url,
    method,
    headers: options.headers,
    withCredentials: true,
  };

  // POST, PUT, PATCH는 body → data
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    config.data = options.body;
  }

  try {
    return await apiClient(config);
  } catch (err) {
    if (err.response?.status === 401) {
      try {
        const refreshRes = await apiClient.post("/auth/refresh-token", null, {
          withCredentials: true,
        });

        if (refreshRes.status === 200) {
          return await apiClient(config); // retry
        }
      } catch {
        throw new Error("세션 만료. 다시 로그인해주세요.");
      }
    }

    throw err;
  }
}
