import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import logo from './logo.svg'; 
import './App.css';

export default function App() {
  const [value, setValue] = useState<string>('');
  const [hash, setHash] = useState<string>(window.location.hash);

  const onChange_ID = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value_id);
    console.log(e.target.value_id);
  };

  const onChange_PassWord = (d: ChangeEvent<HTMLInputElement>) => {
    setValue(d.target.value_pw);
    console.log(d.target.value_pw);
  };

  useEffect(() => {
    const handleHashChange = () => {
      console.log(window.location.hash);
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

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
        <img src={logo} className="App-logo" alt="logo" />
        <p>크리스마스 코딩 파티</p>
        <input
          type="ID"
          placeholder="ID"
          value_id={value}
          onChange={onChange_ID}
        />
        <input
          type="PassWord"
          placeholder="PassWord"
          value_pw={value}
          onChange={onChange_PassWord}
        />
        {hash === '' && <div>Choose a language!</div>}
        {hash === '#C' && <div>{value} for C</div>}
        {hash === '#cpp' && <div>{value} for c++</div>}
        {hash === '#Java' && <div>{value} for java</div>}
        {hash === '#Python' && <div>{value} for python</div>}
        {hash === '#CS' && <div>{value} for c#</div>}
        {hash === '#Js' && <div>{value} for Javascript</div>}
        {hash === '#Dart' && <div>{value} for dart</div>}
      </header>
      <div className="buttom-word">
        <a href="https://github.com/lmwmason">@happy coding</a>
        <p></p>
        <a href="mailmwmason@naver.com">문의 : lmwmason@naver.com</a>
      </div>
    </div>
  );
}
