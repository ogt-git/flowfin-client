import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
    text: string;
    options: string[];
    scores: number[];
}

const QUESTIONS: Question[] = [
    {
        text: '연령대가 어떻게 되십니까?',
        options: ['20~29세', '30~39세', '40~49세', '50~59세', '60세 이상'],
        scores: [10, 8, 6, 4, 2],
    },
    {
        text: '나에게 1천만 원의 여유 자금이 생겼다. 예금과 주식투자로 배분한다면?',
        options: [
            '예금 1,000만 원',
            '예금 700만 원, 주식 300만 원',
            '예금 500만 원, 주식 500만 원',
            '예금 300만 원, 주식 700만 원',
            '주식 1,000만 원',
        ],
        scores: [2, 4, 6, 8, 10],
    },
    {
        text: '이 자금으로 투자를 한다면 어느 정도 기간 동안 투자할 것인가?',
        options: [
            '1개월 미만',
            '1개월 이상 ~ 6개월 미만',
            '6개월 이상 ~ 1년 미만',
            '1년 이상 ~ 3년 미만',
            '3년 이상',
        ],
        scores: [10, 8, 6, 4, 2],
    },
    {
        text: '내가 가장 선호하는 금융 상품은?',
        options: ['예금', '채권', '주식', '선물', '옵션'],
        scores: [2, 4, 6, 8, 10],
    },
    {
        text: '자산 중 예금이나 펀드 등의 금융 자산은 어느 정도 되나요?',
        options: ['거의 없다', '절반 이하', '절반 정도', '절반 이상', '거의 전부'],
        scores: [2, 4, 6, 8, 10],
    },
    {
        text: '자산관리 원칙 중 내가 우선시하는 특성 순서는?',
        options: [
            '안전성 > 유동성 > 수익성',
            '안전성 > 수익성 > 유동성',
            '유동성 > 안전성 > 수익성',
            '유동성 > 수익성 > 안전성',
            '수익성 > 안전성 > 유동성',
            '수익성 > 유동성 > 안전성',
        ],
        scores: [2, 4, 4, 6, 8, 10],
    },
    {
        text: '금융투자상품 취득 및 투자 목적은 무엇입니까?',
        options: ['채무상환', '생활비', '주택마련', '여유자금', '자산증식'],
        scores: [2, 4, 6, 8, 10],
    },
    {
        text: '투자를 통해 만약 손실이 난다면 어느 정도까지 수용할 수 있는가?',
        options: [
            '무슨 일이 있어도 투자원금은 보전되어야 한다',
            '10% 미만까지는 손실을 감수할 수 있다',
            '20% 미만까지는 손실을 감수할 수 있다',
            '40% 미만까지는 손실을 감수할 수 있다',
            '기대수익이 높다면 위험이 높아도 상관없다',
        ],
        scores: [2, 4, 6, 8, 10],
    },
    {
        text: '금융투자상품 투자에 대한 지식수준은 어느 정도입니까?',
        options: [
            '금융상품에 투자해 본 경험이 없음',
            '널리 알려진 금융투자상품(주식, 채권, 펀드 등)의 구조 및 위험을 일정 부분 이해하고 있음',
            '널리 알려진 금융투자상품(주식, 채권, 펀드 등)의 구조 및 위험을 깊이 있게 이해하고 있음',
            '파생상품을 포함한 대부분의 금융투자상품의 구조 및 위험을 이해하고 있음',
        ],
        scores: [5, 10, 15, 20],
    },
];

const RISK_GRADES = [
    {
        min: 21, max: 36,
        type: 'CONSERVATIVE',
        label: '안정형',
        desc: '원금 보전을 최우선으로 하며 안정적인 수익을 추구합니다.',
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-50',
        activeBg: 'bg-blue-100',
    },
    {
        min: 37, max: 52,
        type: 'MODERATELY_CONSERVATIVE',
        label: '안정추구형',
        desc: '안정성을 중시하되 일부 위험 자산에 소극적으로 투자합니다.',
        colorClass: 'text-teal-500',
        bgClass: 'bg-teal-50',
        activeBg: 'bg-teal-100',
    },
    {
        min: 53, max: 68,
        type: 'MODERATE',
        label: '위험중립형',
        desc: '수익과 안정성을 균형 있게 추구하는 투자 성향입니다.',
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-50',
        activeBg: 'bg-emerald-100',
    },
    {
        min: 69, max: 84,
        type: 'MODERATELY_AGGRESSIVE',
        label: '적극투자형',
        desc: '높은 수익을 위해 상당한 위험을 감수할 수 있습니다.',
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-50',
        activeBg: 'bg-amber-100',
    },
    {
        min: 85, max: 100,
        type: 'AGGRESSIVE',
        label: '공격투자형',
        desc: '최고의 수익을 위해 높은 위험을 기꺼이 받아들입니다.',
        colorClass: 'text-red-500',
        bgClass: 'bg-red-50',
        activeBg: 'bg-red-100',
    },
];

