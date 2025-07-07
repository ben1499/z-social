export interface User {
  id: number;
  username: string;
  name: string;
  bio?: string;
  profileImgUrl: string | null;
  coverImgUrl?: string;
  isFollowing: boolean;
  postCount: number;
  isCurrentUser: boolean;
  followsYou: boolean;
  createdAt: string;
  followingCount: number;
  followerCount: number;
}
