import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { fetchPost, createPost, updatePost, type PostPayload } from '../../api/community';

const CATEGORIES = ['소비절약', '투자', '카드/금융', '질문', '자유'];

const CATEGORY_BADGE: Record<string, string> = {
  '소비절약': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '투자':     'bg-blue-50 text-blue-700 border-blue-200',
  '카드/금융': 'bg-purple-50 text-purple-700 border-purple-200',
  '질문':     'bg-amber-50 text-amber-700 border-amber-200',
  '자유':     'bg-slate-50 text-slate-600 border-slate-200',
};

export default function CommunityFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<PostPayload>({ title: '', content: '', category: '소비절약' });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<PostPayload>>({});

  // 수정 시 기존 데이터 로드
  useEffect(() => {
    if (!isEdit) return;
    fetchPost(Number(id))
      .then((post) => {
        setForm({ title: post.title, content: post.content, category: post.category });
      })
      .catch(() => navigate('/community'))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Partial<PostPayload> = {};
    if (!form.title.trim()) newErrors.title = '제목을 입력해주세요.';
    else if (form.title.length > 100) newErrors.title = '제목은 100자 이내로 입력해주세요.';
    if (!form.content.trim()) newErrors.content = '내용을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await updatePost(Number(id), form);
        navigate(`/community/${id}`);
      } else {
        const post = await createPost(form);
        navigate(`/community/${post.id}`);
      }
    } catch {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-3xl p-4 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {isEdit ? '상세로 돌아가기' : '목록으로'}
      </button>

      <div className="mb-6">
        <h2 style={{ fontFamily: 'var(--font-family-display)' }}>
          {isEdit ? '게시글 수정' : '게시글 작성'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit ? '내용을 수정하고 저장하세요.' : '금융 정보를 커뮤니티와 나눠보세요.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-5 sm:p-8 space-y-6">
        {/* 카테고리 */}
        <div>
          <label className="mb-2 block text-sm font-medium">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  form.category === cat
                    ? CATEGORY_BADGE[cat] + ' shadow-sm'
                    : 'border-border bg-white text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-2 block text-sm font-medium">제목</label>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10 ${
              errors.title
                ? 'border-red-400 focus:border-red-400'
                : 'border-border focus:border-primary'
            }`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          <p className="mt-1 text-right text-xs text-muted-foreground">{form.title.length} / 100</p>
        </div>

        {/* 내용 */}
        <div>
          <label className="mb-2 block text-sm font-medium">내용</label>
          <textarea
            placeholder="내용을 입력하세요"
            rows={12}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10 ${
              errors.content
                ? 'border-red-400 focus:border-red-400'
                : 'border-border focus:border-primary'
            }`}
          />
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-border px-6 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? '저장 중...' : isEdit ? '수정 완료' : '게시하기'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
