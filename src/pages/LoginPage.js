import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faExclamationTriangle,
  // faUserMd,
  // faUserTie,
  // faUserInjured,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call authentication service to login
      const response = await authService.login(credentials);
      // console.log('Login response:', response.data);

      // Navigate to the appropriate dashboard based on user type
      const userType = response.data.userType;

      if (userType === "doctor") {
        navigate("/doctor-dashboard");
      } else if (userType === "admin") {
        navigate("/admin-dashboard");
      } else if (userType === "patient") {
        navigate("/patient-dashboard");
      } else {
        // Default fallback in case user type is not recognized
        navigate("/patient-dashboard");
      }
    } catch (error) {
      // Display login error message
      setError(error.message || "Wrong credentials, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
          Login to Your Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 text-soft-blue-500"
              />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faLock}
                className="mr-2 text-soft-blue-500"
              />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
                placeholder="Your password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-soft-blue-600 hover:text-soft-blue-800"
            >
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-soft-blue-500 text-white py-3 px-4 rounded-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-blue-500 transition-colors font-medium ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {/* Register Option */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a
              href="/"
              className="text-soft-blue-600 hover:text-soft-blue-800 font-medium"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
