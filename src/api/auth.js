import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://port-0-paw-mate-backend-msiq1pqe2aa00cb9.sel3.cloudtype.app';

export const loginUser = async ({ email, password }) => {
  const response = await axios.post(`${API_BASE}/adoptmate/login`, {
    email,
    password,
  });

  return response.data;
};

