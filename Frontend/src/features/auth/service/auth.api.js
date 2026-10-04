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

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/get-me");
  return response.data;
}
