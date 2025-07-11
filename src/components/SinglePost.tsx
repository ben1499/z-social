import { useLocation, useNavigate } from "react-router-dom";
import profilePlaceholder from "../assets/person-placeholder.jpeg";
import axiosInst from "../config/axios";
import { getRelativeTime } from "../utilities";
import useComponentVisible from "../hooks/useComponentVisible";
import { AxiosError } from "axios";
import { Post } from "../types/Post";

interface SinglePostProps {
  post: Post;
  user: { id: number };
  fetchPost: () => void;
}

export default function SinglePost({ post, user, fetchPost }: SinglePostProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { dropRef, triggerRef, isComponentVisible, setComponentVisible } =
    useComponentVisible<SVGSVGElement, HTMLDivElement>();

  const goToPost = (e: React.MouseEvent<HTMLElement>, id: number) => {
    const target = e.target as HTMLElement;

    if (
      target.nodeName === "svg" ||
      target.nodeName === "path" ||
      target.classList.contains("ignore")
    )
      return;
    navigate(`/post/${id}`, { state: { from: location } });
  };

  const toggleLike = (post: Post) => {
    if (post.isLiked) {
      axiosInst
        .delete(`/posts/${post.id}/like`)
        .then(() => {
          fetchPost();
        })
        .catch((err: AxiosError) => {
          console.log(err);
        });
    } else {
      axiosInst
        .post(`/posts/${post.id}/like`)
        .then(() => {
          fetchPost();
        })
        .catch((err: AxiosError) => {
          console.log(err);
        });
    }
  };

  const toggleBookmark = (post: Post) => {
    if (post.isBookmarked) {
      axiosInst
        .delete(`/posts/${post.id}/bookmark`)
        .then(() => {
          fetchPost();
        })
        .catch((err: AxiosError) => {
          console.log(err);
        });
    } else {
      axiosInst
        .post(`/posts/${post.id}/bookmark`)
        .then(() => {
          fetchPost();
        })
        .catch((err: AxiosError) => {
          console.log(err);
        });
    }
  };

  const toggleRepost = (post: Post) => {
    if (post.isRepostedByUser) {
      axiosInst
        .delete(`/posts/${post.id}/repost`)
        .then(() => {
          fetchPost();
        })
        .catch((err: AxiosError) => {
          console.log(err);
        });
    } else {
      axiosInst
        .post(`/posts/${post.id}/repost`)
        .then(() => {
          fetchPost();
        })
        .catch((err: AxiosError) => {
          console.log(err);
        });
    }
  };

  const deletePost = (post: Post) => {
    axiosInst
      .delete(`/posts/${post.id}`)
      .then(() => {
        fetchPost();
      })
      .catch((err: AxiosError) => {
        console.log(err);
      });
  };

  return (
    <div
      key={post.keyId}
      className="border-slate-200 border-b-2 py-2 px-3 feed-post"
      onClick={(e) => goToPost(e, post.id)}
    >
      {post.isRepost ? (
        <p className="text-slate-500 ml-6 flex gap-2 items-center text-sm font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
            />
          </svg>
          {post.repostUser.name} reposted
        </p>
      ) : null}
      <div className="flex gap-2">
        <img
          src={
            post.user.profileImgUrl
              ? post.user.profileImgUrl
              : profilePlaceholder
          }
          className="post-profile-img rounded-full border-slate-50 border-2"
          alt=""
        />
        <div className="w-full">
          <div className="mb-3">
            <div className="flex justify-between">
              <div>
                <span className="font-bold">{post.user.name}</span>{" "}
                <span className="text-slate-600">@{post.user.username}</span>
                <span className="text-slate-600 ml-1">
                  · {getRelativeTime(post.createdAt, post.createdAtFormatted)}
                </span>
              </div>
              <div className="relative">
                {post.userId === user?.id ? (
                  <div className="icon-value">
                    <svg
                      ref={triggerRef}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                      onClick={() => setComponentVisible(!isComponentVisible)}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                ) : null}
                {isComponentVisible ? (
                  <div
                    ref={dropRef}
                    className="w-32 cursor-pointer flex border-slate-200 border-2 gap-2 pl-2 pr-4 py-1 ignore"
                    style={{ position: "absolute", left: -100 }}
                    onClick={() => deletePost(post)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    Delete
                  </div>
                ) : null}
              </div>
            </div>
            <p>{post.content}</p>
            {post.imgUrl ? (
              <img src={post.imgUrl} className="post-img" />
            ) : null}
          </div>
          <div className="flex justify-between">
            <div className="icon-value">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="gray"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                />
              </svg>
              <span>{post.replyCount}</span>
            </div>
            <div
              className={
                post.isRepostedByUser ? "icon-value repost" : "icon-value"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke={post.isRepostedByUser ? "#00BA7C" : "gray"}
                className="size-5"
                onClick={() => toggleRepost(post)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                />
              </svg>
              <span>{post.repostCount}</span>
            </div>
            <div className="icon-value">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={post.isLiked ? "#F91880" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="gray"
                className="size-5"
                onClick={() => toggleLike(post)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              <span>{post.likeCount}</span>
            </div>
            <div className="icon-value">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={post.isBookmarked ? "#1A8BD6" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="gray"
                className="size-5"
                onClick={() => toggleBookmark(post)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </svg>
              <span>{post.bookmarkCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
