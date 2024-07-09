import { atom } from "recoil";

export const wasteItemsState = atom({
  key: "wasteItemsState",
  default: [],
});

export const currentWasteItemState = atom({
  key: "currentWasteItemState",
  default: null,
});
