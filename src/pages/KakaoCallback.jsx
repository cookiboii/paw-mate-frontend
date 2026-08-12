import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axiosInstance';
import Spinner from '../components/Spinner';

const KakaoCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [statusMsg, setStatusMsg] = useState('카카오 로그인 처리 중입니다...');

  useEffect(() => {
    const processKakaoAuth = async () => {
      const code = searchParams.get('code');
      const token = searchParams.get('token');
      const role = searchParams.get('role') || 'USER';
      const email = searchParams.get('email') || searchParams.get('id');
      const name = searchParams.get('name');
      const error = searchParams.get('error');

      if (error) {
        setStatusMsg('카카오 로그인 인증이 취소되었거나 오류가 발생했습니다.');
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            navigate('/login', { replace: true });
          }
        }, 2000);
        return;
      }

      // Case 1: Backend redirected to callback with token already
      if (token) {
        const userInfo = { email, role, name, provider: 'KAKAO' };
        
        if (window.opener) {
          window.opener.postMessage(
            { type: 'OAUTH_SUCCESS', token, role, email, name, provider: 'KAKAO' },
            '*'
          );
          window.close();
          return;
        }

        login(token, userInfo);
        alert('카카오 로그인 성공!');
        navigate('/', { replace: true });
        return;
      }

      // Case 2: Code parameter present, exchange code with backend GET /adoptmate/kakao?code={code}
      if (code) {
        try {
          const response = await axios.get(`/adoptmate/kakao?code=${encodeURIComponent(code)}`);
          
          let resData = response.data;
          // Handle string response (e.g. HTML or stringified JSON)
          if (typeof resData === 'string') {
            try {
              resData = JSON.parse(resData);
            } catch {
              // HTML string response returned from backend
              // The backend HTML script may execute window.opener.postMessage itself
              return;
            }
          }

          const jwtToken =
            resData?.token ||
            resData?.result?.token ||
            resData?.data?.token;

          const userRole =
            resData?.role ||
            resData?.result?.role ||
            resData?.data?.role ||
            'USER';

          const userEmail =
            resData?.email ||
            resData?.result?.email ||
            resData?.data?.email ||
            resData?.id;

          const userName =
            resData?.name ||
            resData?.result?.name ||
            resData?.data?.name;

          if (jwtToken) {
            const userInfo = { email: userEmail, role: userRole, name: userName, provider: 'KAKAO' };

            if (window.opener) {
              window.opener.postMessage(
                { type: 'OAUTH_SUCCESS', token: jwtToken, role: userRole, email: userEmail, name: userName, provider: 'KAKAO' },
                '*'
              );
              window.close();
              return;
            }

            login(jwtToken, userInfo);
            alert('카카오 로그인 성공!');
            navigate('/', { replace: true });
          } else {
            setStatusMsg('로그인 토큰을 받지 못했습니다.');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
          }
        } catch (err) {
          console.error('Kakao auth error:', err);
          setStatusMsg('카카오 로그인 연동 실패. 다시 시도해 주세요.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      } else {
        setStatusMsg('인증 코드가 없습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    processKakaoAuth();
  }, [searchParams, login, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.5rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <Spinner />
      <h3 style={{ fontSize: '1.25rem', color: '#374151', margin: 0 }}>{statusMsg}</h3>
      <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>잠시만 기다려주세요.</p>
    </div>
  );
};

export default KakaoCallback;
