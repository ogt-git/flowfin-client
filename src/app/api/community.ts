const BASE_URL = 'http://localhost:8080/api/community';

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

// ── API 공통 fetch ─────────────────────────────────────────────────────────
async function apiFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || '요청에 실패했습니다.');
  }
  // 204 No Content면 json 파싱 안 함
  if (res.status === 204) return;
  return res.json();
}

// ── API 함수 ───────────────────────────────────────────────────────────────

/** 목록 조회 */
export async function fetchPosts(category?: string, keyword?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (category && category !== '전체') params.append('category', category);
  if (keyword) params.append('keyword', keyword);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`${BASE_URL}${query}`);
}

/** 단건 조회 */
export async function fetchPost(id: number): Promise<PostDetail> {
  return apiFetch(`${BASE_URL}/${id}`);
}

/** 게시글 작성 */
export async function createPost(payload: PostPayload): Promise<Post> {
  return apiFetch(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 게시글 수정 */
export async function updatePost(id: number, payload: PostPayload): Promise<Post> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/** 게시글 삭제 */
export async function deletePost(id: number): Promise<void> {
  return apiFetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}