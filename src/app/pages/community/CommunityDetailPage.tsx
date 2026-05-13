import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, type Variants} from 'motion/react';
import { ArrowLeft, Eye, Heart, MessageCircle, Pencil, Trash2, X } from 'lucide-react';
import { fetchPost, deletePost, type PostDetail } from '../../api/community';

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentUser = localStorage.getItem('name') || '';

  useEffect(() => {
    if (!id) return;
    fetchPost(Number(id))
      .then(setPost)
      .catch(() => setError('게시글을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deletePost(Number(id));
      navigate('/community');
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>{error || '게시글을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/community')} className="text-sm text-[#0A3D5C] underline">
          목록으로
        </button>
      </div>
    );
  }

  const isAuthor = post.author === currentUser;

  return (
    <>
      <motion.div
        className="p-8 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/community')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </button>

        {/* 게시글 */}
        <div className="rounded-2xl border border-border bg-white p-8">
          {/* 헤더 */}
          <div className="mb-6 border-b border-border pb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs text-[#1E40AF]">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground">{post.createdAt}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <h2 style={{ fontFamily: 'var(--font-family-display)' }}>{post.title}</h2>
              {isAuthor && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => navigate(`/community/${id}/edit`)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    수정
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{post.author}</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views}</span>
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likeCount}</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* 댓글 */}
        <div className="mt-6 rounded-2xl border border-border bg-white p-6">
          <h4 className="mb-4">댓글 {post.comments.length}개</h4>
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                  {comment.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 댓글 입력 */}
          <div className="mt-5 flex gap-3 border-t border-border pt-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0A3D5C] to-[#10B981] text-xs text-white">
              {currentUser.charAt(0) || 'U'}
            </div>
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="댓글을 입력하세요"
                className="flex-1 rounded-xl border border-border bg-input-background px-4 py-2 text-sm outline-none transition-all focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/10"
              />
              <button className="rounded-xl bg-[#0A3D5C] px-4 py-2 text-sm text-white transition-colors hover:bg-[#0F4C81]">
                등록
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4"
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="mb-2 mt-4">게시글 삭제</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              삭제한 게시글은 복구할 수 없습니다. 정말 삭제하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
