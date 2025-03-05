import { useState } from "react";
import useComponentVisible from "../hooks/useComponentVisible";
import axiosInst from "../config/axios";
import useWatchEffect from "../hooks/useWatchEffect";
import { useNavigate } from "react-router-dom";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import { useLocation } from "react-router-dom";

export default function UserSearch() {
  const [searchInput, setSearchInput] = useState("");
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const { dropRef, triggerRef, isComponentVisible, setComponentVisible } =
    useComponentVisible();

  useWatchEffect(() => {
    const timer = setTimeout(() => {
      axiosInst
        .get("/users", {
          params: {
            searchQuery: searchInput,
            limit: 5,
          },
        })
        .then((res) => {
          setUsers(res.data.data);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const goToProfile = (user) => {
    setComponentVisible(false);
    setSearchInput("");
    navigate(`/${user.username}`, { state: { from: location } });
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={triggerRef}
          className="pl-10 border-slate-200 border-2 rounded-full px-3 py-2 w-[330px] focus:outline-[rgb(29,155,240)] dark:outline-none dark:bg-gray-800 dark:border-none dark:text-white"
          type="text"
          placeholder="Search"
          value={searchInput}
          onInput={handleSearch}
          onClick={() => setComponentVisible(true)}
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

      {isComponentVisible && (
        <div
          ref={dropRef}
          className="border-2 w-[92%] absolute rounded-md left-1 z-10 bg-white dark:bg-gray-900 dark:border-gray-600 drop-shadow-sm"
        >
          {searchInput ? (
            <div>
              {users.length ? (
                users.map((user) => (
                  <div
                    className="cursor-pointer px-3 py-2 hover:bg-[rgb(0,0,0,0.03)]"
                    key={user.id}
                    onClick={() => goToProfile(user)}
                  >
                    <div className="flex gap-2">
                      <img
                        className="rounded-full post-profile-img hover:brightness-[0.9]"
                        src={user.profileImgUrl || personPlaceholder}
                        alt=""
                      />
                      <div>
                        <p className="hover:underline font-medium">
                          {user.name}
                        </p>
                        <p className="text-slate-500 text-sm">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-sm p-2">No users found</p>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-sm h-[40px] p-2">
              Try searching for users
            </div>
          )}
        </div>
      )}
    </div>
  );
}
