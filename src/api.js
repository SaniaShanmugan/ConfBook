const BASE_URL = import.meta.env.VITE_API_URL;

export const getToken = () =>
  localStorage.getItem("token");

export const getUser = () =>
  JSON.parse(
    localStorage.getItem("user") || "null"
  );

export const setToken = (token) =>
  localStorage.setItem("token", token);

export const setUserLocal = (user) =>
  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

export const clearAuth = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

};

export const api = async (
  endpoint,
  method = "GET",
  body = null
) => {

  try {

    const headers = {
      "Content-Type": "application/json",
    };

    const token = getToken();

    if (token) {
      headers["Authorization"] =
        `Bearer ${token}`;
    }

    const res = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        method,
        headers,
        body: body
          ? JSON.stringify(body)
          : null,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data.error || "Something went wrong"
      };
    }

    return data;

  } catch (err) {

    console.error("API Error:", err);

    return {
      error:
        "Server unavailable. Please try again.",
    };
  }
};