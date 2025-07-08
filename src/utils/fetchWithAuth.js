// refreh 토큰을 불러와 자동갱신 시켜주는 함수
// 로그인이 필요해서 사용자 인증이 필요할 때 사용해야함!
export async function fetchWithAutoRefresh(url, options = {}) {
  const res = await fetch(url, { ...options, credentials: "include" });

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // ✅ access_token 갱신 성공 → 재요청
      return fetch(url, { ...options, credentials: "include" });
    } else {
      // ✅ 갱신 실패 → 세션 만료 처리
      throw new Error("세션 만료. 다시 로그인해주세요.");
    }
  }

  return res;
}
