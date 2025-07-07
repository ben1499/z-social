import { Navigate } from "react-router-dom";
import { PropsWithChildren } from "react";

function ProtectedRoute({ children }: PropsWithChildren<{}>) {

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" state={{ isRedirect: true }} />
  }

  return children;
}

export default ProtectedRoute;
