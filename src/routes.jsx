import App from "./App";
import Login from "./pages/Login";

const routes = [
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/login",
        element: <Login />,
    },
]

export default routes;