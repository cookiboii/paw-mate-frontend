// src/api/user.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://192.168.219.104:8000";
const BASE_URL = `${API_BASE}/adoptmate`; // 주소는 환경에 따라 조정


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

