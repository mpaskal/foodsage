import { atom, selector } from "recoil";

export const loggedInUserState = atom({
  key: "loggedInUserState",
  default: null,
});

export const isUserModalOpenState = atom({
  key: "isUserModalOpenState",
  default: false,
});

export const selectedUserState = atom({
  key: "selectedUserState",
  default: null,
});

export const userManagementState = atom({
  key: "userManagementState",
  default: {
    users: [],
    adminUsers: [],
    isLoading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
  },
});

export const isLastAdminState = selector({
  key: "isLastAdminState",
  get: ({ get }) => {
    const { adminUsers } = get(userManagementState);
    const loggedInUser = get(loggedInUserState);
    return adminUsers.length === 1 && adminUsers[0]._id === loggedInUser?.id;
  },
});
