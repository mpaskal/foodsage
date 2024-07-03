import { atom } from "recoil";

export const usersState = atom({
  key: "usersState",
  default: [],
});

export const loggedInUserState = atom({
  key: "loggedInUserState",
  default: null,
});

export const userState = atom({
  key: "userState",
  default: null,
});

export const adminUsersState = atom({
  key: "adminUsersState",
  default: [],
});

export const isUserModalOpenState = atom({
  key: "isUserModalOpenState",
  default: false,
});

export const selectedUserState = atom({
  key: "selectedUserState",
  default: null,
});

export const isLastAdminState = atom({
  key: "isLastAdminState",
  default: false,
});
