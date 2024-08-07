import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/LayoutSite";
import { useSetRecoilState } from "recoil";
import { loggedInUserState, sessionExpiredState } from "../../recoil/userAtoms";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const { register, error: authError } = useAuth();

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError("All fields are required");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (!validatePassword(password)) {
        setError(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        );
        setIsLoading(false);
        return;
      }
    },
    [firstName, lastName, email, password, confirmPassword]
  );

  useEffect(() => {
    let isMounted = true;

    const performRegistration = async () => {
      try {
        const user = await register({ firstName, lastName, email, password });
        if (isMounted) {
          setLoggedInUser(user);
          setSessionExpired(false);
          toast.success("Successfully registered!");
          navigate("/dashboard");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error registering user", error);
          if (error.response?.data?.msg === "Email already exists") {
            setError(
              "This email is already registered. Please use a different email."
            );
            toast.error(
              "This email is already registered. Please use a different email."
            );
          } else {
            setError(error.response?.data?.msg || "Error registering user");
            toast.error(error.response?.data?.msg || "Error registering user");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isLoading) {
      performRegistration();
    }

    return () => {
      isMounted = false;
    };
  }, [
    isLoading,
    register,
    firstName,
    lastName,
    email,
    password,
    setLoggedInUser,
    setSessionExpired,
    navigate,
  ]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/signin">Login</Link>
        </p>
      </div>
    </Layout>
  );
};

export default SignUpPage;
