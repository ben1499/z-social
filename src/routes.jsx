import App from "./App";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";

const routes = [
    // {
    //     path: "/",
    //     element: <App />,
    // },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        // errorElement: <Error />,
        element: <ProtectedRoute>
          <Layout />
        </ProtectedRoute>,
        children: [
          {
            index: true,
            element: <Navigate to="/home" replace />
          },
          {        
            path: "home",
            element: <Home />,
          },
        //   {
        //     path: "/profile/:id",
        //     element: <Profile />,
        //   }
        ]
      }
]

export default routes;