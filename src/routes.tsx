import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AuthSuccess from "./pages/AuthSuccess";
import Error from "./pages/Error";
import Loader from "./components/Loader";
import { Suspense, lazy } from "react";

const Explore = lazy(() => import("./pages/Explore"))
const Notifications = lazy(() => import("./pages/Notifications"))
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Post = lazy(() => import("./pages/Post"));
const Profile = lazy(() => import("./pages/Profile"));

const routes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/auth-success",
    element: <AuthSuccess />,
  },
  {
    path: "/",
    errorElement: <Error />,
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
        element: <Suspense fallback={<Loader />}><Explore /></Suspense>,
      },
      {
        path: "notifications",
        element: <Suspense fallback={<Loader />}><Notifications /></Suspense>,
      },
      {
        path: "post/:id",
        element: <Suspense fallback={<Loader />}>
          <Post />
        </Suspense>,
      },
      {
        path: "bookmarks",
        element: <Suspense fallback={<Loader />}><Bookmarks /></Suspense>
      },
      {
        path: ":username",
        element: <Suspense fallback={<Loader />}>
          <Profile />
        </Suspense>,
      },
    ],
  },
];

export default routes;
