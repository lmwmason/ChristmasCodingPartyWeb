import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Firebase variables (provided by the environment)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Problem data in Markdown format
const problemMarkdown = `
### 문제의 배경

어리에 목이 있는 잠박이 뾰루기 새는 동지를 스스로 짓지 않는다.
대신, 빈 동지가 있는 나무를 발견하면 새로운 동지를 찾아 이동한다.

잠박이 뾰루기의 동지 찾기는 가장 왼쪽의 1번 동지부터 시작되며, 자신의 빈 동지를 찾을 때까지 1-3 과정을 반복한다.

1. 빈 동지를 찾을 때까지 우측으로 이동한다.
2. 빈 동지를 찾으면 그 동지를 차지하고 끝낸다.
3. 도착한 동지에 새끼가 있다면, 그 새끼의 마리 위 값의 개수를 서로 비교하여 이동한다.
   - 자신보다 값의 수가 더 많으면, (현재 동지*2)번째 동지로 이동한다.
   - 자신과 값의 수가 같거나 적다면, (현재 동지*2+1)번째 동지로 이동한다.

여기 마리의 뾰루기가 줄을 선 순서대로 동지를 찾는다.

### 문제/도전

여기 마리의 뾰루기가 줄을 선 순서대로 동지를 찾아요
`;

