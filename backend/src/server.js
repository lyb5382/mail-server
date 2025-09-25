// src/server.js

const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

// emails 배열을 파라미터로 받도록 수정합니다.
const startSmtpServer = (emails, io) => {
    const server = new SMTPServer({
        // ... (secure, authOptional 등은 동일)
        onData(stream, session, callback) {
            simpleParser(stream, {}, (err, parsed) => {
                if (err) {
                    // ...
                } else {
                    // ... (newEmail 객체 만드는 부분은 동일)
                    emails.unshift(newEmail);

                    // ✨ "new_mail" 이라는 이름으로 모든 클라이언트에게 새 메일 정보를 방송!
                    io.emit('new_mail', newEmail);
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