function getGrade(score: number) {
    return RISK_GRADES.find(g => score >= g.min && score <= g.max) ?? RISK_GRADES[0];
}

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
};

export default function SignupPage({ onNavigateToLogin }: { onNavigateToLogin: () => void }) {
    const [step, setStep] = useState<'info' | 'test' | 'result'>('info');
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
    const [direction, setDirection] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const totalScore = answers.reduce(
        (sum, ansIdx, qi) => (ansIdx === -1 ? sum : sum + QUESTIONS[qi].scores[ansIdx]),
        0,
    );
    const grade = getGrade(totalScore);

    const handleInfoNext = () => {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            setError('모든 항목을 입력해주세요.');
            return;
        }
        setError('');
        setDirection(1);
        setStep('test');
    };

    const handleAnswer = (optionIdx: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = optionIdx;
        setAnswers(newAnswers);
        setDirection(1);
        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ(q => q + 1);
        } else {
            setStep('result');
        }
    };

    const handleBack = () => {
        setDirection(-1);
        if (step === 'result') {
            setStep('test');
            setCurrentQ(QUESTIONS.length - 1);
        } else if (step === 'test' && currentQ > 0) {
            setCurrentQ(q => q - 1);
        } else {
            setStep('info');
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, riskType: grade.type }),
            });
            if (!res.ok) throw new Error('회원가입에 실패했습니다.');
            alert('회원가입 성공! 로그인해주세요.');
            onNavigateToLogin();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const animKey = step === 'test' ? `test-${currentQ}` : step;

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={animKey}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 shadow-xl"
                >
                    <h2 className="mb-1 text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
                        💰 Flowfin
                    </h2>

                    {/* Step 1: 기본 정보 */}
                    {step === 'info' && (
                        <>
                            <p className="mb-8 text-muted-foreground">회원가입</p>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1 block text-sm">이름</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="홍길동"
                                        className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm">이메일</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="test@test.com"
                                        className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm">비밀번호</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && handleInfoNext()}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <button
                                    onClick={handleInfoNext}
                                    className="mt-2 w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    다음 — 투자성향 테스트
                                </button>
                                <p className="text-center text-sm text-muted-foreground">
                                    이미 계정이 있으신가요?{' '}
                                    <button onClick={onNavigateToLogin} className="text-primary hover:underline">
                                        로그인
                                    </button>
                                </p>
                            </div>
                        </>
                    )}

                    {/* Step 2: 투자성향 테스트 */}
                    {step === 'test' && (
                        <>
                            <div className="mb-6">
                                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>투자성향 테스트</span>
                                    <span>{currentQ + 1} / {QUESTIONS.length}</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                        style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <p className="mb-6 text-base font-medium leading-relaxed">
                                Q{currentQ + 1}. {QUESTIONS[currentQ].text}
                            </p>

                            <div className="flex flex-col gap-2">
                                {QUESTIONS[currentQ].options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 ${
                                            answers[currentQ] === i
                                                ? 'border-primary bg-primary/10 font-medium text-primary'
                                                : 'border-border'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleBack}
                                className="mt-6 text-sm text-muted-foreground hover:text-foreground"
                            >
                                ← 이전
                            </button>
                        </>
                    )}

                    {/* Step 3: 결과 */}
                    {step === 'result' && (
                        <>
                            <p className="mb-6 text-muted-foreground">투자성향 테스트 결과</p>

                            <div className={`mb-6 rounded-2xl ${grade.bgClass} p-6 text-center`}>
                                <p className="mb-1 text-sm text-muted-foreground">나의 투자성향</p>
                                <p className={`mb-2 text-3xl font-bold ${grade.colorClass}`}>{grade.label}</p>
                                <p className="text-sm text-muted-foreground">{grade.desc}</p>
                                            </div>

                            <div className="mb-6 flex gap-1 text-center text-xs">
                                {RISK_GRADES.map(g => (
                                    <div
                                        key={g.type}
                                        className={`flex-1 rounded-lg py-2 transition-colors ${
                                            g.type === grade.type
                                                ? `${g.activeBg} ${g.colorClass} font-semibold`
                                                : 'bg-muted/40 text-muted-foreground'
                                        }`}
                                    >
                                        {g.label}
                                    </div>
                                ))}
                            </div>

                            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {loading ? '가입 중...' : '가입 완료'}
                            </button>

                            <button
                                onClick={handleBack}
                                className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
                            >
                                ← 다시 테스트하기
                            </button>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
