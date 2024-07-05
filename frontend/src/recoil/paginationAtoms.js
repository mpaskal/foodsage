import { atom } from "recoil";

/*
export const totalPagesState = atom({
  key: "totalPagesState",
  default: 0,
});

export const totalItemsState = atom({
  key: "totalItemsState",
  default: 0,
});




*/
export const currentPageState = atom({
  key: "currentPageState",
  default: 1,
});

export const usersPerPageState = atom({
  key: "usersPerPageState",
  default: 10,
});
