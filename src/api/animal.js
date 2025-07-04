// src/api/animal.js
import axiosInstance from './axiosInstance';

export const registerAnimal = async (animalData) => {
  return await axiosInstance.post('/animals/register', animalData);
};

