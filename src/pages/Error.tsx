import { Link } from "react-router-dom";

export default function Error() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-7xl">404</h2>
      <h5 className="text-2xl">Page not found</h5>
      <p className="mt-6 max-w-[450px] text-center">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link to="/home"><button className="mt-8">Go back home</button></Link>
    </div>
  );
}
