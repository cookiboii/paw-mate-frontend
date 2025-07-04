// src/api/animal.js
import axios from 'axios';

export const registerAnimal = async (animalData) => {
  const token = localStorage.getItem('token');
  return axios.post('/adoptmate/animal', animalData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
