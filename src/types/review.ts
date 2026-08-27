export interface CommentItem {
  id: number | string;
  postId?: number | string;
  authorEmail?: string;
  authorName?: string;
  content: string;
  createdAt?: string;
  children?: CommentItem[];
  parentId?: number | string | null;
}

export interface AdoptionReview {
  id: number | string;
  title: string;
  content: string;
  authorName?: string;
  authorEmail?: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  commentCount?: number;
  comments?: CommentItem[];
}

export interface ReviewFormData {
  title: string;
  content: string;
  image?: string;
}
