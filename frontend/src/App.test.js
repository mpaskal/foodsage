import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import App from "./App";

const renderWithRouter = (ui, { route = "/" } = {}) => {
  return render(
    <RecoilRoot>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </RecoilRoot>
  );
};

test("renders without crashing", () => {
  renderWithRouter(<App />);
});

test("renders home page by default", () => {
  renderWithRouter(<App />);
  const homeElement = screen.getByText(/Discover Foodsage/i);
  expect(homeElement).toBeInTheDocument();
});

test("renders signin and signup links", () => {
  renderWithRouter(<App />);
  const signinLink = screen.getByRole("link", { name: /sign in/i });
  const signupLink = screen.getByRole("link", { name: /sign up/i });
  expect(signinLink).toBeInTheDocument();
  expect(signupLink).toBeInTheDocument();
});
