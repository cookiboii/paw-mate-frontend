# 🚀 PawMate k6 동시성 & 부하 테스트 가이드

## 1. k6 설치 (Windows)
Windows 터미널(PowerShell)에서 다음 명령어 중 하나로 설치합니다:

```powershell
# winget 사용 시
winget install k6 --source winget

# 또는 Chocolatey 사용 시
choco install k6
```

---

## 2. 동시성 & 부하 테스트 실행

### 기본 실행
```powershell
k6 run k6/concurrency-test.js
```

### 📊 실시간 웹 대시보드와 함께 실행 (강력 추천!)
실행 시 로컬 브라우저(`http://localhost:5665`)에서 실시간 차트와 지표를 확인할 수 있습니다:

```powershell
$env:K6_WEB_DASHBOARD=1; k6 run k6/concurrency-test.js
```

---

## 3. 테스트 시나리오 커스텀

- **가상 사용자 수(VUs) 조절**: `concurrency-test.js` 내의 `target: 50` 숫자를 100, 200 등으로 변경
- **대상 백엔드 주소 변경**:
```powershell
k6 run -e API_BASE_URL=http://localhost:8080 k6/concurrency-test.js
```
