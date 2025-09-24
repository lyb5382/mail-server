// src/server.js

const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

// SMTP 서버를 시작하는 함수를 정의합니다.
const startSmtpServer = () => {
    const server = new SMTPServer({
        secure: false,
        authOptional: true,
        onData(stream, session, callback) {
            console.log('📬 새로운 메일 수신 시작!');
            simpleParser(stream, {}, (err, parsed) => {
                if (err) {
                    console.error("이메일 파싱 오류:", err);
                } else {
                    console.log("======================================");
                    console.log("  보낸 사람: ", parsed.from.text);
                    console.log("  받는 사람: ", parsed.to.text);
                    console.log("  제목: ", parsed.subject);
                    console.log("======================================");
                }
            });
            stream.on('end', callback);
        },
    });

    server.on('error', err => {
        console.log('서버 에러 발생:', err.message);
    });

    server.listen(25, () => {
        console.log('🚀 SMTP 서버가 25번 포트에서 실행 중입니다...');
    });
};

// 다른 파일에서 이 함수를 가져다 쓸 수 있도록 내보냅니다.
module.exports = { startSmtpServer };