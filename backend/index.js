// src/index.js

const express = require('express');
const cors = require('cors');
const { startSmtpServer } = require('./src/server.js');

// ------------------- 새로 추가된 부분 시작 -------------------

// 1. 이메일을 저장할 배열 (DB 대신 임시로 사용)
const emails = [];

// 2. Express 앱 생성 및 설정
const app = express();
const PORT = 8080; // API 서버가 사용할 포트

app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 본문 파싱 허용

// 3. API 엔드포인트 생성
// GET /api/emails/test@mydomain.com -> 특정 주소로 온 이메일 목록 반환
app.get('/api/emails/:emailAddress', (req, res) => {
    const { emailAddress } = req.params;

    // 전체 이메일 목록에서 to 주소가 일치하는 것만 필터링
    const filteredEmails = emails.filter(email =>
        email.to.value.some(recipient => recipient.address === emailAddress)
    );

    res.json(filteredEmails);
});

// 4. Express 서버 실행
app.listen(PORT, () => {
    console.log(`🚀 API 서버가 ${PORT}번 포트에서 실행 중입니다...`);
});

// ------------------- 새로 추가된 부분 끝 -------------------


// 기존 SMTP 서버 실행 (emails 배열을 넘겨줌)
startSmtpServer(emails);