import { useState } from 'react';
import { motion } from 'motion/react';

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage({ onNavigateToSignup, onLoginSuccess }: {
    onNavigateToSignup: () => void;
    onLoginSuccess: (token: string, name: string) => void;
}) {
    const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');

            const data = await res.json();
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('name', data.name);
            localStorage.setItem('userId', String(data.userId));
            localStorage.setItem('email', data.email ?? form.email);
            localStorage.setItem('riskType', data.riskType ?? '');
            onLoginSuccess(data.accessToken, data.name);
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
                    💰 Flowfin
                </h2>
                <p className="mb-8 text-muted-foreground">스마트 자산관리 서비스</p>

                <div className="flex flex-col gap-4">
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
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="mt-2 w-full rounded-xl bg-primary py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        계정이 없으신가요?{' '}
                        <button onClick={onNavigateToSignup} className="text-primary hover:underline">
                            회원가입
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}