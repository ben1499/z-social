import { useEffect, useState, createContext } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import axiosInst from "../config/axios";
import { UserContext } from "../contexts/userContext";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import useComponentVisible from "../hooks/useComponentVisible";

function Layout() {
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const { triggerRef, dropRef, isComponentVisible, setComponentVisible } =
    useComponentVisible();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axiosInst.get("/users/profile").then((res) => {
      setUser(res.data.data);
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
  }, []);

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

  return (
    <UserContext.Provider value={user}>
      <div className="flex">
        <div className="sidebar absolute">
          <div>
            <p className="text-4xl ml-6 mt-2 font-semibold">ℤ</p>
            <ul className="sidebar-list">
              <li>
                <Link to="/home" className="!w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={location.pathname === "/home" ? "black" : "none"}
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
                    fill={location.pathname === "/explore" ? "black" : "none"}
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
                  Explore
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
                          ? "black"
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
                  Notifications
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="!w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={location.pathname === "/bookmarks" ? "black" : "none"}
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
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link to={`/${user?.username}`} className="!w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={
                      location.pathname === `/${user?.username}`
                        ? "black"
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
                  Profile
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
                Sign Out
              </li>
            </ul>
            {user && isComponentVisible && (
              <ul
                className="absolute left-[0.6rem] bottom-[6.5rem] bg-white py-2 rounded-md drop-shadow-md z-10"
                ref={dropRef}
              >
                <li className="hover:bg-slate-100 py-3 px-4 cursor-pointer flex gap-3">
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
                <li className="hover:bg-slate-100 py-3 px-4 cursor-pointer flex gap-3">
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
              </ul>
            )}
          </div>
          {user ? (
            <div className="flex items-center justify-between relative mt-auto mb-6 hover:bg-[rgb(15,20,25,0.1)] rounded-full py-3 px-2 w-[120%]">
              <div className="flex gap-2">
                <Link to={`/${user.username}`} state={{ from: location }}>
                  <img
                    src={user.profileImgUrl || personPlaceholder}
                    className="post-profile-img rounded-full cursor-pointer hover:brightness-[0.9]"
                    alt=""
                  />
                </Link>
                <div>
                  <Link
                    to={`/${user.username}`}
                    state={{ from: location }}
                    className="!cursor-pointer"
                  >
                    <p>{user.name}</p>
                  </Link>
                  <p className="text-slate-600 text-sm cursor-pointer">
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
          <Outlet context={{ user }} />
        </div>
        <div className="right-bar">
          <input
            className="border-slate-200 border-2 rounded-full px-3 py-1"
            type="text"
            placeholder="Search"
          />
          <div className="border-2 p-4 mt-6 rounded-lg suggestion-box">
            <p className="font-bold mb-3">You might like</p>
            <div>
              {suggestedUsers.map((user) => (
                <div
                  className="flex justify-between items-center mb-4"
                  key={user.id}
                >
                  <div className="flex gap-2">
                    <img
                      className="rounded-full post-profile-img"
                      src={user.profileImgUrl || personPlaceholder}
                      alt=""
                    />
                    <div>
                      {user.name}
                      <p className="text-slate-600 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    className="!rounded-full !px-4 !py-1"
                    onClick={() => toggleFollow(user)}
                  >
                    {user.isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default Layout;
