import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/LayoutSite";
import { useSetRecoilState } from "recoil";
import { loggedInUserState } from "../../recoil/userAtoms";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const { login, error } = useAuth();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      console.log("User logged in", user);
      setLoggedInUser(user);
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in user", error);
      toast.error(error.message || "Error logging in user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="sign-in-container">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </Layout>
  );
};

export default SignInPage;
