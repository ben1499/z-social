import { useEffect, useState } from "react";
import axiosInst from "../config/axios";
import personPlaceholder from "../assets/person-placeholder.jpeg";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axiosInst.get("/notifications").then((res) => {
      setNotifications(res.data.data);
    });
  }, []);

  return (
    <div>
      <p className="font-bold text-xl border-b p-2">Notifications</p>
      <div>
        {notifications.map((notification) => (
          <div key={notification.id} className="flex gap-3 notification-item border-b px-2 py-3">
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
                className="post-profile-img rounded-full"
                alt=""
              />
              <p className="text-base">{notification.content}</p>
              <p className="mt-2 text-sm text-slate-500">{notification.post?.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
