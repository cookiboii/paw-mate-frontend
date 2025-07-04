import axios from 'axios';

export const loginUser = async ({ email, password }) => {
  const response = await axios.post('/adoptmate/login', {
    email,
    password,
    
  });

  return response.data; 
  // JWT 포함 응답

  
};

