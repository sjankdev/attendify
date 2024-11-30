import axiosInstance from "../../security/api/axiosConfig";

const API_URL = 'https://attendify-backend-el2r.onrender.com/api/auth/roles';

export const fetchRoles = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to load roles');
  }
};
