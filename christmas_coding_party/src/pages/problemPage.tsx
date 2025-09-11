import React, { useState } from 'react';
import './problemPage.css';
import Problem1 from './problemDetail1.tsx';
import Problem2 from './problemDetail2.tsx';
import Problem3 from './problemDetail3.tsx';
import Problem4 from './problemDetail4.tsx';
import Problem5 from './problemDetail5.tsx';
import Problem6 from './problemDetail6.tsx';
import Problem7 from './problemDetail7.tsx';
import Problem8 from './problemDetail8.tsx';
import Problem9 from './problemDetail9.tsx';
import Problem10 from './problemDetail10.tsx';
import Problem11 from './problemDetail11.tsx';

const getDifficultyClass = (difficulty: string): string => {
    switch (difficulty) {
        case 'LV.1':
        case 'LV.2':
        case 'LV.3':
            return 'difficulty-bronze';
        case 'LV.4':
        case 'LV.5':
        case 'LV.6':
            return 'difficulty-silver';
        case 'LV.7':
        case 'LV.8':
        case 'LV.9':
            return 'difficulty-gold';
        case 'LV.10':
            return 'difficulty-platinum';
        case 'LV.11':
            return 'difficulty-diamond';
        default:
            return '';
    }
};

const getScoreIndicatorColor = (score: number, maxScore: number): string => {
    if (score >= maxScore / 100 * 80) return 'indicator-green';
    if (score >= maxScore / 100 * 60) return 'indicator-blue';
    if (score >= maxScore / 100 * 40) return 'indicator-yellow';
    return 'indicator-red';
};

function ProblemPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const problems = [
        { id: '0001', title: 'fuck1', difficulty: 'LV.1', score: 40, maxScore: 40 },
        { id: '0002', title: 'fuck2', difficulty: 'LV.2', score: 50, maxScore: 60 },
        { id: '0003', title: 'fuck3', difficulty: 'LV.3', score: 70, maxScore: 80 },
        { id: '0004', title: 'fuck4', difficulty: 'LV.4', score: 50, maxScore: 100 },
        { id: '0005', title: 'fuck5', difficulty: 'LV.5', score: 70, maxScore: 120 },
        { id: '0006', title: 'fuck6', difficulty: 'LV.6', score:40, maxScore: 140 },
        { id: '0007', title: 'fuck7', difficulty: 'LV.7', score: 0, maxScore: 160 },
        { id: '0008', title: 'fuck8', difficulty: 'LV.8', score: 50, maxScore: 180 },
        { id: '0009', title: 'fuck9', difficulty: 'LV.9', score: 70, maxScore: 200 },
        { id: '0010', title: 'fuck10', difficulty: 'LV.10', score:40, maxScore: 220 },
        { id: '0011', title: 'fuck11', difficulty: 'LV.11', score: 30, maxScore: 240 },
    ];

    const handleProblemClick = (id: string) => {
        setSelectedId(id);
    };

    if (selectedId === '0001') {
        return <Problem1 />;
    }
    else if (selectedId === '0002') {
        return <Problem2 />;
    }
    else if (selectedId === '0003') {
        return <Problem3 />;
    }
    else if (selectedId === '0004') {
        return <Problem4 />;
    }
    else if (selectedId === '0005') {
        return <Problem5 />;
    }
    else if (selectedId === '0006') {
        return <Problem6 />;
    }
    else if (selectedId === '0007') {
        return <Problem7 />;
    }
    else if (selectedId === '0008') {
        return <Problem8 />;
    }
    else if (selectedId === '0009') {
        return <Problem9 />;
    }
    else if (selectedId === '0010') {
        return <Problem10 />;
    }
    else if (selectedId === '0011') {
        return <Problem11 />;
    }

    return (
        <div className="problem-page-container">
            <h2 className="page-title">문제 목록</h2>
            <div className="problem-list">
                {problems.map(problem => (
                    <div
                        key={problem.id}
                        onClick={() => handleProblemClick(problem.id)}
                        className="problem-card"
                    >
                        <div className="problem-header">
                            <div className="problem-info">
                                <span className="problem-id">{problem.id}.</span>
                                <span className="problem-title">{problem.title}</span>
                            </div>
                            <div className={`difficulty-badge ${getDifficultyClass(problem.difficulty)}`}>
                                {problem.difficulty}
                            </div>
                        </div>
                        <div className="problem-footer">
                            <span className="score-label">점수</span>
                            <span className="score-value">{problem.score}점</span>
                        </div>
                        <div className="score-indicator-container">
                            <div
                                className={`score-indicator-bar ${getScoreIndicatorColor(problem.score, problem.maxScore)}`}
                                style={{ width: `${(problem.score / problem.maxScore) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProblemPage;
