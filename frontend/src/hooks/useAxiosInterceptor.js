import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { toast } from "react-toastify";
import { loggedInUserState } from "../recoil/userAtoms";

const useAxiosInterceptor = () => {
  const navigate = useNavigate();
  const setLoggedInUser = useSetRecoilState(loggedInUserState);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("user");
          setLoggedInUser(null);

          toast.info("Your session has expired. Please sign in again.", {
            onClose: () => navigate("/signin"),
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, setLoggedInUser]);
};

export default useAxiosInterceptor;
