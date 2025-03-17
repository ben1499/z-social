import { useNavigate } from "react-router-dom";
import Feed from "../components/Feed";
import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import useWatchEffect from "../hooks/useWatchEffect";
import useStickyHeader from "../hooks/useStickyHeader";

export default function Bookmarks() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setLoading] = useState(false);

  const { stickyRef } = useStickyHeader();

  const fetchPosts = (query = "") => {
    setLoading(true);
    return axiosInst
      .get("/bookmarks", {
        params: {
          searchQuery: query,
        },
      })
      .then((res) => {
        setPosts(res.data.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useWatchEffect(() => {
    const timeout = setTimeout(() => {
      fetchPosts(query);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [query]);

  const goBack = () => {
    if (location.state === null) {
      navigate("/home");
    } else {
      navigate(-1);
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="min-h-screen">
      <div ref={stickyRef} className="mb-3 mx-2 py-1 sticky-header">
        <div className="flex items-center gap-4 my-3">
          <div className="hover:bg-slate-300 dark:hover:bg-gray-800 rounded-full p-1">
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
          <p className="text-xl font-semibold">Bookmarks</p>
        </div>
        <div className="w-full relative">
          <input
            type="text"
            placeholder="Search Bookmarks"
            className="pl-10 border border-slate-200 dark:border-[rgb(51,54,57)] rounded-full px-3 py-1 w-full focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1"
            onInput={handleInput}
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
      </div>
      <Feed
        posts={posts}
        setPosts={setPosts}
        getPosts={fetchPosts}
        isLoading={isLoading}
      />
    </div>
  );
}
