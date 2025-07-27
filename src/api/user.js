// src/api/user.js
import axios from "axios";

const BASE_URL = "http://localhost:8000/adoptmate"; // 주소는 환경에 따라 조정


// 회원가입
export const registerUser = async ({ name, email, password }) => {
  return await axios.post(`${BASE_URL}/register`, {
    name: name,
    email,
    password,

  });
};

// 로그인
export const loginUser = async ({ email, password }) => {
  return await axios.post(`${BASE_URL}/login`, {
    email,
    password,
  });
};

