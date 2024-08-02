// hooks/useSessionManager.js
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import {
  loggedInUserState,
  sessionExpiredState,
  authTokenState,
} from "../recoil/userAtoms";
import { toast } from "react-toastify";

export const useSessionManager = () => {
  const setUser = useSetRecoilState(loggedInUserState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const setAuthToken = useSetRecoilState(authTokenState);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken("");
    setUser(null);
    setSessionExpired(false);
    toast.info("Your session has ended. Please sign in again.");
  }, [setAuthToken, setUser, setSessionExpired]);

  return { logout };
};
