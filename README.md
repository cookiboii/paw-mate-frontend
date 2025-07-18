# 프론트 API연동
| 파일명                            | 설명                | 연동 API                       | 메서드         | 주요 훅 / 상태 관리              | 권한  |
| ------------------------------ | ----------------- | ---------------------------- | ----------- | ------------------------- | --- |
| **AdminAdoptionsPage.jsx**     | 입양 신청 전체 조회 (관리자) | `/adoptmate/adoptions`       | GET         | `useEffect`, `useState`   | 관리자 |
| **AdminAnimalsPage.jsx**       | 동물 리스트 및 관리 (관리자) | `/adoptmate/animals`         | GET         | `useEffect`, `useState`   | 관리자 |
| **AdminLayout.jsx**            | 관리자 전용 레이아웃 컴포넌트  | -                            | -           | React Router              | 관리자 |
| **AdminUsersPage.jsx**         | 회원 리스트 조회 (관리자)   | `/adoptmate/users` *(추정)*    | GET         | `useEffect`, `useState`   | 관리자 |
| **AnimalStatusEditPage.jsx**   | 동물 상태 수정 (관리자)    | `/adoptmate/animals/{id}`    | PUT         | `useEffect`, `useState`   | 관리자 |
| **AdoptionForm.jsx**           | 입양 신청 폼           | `/adoptmate/adoptions`       | POST        | `useState`, `useNavigate` | 일반  |
| **AdoptionReview\.jsx**        | 후기 작성             | `/adoptmate/posts`           | POST        | `useState`, `useEffect`   | 일반  |
| **AdoptionReviewDetail.jsx**   | 후기 상세 조회 및 삭제     | `/adoptmate/posts/{id}`      | GET, DELETE | `useParams`, `useState`   | 일반  |
| **AdoptionReviewEdit.jsx**     | 후기 수정             | `/adoptmate/posts/{id}`      | PUT         | `useParams`, `useState`   | 일반  |
| **AdoptionReviewListPage.jsx** | 후기 전체 목록 조회       | `/adoptmate/posts`           | GET         | `useEffect`, `useState`   | 일반  |
| **AnimalDetail.jsx**           | 유기 동물 상세 정보       | `/adoptmate/animals/{id}`    | GET         | `useParams`, `useState`   | 일반  |
| **AnimalList.jsx**             | 유기 동물 전체 목록       | `/adoptmate/animals`         | GET         | `useEffect`, `useState`   | 일반  |
| **ForgotPassword.jsx**         | 비밀번호 재설정 메일 요청    | `/adoptmate/password-reset`  | POST        | `useState`, `axios`       | 공개  |
| **HomePage.jsx**               | 메인 홈 페이지          | -                            | -           | -                         | 공개  |
| **Login.jsx**                  | 로그인 페이지           | `/adoptmate/login`           | POST        | `useState`, `useContext`  | 공개  |
| **MyPage.jsx**                 | 마이페이지 - 회원 정보 조회  | `/adoptmate/myInfo`          | GET         | `useEffect`, `useContext` | 일반  |
| **Register.jsx**               | 회원가입              | `/adoptmate/register` *(추정)* | POST        | `useState`, `axios`       | 공개  |



#프론트 화면
비로그인 헤더
<img width="659" height="37" alt="image" src="https://github.com/user-attachments/assets/3c1cc7f9-668c-4eae-9b2a-99338120cc1c" />


#일반로그인 헤더<br>
<img width="848" height="60" alt="image" src="https://github.com/user-attachments/assets/c1af9fac-ff0c-4f77-b320-86198c7ee72d" />



#동물 목록 클릭시 화면 <br>
<img width="1448" height="899" alt="image" src="https://github.com/user-attachments/assets/01704715-dce5-4bee-8c29-2cb825d5898b" />
#입양후기<br>
<img width="1603" height="911" alt="image" src="https://github.com/user-attachments/assets/9e397fd4-62dc-4aa1-bf6b-fae936d873bd" />

#마이페이지 <br>
<img width="681" height="762" alt="image" src="https://github.com/user-attachments/assets/361001b4-88d4-4e20-a27e-bafcbabafadf" />

