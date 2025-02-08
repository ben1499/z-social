import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import Feed from "../components/Feed";

export default function Explore() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    axiosInst
      .get("/users", {
        params: {
          searchQuery: "",
          limit: 5,
        },
      })
      .then((res) => {
        setSuggestedUsers(res.data.data.filter((user) => !user.isFollowing));
      });

    axiosInst
      .get("posts", {
        params: {
          is_explore: true,
        },
      })
      .then((res) => {
        console.log(res.data);
        setPosts(res.data.data);
      });
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

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Fetching");
      axiosInst
        .get("/users", {
          params: {
            searchQuery: searchInput,
          },
        })
        .then((res) => {
          setSuggestedUsers(res.data.data);
        });

      axiosInst
        .get("/posts", {
          params: {
            is_explore: true,
            searchQuery: searchInput,
          },
        })
        .then((res) => {
          setPosts(res.data.data);
        });
    }, 1200);

    return () => clearTimeout(timeout);
  }, [searchInput]);

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
          <Feed posts={posts} />
        </div>
      ) : (
        <p className="text-center text-slate-500 mt-4">No more posts found</p>
      )}
    </div>
  );
}
