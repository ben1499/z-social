import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import Feed from "../components/Feed";
import useWatchEffect from "../hooks/useWatchEffect";
import { useNavigate, useLocation } from "react-router-dom";

export default function Explore() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

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
        setSuggestedUsers(res1.data.data.filter((user) => !user.isFollowing));
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

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const goToProfile = (user, e) => {
    if (e.target.classList.contains("ignore")) return;
    navigate(`/${user.username}`, { state: { from: location } });
  }

  return (
    <div className="mt-2">
      <div className="mx-3">
        <input
          type="text"
          className="border-2 rounded-full w-full px-2 py-1"
          placeholder="Search users or posts"
          value={searchInput}
          onInput={handleSearch}
        />
      </div>
      {suggestedUsers.length ? (
        <div className="mt-4 mb-2 border-b">
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
                    <p className="hover:underline leading-5 font-semibold">{user.name}</p>
                    <p className="text-sm text-slate-600">@{user.username}</p>
                    <p className="text-[15px] mt-[3px]">{user.bio}</p>
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
