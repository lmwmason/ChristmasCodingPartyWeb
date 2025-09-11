import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ProblemPage() {
    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [error, setError] = useState(null);
    const [language, setLanguage] = useState("cpp");
    const [testCases, setTestCases] = useState(`[
    { "input": "1 2", "output": "3" },
    { "input": "10 20", "output": "30" }
]`);
    const [testResults, setTestResults] = useState([]);

    const userId = "user123";
    const problemId = "4687";

    const problemStatement = `
# A + B
두 정수 A와 B를 입력받아, A+B를 출력하는 프로그램을 작성하시오.

## 입력
첫째 줄에 A와 B가 공백으로 구분되어 주어진다.
- $0 < A, B < 10000$

## 출력
첫째 줄에 A+B를 출력한다.

---

### 예제 입력
\`\`\`
1 2
\`\`\`

### 예제 출력
\`\`\`
3
\`\`\`
`;

    const fetchRecords = async () => {
        try {
            const response = await fetch(`/api/records?problemId=${problemId}&userId=${userId}`);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to fetch records: ${response.status} - ${text}`);
            }
            const data = await response.json();
            setRecords(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setTestResults([]);
        try {
            const response = await fetch("/api/judge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    problemId,
                    language,
                    code,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Failed to submit code: ${response.status} - ${text}`);
            }

            const data = await response.json();
            setResult(data);
            fetchRecords();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setTestLoading(true);
        setError(null);
        setTestResults([]);
        setResult(null);

        try {
            const parsedTestCases = JSON.parse(testCases);

            const testPromises = parsedTestCases.map(async (testCase) => {
                const response = await fetch("/api/run", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        problemId,
                        language,
                        code,
                        input: testCase.input,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to run test case: ${response.status}`);
                }

                const result = await response.json();
                return {
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: result.output,
                    runtime: result.runtime,
                    memory: result.memory,
                    isPassed: result.output.trim() === testCase.output.trim(),
                };
            });

            const results = await Promise.all(testPromises);
            setTestResults(results);
        } catch (err) {
            setError(`테스트 케이스 JSON 형식이 잘못되었습니다: ${err.message}`);
        } finally {
            setTestLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <div style={{ maxWidth: "1200px", width: "100%", display: "flex", gap: "2rem" }}>
                <div style={{ flex: 1, padding: "2rem", border: "1px solid #ddd", borderRadius: "8px", overflowY: "auto", maxHeight: "calc(100vh - 4rem)" }}>
                    <ReactMarkdown>{problemStatement}</ReactMarkdown>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <h2 style={{ margin: 0 }}>코드 작성</h2>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                            >
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <textarea
                            style={{
                                width: "100%",
                                minHeight: "300px",
                                padding: "1rem",
                                fontSize: "0.9rem",
                                fontFamily: "monospace",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                resize: "vertical",
                            }}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="여기에 코드를 작성하세요..."
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            onClick={handleTest}
                            disabled={testLoading}
                            style={{
                                flex: 1,
                                padding: "1rem",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                backgroundColor: testLoading ? "#ccc" : "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: testLoading ? "not-allowed" : "pointer",
                                transition: "background-color 0.3s"
                            }}
                        >
                            {testLoading ? "테스트 중..." : "테스트"}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: "1rem",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                backgroundColor: loading ? "#ccc" : "#007bff",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "background-color 0.3s"
                            }}
                        >
                            {loading ? "채점 중..." : "제출"}
                        </button>
                    </div>

                    {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}

                    {/* 테스트 결과 표시 영역 */}
                    {testResults.length > 0 && (
                        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                            <h3 style={{ marginBottom: "1rem" }}>테스트 결과</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                <tr style={{ borderBottom: "2px solid #ddd" }}>
                                    <th style={{ padding: "0.5rem", textAlign: "left" }}>#</th>
                                    <th style={{ padding: "0.5rem", textAlign: "left" }}>결과</th>
                                    <th style={{ padding: "0.5rem", textAlign: "left" }}>실행 시간</th>
                                    <th style={{ padding: "0.5rem", textAlign: "left" }}>메모리</th>
                                </tr>
                                </thead>
                                <tbody>
                                {testResults.map((test, index) => (
                                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "0.5rem" }}>{index + 1}</td>
                                        <td style={{ padding: "0.5rem", color: test.isPassed ? "#28a745" : "#dc3545" }}>
                                            {test.isPassed ? "정답" : "오답"}
                                        </td>
                                        <td style={{ padding: "0.5rem" }}>{test.runtime} ms</td>
                                        <td style={{ padding: "0.5rem" }}>{test.memory} KB</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: "1rem" }}>
                                <h4 style={{ margin: "0.5rem 0" }}>입력/출력 상세</h4>
                                {testResults.map((test, index) => (
                                    <div key={index} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "4px", backgroundColor: "#fff" }}>
                                        <p style={{ margin: 0, fontSize: "0.9rem" }}>**입력**: {test.input}</p>
                                        <p style={{ margin: 0, fontSize: "0.9rem" }}>**기대 출력**: {test.expectedOutput}</p>
                                        <p style={{ margin: 0, fontSize: "0.9rem", color: test.isPassed ? "#28a745" : "#dc3545" }}>**실제 출력**: {test.actualOutput}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                            <h3 style={{ color: result.isPassed ? "#28a745" : "#dc3545" }}>
                                {result.isPassed ? "✅ Accepted" : "❌ Wrong Answer"}
                            </h3>
                            <ReactMarkdown>{result.feedback}</ReactMarkdown>
                        </div>
                    )}

                    <div style={{ marginTop: "2rem" }}>
                        <h2 style={{ marginBottom: "1rem" }}>제출 기록</h2>
                        <ul style={{ listStyleType: "none", padding: "0" }}>
                            {records.length > 0 ? (
                                records.map((record, index) => (
                                    <li key={index} style={{
                                        padding: "0.8rem",
                                        borderBottom: "1px solid #eee",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white"
                                    }}>
                                        <span style={{ fontWeight: "bold", color: record.isPassed ? "#28a745" : "#dc3545" }}>
                                            {record.isPassed ? "Accepted" : "Wrong Answer"}
                                        </span>
                                        <span style={{ fontSize: "0.9rem", color: "#888" }}>{record.timestamp}</span>
                                    </li>
                                ))
                            ) : (
                                <p style={{ textAlign: "center", color: "#888" }}>아직 제출 기록이 없습니다.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}