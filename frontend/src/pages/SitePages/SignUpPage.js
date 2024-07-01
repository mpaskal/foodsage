// src/pages/SitePages/SignUpPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { userState } from "../../recoil/atoms";
import { loggedInUserState } from "../../recoil/atoms";
import Layout from "../../components/Layout/LayoutSite";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userState);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          firstName,
          lastName,
          email,
          password,
        }
      );

      if (response.data && response.data.user && response.data.token) {
        const userData = {
          ...response.data.user,
          token: response.data.token,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        localStorage.setItem("isNewUser", "true");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setError("User data is not returned correctly");
      }
    } catch (error) {
      console.error("Error registering user", error);
      setError(error.response?.data?.msg || "Error registering user");
    }
  };

  return (
    <Layout>
      <div className="sign-up-container">
        <h2>Create Admin Account</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
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
      </div>
    </Layout>
  );
};

export default SignUpPage;
