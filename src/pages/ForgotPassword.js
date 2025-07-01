import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await authService.forgotPassword({ email });

      if (response.status == true) {
        setStatus({
          type: "success",
          message: "Password reset instructions have been sent to your email.",
        }); // Redirect to OTP page after 3 seconds with email in both state and URL parameters
        setTimeout(() => {
          navigate(`/otp?email=${encodeURIComponent(email)}`, {
            state: { email },
          });
        }, 3000);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.message || "Failed to process your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
          Forgot Password
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 text-soft-blue-500"
              />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="Enter your registered email"
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
              {isSubmitting ? "Sending..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-soft-blue-600 hover:text-soft-blue-800 font-medium"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
