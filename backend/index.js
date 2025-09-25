// src/index.js

const express = require('express');
const cors = require('cors');
const { startSmtpServer } = require('./ssrc');
const http = require('http'); // http 모듈 추가
const { Server } = require("socket.io"); // socket.io 추가

const emails = [];
const app = express();
const PORT = 8080;

// ✨ Express 앱을 http 서버에 연결
const server = http.createServer(app);
// ✨ http 서버에 Socket.IO 서버를 연결
const io = new Server(server, {
    cors: {
        origin: "*", // 모든 출처 허용 (개발용)
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.get('/api/emails/:emailAddress', (req, res) => {
    const { emailAddress } = req.params;
    const filteredEmails = emails.filter(email =>
        email.to.value.some(recipient => recipient.address === emailAddress)
    );
    res.json(filteredEmails);
});

// ✨ io.on() 으로 연결 리스너 설정
io.on('connection', (socket) => {
    console.log('🔗 클라이언트가 접속했습니다:', socket.id);

    socket.on('disconnect', () => {
        console.log('🔌 클라이언트 접속이 해제되었습니다:', socket.id);
    });
});

// ✨ app.listen 대신 server.listen 사용
server.listen(PORT, () => {
    console.log(`🚀 API 서버가 ${PORT}번 포트에서 실행 중입니다...`);
});

// ✨ SMTP 서버에 io 객체를 넘겨줌
startSmtpServer(emails, io);