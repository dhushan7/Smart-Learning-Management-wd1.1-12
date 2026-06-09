import axios from "axios";

const api = axios.create({

  baseURL: "http://localhost:8086",

});

// 🔥 Auto attach token to every request

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token && token !== "null") {

    config.headers.Authorization = `Bearer ${token}`;

  } else {

    console.warn("⚠️ No valid token found");

  }

  return config;

});

export default api;