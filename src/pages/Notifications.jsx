import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import useStickyHeader from "../hooks/useStickyHeader";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const { stickyRef } = useStickyHeader();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    axiosInst
      .get("/notifications", {
        params: {
          limit: 10,
        },
      })
      .then((res) => {
        setNotifications(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const goToPost = (e, notification) => {
    if (e.target.classList.contains("ignore") && notification.sender) {
      return navigate(`/${notification.sender.username}`);
    }
    if (notification.postId) {
      navigate(`/post/${notification.postId}`, { state: { from: location } });
    }
  };

  const goBack = () => {
    if (location.state === null) {
      navigate("/home");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-[95vh]">
      <div ref={stickyRef} className="flex items-center gap-2 px-3 my-1 border-b border-[rgb(185,202,211)] dark:border-[rgb(47,51,54)] sticky-header p-2">
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
        <p className="font-bold text-xl">
          Notifications
        </p>
      </div>
      <div>
        {isLoading ? (
          <div className="flex justify-center h-50 overflow-hidden mt-4">
            <svg
              className="mr-3 size-5 animate-spin overflow-hidden"
              viewBox="0 0 24 24"
            >
              <path
                className="opacity-25"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : notifications.length ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-3 w-[100%] notification-item cursor-pointer border-b border-[rgb(185,202,211)] dark:border-[rgb(47,51,54)] px-2 py-3"
              onClick={(e) => goToPost(e, notification)}
            >
              {notification.type === "LIKE" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#F91880"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="none"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              ) : notification.type === "REPOST" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#00BA7C"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </svg>
              )}

              <div>
                <img
                  src={notification.sender.profileImgUrl || personPlaceholder}
                  className="post-profile-img rounded-full ignore"
                  alt=""
                />
                <p className="text-base ignore">{notification.content}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {notification.post?.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center mt-4 text-slate-600 dark:text-gray-500">
            You have no notifications
          </p>
        )}
      </div>
    </div>
  );
}
