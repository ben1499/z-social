import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInst from "../config/axios";
import profilePlaceholder from "../assets/person-placeholder.jpeg";
import EmojiPicker from "emoji-picker-react";
import { useOutletContext } from "react-router-dom";
import SinglePost from "../components/SinglePost";

export default function Post() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const stickyRef = useRef(null);

  const [post, setPost] = useState(null);
  const [dropdownVisibleId, setDropdownVisibleId] = useState(null);

  const [contentInput, setContentInput] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [uploadImage, setUploadImage] = useState(null);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const [wordCount, setWordCount] = useState(0);

  const [createLoading, setCreateLoading] = useState(false);

  // For sticky header backdrop style
  useEffect(() => {
    // timeout to wait for the element to be mounted
    const timeoutId = setTimeout(() => {
      const el = stickyRef.current;
      if (el) {
        // Check if the ref is attached to an element
        const observer = new IntersectionObserver(
          ([e]) =>
            e.target.classList.toggle("is-pinned", e.intersectionRatio < 1),
          { threshold: [1] }
        );
        observer.observe(el);
  
        // Cleanup: Important to avoid memory leaks
        return () => {
          observer.unobserve(el);
          clearTimeout(timeoutId)
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    axiosInst
      .get(`/posts/${id}`)
      .then((res) => {
        setPost(res.data.data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const toggleLike = (post) => {
    if (post.isLiked) {
      axiosInst
        .delete(`/posts/${post.id}/like`)
        .then(() => {
          fetchPost();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axiosInst
        .post(`/posts/${post.id}/like`)
        .then(() => {
          fetchPost();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const toggleBookmark = (post) => {
    if (post.isBookmarked) {
      axiosInst
        .delete(`/posts/${post.id}/bookmark`)
        .then(() => {
          fetchPost();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axiosInst
        .post(`/posts/${post.id}/bookmark`)
        .then(() => {
          fetchPost();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const toggleRepost = (post) => {
    if (post.isRepostedByUser) {
      axiosInst
        .delete(`/posts/${post.id}/repost`)
        .then(() => {
          fetchPost();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axiosInst
        .post(`/posts/${post.id}/repost`)
        .then(() => {
          fetchPost();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const showDropdown = (postId) => {
    if (postId === dropdownVisibleId) setDropdownVisibleId(null);
    else setDropdownVisibleId(postId);
  };

  const fetchPost = () => {
    axiosInst
    .get(`/posts/${id}`)
    .then((res) => {
      setPost(res.data.data);
    })
    .catch((err) => console.log(err));
  }

  const createReply = (e) => {
    e.preventDefault();
    setCreateLoading(true);
    axiosInst
      .post("/posts", {
        content: contentInput,
        parentPostId: post.id,
        imgUrl: uploadImage,
      })
      .then(() => {
        setContentInput("");
        setUploadImage(null);
        setWordCount(0);
        setPickerVisible(false);
        fetchPost();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCreateLoading(false);
      });
  };

  const handleContentInputChange = (e) => {
    setContentInput(e.target.value);
    setWordCount(e.target.value.length);
  };

  const handleEmojiClick = (value) => {
    setContentInput(contentInput + value.emoji);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploadLoading(true);
    setImageProgress(0);
    const timer = setTimeout(() => {
      setImageProgress(imageProgress + 10);
    }, 500);
    axiosInst
      .post("/images", formData)
      .then((res) => {
        console.log(res);
        setUploadImage(res.data.url);
        setImageProgress(100);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        clearTimeout(timer);
        setUploadLoading(false);
      });
  };

  const removeImage = () => {
    const image_id = uploadImage.match(/z-social\/[a-zA-Z0-9]+/g);
    console.log(image_id);
    axiosInst
      .delete("/images/", {
        params: {
          image_id,
        },
      })
      .then((res) => {
        setUploadImage(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const goBack = () => {
    if (location.state === null) {
      navigate("/home");
    } else {
      navigate(-1);
    }
  }

  const handleReplyIconClick = () => {
    inputRef.current.focus();
  }

  return (
    <div>
      <div className="flex items-center gap-4 border-b pl-3 py-3 sticky-header" ref={stickyRef}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 hover:animate-bounce"
          onClick={goBack}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <p className="font-bold text-xl">Post</p>
      </div>
      {post && (
        <div key={post.keyId} className="py-2">
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
          <div className="w-full border-b pb-3 px-3">
            <div className="mb-3">
              <div className="flex justify-between">
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
                  <div>
                    <span className="font-bold leading-none">
                      {post.user.name}
                    </span>{" "}
                    <p className="text-slate-600 text-sm leading-none">
                      @{post.user.username}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  {post.userId ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                      onClick={() => showDropdown(post.keyId)}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  ) : null}
                  {post.keyId === dropdownVisibleId ? (
                    <div
                      className="w-32 cursor-pointer flex border-slate-200 border-2 gap-2 pl-2 pr-4 py-1"
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
              <p className="mt-3">{post.content}</p>
              {post.imgUrl ? (
                <img src={post.imgUrl} className="post-img" />
              ) : null}
              <p className="text-slate-500 mt-4 text-sm">
                {post.createdAtFormatted}
              </p>
            </div>
            <div className="flex justify-between border-t pt-3">
              <div className="icon-value">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="gray"
                  className="size-5"
                  onClick={handleReplyIconClick}
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
          <form onSubmit={createReply} className="border-b-2 px-3">
            <div className="w-full flex pt-2">
              <img
                src={user?.profileImgUrl ?? profilePlaceholder}
                className="post-profile-img rounded-full border-slate-50 border-2"
                alt=""
              />
              <div className="grow-wrap" data-replicated-value={contentInput}>
                <textarea
                  ref={inputRef}
                  type="text"
                  required
                  className="content-input"
                  value={contentInput}
                  onInput={handleContentInputChange}
                  placeholder="Post your Reply"
                  maxLength={300}
                />
              </div>
            </div>
            {uploadImage && (
              <div className="mx-6 h-30 relative">
                <button className="post-img-remove" onClick={removeImage}>
                  X
                </button>
                <img src={uploadImage} alt="" className="post-img" />
              </div>
            )}
            {uploadLoading ? (
              <div className="mb-2 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                  style={{ width: `${imageProgress}%` }}
                ></div>
              </div>
            ) : null}
            <div className="flex justify-between items-center pb-2 px-1">
              <div className="flex items-center gap-2 px-6 relative">
                <label htmlFor="image" className="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-blue"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </label>
                <input
                  id="image"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageUpload}
                />
                {isPickerVisible ? (
                  <EmojiPicker
                    style={{ position: "absolute", top: 25 }}
                    onEmojiClick={handleEmojiClick}
                  />
                ) : null}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 cursor-pointer text-blue"
                  onClick={() => setPickerVisible(!isPickerVisible)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                  />
                </svg>
              </div>
              <div>
                {wordCount ? (
                  <span className="mr-2 text-blue">{wordCount}/300</span>
                ) : null}
                <button
                  className="!py-1 !px-4 !rounded-full"
                  disabled={wordCount > 300}
                >
                  Reply
                </button>
              </div>
            </div>
          </form>
          <div>
            {post.replies.map((reply) => (
              <SinglePost key={reply.id} post={reply} user={user} fetchPost={fetchPost} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
