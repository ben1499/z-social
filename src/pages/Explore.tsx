import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import Feed from "../components/Feed";
import useWatchEffect from "../hooks/useWatchEffect";
import { useNavigate, useLocation } from "react-router-dom";
import useStickyHeader from "../hooks/useStickyHeader";
import { User } from "../types/User";

export default function Explore() {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { stickyRef } = useStickyHeader();

  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = (query = "") => {
    setLoading(true);
    return Promise.all([
      axiosInst.get("/users", {
        params: {
          searchQuery: query,
          limit: 5,
        },
      }),
      axiosInst.get("posts", {
        params: {
          is_explore: true,
          searchQuery: query,
        },
      }),
    ])
      .then(([res1, res2]) => {
        setSuggestedUsers(res1.data.data.filter((user: User) => !user.isFollowing));
        setPosts(res2.data.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useWatchEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(searchInput);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const toggleFollow = (user: User) => {
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

  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchInput(e.currentTarget.value);
  };

  const goToProfile = (user: User, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.classList.contains("ignore")) return;
    navigate(`/${user.username}`, { state: { from: location } });
  };

  return (
    <div className="mt-2 min-h-screen">
      <div ref={stickyRef} className="mx-3 relative py-2 sticky-header">
        <input
          type="text"
          className="pl-10 border border-slate-300 dark:border-[rgb(51,54,57)] rounded-full w-full px-2 py-1 focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1"
          placeholder="Search users or posts"
          value={searchInput}
          onInput={handleSearch}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </div>
      {suggestedUsers.length ? (
        <div className="mt-4 mb-2 border-b border-[rgb(185,202,211)] dark:border-[rgb(47,51,54)]">
          <p className="font-bold text-2xl px-3">
            {searchInput ? "Users" : "Who to follow"}
          </p>
          <div className="mt-4">
            {suggestedUsers.map((user) => (
              <div
                className="flex justify-between items-center px-3 py-3 cursor-pointer hover:bg-[rgb(0,0,0,0.03)]"
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
                    <p className="hover:underline leading-5 font-semibold">
                      {user.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-gray-500">@{user.username}</p>
                    <p className="text-[15px] mt-[3px]">{user.bio}</p>
                  </div>
                </div>
                <button
                  className="!rounded-full !px-4 !py-1 ignore"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(user);
                  }}
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {posts.length ? (
        <div>
          <p className="font-bold text-2xl px-3 mb-3 mt-4">
            {searchInput ? "Posts" : "Posts for You"}
          </p>
          <Feed posts={posts} setPosts={setPosts} isLoading={isLoading} />
        </div>
      ) : (
        <p className="text-center text-slate-500 mt-4">No more posts found</p>
      )}
    </div>
  );
}
