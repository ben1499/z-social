import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function ProtectedRoute({ children }) {

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" state={{ isRedirect: true }} />
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node
};

export default ProtectedRoute;