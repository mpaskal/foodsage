import React from "react";
import { useSetRecoilState } from "recoil";
import { loggedInUserState } from "../recoil/userAtoms";

const InitializeState = ({ children }) => {
  const setLoggedInUser = useSetRecoilState(loggedInUserState);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User retrieved from local storage:", user);
    if (user && user.token) {
      setLoggedInUser(user);
    }
  }, [setLoggedInUser]);

  return <>{children}</>;
};

export default InitializeState;
