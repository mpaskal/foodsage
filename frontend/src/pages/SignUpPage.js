// frontend/src/pages/SignUpPage.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout/LayoutSite";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    spaceName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { firstName, lastName, spaceName, email, password, confirmPassword } =
    formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("/api/users/register", {
        firstName,
        lastName,
        spaceName,
        email,
        password,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error registering user", error);
    }
  };

  return (
    <Layout>
      <div className="sign-up-container">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="spaceName">Space name</label>
            <input
              type="text"
              id="spaceName"
              name="spaceName"
              value={spaceName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account? <Link to="/signin">Login</Link>
        </p>
        <p>
          Sign in with your Google Account. <Link to="/signin">Signin</Link>
        </p>
      </div>
    </Layout>
  );
};

export default SignUpPage;
