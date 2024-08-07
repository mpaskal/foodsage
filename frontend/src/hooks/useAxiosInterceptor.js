// useAxiosInterceptor.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { toast } from "react-toastify";
import {
  loggedInUserState,
  authTokenState,
  sessionExpiredState,
} from "../recoil/userAtoms";
import api from "../utils/api";

const useAxiosInterceptor = () => {
  const navigate = useNavigate();
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const authToken = useRecoilValue(authTokenState);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (authToken) {
          config.headers["Authorization"] = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setLoggedInUser(null);
          setSessionExpired(true);
          toast.error("Your session has expired. Please sign in again.");
          navigate("/signin");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, setLoggedInUser, setSessionExpired, authToken]);
};

export default useAxiosInterceptor;
