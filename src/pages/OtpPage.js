import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../services/authService";

const OtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  // Get email from state or URL parameters
  useEffect(() => {
    const stateEmail = location.state?.email;
    const urlEmail = searchParams.get("email");

    if (stateEmail) {
      setEmail(stateEmail);
    } else if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
    }

    console.log("Email retrieved:", stateEmail || urlEmail || "none");
  }, [location.state, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await authService.verifyOtp({
        email,
        otp_verification: otp,
      });
      if (response.status === true) {
        setStatus({
          type: "success",
          message: "OTP verified successfully!",
        });

        // Redirect to password reset page after successful OTP verification
        // Include data in both state and URL parameters for maximum compatibility
        navigate(
          `/reset-password?email=${encodeURIComponent(email)}&verified=true`,
          {
            state: { email, verified: true },
          }
        );
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Invalid OTP. Please try again.",
      });
      setIsSubmitting(false);
    }
  };
  // If no email in state, show message and link to forgot password
  if (!email) {
    return (
      <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
            Missing Information
          </h1>

          <div className="mb-4 p-3 rounded-md flex items-center bg-yellow-100 text-yellow-700">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
            Email address is required to verify OTP.
          </div>

          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-soft-blue-500 text-white py-3 px-4 rounded-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-blue-500 transition-colors font-medium"
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
          Enter OTP
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Please enter the verification code sent to your email: {email}
        </p>

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
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faKey}
                className="mr-2 text-soft-blue-500"
              />
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id="otp"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 4) setOtp(value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="Enter 4-digit OTP"
              maxLength="4"
              required
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
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Didn't receive the code?{" "}
            <button
              onClick={() => navigate("/forgot_password", { state: { email } })}
              className="text-soft-blue-600 hover:text-soft-blue-800 font-medium"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
