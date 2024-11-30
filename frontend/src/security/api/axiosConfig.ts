import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://attendify-backend-el2r.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      window.location.href = "/unauthorized";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
