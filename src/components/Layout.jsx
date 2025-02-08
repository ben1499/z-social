import { useEffect, useState, createContext } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import axiosInst from "../config/axios";
import { UserContext } from "../contexts/userContext";
import personPlaceholder from "../assets/person-placeholder.jpeg";

function Layout() {
  const [user, setUser] = useState(null);

  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const [notificationCount, setNotificationCount] = useState(0);

  const location = useLocation();

  useEffect(() => {
    axiosInst.get("/users/profile").then((res) => {
      console.log(res.data.data);
      setUser(res.data.data);
    });

    axiosInst.get("/users", {
      params: {
        searchQuery: "",
        limit: 5
      }
    })
    .then((res) => {
      setSuggestedUsers(res.data.data);
    })

    axiosInst.get("notifications/unread")
    .then((res) => {
      setNotificationCount(res.data.data.unreadCount);
    }).catch((err) => console.log(err))
  }, []);

  const toggleFollow = (user) => {
    if (user.isFollowing) {
      axiosInst.delete(`/users/follow/${user.id}`)
      .then(() => {
        const updatedSuggestUsers = suggestedUsers.map((item) => {
          if (item.id === user.id) {
            return {
              ...item,
              isFollowing: false
            }
          } else {
            return item;
          }
        })
        setSuggestedUsers(updatedSuggestUsers);
      }).catch((err) => console.log(err));
    } else {
      axiosInst.post(`/users/follow/${user.id}`)
      .then(() => {
        const updatedSuggestUsers = suggestedUsers.map((item) => {
          if (item.id === user.id) {
            return {
              ...item,
              isFollowing: true
            }
          } else {
            return item;
          }
        })
        setSuggestedUsers(updatedSuggestUsers);
      }).catch((err) => console.log(err));
    }
  }

  return (
    <UserContext.Provider value={user}>
      <div className="flex">
        <div className="sidebar">
          <p className="text-4xl ml-6 mt-2 font-semibold">ℤ</p>
          <ul className="sidebar-list">
            <li>
              <Link to="/home">
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
                <span className={location.pathname === "/home" ? "font-bold" : ""}>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/explore">
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
              <Link to="/notifications" onClick={() => setNotificationCount(0)}>
                <div className="relative">
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
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                  {notificationCount ? (
                    <p className="bg-blue-500 border-2 border-gray-500 text-white rounded-full -top-2 -end-1 absolute text-[10px] font-bold p-0.2 px-0.5">{notificationCount}</p>
                  ) : null}
                </div>
                Notifications
              </Link>
            </li>
            <li>
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
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </svg>
              Bookmarks
            </li>
            <li>
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
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              Profile
            </li>
            <li>
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
          {user ? (
          <div className="mt-auto flex">
            <img src={user.profileImgUrl || personPlaceholder} className="post-profile-img rounded-full" alt="" />
            <div>
              <p>{user.name}</p>
              @{user.username}
            </div>
          </div>
          ) : null}
        </div>
        <div className="w-2/6 center-section">
          <Outlet context={{ user }} />
        </div>
        <div className="right-bar">
          <input className="border-slate-200 border-2 rounded-full px-3 py-1" type="text" placeholder="Search" />
          <div className="border-2 p-4 mt-6 rounded-lg suggestion-box">
            <p className="font-bold mb-3">You might like</p>
            <div>
              {suggestedUsers.map((user) => (
                <div className="flex justify-between items-center mb-4" key={user.id}>
                  <div className="flex gap-2">
                    <img className="rounded-full post-profile-img" src={user.profileImgUrl || personPlaceholder} alt="" />
                    <div>
                      {user.name}
                      <p className="text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <button className="!rounded-full !px-4 !py-1" onClick={() => toggleFollow(user)}>{ user.isFollowing ? "Following" : "Follow"}</button>
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
