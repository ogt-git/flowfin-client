import { useState } from 'react';
import { motion } from 'motion/react';

interface SignupForm {
    email: string;
    password: string;
    name: string;
}

export default function SignupPage({ onNavigateToLogin }: {
    onNavigateToLogin: () => void;
}) {
    const [form, setForm] = useState<SignupForm>({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-xl"
            >
                <h2 className="mb-1 text-2xl" style={{ fontFamily: 'var(--font-family-display)' }}>
                    💰 갓생Money
                </h2>
                <p className="mb-8 text-muted-foreground">회원가입</p>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm">이름</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="홍길동"
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">이메일</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="test@test.com"
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm">비밀번호</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className="mt-2 w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? '가입 중...' : '회원가입'}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        이미 계정이 있으신가요?{' '}
                        <button onClick={onNavigateToLogin} className="text-primary hover:underline">
                            로그인
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}