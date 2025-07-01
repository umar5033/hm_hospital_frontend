import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const RegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-soft-blue-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 sm:p-8 text-center">
        <div className="mb-6">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-5xl"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-soft-blue-700 mb-4">
          Thanks for registering!
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Your account is waiting for approval.
        </p>
        <div className="mt-8">
          <a
            href="/login"
            className="inline-block bg-soft-blue-500 text-white py-3 px-6 rounded-md hover:bg-soft-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-blue-500 transition-colors font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
