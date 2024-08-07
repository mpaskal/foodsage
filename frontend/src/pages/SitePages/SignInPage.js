import React, { useState, useEffect, useCallback } from "react";
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
    rememberMe: true, // Default to checked
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const { login, error: authError } = useAuth();
  const [error, setError] = useState(null);

  const { email, password, rememberMe } = formData;

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      setLoggedInUser(user);
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in user", error);
      toast.error(error.message || "An error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const performLogin = async () => {
      try {
        const user = await login(email, password, rememberMe);
        if (isMounted) {
          console.log("User logged in", user);
          setLoggedInUser(user);
          toast.success("Successfully signed in!");
          navigate("/dashboard");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error logging in user", error);
          setError(error.message || "An error occurred during sign in.");
          toast.error(error.message || "An error occurred during sign in.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isLoading) {
      performLogin();
    }

    return () => {
      isMounted = false;
    };
  }, [
    isLoading,
    login,
    email,
    password,
    rememberMe,
    setLoggedInUser,
    navigate,
  ]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

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
          <div>
            <label>
              <input
                type="checkbox"
                name="rememberMe"
                checked={rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
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
