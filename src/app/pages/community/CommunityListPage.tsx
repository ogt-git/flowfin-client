import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, type Variants} from 'motion/react';
import { PenLine, Search, Eye, Heart, MessageCircle } from 'lucide-react';
import { fetchPosts, type Post } from '../../api/community';

const CATEGORIES = ['전체', '소비절약', '투자', '카드/금융', '질문', '자유'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function CommunityListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchPosts(category, keyword)
        .then(setPosts)
        .finally(() => setLoading(false));
  }, [category, keyword]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  return (
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: 'var(--font-family-display)' }}>커뮤니티</h2>
            <p className="mt-1 text-sm text-muted-foreground">금융 정보를 나누고 함께 성장해요</p>
          </div>
          <button
              onClick={() => navigate('/community/new')}
              className="flex items-center gap-2 rounded-xl bg-[#0A3D5C] px-5 py-2.5 text-sm text-white shadow-md transition-all hover:bg-[#0F4C81] hover:shadow-lg"
          >
            <PenLine className="h-4 w-4" />
            글쓰기
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#0A3D5C] focus:ring-2 focus:ring-[#0A3D5C]/10"
            />
          </div>
          <button
              type="submit"
              className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            검색
          </button>
        </form>

        <div className="mb-6 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
              <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all ${
                      category === cat
                          ? 'bg-[#0A3D5C] text-white shadow-md'
                          : 'border border-border bg-white text-muted-foreground hover:border-[#0A3D5C] hover:text-[#0A3D5C]'
                  }`}
              >
                {cat}
              </button>
          ))}
        </div>

        {loading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              불러오는 중...
            </div>
        ) : posts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>게시글이 없습니다.</p>
              <button
                  onClick={() => navigate('/community/new')}
                  className="text-sm text-[#0A3D5C] underline underline-offset-2"
              >
                첫 글을 작성해보세요 →
              </button>
            </div>
        ) : (
            <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
              {posts.map((post) => (
                  <motion.div
                      key={post.id}
                      variants={itemVariants}
                      onClick={() => navigate(`/community/${post.id}`)}
                      className="group cursor-pointer rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#0A3D5C]/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs text-[#1E40AF]">
                      {post.category}
                    </span>
                          <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                        </div>
                        <h4 className="mb-1 truncate group-hover:text-[#0A3D5C]">{post.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {post.views}
                </span>
                      <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> {post.likes}
                </span>
                      <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}
                </span>
                    </div>
                  </motion.div>
              ))}
            </motion.div>
        )}
      </div>
  );
}