import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import UserModal from "./UserModal";
import {
  selectedUserState,
  isUserModalOpenState,
  loggedInUserState,
  authTokenState,
} from "../../recoil/userAtoms";
import { toast } from "react-toastify";
const mockUpdateUser = jest.fn();
const mockAddUser = jest.fn();
jest.mock("../../hooks/useUserManagement.js", () => ({
  useUpdateUser: () => mockUpdateUser,
  useAddUser: () => mockAddUser,
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("UserModal", () => {
  const mockFetchUsers = jest.fn();
  const mockUpdateUser =
    require("../../hooks/useUserManagement.js").useUpdateUser;
  const mockAddUser = require("../../hooks/useUserManagement.js").useAddUser;

  const setup = (
    isOpen = true,
    user = null,
    authToken = "mockToken",
    loggedInUser = { id: "mockId" }
  ) => {
    return render(
      <RecoilRoot
        initializeState={(snap) => {
          snap.set(isUserModalOpenState, isOpen);
          snap.set(selectedUserState, user);
          snap.set(loggedInUserState, loggedInUser);
          snap.set(authTokenState, authToken);
        }}
      >
        <UserModal fetchUsers={mockFetchUsers} page={1} usersPerPage={10} />
      </RecoilRoot>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly for adding a new user", () => {
    setup();
    expect(
      screen.getByText("Add User", { selector: "div.modal-title" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toHaveValue("");
    expect(screen.getByLabelText("Last Name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test("renders correctly for editing an existing user", () => {
    const user = {
      _id: "123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "user",
    };
    setup(true, user);
    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toHaveValue("John");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  test("submits new user data correctly", async () => {
    mockAddUser.mockResolvedValue({});
    setup();
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Wonderland" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "admin" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save user/i }));

    await waitFor(() =>
      expect(mockAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Alice",
          lastName: "Wonderland",
          email: "alice@example.com",
          password: "password123",
          role: "admin",
        }),
        "mockToken"
      )
    );
    expect(mockFetchUsers).toHaveBeenCalled();
  });

  test("submits updated user data correctly", async () => {
    mockUpdateUser.mockResolvedValue({});
    const user = {
      _id: "123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "user",
    };
    setup(true, user);

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Johnny" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "123",
          firstName: "Johnny",
          lastName: "Doe",
          email: "john@example.com",
          role: "user",
        }),
        "mockToken"
      );
    });
  });

  test("handles error when no token is available", async () => {
    console.error = jest.fn();
    setup(true, null, ""); // No token

    fireEvent.click(screen.getByRole("button", { name: /save user/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Authentication error. Please log in again."
      )
    );
  });

  test("closes modal on cancel", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });
});
