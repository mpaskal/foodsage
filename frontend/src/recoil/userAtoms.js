import { atom, selector } from "recoil";

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

export const isLastAdminState = selector({
  key: "isLastAdminState",
  get: ({ get }) => {
    const users = get(usersState);
    const loggedInUser = get(loggedInUserState);
    const adminUsers = users.filter((user) => user.role === "admin");
    return adminUsers.length === 1 && adminUsers[0]._id === loggedInUser?.id;
  },
});

export const userManagementState = atom({
  key: "userManagementState",
  default: {
    users: [],
    loggedInUser: null,
    adminUsers: [],
    selectedUser: null,
    isUserModalOpen: false,
    isLastAdmin: false,
  },
});
