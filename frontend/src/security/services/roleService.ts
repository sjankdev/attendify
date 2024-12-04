import axios from 'axios';

const API_URL = 'https://attendify-backend-el2r.onrender.com/event-participant/api/auth/roles';

export const fetchRoles = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Failed to load roles');
  }
};