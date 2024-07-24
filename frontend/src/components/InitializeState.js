import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { loggedInUserState, authTokenState } from "../recoil/userAtoms";

const InitializeState = ({ children }) => {
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const setAuthToken = useSetRecoilState(authTokenState);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User retrieved from local storage:", user);
    if (user && user.token) {
      setLoggedInUser(user);
      setAuthToken(user.token);
    }
  }, [setLoggedInUser, setAuthToken]);

  return <>{children}</>;
};

export default InitializeState;
