import { atom } from "recoil";

export const currentPageState = atom({
  key: "currentPageState",
  default: 1,
});

export const usersPerPageState = atom({
  key: "usersPerPageState",
  default: 10,
});
