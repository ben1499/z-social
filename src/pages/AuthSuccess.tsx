import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    // Get the token from URL fragment
    const fragment = window.location.hash.substring(1);
    const params = new URLSearchParams(fragment);
    const token = params.get("token");
    const userId = params.get("user_id");

    if (token && userId) {
      // Store token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", userId);

      window.location.href = "/home";
    }
  }, []);

  return (
    <div className="flex justify-center items-center mt-64">
      <div className="flex flex-col items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <p className="text-3xl">Authenticated Successfully</p>
        <p className="text-slate-600">
          Redirecting you to the application, please wait...
        </p>
      </div>
    </div>
  );
}
