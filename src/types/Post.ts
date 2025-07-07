export interface Post {
  id: number;
  keyId: string;
  userId: number;
  isLiked: boolean;
  likeCount: number;
  isBookmarked: boolean;
  bookmarkCount: number;
  isRepostedByUser: boolean;
  isRepost: boolean;
  repostCount: number;
  replyCount: number;
  createdAt: string;
  createdAtFormatted: string;
  content: string;
  imgUrl?: string;
  repostUser: {
    id: number;
    name: string;
  };
  user: {
    name: string;
    username: string;
    profileImgUrl?: string;
  };
  replies: Post[]
}
