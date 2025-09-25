import { useState, useEffect } from 'react'; // useEffect 다시 추가
import axios from 'axios';
import DOMPurify from 'dompurify';
import io from 'socket.io-client'; // socket.io-client import
import './App.css';

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function App() {
  const [email, setEmail] = useState('');
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);

  const domain = 'lyb2027.duckdns.org';
  const apiUrl = `http://${domain}:8080`;

  // ✨ Socket.IO 연결 로직
  useEffect(() => {
    // 백엔드 Socket.IO 서버에 접속
    const socket = io(apiUrl);

    // "new_mail" 이벤트를 기다림
    socket.on('new_mail', (newMail) => {
      console.log('새 메일 도착 신호 수신!', newMail);
      // 현재 보고 있는 이메일 주소로 온 메일일 경우에만 목록에 추가
      if (newMail.to.value.some(r => r.address === email)) {
        setMails(prevMails => [newMail, ...prevMails]);
      }
    });

    // 컴포넌트가 사라질 때 소켓 연결을 끊어줌 (메모리 누수 방지)
    return () => {
      socket.disconnect();
    };
  }, [email]); // email 주소가 바뀔 때마다 리스너를 새로 설정

  const generateNewEmail = () => {
    setSelectedMail(null);
    const randomPart = generateRandomString(7);
    const newEmail = `${randomPart}@${domain}`;
    setEmail(newEmail);
    // ✨ 새 주소를 만들 때 메일 목록은 비워주기만 합니다. (자동 호출 삭제)
    setMails([]);
  };

  // ✨ fetchMails 함수는 그대로 유지됩니다.
  const fetchMails = async (emailAddress) => {
    // 이메일 주소가 없으면 함수를 실행하지 않습니다.
    if (!emailAddress) return;

    try {
      const response = await axios.get(`${apiUrl}/api/emails/${emailAddress}`);
      setMails(response.data);
    } catch (error) {
      console.error("메일 목록을 가져오는 중 오류 발생:", error);
      setMails([]);
    }
  };

  // ✨ 이메일 본문 HTML을 안전하게 정제하는 함수
  const createMarkup = (html) => {
    return {
      __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>일회용 이메일 주소</h1>
        <div className="email-generator">
          <button onClick={generateNewEmail}>새 주소 생성하기</button>
        </div>

        {email && (
          <>
            <div className="email-display">
              <h2>{email}</h2>
              <button>복사</button>
            </div>
            <div className="mailbox">
              {/* ✨ selectedMail 상태에 따라 다른 내용을 보여줍니다 */}
              {selectedMail ? (
                // 📧 상세 보기 화면
                <div className="mail-view">
                  <button onClick={() => setSelectedMail(null)}>목록으로 돌아가기</button>
                  <div className="mail-header">
                    <p><strong>보낸 사람:</strong> {selectedMail.from.text}</p>
                    <p><strong>제목:</strong> {selectedMail.subject}</p>
                    <p><strong>받은 시간:</strong> {new Date(selectedMail.date).toLocaleString()}</p>
                  </div>
                  {/* HTML 본문을 안전하게 렌더링합니다 */}
                  <div className="mail-body" dangerouslySetInnerHTML={createMarkup(selectedMail.html || selectedMail.textAsHtml)} />
                </div>
              ) : (
                // 📬 메일 목록 화면
                <>
                  <div className="mailbox-header">
                    {/* ✨ '새 메일 확인' 버튼 추가! */}
                    <button onClick={() => fetchMails(email)}>새로고침</button>
                  </div>
                  <h3>받은 메일함 ({mails.length}개)</h3>
                  {mails.length > 0 ? (
                    <ul>
                      {/* 메일 아이템을 클릭하면 setSelectedMail 함수를 호출합니다 */}
                      {mails.map((mail) => (
                        <li key={mail.id} onClick={() => setSelectedMail(mail)}>
                          <p><strong>보낸 사람:</strong> {mail.from.text}</p>
                          <p><strong>제목:</strong> {mail.subject}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>받은 메일이 없습니다.</p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;