import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Post from "./pages/Post";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";

const routes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    // errorElement: <Error />,
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "explore",
        element: <Explore />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "post/:id",
        element: <Post />,
      },
      {
        path: "bookmarks",
        element: <Bookmarks />,
      },
      {
        path: ":username",
        element: <Profile />,
      },
    ],
  },
];

export default routes;
