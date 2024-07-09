// File: frontend/src/hooks/useAxiosInterceptor.js

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
          // Token has expired
          localStorage.removeItem("user"); // Clear the user from local storage
          setLoggedInUser(null); // Clear the user from Recoil state

          // Show a friendly message to the user
          toast.info(
            "Your session has expired. Please sign in again to continue.",
            {
              onClose: () => navigate("/signin"),
            }
          );
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Remove the interceptor when the component unmounts
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, setLoggedInUser]);
};

export default useAxiosInterceptor;
