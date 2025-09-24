// src/server.js

const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

// emails 배열을 파라미터로 받도록 수정합니다.
const startSmtpServer = (emails) => {
    const server = new SMTPServer({
        secure: false,
        authOptional: true,
        onData(stream, session, callback) {
            simpleParser(stream, {}, (err, parsed) => {
                if (err) {
                    console.error("이메일 파싱 오류:", err);
                } else {
                    console.log('✅ 이메일 수신 및 저장 성공:', parsed.subject);

                    // 새로 추가된 부분: ID와 수신 날짜를 추가해서 emails 배열에 저장
                    const newEmail = {
                        id: Date.now(), // 간단한 고유 ID 생성
                        date: new Date(),
                        ...parsed,
                    };
                    emails.unshift(newEmail); // 배열의 맨 앞에 추가해서 최신 메일이 위로 오게 함
                }
            });
            stream.on('end', callback);
        },
    });

    server.on('error', err => {
        console.log('SMTP 서버 에러:', err.message);
    });

    server.listen(25, () => {
        console.log('🚀 SMTP 서버가 25번 포트에서 실행 중입니다...');
    });
};

module.exports = { startSmtpServer };