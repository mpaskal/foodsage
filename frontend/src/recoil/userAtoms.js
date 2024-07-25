import { atom } from "recoil";

export const loggedInUserState = atom({
  key: "loggedInUserState",
  default: null,
});

export const authLoadingState = atom({
  key: "authLoadingState",
  default: true,
});

export const authTokenState = atom({
  key: "authTokenState",
  default: localStorage.getItem("token") || "",
});

export const isUserModalOpenState = atom({
  key: "isUserModalOpenState",
  default: false,
});

export const selectedUserState = atom({
  key: "selectedUserState",
  default: null,
});

export const usersState = atom({
  key: "usersState",
  default: [],
});

export const adminUsersState = atom({
  key: "adminUsersState",
  default: [],
});

export const isLoadingState = atom({
  key: "isLoadingState",
  default: false,
});

export const totalPagesState = atom({
  key: "totalPagesState",
  default: 0,
});

export const currentPageState = atom({
  key: "currentPageState",
  default: 1,
});

export const usersPerPageState = atom({
  key: "usersPerPageState",
  default: 10,
});
