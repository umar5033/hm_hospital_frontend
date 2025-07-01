import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../services/authService";

const PassReset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);

  // Get email and verification status from navigation state or URL
  useEffect(() => {
    // Get from state first
    const stateEmail = location.state?.email;
    const stateVerified = location.state?.verified;

    // Get from URL params as fallback
    const urlEmail = searchParams.get("email");
    const urlVerified = searchParams.get("verified") === "true";

    setEmail(stateEmail || (urlEmail ? decodeURIComponent(urlEmail) : ""));
    setVerified(stateVerified || urlVerified);

    console.log("Password reset page data1:", {
      email: stateEmail || urlEmail || "none",
      verified: stateVerified || urlVerified || false,
    });
  }, [location.state, searchParams]);
  useEffect(() => {
    // Log for debugging purposes
    console.log("Password reset page state2:", { email, verified });

    // No immediate redirect, we'll show a message instead
  }, [email, verified, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePasswords = () => {
    if (formData.password.length < 6) {
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await authService.resetPassword({
        email,
        newPassword: formData.password,
      });

      setStatus({
        type: "success",
        message: "Password reset successfully!",
      });

      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (!email || !verified) {
  //   return (
  //     <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
  //       <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
  //         <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
  //           Password Reset Error
  //         </h1>

  //         <div className="mb-4 p-3 rounded-md flex items-center bg-yellow-100 text-yellow-700">
  //           <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
  //           {!email ? "Email address is missing." : "OTP verification is required before resetting password."}
  //         </div>

  //         <button
  //           onClick={() => navigate('/forgot-password')}
  //           className="w-full bg-soft-blue-500 text-white py-3 px-4 rounded-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-blue-500 transition-colors font-medium"
  //         >
  //           Start Password Reset Process
  //         </button>
  //       </div>
  //     </div>
  //   );
  // } return null;

  return (
    <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
          Reset Password
        </h1>

        {status.message && (
          <div
            className={`mb-4 p-3 rounded-md flex items-center ${
              status.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <FontAwesomeIcon
              icon={
                status.type === "success"
                  ? faCheckCircle
                  : faExclamationTriangle
              }
              className="mr-2"
            />
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faLock}
                className="mr-2 text-soft-blue-500"
              />
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="Enter new password"
              required
              minLength="6"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faLock}
                className="mr-2 text-soft-blue-500"
              />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="Confirm new password"
              required
              minLength="6"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-soft-blue-500 text-white py-3 px-4 rounded-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-blue-500 transition-colors font-medium ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-soft-blue-600 hover:text-soft-blue-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassReset;
