import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UnauthorizedInterceptor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          navigate("/unauthorized");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return null;
};

export default UnauthorizedInterceptor;
