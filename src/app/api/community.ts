import http from '@/api/http';

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: string;
  views: number;
  likeCount: number;
  commentCount: number;
}

export interface PostDetail extends Post {
  isLiked: boolean;
  comments: Comment[];
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface PostPayload {
  title: string;
  content: string;
  category: string;
}

// ── API 함수 ───────────────────────────────────────────────────────────────

/** 목록 조회 */
export async function fetchPosts(category?: string, keyword?: string): Promise<Post[]> {
  const params: Record<string, string> = {};
  if (category && category !== '전체') params.category = category;
  if (keyword) params.keyword = keyword;
  const res = await http.get<Post[]>('/api/community', { params });
  return res.data;
}

/** 단건 조회 */
export async function fetchPost(id: number): Promise<PostDetail> {
  const res = await http.get<PostDetail>(`/api/community/${id}`);
  return res.data;
}

/** 게시글 작성 */
export async function createPost(payload: PostPayload): Promise<Post> {
  const res = await http.post<Post>('/api/community', payload);
  return res.data;
}

/** 게시글 수정 */
export async function updatePost(id: number, payload: PostPayload): Promise<Post> {
  const res = await http.put<Post>(`/api/community/${id}`, payload);
  return res.data;
}

/** 게시글 삭제 */
export async function deletePost(id: number): Promise<void> {
  await http.delete(`/api/community/${id}`);
}

/** 좋아요 토글 */
export async function toggleLike(id: number): Promise<void> {
  await http.post(`/api/community/like/${id}`);
}

/** 댓글 목록 조회 */
export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await http.get<Comment[]>(`/api/community/${postId}/comments`);
  return res.data;
}

/** 댓글 등록 */
export async function createComment(postId: number, content: string): Promise<Comment> {
  const res = await http.post<Comment>(`/api/community/${postId}/comments`, { content });
  return res.data;
}

/** 댓글 삭제 */
export async function deleteComment(postId: number, commentId: number): Promise<void> {
  await http.delete(`/api/community/${postId}/comments/${commentId}`);
}