// Helper function to simulate a backend API call
const mockBackendApi = (userId, problemId, code, language, type, input = '') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (type === 'test') {
        let simulatedOutput = '';
        simulatedOutput = `입력값: ${input}\n처리된 결과는 다음과 같습니다.\n${code.split('').reverse().join('')}`;
        
        const result = {
          userId,
          problemId,
          language,
          code,
          submissionType: type,
          timestamp: new Date(),
          message: `실행 결과:\n${simulatedOutput}`,
        };
        resolve(result);
      } else { // 'submit' type
        const isCorrect = code.includes('Hello, World!');
        let score = 0;
        let status = '오답';
        if (isCorrect) {
          score = 100;
          status = '정답';
        }

        const result = {
          userId,
          problemId,
          language,
          code,
          score,
          status,
          submissionType: type,
          timestamp: new Date(),
          message: `제출 결과: ${status} (점수: ${score})`,
        };
        resolve(result);
      }
    }, 1500); // Simulate network delay
  });
};

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [code, setCode] = useState("print('Hello, World!')");
  const [language, setLanguage] = useState('python');
  const [fileName, setFileName] = useState('Main.py');
  const [submissions, setSubmissions] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [problemId, setProblemId] = useState('1552');
  const [autoCompleteVisible, setAutoCompleteVisible] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showInputModal, setShowInputModal] = useState(false);
  const [testInput, setTestInput] = useState('');

  const contentRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize Firebase and Auth
  useEffect(() => {
    try {
      // Firebase 초기화 로직을 주석 처리합니다.
      /*
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      setDb(dbInstance);
      setAuth(authInstance);
      */
      
      // 사용자 ID를 고정된 값으로 설정하여 Firebase 없이도 작동하도록 합니다.
      setUserId('anonymous-user-1234');
      setIsAuthReady(true);

      // Firebase 인증 로직을 주석 처리합니다.
      /*
      const handleAuthStateChange = async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          const anonymousUser = await signInAnonymously(authInstance);
          setUserId(anonymousUser.user.uid);
        }
        setIsAuthReady(true);
      };

      if (initialAuthToken) {
        signInWithCustomToken(authInstance, initialAuthToken)
          .then((userCredential) => {
            handleAuthStateChange(userCredential.user);
          })
          .catch((error) => {
            console.error("Custom token sign-in failed:", error);
            signInAnonymously(authInstance).then((userCredential) => {
              handleAuthStateChange(userCredential.user);
            });
          });
      } else {
        handleAuthStateChange(authInstance.currentUser);
      }
      */
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  // Set up Firestore listener for submissions
  useEffect(() => {
    // Firebase 관련 코드를 주석 처리하여 Firestore 리스너를 비활성화합니다.
    /*
    if (!isAuthReady || !db || !userId) return;
  
    const submissionsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/submissions`);
    const q = query(submissionsCollectionRef, orderBy('timestamp', 'desc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setSubmissions(submissionsList);
    }, (error) => {
      console.error("Error fetching submissions:", error);
    });
  
    return () => unsubscribe();
    */
  }, [isAuthReady, db, userId]);

  const handleSubmit = async (type, input = '') => {
    // Firebase 관련 db, userId 사용을 제거하고 mockBackendApi만 호출하도록 수정합니다.
    if (isLoading) return;

    setIsLoading(true);
    setSubmissionStatus({ status: '로딩', message: `${type === 'submit' ? '제출' : '테스트'} 중입니다...` });

    try {
      // userId를 고정된 값으로 사용
      const result = await mockBackendApi('anonymous-user-1234', problemId, code, language, type, input);
      
      // Firestore에 기록을 추가하는 로직을 주석 처리합니다.
      /*
      const submissionsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/submissions`);
      await addDoc(submissionsCollectionRef, {
        ...result,
        timestamp: serverTimestamp(),
      });
      */
      
      // 제출 기록을 상태에 직접 추가합니다.
      setSubmissions(prevSubmissions => [
        { ...result, timestamp: new Date(), id: Date.now().toString() },
        ...prevSubmissions
      ]);
      
      setSubmissionStatus({
        status: result.status,
        message: result.message
      });

    } catch (error) {
      setSubmissionStatus({ status: '오류', message: `오류가 발생했습니다: ${error.message}` });
      console.error("Submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestClick = () => {
    setShowInputModal(true);
  };

  const runTestWithInput = () => {
    setShowInputModal(false);
    handleSubmit('test', testInput);
  };

  const getFileExtension = (lang) => {
    switch (lang) {
      case 'python': return '.py';
      case 'cpp': return '.cpp';
      case 'java': return '.java';
      default: return '.py';
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setFileName(`Main${getFileExtension(newLang)}`);
    // Change initial code based on language
    if (newLang === 'cpp') {
      setCode(`#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`);
    } else if (newLang === 'java') {
      setCode(`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`);
    } else { // python
      setCode("print('Hello, World!')");
    }
  };

  const getLanguageSpecificSnippets = (lang) => {
    const snippets = {
      python: {
        'if': 'if __cursor__:',
        'else': 'else:',
        'for': 'for item in iterable:\n    __cursor__',
        'while': 'while condition:\n    __cursor__',
        'def': 'def function_name(__cursor__):\n    pass',
        'class': 'class ClassName:\n    __cursor__',
        'print': 'print(__cursor__)',
        'import': 'import ',
      },
      cpp: {
        '#include': '#include <iostream>\nusing namespace std;\n\n__cursor__',
        'main': 'int main() {\n    __cursor__\n    return 0;\n}',
        'if': 'if (__cursor__) {\n    \n}',
        'for': 'for (int i = 0; i < 10; ++i) {\n    __cursor__\n}',
        'cout': 'cout << "__cursor__";',
        'cin': 'cin >> __cursor__;',
        'return': 'return 0;',
      },
      java: {
        'class': 'public class ClassName {\n    __cursor__\n}',
        'main': 'public static void main(String[] args) {\n    __cursor__\n}',
        'if': 'if (__cursor__) {\n    \n}',
        'for': 'for (int i = 0; i < 10; i++) {\n    __cursor__\n}',
        'System': 'System.out.println(__cursor__);',
        'import': 'import ',
      },
    };
    return snippets[lang] || {};
  };

  const handleTextareaChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    const position = e.target.selectionStart;
    setCursorPosition(position);

    const textBeforeCursor = newCode.substring(0, position);
    const lastWord = textBeforeCursor.split(/[\s\(\[\{]+/g).pop()?.toLowerCase() || '';
    
    const snippets = getLanguageSpecificSnippets(language);
    const suggestions = Object.keys(snippets).filter(keyword => keyword.startsWith(lastWord));
    
    if (suggestions.length > 0 && lastWord.length > 0) {
      setAutoCompleteSuggestions(suggestions);
      setAutoCompleteVisible(true);
    } else {
      setAutoCompleteVisible(false);
    }
  };

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const newCode = code.substring(0, selectionStart) + '    ' + code.substring(selectionEnd);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 4;
        }
      }, 0);
    }

    // Handle auto-closing pairs
    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
    const openingBrackets = Object.keys(pairs);

    const { selectionStart, selectionEnd } = e.currentTarget;
    
    if (openingBrackets.includes(e.key) && selectionStart === selectionEnd) {
      e.preventDefault();
      const newCode = code.substring(0, selectionStart) + e.key + pairs[e.key] + code.substring(selectionEnd);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 1;
        }
      }, 0);
    }

    // Handle backspace to delete a pair
    if (e.key === 'Backspace' && selectionStart === selectionEnd) {
      const charBefore = code.charAt(selectionStart - 1);
      const charAfter = code.charAt(selectionStart);
      if (pairs[charBefore] && pairs[charBefore] === charAfter) {
        e.preventDefault();
        const newCode = code.substring(0, selectionStart - 1) + code.substring(selectionStart + 1);
        setCode(newCode);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart - 1;
          }
        }, 0);
      }
    }
    
    // Handle selecting autocomplete suggestion with Enter or Tab
    if ((e.key === 'Enter' || e.key === 'Tab') && autoCompleteVisible && autoCompleteSuggestions.length > 0) {
      e.preventDefault();
      const suggestion = autoCompleteSuggestions[0]; 
      insertSuggestion(getLanguageSpecificSnippets(language)[suggestion]);
    }
  };

  const insertSuggestion = (suggestion) => {
    const lastWord = code.substring(0, cursorPosition).split(/[\s\(\[\{]+/g).pop()?.toLowerCase() || '';
    const startOfWord = cursorPosition - lastWord.length;
    
    const newCode = code.substring(0, startOfWord) + suggestion.replace('__cursor__', '') + code.substring(cursorPosition);
    const newCursorPosition = startOfWord + suggestion.indexOf('__cursor__');
    setCode(newCode);
    setAutoCompleteVisible(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursorPosition;
      }
    }, 0);
  };


  const getStatusColor = (status) => {
    if (!status) return 'status-default';
    switch (status) {
      case '정답': return 'status-correct';
      case '오답': return 'status-wrong';
      case '로딩': return 'status-loading';
      default: return 'status-default';
    }
  };

  const sanitizeMarkdown = () => {
    const html = marked(problemMarkdown);
    return DOMPurify.sanitize(html);
  };

  const renderSubmissionHistory = () => {
    return (
      <div className="history-container">
        <h3 className="history-title">제출 기록</h3>
        <ul className="history-list">
          {submissions.length > 0 ? (
            submissions.map((sub, index) => (
              <li key={sub.id} className="history-item">
                <div className="history-header">
                  <span className="history-type">
                    [{sub.submissionType === 'submit' ? '제출' : '테스트'}]
                  </span>
                  <span className="history-timestamp">
                    {sub.timestamp ? sub.timestamp.toLocaleString() : 'Loading...'}
                  </span>
                </div>
                <div className="history-content">
                  {sub.submissionType === 'submit' ? (
                    <>
                      <span className={`history-status ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                      <span className="history-score">
                        {sub.score !== undefined ? `${sub.score}점` : ''}
                      </span>
                    </>
                  ) : (
                    <span className="history-message">{sub.message}</span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <p className="history-empty">아직 제출한 기록이 없습니다.</p>
          )}
        </ul>
      </div>
    );
  };
  

  return (
    <div className="container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #000;
        }
        
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: 'Inter', sans-serif;
          background-color: #1a202c;
          color: #e2e8f0;
        }
        
        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        .problem-panel {
          flex: 3;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          overflow-y: auto;
          background-color: #2d3748;
        }
        
        .problem-status-card {
          background-color: #1a202c;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        
        .problem-header {
          display: flex;
          align-items: center;
          space-x: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .problem-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .problem-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          font-size: 0.875rem;
          color: #a0aec0;
          margin-bottom: 1.5rem;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-value {
          font-weight: bold;
        }
        
        .score-display {
          font-size: 1.875rem;
          font-weight: 800;
          color: #63b3ed;
        }
        
        .status-badge {
          font-weight: bold;
          font-size: 0.75rem;
          color: #f56565;
          background-color: #9b2c2c;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }
        
        .status-badge-correct {
          color: #48bb78;
          background-color: #276749;
        }
        
        .tab-menu {
          display: flex;
          border-bottom: 2px solid #4a5568;
          font-size: 0.875rem;
          font-weight: bold;
        }
        
        .tab-item {
          padding: 0.5rem 1rem;
          cursor: pointer;
          color: #a0aec0;
        }
        
        .tab-item.active {
          color: #63b3ed;
          border-bottom: 2px solid #63b3ed;
        }
        
        .status-message {
          text-align: center;
          font-style: italic;
          margin-top: 1.5rem;
        }
        
        .status-default {
          color: #a0aec0;
        }
        
        .status-correct {
          color: #48bb78;
        }
        
        .status-wrong {
          color: #e53e3e;
        }
        
        .loading-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        
        .loading-image {
          width: 6rem;
          height: 6rem;
          border-radius: 0.5rem;
        }
        
        .history-container {
          margin-top: 1.5rem;
        }
        
        .history-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .history-list {
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 0.5rem;
        }
        
        .history-item {
          padding: 1rem;
          background-color: #2d3748;
          border-radius: 0.5rem;
          white-space: pre-wrap;
        }
        
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .history-type {
          font-weight: bold;
        }
        
        .history-timestamp {
          color: #a0aec0;
        }
        
        .history-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.125rem;
        }
        
        .history-status {
          font-weight: bold;
        }
        
        .history-message {
          color: #a0aec0;
          width: 100%;
        }
        
        .history-score {
          color: #a0aec0;
        }
        
        .history-empty {
          text-align: center;
          font-style: italic;
          color: #a0aec0;
        }
        
        .problem-description {
          padding: 2rem;
          background-color: #1a202c;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
          margin-top: 2rem;
        }
        
        .problem-description h3, .problem-description h4 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .problem-description p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .editor-panel {
          flex: 4;
          display: flex;
          flex-direction: column;
          background-color: #2d3748;
          color: white;
          overflow: hidden;
        }
        
        .editor-tabs {
          display: flex;
          align-items: center;
          background-color: #4a5568;
          font-size: 0.875rem;
        }
        
        .editor-tab {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-right: 1px solid #2d3748;
          cursor: pointer;
          background-color: #1a202c;
          color: white;
        }
        
        .editor-tab svg {
          height: 1rem;
          width: 1rem;
          margin-right: 0.5rem;
        }
        
        .editor-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          position: relative;
        }
        
        .code-textarea {
          flex: 1;
          padding: 1rem;
          background-color: #1a202c;
          color: #a0aec0;
          font-family: monospace;
          font-size: 0.875rem;
          resize: none;
          outline: none;
          border: none;
        }
        
        .autocomplete-list {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background-color: #2d3748;
          border: 1px solid #4a5568;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-height: 10rem;
          overflow-y: auto;
          z-index: 10;
          padding: 0;
          list-style: none;
        }
        
        .autocomplete-item {
          padding: 0.5rem;
          cursor: pointer;
          color: #e2e8f0;
        }
        
        .autocomplete-item:hover {
          background-color: #4a5568;
        }
        
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background-color: #1a202c;
          color: white;
          box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
          border-top: 1px solid #2d3748;
        }
        
        .language-select {
          background-color: #2d3748;
          color: #a0aec0;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          outline: none;
          border: none;
        }
        
        .language-select:focus {
          ring: 2px solid #63b3ed;
        }
        
        .button-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #6b46c1;
          color: white;
          font-weight: bold;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition-property: background-color;
          transition-duration: 0.15s;
          cursor: pointer;
          border: none;
        }
        
        .action-button:hover {
          background-color: #553c9a;
        }
        
        .action-button:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        
        .action-button svg {
          height: 1.25rem;
          width: 1.25rem;
          margin-right: 0.5rem;
        }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(26, 32, 44, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        
        .modal-content {
          background-color: #2d3748;
          padding: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 36rem;
        }
        
        .modal-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .modal-description {
          color: #a0aec0;
          margin-bottom: 1rem;
        }
        
        .modal-textarea {
          width: 100%;
          height: 10rem;
          padding: 1rem;
          background-color: #1a202c;
          color: #a0aec0;
          border-radius: 0.5rem;
          resize: none;
          outline: none;
          border: none;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .modal-button-cancel {
          padding: 0.5rem 1.5rem;
          background-color: #4a5568;
          color: white;
          font-weight: bold;
          border-radius: 0.5rem;
          transition-property: background-color;
          transition-duration: 0.15s;
          border: none;
        }
        
        .modal-button-cancel:hover {
          background-color: #2d3748;
        }
        
        .modal-button-execute {
          padding: 0.5rem 1.5rem;
          background-color: #6b46c1;
          color: white;
          font-weight: bold;
          border-radius: 0.5rem;
          transition-property: background-color;
          transition-duration: 0.15s;
          border: none;
        }
        
        .modal-button-execute:hover {
          background-color: #553c9a;
        }
        
      `}</style>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Left Panel: Problem Description */}
        <div className="problem-panel">
          {/* Problem Status Section */}
          <div className="problem-status-card">
            <div className="problem-header">
              <span style={{color: '#a0aec0', fontWeight: 'bold'}}>#</span>
              <span style={{fontSize: '1.125rem', fontWeight: 'bold'}}>1552</span>
            </div>
            <h2 className="problem-title">뾰루기 새동지</h2>
            
            <div className="problem-info-grid">
              <div className="info-item">
                <span>획득 점수</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span className="score-display">0</span>
                  <span className="status-badge">미제출</span>
                </div>
              </div>
              <div className="info-item">
                <span>실행 시간 제한</span>
                <span className="info-value">1초</span>
              </div>
              <div className="info-item">
                <span>메모리 제한</span>
                <span className="info-value">512MiB</span>
              </div>
            </div>
            
            <div className="tab-menu">
              <div className="tab-item active">
                <span>제출 + 테스트</span>
              </div>
              <div className="tab-item">
                <span>테스트</span>
              </div>
            </div>

            <div className="status-message">
              <p className={getStatusColor(submissionStatus?.status)}>
                {isLoading ? (
                    <div className="loading-animation">
                    <img 
                      src="https://i.namu.wiki/i/fCDzvNXe4SegDQEmBIU8lW-BJYNm9M_JJkW6mlYwrOqNvvM8SuTbW_RoRXk8rg98mjF9yGrxqHz2pxdVpD853g.webp" 
                      alt="로딩 중" 
                      className="loading-image"
                    />
                    <span>{submissionStatus?.message}</span>
                    </div>
                ) : (
                  submissionStatus?.message || '아직 제출한 코드나 실행한 테스트가 없습니다.'
                )}
              </p>
            </div>
            
            {renderSubmissionHistory()}
          </div>
          
          {/* Problem Description using Markdown */}
          <div 
            className="problem-description" 
            dangerouslySetInnerHTML={{ __html: sanitizeMarkdown() }} 
          />
        </div>

        {/* Right Panel: Code Editor */}
        <div className="editor-panel">
          {/* Editor Tabs */}
          <div className="editor-tabs">
            <div className="editor-tab">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>{fileName}</span>
            </div>
          </div>

          {/* Code Editor Content */}
          <div className="editor-content">
            <textarea
              ref={textareaRef}
              className="code-textarea"
              value={code}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              spellCheck="false"
            />
            {autoCompleteVisible && (
              <ul className="autocomplete-list">
                {autoCompleteSuggestions.map((s, index) => (
                  <li 
                    key={index} 
                    className="autocomplete-item"
                    onClick={() => insertSuggestion(getLanguageSpecificSnippets(language)[s])}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Test Input Modal */}
      {showInputModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">테스트 입력</h3>
            <p className="modal-description">코드에 전달할 입력값을 여기에 작성하세요.</p>
            <textarea
              className="modal-textarea"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="예시: 10&#10;20"
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowInputModal(false)}
                className="modal-button-cancel"
              >
                취소
              </button>
              <button
                onClick={runTestWithInput}
                className="modal-button-execute"
              >
                실행
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="footer">
        <div>
          <select 
            className="language-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="button-group">
          <button 
            onClick={handleTestClick}
            disabled={isLoading}
            className="action-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>테스트하기</span>
          </button>
          <button 
            onClick={() => handleSubmit('submit')}
            disabled={isLoading}
            className="action-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>제출</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App; 