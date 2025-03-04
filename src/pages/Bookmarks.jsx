import { useNavigate } from "react-router-dom";
import Feed from "../components/Feed";
import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import useWatchEffect from "../hooks/useWatchEffect";

export default function Bookmarks() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setLoading] = useState(false);

  const fetchPosts = (query = "") => {
    setLoading(true);
    return axiosInst
      .get("/bookmarks", {
        params: {
          searchQuery: query
        }
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
    }, 1000)

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
  }

  return (
    <div>
      <div className="mb-3 mx-2">
        <div className="flex items-center gap-4 my-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 hover:animate-bounce"
            onClick={goBack}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          <p className="text-xl font-semibold">Bookmarks</p>
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Search Bookmarks"
            className="border-slate-200 border-2 rounded-full px-3 py-1 w-full"
            onInput={handleInput}
          />
        </div>
      </div>
      <Feed posts={posts} setPosts={setPosts} getPosts={fetchPosts} isLoading={isLoading} />
    </div>
  );
}
