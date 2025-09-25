const fs = require('fs');
const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');

const startSmtpServer = (emails, io) => {
    const server = new SMTPServer({
        // 보안 연결(TLS)을 사용하도록 설정합니다.
        secure: true,
        // Certbot으로 발급받은 SSL 인증서 파일 경로를 지정합니다.
        key: fs.readFileSync('/etc/letsencrypt/live/lyb2027.duckdns.org/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/lyb2027.duckdns.org/fullchain.pem'),
        ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
        // 로그인 없이 모든 메일을 받도록 설정합니다.
        authOptional: true,

        // 이메일 수신 시 실행될 함수입니다.
        onData(stream, session, callback) {
            simpleParser(stream, {}, (err, parsed) => {
                if (err) {
                    console.error("이메일 파싱 오류:", err);
                } else {
                    console.log('✅ (보안연결) 이메일 수신 및 저장 성공:', parsed.subject);

                    const newEmail = {
                        id: Date.now(),
                        date: new Date(),
                        ...parsed,
                    };

                    // 이메일 배열의 맨 앞에 추가합니다.
                    emails.unshift(newEmail);

                    // Socket.IO를 통해 모든 클라이언트에게 새 메일 정보를 방송합니다.
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
        console.log('🚀 SMTP 서버가 25번 포트에서 (보안 연결로) 실행 중입니다...');
    });
};

module.exports = { startSmtpServer };