import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faUser,
  faMobile,
  faCalendarAlt,
  faPills,
  faUserFriends,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    mobile: "",
    age: "",
    gender: "",
    dob: "",
    treatment_id: "",
    care_of: "",
    password: "",
    confirmPassword: "",
    role: "patient", // Default role for registration
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [treatmentData, setTreatmentData] = useState([]);

  useEffect(() => {
    // Fetch treatment data from the API
    const fetchTreatmentData = async () => {
      try {
        const response = await authService.treatment();
        setTreatmentData(response.data);
      } catch (error) {
        console.error("Error fetching treatment data:", error);
        setApiError("Failed to load treatment data. Please try again later.");
      }
    };
    fetchTreatmentData();
  }, []);
  console.log(treatmentData, "treatmentData");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let tempErrors = {};

    // Name validation - required
    if (!formData.name.trim()) {
      tempErrors.name = "Name is required";
    }

    // Mobile validation - required, numeric and proper length
    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      tempErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    // Age validation - required and numeric
    if (!formData.age) {
      tempErrors.age = "Age is required";
    } else if (isNaN(formData.age) || parseInt(formData.age) <= 0) {
      tempErrors.age = "Please enter a valid age";
    }

    // gender validation - required
    if (!formData.gender.trim()) {
      tempErrors.gender = "Gender is required";
    }

    // Treatment type validation - required
    if (!formData.treatment_id.trim()) {
      tempErrors.treatment_id = "Treatment type is required";
    }

    // Care of validation - required
    if (!formData.care_of.trim()) {
      tempErrors.care_of = "Care of is required";
    }

    // Password validation - required and minimum length
    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation - must match password
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");

      try {
        // Prepare registration data
        const registrationData = {
          ...formData,
          userType: "patient", // Default registration is for patients
          age: parseInt(formData.age),
        };
        console.log(registrationData, "registrationData");

        // Remove confirmPassword as it's not needed for the API
        delete registrationData.confirmPassword;

        // Call the authentication service to register the user
        await authService.register(registrationData);

        // Redirect to success page
        navigate("/registration-success");
      } catch (error) {
        // Handle registration errors
        setApiError(error.message || "Registration failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-soft-blue-700 mb-6">
          Create Your Account
        </h1>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faUser}
                className="mr-2 text-soft-blue-500"
              />
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
              placeholder="Your full name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          {/* Email Field (Optional) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 text-soft-blue-500"
              />
              Email ID
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="your@email.com"
            />
          </div>

          {/* Mobile Number Field */}
          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faMobile}
                className="mr-2 text-soft-blue-500"
              />
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
              placeholder="Your 10-digit mobile number"
              required
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-soft-blue-500"
              />
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
              placeholder="Your date of birth"
            />
          </div>
          {/* Age Field */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-soft-blue-500"
              />
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.age ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
              placeholder="Your age"
              required
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-500">{errors.age}</p>
            )}
          </div>

          {/* gender types*/}
          <div>
            <label
              htmlfor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faUser}
                className="mr-2 text-soft-blue-500"
              />
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.gender ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
              required
            >
              <option>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {/* Treatment Type Field */}
          <div>
            <label
              htmlFor="treatment_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faPills}
                className="mr-2 text-soft-blue-500"
              />
              Treatment Type <span className="text-red-500">*</span>
            </label>

            <select
              // id="treatmentType"
              name="treatment_id"
              value={formData.treatment_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border  rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
              required
            >
              <option selected>Select treatment type</option>
              {treatmentData.map((data, index) => (
                <>
                  <option key={index} value={data.id}>
                    {data.treatment_name}
                  </option>
                </>
              ))}
            </select>
          </div>

          {/* Care Of Field */}
          <div>
            <label
              htmlFor="careOf"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faUserFriends}
                className="mr-2 text-soft-blue-500"
              />
              Care Of <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="care_of"
              name="care_of"
              value={formData.care_of}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border ${
                errors.care_of ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
              placeholder="Guardian or responsible person"
              required
            />
            {errors.care_of && (
              <p className="mt-1 text-sm text-red-500">{errors.care_of}</p>
            )}
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
              Set Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
                placeholder="Choose a secure password"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <FontAwesomeIcon
                icon={faLock}
                className="mr-2 text-soft-blue-500"
              />
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500`}
                placeholder="Confirm your password"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Register Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-soft-blue-500 text-white py-3 px-4 rounded-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-blue-500 transition-colors font-medium ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        {/* Login Option */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
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

export default RegistrationPage;
