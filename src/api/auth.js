import axiosInstance from './axiosInstance';

/**
 * 📝 회원가입 API
 * @param {Object} userData - { name, email, password }
 */
export const registerUser = async ({ name, email, password }) => {
  return await axiosInstance.post('/adoptmate/register', {
    name,
    email,
    password,
    role: 'USER',
  });
};

/**
 * 🔑 로그인 API
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async ({ email, password }) => {
  return await axiosInstance.post('/adoptmate/login', {
    email,
    password,
  });
};

/**
 * 👤 내 정보 조회 API
 */
export const fetchMyInfo = async () => {
  const response = await axiosInstance.get('/adoptmate/myInfo');
  return response.data.result || response.data;
};

/**
 * 🔒 비밀번호 변경 API
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  return await axiosInstance.post('/adoptmate/password', {
    currentPassword,
    newPassword,
  });
};

/**
 * 🚪 회원 탈퇴 API
 */
export const deleteAccount = async () => {
  return await axiosInstance.delete('/adoptmate/delete');
};
