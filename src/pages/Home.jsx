import { useEffect, useState, useContext } from "react";
import Feed from "../components/Feed";
import axiosInst from "../config/axios";
import { useOutletContext } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import useWatchEffect from "../hooks/useWatchEffect";
import useComponentVisible from "../hooks/useComponentVisible";
import ThemeContext from "../contexts/ThemeContext";

const url = import.meta.env.VITE_API_URL;

function Home() {
  const [posts, setPosts] = useState([]);
  const { user, triggerPostsFetch } = useOutletContext();
  const [contentInput, setContentInput] = useState("");

  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [uploadImage, setUploadImage] = useState(null);

  const [wordCount, setWordCount] = useState(0);

  const [createLoading, setCreateLoading] = useState(false);

  const { isDarkMode } = useContext(ThemeContext);

  const {
    triggerRef,
    dropRef,
    isComponentVisible: isPickerVisible,
    setComponentVisible: setPickerVisible,
  } = useComponentVisible();

  useEffect(() => {
    axiosInst
      .get(`${url}/posts`, {
        params: {
          is_explore: false,
        },
      })
      .then((res) => {
        console.log(res.data);
        setPosts(res.data.data);
      });
  }, []);

  const getPosts = () => {
    axiosInst
      .get(`${url}/posts`, {
        params: {
          is_explore: false,
        },
      })
      .then((res) => {
        setPosts(res.data.data);
      });
  };

  useWatchEffect(() => {
    getPosts();
  }, [triggerPostsFetch]);

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
      .then(() => {
        setUploadImage(null);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createPost = (e) => {
    e.preventDefault();
    setCreateLoading(true);
    axiosInst
      .post("/posts", {
        content: contentInput,
        parentPostId: null,
        imgUrl: uploadImage,
      })
      .then(() => {
        setContentInput("");
        setUploadImage(null);
        setWordCount(0);
        setPickerVisible(false);
        getPosts();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCreateLoading(false);
      });
  };

  return (
    <div>
      <div className="border-b border-[rgb(185,202,211)] dark:border-[rgb(47,51,54)]">
        <form onSubmit={createPost}>
          <div className="w-full flex px-2 pt-2">
            <img
              src={user?.profileImgUrl ?? personPlaceholder}
              className="post-profile-img rounded-full border-slate-50 dark:border-black border-2"
              alt=""
            />
            <div className="grow-wrap" data-replicated-value={contentInput}>
              <textarea
                type="text"
                required
                className="content-input"
                value={contentInput}
                onInput={handleContentInputChange}
                placeholder="What's happening?"
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
                <div ref={dropRef} style={{ position: "absolute", top: 25, zIndex: 5 }}>
                  <EmojiPicker
                    theme={isDarkMode ? "dark" : "light"}
                    onEmojiClick={handleEmojiClick}
                  />
                </div>
              ) : null}
              <svg
                ref={triggerRef}
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
                disabled={wordCount > 300 || createLoading}
              >
                Post
              </button>
            </div>
          </div>
        </form>
      </div>
      <Feed posts={posts} getPosts={getPosts} setPosts={setPosts} />
    </div>
  );
}

export default Home;
