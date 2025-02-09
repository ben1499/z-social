import { useEffect, useState, useRef } from "react";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import Feed from "../components/Feed";

export default function Explore() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const isFirstMount = useRef(true);

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
    fetchData().then(() => {
      isFirstMount.current = false;
    });
  }, []);

  useEffect(() => {
    if (isFirstMount.current) return;
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
        <div className="mt-4 mb-2 border-b px-3">
          <p className="font-bold text-2xl">
            {searchInput ? "Users" : "Who to follow"}
          </p>
          <div className="mt-4">
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
                    <p className="text-sm">@{user.username}</p>
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
      ) : null}
      {posts.length ? (
        <div>
          <p className="font-bold text-2xl px-3 mb-3">
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
