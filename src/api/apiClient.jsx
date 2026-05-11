import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.spahic.dev/api",
});

// Dodaj Bearer token direktno
apiClient.interceptors.request.use((config) => {
  const token = "14|D1tWEjkP5NuTwqoxuAEWdFMqexgnjQ3H0rIFSISs2b16d14f"; // tvoj token
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Globalni error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized, redirecting...");
    }
    if (error.response?.status === 500) {
      console.error("Server error");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
