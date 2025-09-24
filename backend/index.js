// src/index.js

// server.js 파일에서 startSmtpServer 함수를 불러옵니다.
const { startSmtpServer } = require('./src/server.js');

console.log('🚀 애플리케이션을 시작합니다...');

// SMTP 서버를 시작합니다.
startSmtpServer();