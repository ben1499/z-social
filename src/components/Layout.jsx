import { useEffect, useState, useRef, useContext } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import useComponentVisible from "../hooks/useComponentVisible";
import Modal from "react-modal";
import EmojiPicker from "emoji-picker-react";
import UserSearch from "./UserSearch";
import { useSnackbar } from "react-simple-snackbar";
import ThemeContext from "../contexts/ThemeContext";

const customStyles = {
  content: {
    width: "35%",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "20px",
    padding: "12px",
    paddingBottom: "30px",
    height: "70%",
  },
};

const options = {
  position: "bottom-left",
  closeStyle: {
    backgroundColor: "inherit",
    color: "inherit",
    padding: "5px",

    "&:hover": {
      opacity: 0.5,
    },
  },
};

function Layout() {
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  // Post creation state
  const [modalIsOpen, setIsOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [contentInput, setContentInput] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [uploadImage, setUploadImage] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [triggerPostsFetch, setTriggerPostsFetch] = useState(0);

  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const { triggerRef, dropRef, isComponentVisible, setComponentVisible } =
    useComponentVisible();

  const {
    triggerRef: pickerTriggerRef,
    dropRef: pickerDropRef,
    isComponentVisible: isPickerVisible,
    setComponentVisible: setPickerVisible,
  } = useComponentVisible();

  const [openSnackbar] = useSnackbar(options);
  const openSnackbarRef = useRef();

  const location = useLocation();
  const navigate = useNavigate();

  // Update the ref whenever openSnackbar changes
  // to fix issue where openSnackbar as dependency in second useEffect causes infinite re-renders
  useEffect(() => {
    openSnackbarRef.current = openSnackbar;
  }, [openSnackbar]);

  useEffect(() => {
    axiosInst
      .get("/users/profile")
      .then((res) => {
        setUser(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        if (!err.response || err.response.status !== 400) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          openSnackbarRef.current(
            "Something went wrong. Please try again.",
            2500
          );
          return navigate("/login");
        }

        if (err.response.status === 401 || err.response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          openSnackbarRef.current("Please login to your account", 2500);
          return navigate("/login");
        }
      });

    axiosInst
      .get("/users", {
        params: {
          searchQuery: "",
          limit: 5,
        },
      })
      .then((res) => {
        setSuggestedUsers(res.data.data);
      });

    axiosInst
      .get("notifications/unread")
      .then((res) => {
        setNotificationCount(res.data.data.unreadCount);
      })
      .catch((err) => console.log(err));
  }, [navigate]);

  const handleContentInputChange = (e) => {
    setContentInput(e.target.value);
    setWordCount(e.target.value.length);
  };

  const handleEmojiClick = (value) => {
    setContentInput(contentInput + value.emoji);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1000000) {
      openSnackbar("File size must be less than 1 MB", 2500);
      return;
    }
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

  const resetPostForm = () => {
    setContentInput("");
    setUploadImage(null);
    setWordCount(0);
    setPickerVisible(false);
  };

  const openModal = () => {
    if (uploadImage) {
      removeImage();
    }
    resetPostForm();
    setIsOpen(true);
  };

  const createPost = (e) => {
    e.preventDefault();
    if (!contentInput && !uploadImage) 
      return;
    setCreateLoading(true);
    axiosInst
      .post("/posts", {
        content: contentInput,
        parentPostId: null,
        imgUrl: uploadImage,
      })
      .then(() => {
        resetPostForm();
        setIsOpen(false);
        if (location.pathname === "/home")
          setTriggerPostsFetch(triggerPostsFetch + 1);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCreateLoading(false);
      });
  };

  const toggleFollow = (user) => {
    if (user.isFollowing) {
      axiosInst
        .delete(`/users/follow/${user.id}`)
        .then(() => {
          const updatedSuggestUsers = suggestedUsers.map((item) => {
            if (item.id === user.id) {
              return {
                ...item,
                isFollowing: false,
              };
            } else {
              return item;
            }
          });
          setSuggestedUsers(updatedSuggestUsers);
        })
        .catch((err) => console.log(err));
    } else {
      axiosInst
        .post(`/users/follow/${user.id}`)
        .then(() => {
          const updatedSuggestUsers = suggestedUsers.map((item) => {
            if (item.id === user.id) {
              return {
                ...item,
                isFollowing: true,
              };
            } else {
              return item;
            }
          });
          setSuggestedUsers(updatedSuggestUsers);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const goToProfile = (user, e) => {
    if (e.target.classList.contains("ignore")) return;
    navigate(`/${user.username}`, { state: { from: location } });
  };

  return (
    <div className="flex max-sm:flex-col">
      <div className="sidebar absolute">
        <div>
          <p className="text-4xl ml-5 mt-2 font-bold max-sm:hidden">ℤ</p>
          <ul className="sidebar-list">
            <li>
              <Link to="/home" className="!w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={
                    location.pathname === "/home"
                      ? isDarkMode
                        ? "white"
                        : "black"
                      : "none"
                  }
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                <span
                  className={location.pathname === "/home" ? "font-bold" : ""}
                >
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link to="/explore" className="!w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={
                    location.pathname === "/explore"
                      ? isDarkMode
                        ? "white"
                        : "black"
                      : "none"
                  }
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <span>Explore</span>
              </Link>
            </li>
            <li>
              <Link
                to="/notifications"
                className="!w-full"
                onClick={() => setNotificationCount(0)}
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={
                      location.pathname === "/notifications"
                        ? isDarkMode
                          ? "white"
                          : "black"
                        : "none"
                    }
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                  {notificationCount ? (
                    <p className="bg-blue-500 border-2 border-gray-500 text-white rounded-full -top-2 -end-1 absolute text-[10px] font-bold p-0.2 px-0.5">
                      {notificationCount}
                    </p>
                  ) : null}
                </div>
                <span>Notifications</span>
              </Link>
            </li>
            <li>
              <Link to="/bookmarks" className="!w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={
                    location.pathname === "/bookmarks"
                      ? isDarkMode
                        ? "white"
                        : "black"
                      : "none"
                  }
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                  />
                </svg>
                <span>Bookmarks</span>
              </Link>
            </li>
            <li>
              <Link to={`/${user?.username}`} className="!w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={
                    location.pathname === `/${user?.username}`
                      ? isDarkMode
                        ? "white"
                        : "black"
                      : "none"
                  }
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span>Profile</span>
              </Link>
            </li>
            <li onClick={handleSignOut}>
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
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
              <span>Sign Out</span>
            </li>
            <button className="!rounded-full w-full mt-4 max-lg:hidden" onClick={openModal}>
              Post
            </button>
            <button className="!rounded-full !p-2 lg:hidden max-lg:ml-3 max-lg:mt-4 max-sm:hidden" onClick={openModal}>
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
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          </ul>
          {user && isComponentVisible && (
            <ul
              className="absolute left-[0.6rem] bottom-[6.5rem] bg-white dark:bg-gray-900 py-2 rounded-md drop-shadow-md z-10"
              ref={dropRef}
            >
              {isDarkMode ? (
                <li
                  className="hover:bg-slate-100 hover:dark:bg-gray-700 py-3 px-4 cursor-pointer flex gap-3 max-lg:text-sm w-56"
                  onClick={toggleTheme}
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
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                    />
                  </svg>
                  Switch to light mode
                </li>
              ) : (
                <li
                  className="hover:bg-slate-100 hover:dark:bg-gray-700 py-3 px-4 cursor-pointer flex gap-3"
                  onClick={toggleTheme}
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
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                    />
                  </svg>
                  Switch to dark mode
                </li>
              )}
            </ul>
          )}
        </div>
        {user ? (
          <div className="flex items-center max-lg:flex-col justify-between relative mt-auto max-sm:mt-0 mb-6 max-sm:hidden hover:bg-[rgb(15,20,25,0.1)] hover:dark:bg-gray-900 rounded-full py-3 px-2 w-[120%] transition-colors">
            <div className="flex gap-2">
              <Link to={`/${user.username}`} state={{ from: location }}>
                <img
                  src={user.profileImgUrl || personPlaceholder}
                  className="post-profile-img rounded-full cursor-pointer hover:brightness-[0.9]"
                  alt=""
                />
              </Link>
              <div className="max-lg:hidden">
                <Link
                  to={`/${user.username}`}
                  state={{ from: location }}
                  className="!cursor-pointer"
                >
                  <p>{user.name}</p>
                </Link>
                <p className="text-zinc-600 text-sm cursor-pointer">
                  <Link to={`/${user.username}`} state={{ from: location }}>
                    @{user.username}
                  </Link>
                </p>
              </div>
            </div>
            <svg
              ref={triggerRef}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 rounded-full cursor-pointer"
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
      </div>
      <div className="w-2/6 center-section">
        <Outlet context={{ user, triggerPostsFetch }} />
      </div>
      <div className="right-bar max-lg:hidden">
        <UserSearch />
        <div className="pt-4 pb-2 mt-6 rounded-xl suggestion-box">
          <p className="font-bold mb-5 text-xl px-3">You might like</p>
          <div>
            {suggestedUsers.map((user) => (
              <div
                className="flex justify-between items-center cursor-pointer px-3 py-2 hover:bg-[rgb(0,0,0,0.03)] dark:hover:bg-[rgb(255,255,255,0.08)]"
                key={user.id}
                onClick={(e) => goToProfile(user, e)}
              >
                <div className="flex gap-2">
                  <img
                    className="rounded-full post-profile-img hover:brightness-[0.9]"
                    src={user.profileImgUrl || personPlaceholder}
                    alt=""
                  />
                  <div>
                    <p className="hover:underline font-medium">{user.name}</p>
                    <p className="text-slate-600 dark:text-gray-500 text-sm">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <button
                  className="!rounded-full !px-4 !py-1 ignore"
                  onClick={() => toggleFollow(user)}
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        contentLabel="Create Post"
        bodyOpenClassName="modal-open"
      >
        <div className="rounded-full hover:bg-slate-300 hover:dark:bg-gray-700 cursor-pointer w-fit p-1 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
            onClick={() => setIsOpen(false)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
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
          <div className="flex justify-between items-center pb-4 px-1 border-b border-[rgb(185,202,211)] dark:border-[rgb(47,51,54)]">
            <div className="flex items-center gap-2 pl-2 relative">
              <label htmlFor="image1" className="cursor-pointer">
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
                id="image1"
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageUpload}
              />
              {isPickerVisible ? (
                <div
                  ref={pickerDropRef}
                  style={{ position: "absolute", top: 25 }}
                >
                  <EmojiPicker
                    theme={isDarkMode ? "dark" : "light"}
                    onEmojiClick={handleEmojiClick}
                  />
                </div>
              ) : null}
              <svg
                ref={pickerTriggerRef}
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
            <div className="flex justify-center">
              {wordCount ? (
                <span className="mr-2 text-blue mt-1">{wordCount}/300</span>
              ) : null}
              <button
                className="!py-1 !px-4 !rounded-full flex justify-center"
                disabled={wordCount > 300}
              >
                {createLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 4V2m0 20v-2m8-14h2M4 12H2m15.293 15.293l-1.414-1.414M4.293 4.293l1.414 1.414m16 0l-1.414 1.414M4 20l1.414-1.414"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
                Post
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Layout;
