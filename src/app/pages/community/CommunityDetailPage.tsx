import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, type Variants} from 'motion/react';
import { ArrowLeft, Eye, Heart, MessageCircle, Pencil, Trash2, X } from 'lucide-react';
import { fetchPost, fetchComments, deletePost, toggleLike, createComment, deleteComment, type PostDetail, type Comment } from '../../api/community';

const CATEGORY_BAR: Record<string, string> = {
  '소비절약': 'bg-emerald-400',
  '투자':     'bg-blue-400',
  '카드/금융': 'bg-purple-400',
  '질문':     'bg-amber-400',
  '자유':     'bg-slate-300',
};

const CATEGORY_BADGE: Record<string, string> = {
  '소비절약': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '투자':     'bg-blue-50 text-blue-700 border-blue-200',
  '카드/금융': 'bg-purple-50 text-purple-700 border-purple-200',
  '질문':     'bg-amber-50 text-amber-700 border-amber-200',
  '자유':     'bg-slate-50 text-slate-600 border-slate-200',
};

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const currentUser = localStorage.getItem('name') || '';

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    Promise.all([fetchPost(numId), fetchComments(numId)])
      .then(([postData, comments]) => {
        setPost({ ...postData, comments });
      })
      .catch(() => setError('게시글을 불러올 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    await toggleLike(post.id);
    setPost((prev) => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    } : prev);
  };

  const handleCommentSubmit = async () => {
    if (!id || !commentInput.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await createComment(Number(id), commentInput.trim());
      setPost((prev) => prev ? {
        ...prev,
        comments: [...prev.comments, newComment],
        commentCount: prev.commentCount + 1,
      } : prev);
      setCommentInput('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!id) return;
    await deleteComment(Number(id), commentId);
    setPost((prev) => prev ? {
      ...prev,
      comments: prev.comments.filter((c: Comment) => c.id !== commentId),
      commentCount: prev.commentCount - 1,
    } : prev);
  };

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
        <button onClick={() => navigate('/community')} className="text-sm text-primary underline">
          목록으로
        </button>
      </div>
    );
  }

  const isAuthor = post.author === currentUser;

  return (
    <>
      <motion.div
        className="mx-auto max-w-3xl p-4 lg:p-8"
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
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* 카테고리 컬러 상단 바 */}
          <div className={`h-1.5 w-full ${CATEGORY_BAR[post.category] ?? 'bg-primary'}`} />

          {/* 헤더 */}
          <div className="p-5 sm:p-8">
          <div className="mb-6 border-b border-border pb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_BADGE[post.category] ?? 'bg-primary/10 text-primary border-primary/20'}`}>
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

            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success text-[10px] font-bold text-white">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium text-foreground">{post.author}</span>
              </div>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views}</span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-3.5 w-3.5 ${post.isLiked ? 'fill-red-500' : ''}`} /> {post.likeCount}
              </button>
              <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
          </div>{/* p-5 sm:p-8 닫기 */}
        </div>

        {/* 댓글 */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h4>댓글 {post.comments.length}개</h4>
          </div>
          {post.comments.length > 0 && (
            <div className="space-y-4 px-6 pt-5">
              {post.comments.map((comment: Comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-muted text-xs font-semibold text-muted-foreground">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                      </div>
                      {comment.author === currentUser && (
                        <button
                          onClick={() => handleCommentDelete(comment.id)}
                          className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 댓글 입력 */}
          <div className={`flex gap-3 p-6 ${post.comments.length > 0 ? 'border-t border-border' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-success text-xs text-white">
              {currentUser.charAt(0) || 'U'}
            </div>
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                placeholder="댓글을 입력하세요"
                className="flex-1 rounded-xl border border-border bg-input-background px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={submittingComment || !commentInput.trim()}
                className="rounded-xl bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
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
