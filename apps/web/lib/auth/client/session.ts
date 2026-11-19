import { API_BASE } from "@/lib/http/config";

export const setToken = (token: string) => {
  if(typeof window !== 'undefined') {
    localStorage.setItem('user_token', token);
    window.dispatchEvent(new Event('auth-change'));
  }
};

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("user_token");
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const payload = JSON.parse(jsonPayload);
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          localStorage.removeItem("user_token");
          window.dispatchEvent(new Event("auth-change"));
          return null;
        }
      }
    } catch {
      // In case of non-JWT token, fallback to returning token directly
    }
    return token;
  }
  return null;
};

export const removeToken = () => {
  if(typeof window !== 'undefined') {
    localStorage.removeItem('user_token');
    window.dispatchEvent(new Event('auth-change'));
  }
};

export const fetchMe = async () => {
  const token = getToken();
  if(!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if(!res.ok) {
      if(res.status === 401 || res.status === 403) removeToken();
      return null;
    }
    return await res.json();
  } catch(error) {
    return null;
  }
};
