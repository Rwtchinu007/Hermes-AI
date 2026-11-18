import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:3000"
    : window.location.origin,
  withCredentials: true, // Allow sending cookies with requests
});

export async function register({ email, password, username }) {
  const response = await api.post("/api/auth/register", {
    email,
    password,
    username,
  });
  return response.data;
}

export async function login({ email, password, remember }) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
    remember,
  });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");
  return response.data;
}

export async function logout() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

export async function getGoogleConfig() {
  const response = await api.get("/api/auth/google/config");
  return response.data;
}

export async function googleLogin({ credential, code, remember }) {
  const response = await api.post("/api/auth/google", {
    credential,
    code,
    remember,
  });
  return response.data;
}
