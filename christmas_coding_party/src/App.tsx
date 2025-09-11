import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import logo from './logo.svg'; 
import './App.css';
import ProblemPage from './pages/problemPage.tsx';

export default function App() {
  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hash, setHash] = useState<string>(window.location.hash);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const login_val: Record<string, string> = {
    '1101': '0000',
    '1102': '0000',
  };

  const onChange_ID = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const onChange_PassWord = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onLogin = () => {
    console.log("ID:", id);
    console.log("Password:", password);
    if (login_val[id] === password) {
      alert("Login Success!");
      setIsLogin(true);
    }
    else {
      alert("Login Failed! Please check your ID and Password.");
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const renderContent = () => {
    switch (hash) {
      case '#problem':
        return <ProblemPage />;
      case '#score_me':
        return <div>채점 상황 페이지입니다.</div>;
      case '#leaderboard':
        return <div>리더보드 페이지입니다.</div>;
      case '#Mypage':
        return <div>내 정보 페이지입니다.</div>;
      default:
        return (
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <p>크리스마스 코딩 파티</p>
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="ID"
                  value={id}
                  onChange={onChange_ID}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={onChange_PassWord}
                />
                <button className="login-button" onClick={onLogin}>로그인</button>
              </>
            )}
            {isLogin && <div>환영합니다, {id}님!</div>}
          </>
        );
    }
  };

  return (
    <div className="App">
      <div className="menu-container">
        <div className="menu-title">
          <a href="">Christmas Coding Party</a>
        </div>
        <div className="menu-list">
          {[
            { label: "문제", hash: "#problem" },
            { label: "채점 상황", hash: "#score_me" },
            { label: "리더보드", hash: "#leaderboard" },
            { label: "내 정보", hash: "#Mypage" },
          ].map((item) => (
            <div
              key={item.hash}
              className={`menu-item ${hash === item.hash ? "active" : ""}`}
            >
              <a href={item.hash}>{item.label}</a>
            </div>
          ))}
        </div>
      </div>

      <header className="App-header">
        {renderContent()}
      </header>
      
      <div className="buttom-word">
        <a href="https://github.com/lmwmason">@happy coding</a>
        <p></p>
        <a href="lmwmason@naver.com">문의 : lmwmason@naver.com</a>
      </div>
    </div>
  );
}