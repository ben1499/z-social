import { useEffect, useState, useRef, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../contexts/ThemeContext";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    width: "35%",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    paddingLeft: "25px",
    paddingRight: "25px",
    borderRadius: "20px"
  },
};

const url = import.meta.env.VITE_API_URL;

function Login() {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState(null);
  const [loginErrors, setLoginErrors] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const { isDarkMode } = useContext(ThemeContext);

  const createForm = useRef();
  const loginForm = useRef();

  const navigate = useNavigate();

  const [createModel, setCreateModel] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [loginModel, setLoginModel] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/home");
    }
  }, [navigate]);

  const closeModal = () => {
    setCreateErrors(null);
    setIsOpen(false);
  };

  const handleLoginModelChange = (e) => {
    switch (e.target.name) {
      case "email":
        setLoginModel({ ...loginModel, email: e.target.value });
        break;
      case "password":
        setLoginModel({ ...loginModel, password: e.target.value });
        break;
    }
  };

  const handleCreateModelChange = (e) => {
    switch (e.target.name) {
      case "username":
        setCreateModel({ ...createModel, username: e.target.value });
        break;
      case "name":
        setCreateModel({ ...createModel, name: e.target.value });
        break;
      case "email":
        setCreateModel({ ...createModel, email: e.target.value });
        break;
      case "password":
        setCreateModel({ ...createModel, password: e.target.value });
        break;
    }
  };

  const submitCreateForm = (e) => {
    e.preventDefault();
    const isValid = createForm.current.reportValidity();
    if (isValid) {
      setLoading(true);
      axios
        .post(`${url}/auth/signup`, createModel)
        .then(() => {
          setIsOpen(false);
        })
        .catch((err) => {
          if (err.response.data.errors) {
            console.log(err.response.data.errors);
            setCreateErrors(err.response.data.errors);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const createUsernameError = createErrors?.find(
    (error) => error.path === "username"
  );
  const createNameError = createErrors?.find((error) => error.path === "name");
  const createEmailError = createErrors?.find(
    (error) => error.path === "email"
  );
  const createPasswordError = createErrors?.find(
    (error) => error.path === "password"
  );

  const submitLoginForm = (e) => {
    e.preventDefault();
    const isValid = loginForm.current.reportValidity();
    if (isValid) {
      setLoading(true);
      axios
        .post(`${url}/auth/login`, loginModel)
        .then((res) => {
          setLoginErrors(null);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user_id", res.data.user_id);
          navigate("/home");
        })
        .catch((err) => {
          if (err.response.data.errors) {
            setLoginErrors(err.response.data.errors);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const handleTwitterLogin = () => {
    window.location.href = `${url}/auth/twitter`;
  };

  const loginEmailError = loginErrors?.find((error) => error.path === "email");
  const loginPasswordError = loginErrors?.find(
    (error) => error.path === "password"
  );
  const loginOtherError = loginErrors?.find((error) => !error.path);

  return (
    <div className="h-screen flex justify-center items-center gap-44">
      <div>
        <h1 className="font-[XCompany] text-[27rem]">Z</h1>
      </div>
      <div>
        <h1 className="mb-8 text-7xl font-semibold">Happening now</h1>
        <h3 className="text-3xl mb-9 font-medium">Join today.</h3>
        <div className="w-3/5">
          <form ref={loginForm} method="post" onSubmit={submitLoginForm}>
            <div>
              <label htmlFor="">Email</label>
              <input
                className="w-full block border border-slate-300 dark:border-[rgb(51,54,57)] rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                placeholder="xyz@gmail.com"
                name="email"
                type="email"
                required
                onChange={handleLoginModelChange}
              />
              <p className="text-red-500 text-sm italic">
                {loginEmailError ? loginEmailError.msg : null}
              </p>
            </div>
            <div className="mt-3">
              <label htmlFor="">Password</label>
              <input
                className="w-full block border border-slate-300 dark:border-[rgb(51,54,57)] rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                placeholder="********"
                name="password"
                type="password"
                required
                onChange={handleLoginModelChange}
              />
              <p className="text-red-500 text-sm italic">
                {loginPasswordError ? loginPasswordError.msg : null}
              </p>
            </div>
            <p className="text-red-500 text-sm italic">
              {loginOtherError ? loginOtherError.msg : null}
            </p>
            <div className="mt-3">
              <button
                type="submit"
                className="blue-btn w-full py-2 flex justify-center"
                onClick={submitLoginForm}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 4V2m0 20v-2m8-14h2M4 12H2m15.293 15.293l-1.414-1.414M4.293 4.293l1.414 1.414m16 0l-1.414 1.414M4 20l1.414-1.414"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
                Sign in
              </button>
              <div className="flex items-center gap-4 my-1">
                <div className="divide-border grow"></div>
                <div>or</div>
                <div className="divide-border grow"></div>
              </div>
              <button
                type="button"
                className="flex justify-center w-full py-2 my-2"
                disabled={isLoading}
                onClick={handleTwitterLogin}
              >
                <svg
                  fill={isDarkMode ? "black" : "white"}
                  style={{ width: "30px", height: "25px" }}
                  aria-hidden="true"
                >
                  <g>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </g>
                </svg>
                Sign in with X
              </button>
              <p className="text-center">
                Don{"'"}t have an account?{" "}
                <a className="!cursor-pointer !text-blue-500 hover:!underline" onClick={() => setIsOpen(true)}>
                  Create account
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        shouldCloseOnOverlayClick={false}
        contentLabel="Sign up"
      >
        <h2 className="text-3xl font-semibold mb-6">Create account</h2>
        <form ref={createForm}>
          <div>
            <label htmlFor="">Username</label>
            <input
              className="w-full block bg-white dark:bg-black border border-slate-300 dark:border-[rgb(51,54,57)] rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
              placeholder="Username"
              type="text"
              name="username"
              required
              autoComplete="off"
              onChange={handleCreateModelChange}
            />
            <p className="text-red-500 text-sm italic">
              {createUsernameError ? createUsernameError.msg : null}
            </p>
          </div>
          <div className="mt-3">
            <label htmlFor="">Name</label>
            <input
              className="w-full block bg-white dark:bg-black border border-slate-300 dark:border-[rgb(51,54,57)] rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
              placeholder="John Doe"
              type="text"
              name="name"
              required
              onChange={handleCreateModelChange}
            />
            <p className="text-red-500 text-sm italic">
              {createNameError ? createNameError.msg : null}
            </p>
          </div>
          <div className="mt-3">
            <label htmlFor="">Email</label>
            <input
              className="w-full block bg-white dark:bg-black border border-slate-300 dark:border-[rgb(51,54,57)] rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
              placeholder="xyz@gmail.com"
              type="email"
              name="email"
              required
              autoComplete="off"
              onChange={handleCreateModelChange}
            />
            <p className="text-red-500 text-sm italic">
              {createEmailError ? createEmailError.msg : null}
            </p>
          </div>
          <div className="mt-3">
            <label htmlFor="">Password</label>
            <input
              className="w-full block bg-white dark:bg-black border border-slate-300 dark:border-[rgb(51,54,57)] rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
              placeholder="********"
              type="password"
              name="password"
              required
              onChange={handleCreateModelChange}
              autoComplete="new-password"
              spellCheck="false"
              autoCorrect="false"
            />
            <p className="text-red-500 text-sm italic">
              {createPasswordError ? createPasswordError.msg : null}
            </p>
          </div>
          <div className="flex justify-end mt-7 gap-4">
            <button
              className="!py-1 !px-3 !rounded-lg"
              disabled={isLoading}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="!py-1 !px-3 !rounded-lg flex justify-center"
              onClick={submitCreateForm}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    d="M12 4V2m0 20v-2m8-14h2M4 12H2m15.293 15.293l-1.414-1.414M4.293 4.293l1.414 1.414m16 0l-1.414 1.414M4 20l1.414-1.414"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
              Sign up
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Login;
