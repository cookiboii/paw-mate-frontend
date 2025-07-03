import axios from 'axios';

export const loginUser = async ({ email, password }) => {
  const response = await axios.post('/api/login', {
    email,
    password,
  });
  return response.data.data; // JWT 포함 응답
};
