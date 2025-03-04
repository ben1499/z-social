import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInst from "../config/axios";
import Feed from "../components/Feed";
import profilePlaceholder from "../assets/person-placeholder.jpeg";
import Modal from "react-modal";

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
    padding: 0,
    paddingBottom: "30px",
  },
};

const tabs = [
  {
    id: 1,
    label: "Posts",
  },
  {
    id: 2,
    label: "Likes",
  },
  {
    id: 3,
    label: "Media",
  },
];

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const stickyRef = useRef(null);
  const location = useLocation();

  const [modalIsOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(1);
  const [posts, setPosts] = useState([]);
  const [postImages, setPostImages] = useState([]);
  const [createErrors, setCreateErrors] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isSaveLoading, setSaveLoading] = useState(false);
  const [editModel, setEditModel] = useState({
    name: "",
    bio: "",
    profileImgUrl: null,
    coverImgUrl: null,
  });
  const [uploadedProfileImg, setUploadedProfileImg] = useState(null);
  const [uploadedCoverImg, setUploadedCoverImg] = useState(null);

  const editForm = useRef();

  const createNameError = createErrors?.find((error) => error.path === "name");

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
          clearTimeout(timeoutId);
        };
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    axiosInst.get(`/users/${username}`).then((res) => {
      const userData = res.data.data;
      setUser(userData);

      axiosInst
        .get("/posts", {
          params: {
            is_explore: false,
            user_id: userData.id,
          },
        })
        .then((res) => {
          setPosts(res.data.data);
        });
    });
  }, [username]);

  const fetchUser = () => {
    axiosInst.get(`/users/${username}`).then((res) => {
      const userData = res.data.data;
      setUser(userData);
    });
  };

  const fetchPosts = () => {
    if (user) {
      axiosInst
        .get("/posts", {
          params: {
            is_explore: false,
            user_id: user.id,
          },
        })
        .then((res) => {
          setPosts(res.data.data);
        });
    }
  };

  const handleTabChange = (id) => {
    if (id === selectedTab) return;
    setSelectedTab(id);
    switch (id) {
      case 1:
        fetchPosts();
        break;
      case 2:
        axiosInst.get(`/posts/liked-by/${user.id}`).then((res) => {
          setPosts(res.data.data);
        });
        break;
      case 3:
        axiosInst.get(`/users/${user.id}/media`).then((res) => {
          setPostImages(res.data.data);
        });
        break;
    }
  };

  const goBack = () => {
    if (location.state === null) {
      navigate("/home");
    } else {
      navigate(-1);
    }
  };

  const goToPost = (id) => {
    return () => {
      navigate(`/post/${id}`, { state: { from: location } });
    };
  };

  const closeModal = () => {
    setCreateErrors(null);
    setIsOpen(false);
  };

  const submitForm = (e) => {
    e.preventDefault();
    const isValid = editForm.current.reportValidity();
    if (isValid) {
      setSaveLoading(true);
      const payload = {
        ...editModel,
        profileImgUrl: uploadedProfileImg || editModel.profileImgUrl,
        coverImgUrl: uploadedCoverImg || editModel.coverImgUrl,
      };
      axiosInst
        .put("/users/profile", payload)
        .then(() => {
          setIsOpen(false);
          setUploadedCoverImg(null);
          setUploadedProfileImg(null);

          fetchUser();
          fetchPosts();
        })
        .catch((err) => {
          if (err.response.data.errors) {
            setCreateErrors(err.response.data.errors);
          }
        })
        .finally(() => setSaveLoading(false));
    }
  };

  const handleEditModelChange = (e) => {
    switch (e.target.name) {
      case "name":
        setEditModel({ ...editModel, name: e.target.value });
        break;
      case "bio":
        setEditModel({ ...editModel, bio: e.target.value });
        break;
    }
  };

  const showModal = () => {
    setEditModel({
      name: user.name,
      bio: user.bio,
      profileImgUrl: user.profileImgUrl,
      coverImgUrl: user.coverImgUrl,
    });
    setIsOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    axiosInst
      .post("/images", formData)
      .then((res) => {
        if (e.target.id === "profile-img") {
          setUploadedProfileImg(res.data.url);
        } else {
          setUploadedCoverImg(res.data.url);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeImage = (e) => {
    const id = e.currentTarget.id;
    const image_id =
      id === "profile-img"
        ? uploadedProfileImg.match(/z-social\/[a-zA-Z0-9]+/g)
        : uploadedCoverImg.match(/z-social\/[a-zA-Z0-9]+/g);
    axiosInst
      .delete("/images/", {
        params: {
          image_id,
        },
      })
      .then(() => {
        if (id === "profile-img") {
          setUploadedProfileImg(null);
        } else {
          setUploadedCoverImg(null);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleFollow = () => {
    if (user.isFollowing) {
      axiosInst
        .delete(`/users/follow/${user.id}`)
        .then(() => {
          fetchUser();
        })
        .catch((err) => console.log(err));
    } else {
      axiosInst
        .post(`/users/follow/${user.id}`)
        .then(() => {
          fetchUser();
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <div>
      <div>
        {user && (
          <>
            <div
              className="flex items-center gap-4 py-1 pl-3 z-10 sticky-header"
              ref={stickyRef}
            >
              <div className="hover:bg-slate-300 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                  onClick={goBack}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold">{user.name}</p>
                <p className="text-slate-500 text-sm">
                  {user.postCount} {user.postCount === 1 ? "post" : "posts"}
                </p>
              </div>
            </div>
            <div className="relative">
              <img className="cover-bg" src={user?.coverImgUrl} alt="" />
              <img
                className="profile-img"
                src={user.profileImgUrl || profilePlaceholder}
                alt=""
              />
            </div>
            <div className="mt-[70px] pl-3 relative">
              {user?.isCurrentUser ? (
                <button
                  className="edit-profile-btn !rounded-full !px-4 !py-1"
                  onClick={showModal}
                >
                  Edit Profile
                </button>
              ) : user?.isFollowing ? (
                <button
                  className="!rounded-full !px-4 !py-1 edit-profile-btn"
                  onClick={toggleFollow}
                >
                  Following
                </button>
              ) : (
                <button
                  className="!rounded-full !px-4 !py-1 absolute top-[-55px] right-[12px]"
                  onClick={toggleFollow}
                >
                  Follow
                </button>
              )}

              <div className="mb-2">
                <p className="font-semibold text-xl">{user.name}</p>
                <p className="text-slate-500 text-sm leading-none">
                  @{user.username}
                </p>
              </div>
              <p className="my-1">{user.bio}</p>
              <p className="flex items-center text-slate-500 gap-1 my-1 text-sm">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                Joined {user.createdAt}
              </p>
              <div className="flex gap-4 text-sm mt-3">
                <p>
                  <span className="font-semibold">{user.followingCount}</span>{" "}
                  Following
                </p>
                <p>
                  <span className="font-semibold">{user.followerCount}</span>{" "}
                  Followers
                </p>
              </div>
            </div>
            <div className="flex *:flex-1 mt-3 *:cursor-pointer *:flex *:flex-col *:items-center border-b tabs">
              {tabs.map((tab) => (
                <div
                  className={
                    selectedTab === tab.id
                      ? "hover:bg-slate-100 py-3 relative active"
                      : "hover:bg-slate-100 py-3 relative"
                  }
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </div>
              ))}
            </div>
            <div>
              {selectedTab != 3 ? (
                <Feed posts={posts} getPosts={fetchPosts} setPosts={setPosts} />
              ) : (
                <div className="media-grid">
                  {postImages.length ? (
                    postImages.map((postImage) => (
                      <img
                        src={postImage.imgUrl}
                        key={postImage.id}
                        onClick={goToPost(postImage.id)}
                      />
                    ))
                  ) : (
                    <p className="text-center text-slate-500 mt-2">
                      No media found
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        contentLabel="Sign up"
        bodyOpenClassName="modal-open"
      >
        <div className="flex justify-between items-center px-2 py-2">
          <div className="flex gap-4">
            <div className="icon-value">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 rounded-full"
                onClick={closeModal}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold">Edit profile</p>
          </div>
          <button
            className="!rounded-full !px-4 !py-1 flex justify-center"
            disabled={isSaveLoading}
            onClick={submitForm}
          >
            {isSaveLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path
                  d="M12 4V2m0 20v-2m8-14h2M4 12H2m15.293 15.293l-1.414-1.414M4.293 4.293l1.414 1.414m16 0l-1.414 1.414M4 20l1.414-1.414"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
            Save
          </button>
        </div>
        <div className="relative">
          <div className="relative">
            <img
              className="cover-bg"
              src={uploadedCoverImg || editModel?.coverImgUrl}
              alt=""
            />
            <div className="absolute bottom-[-50px] left-2">
              <div className="relative">
                <div className="inline-block border-4 border-white dark:border-black rounded-full">
                  {uploadedProfileImg && (
                    <button
                      id="profile-img"
                      className="post-img-remove z-10"
                      onClick={removeImage}
                    >
                      X
                    </button>
                  )}
                  <img
                    className="rounded-full size-28 object-cover brightness-50 bg-black/30"
                    src={
                      uploadedProfileImg ||
                      editModel?.profileImgUrl ||
                      profilePlaceholder
                    }
                    alt=""
                  />
                </div>
                {!uploadedProfileImg && (
                  <div className="center-absolute rounded-full hover:bg-black/10 p-2 cursor-pointer">
                    <label htmlFor="profile-img" className="cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="white"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                        />
                      </svg>
                    </label>
                    <input
                      type="file"
                      className="hidden"
                      id="profile-img"
                      accept="image/png, image/jpeg, image/webp"
                      disabled={isLoading}
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {uploadedCoverImg ? (
            <div
              className="center-absolute rounded-full bg-slate-400 hover:bg-slate-400/90 p-2 cursor-pointer"
              id="cover-img"
              onClick={removeImage}
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
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
          ) : (
            <div className="center-absolute rounded-full bg-slate-400 hover:bg-slate-400/90 p-2 cursor-pointer">
              <label htmlFor="cover-img" className="cursor-pointer">
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
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                  />
                </svg>
              </label>
              <input
                type="file"
                className="hidden"
                id="cover-img"
                accept="image/png, image/jpeg, image/webp"
                disabled={isLoading}
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>

        <form ref={editForm} className="px-4 edit-form mt-[4.3rem]">
          <div className="mt-3 label-field" tabIndex={0}>
            <input
              className="w-full block rounded-sm"
              type="text"
              id="name"
              name="name"
              placeholder=""
              required
              value={editModel.name}
              onChange={handleEditModelChange}
            />
            <label className="flex justify-between" htmlFor="name">
              <p>Name</p>
              {/* <p>1/50</p> */}
            </label>
            <p className="text-red-500 text-sm italic">
              {createNameError ? createNameError.msg : null}
            </p>
          </div>
          <div className="mt-3 label-field">
            <textarea
              id="bio"
              className="w-full block rounded-sm"
              placeholder=""
              type="email"
              name="bio"
              value={editModel.bio}
              onChange={handleEditModelChange}
            />
            <label htmlFor="bio">Bio</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
