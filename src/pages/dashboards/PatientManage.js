import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faArrowLeft,
  faSave,
  faTimes,
  faSort,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import adminService from "../../services/adminService";
import authService from "../../services/authService";

const PatientManage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [treatmentData, setTreatmentData] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    age: "",
    gender: "",
    updated_by: localStorage.getItem("user_id"),
    treatment_id: "",
    care_of: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getApprovePatients();
      const treatmentResponse = await authService.treatment();
      setTreatmentData(treatmentResponse.data || []);
      setPatients(response || []);
    } catch (error) {
      console.error("Error fetching patients data:", error);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = React.useMemo(() => {
    let sortablePatients = [...patients];
    if (sortConfig.key !== null) {
      sortablePatients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePatients;
  }, [patients, sortConfig]);

  const filteredPatients = sortedPatients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobile?.includes(searchTerm)
  );

  const handleOpenEditModal = (patient) => {
    setCurrentPatient(patient);
    setEditFormData({
      name: patient.name || "",
      email: patient.email || "",
      mobile: patient.mobile || "",
      dob: patient.dob || "",
      age: patient.age || "",
      gender: patient.gender || "",
      updated_by: localStorage.getItem("user_id"),
      treatment_id: patient.treatment_id || "",
      care_of: patient.care_of || patient.careOf || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPatient(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!editFormData.name.trim()) errors.name = "Name is required";
    if (!editFormData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(editFormData.mobile.trim())) {
      errors.mobile = "Mobile number must be 10 digits";
    }
    if (!editFormData.gender) errors.gender = "Gender is required";
    if (!editFormData.treatment_id)
      errors.treatment_id = "Treatment type is required";
    if (!editFormData.care_of.trim()) errors.care_of = "Care of is required";

    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (formErrors) {
      setError("Please fill in all required fields correctly");
      return;
    }
    try {
      await adminService.updatePatient(currentPatient.id, editFormData);

      // Find the treatment details before updating the patients list
      const selectedTreatment = treatmentData.find(
        (t) => t.id === parseInt(editFormData.treatment_id)
      );

      const updatedPatients = patients.map((patient) => {
        if (patient.id === currentPatient.id) {
          return {
            ...patient,
            ...editFormData,
            treatment_name: selectedTreatment
              ? selectedTreatment.treatment_name
              : "N/A",
          };
        }
        return patient;
      });

      setPatients(updatedPatients);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating patient:", error);
      setError("Failed to update patient information. Please try again.");
    }
  };

  // Pagination calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full bg-white shadow-lg border-b sticky top-0 z-10">
        <div className="bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
          <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 max-w-[2000px] mx-auto">
            <button
              onClick={() => window.history.back()}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-soft-blue-600 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center gap-2 shadow-md group"
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white order-first w-full sm:w-auto sm:order-none text-center sm:text-left mb-4 sm:mb-0">
              Manage Patients
            </h2>
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20"></div>
        </div>{" "}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm flex items-center transform hover:scale-[1.01] transition-transform">
              <div className="mr-3 text-red-500">
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </div>
              <div>{error}</div>
            </div>
          )}
          {/* Search Bar and Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-2/3 md:w-1/3">
                <div className="flex items-center bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 mr-2 ml-2 transform transition-transform group-focus-within:scale-110"
                  />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="bg-transparent border-none outline-none w-full p-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700">
                <span>
                  Total patients:{" "}
                  <strong className="text-soft-blue-600 font-medium">
                    {patients.length}
                  </strong>
                </span>
              </div>
            </div>
          </div>{" "}
          {loading ? (
            <div className="text-center py-12">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-soft-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-600 text-lg font-medium">
                Loading patients...
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Please wait while we fetch the data
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {" "}
                <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-white">
                      {[
                        "Name",
                        "Email",
                        "Mobile",
                        "Date Of Birth",
                        "Age",
                        "Gender",
                        "Care Of",
                        "Treatment Name",
                        "Actions",
                      ].map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleSort(header.toLowerCase().replace(/ /g, "_"))
                          }
                        >
                          <div className="flex items-center gap-2 group">
                            {header}
                            <FontAwesomeIcon
                              icon={faSort}
                              className={`transition-opacity ${
                                sortConfig.key ===
                                header.toLowerCase().replace(/ /g, "_")
                                  ? "opacity-100 text-soft-blue-600"
                                  : "opacity-30 group-hover:opacity-50"
                              }`}
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.length > 0 ? (
                      currentRecords.map((patient) => (
                        <tr
                          key={patient.id}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {patient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(patient.dob)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-full ${
                                patient.gender === "male"
                                  ? "bg-blue-100 text-blue-800"
                                  : patient.gender === "female"
                                  ? "bg-pink-100 text-pink-800"
                                  : "bg-gray-100 text-gray-800"
                              } text-xs font-semibold`}
                            >
                              {patient.gender || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.care_of || patient.careOf || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.treatment_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenEditModal(patient)}
                                title="Edit Patient"
                                className="p-2 bg-soft-blue-50 text-soft-blue-600 rounded-full hover:bg-soft-blue-100 transition-colors duration-200"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                              <FontAwesomeIcon icon={faEye} size="2x" />
                            </div>
                            <p className="text-gray-800 font-semibold text-xl mb-2">
                              No patients found
                            </p>
                            <p className="text-gray-600 text-sm mb-6 max-w-xs">
                              {searchTerm
                                ? "No patients match your search criteria. Try adjusting your search term."
                                : "The patient list is currently empty."}
                            </p>
                            {searchTerm && (
                              <button
                                onClick={() => setSearchTerm("")}
                                className="px-6 py-2 text-soft-blue-600 hover:text-soft-blue-700 bg-soft-blue-50 rounded-lg hover:bg-soft-blue-100 transition-colors"
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredPatients.length > recordsPerPage && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-soft-blue-300"
                      }`}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`min-w-[40px] h-10 rounded-lg transition-all ${
                              currentPage === number
                                ? "bg-soft-blue-600 text-white font-medium"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            }`}
                          >
                            {number}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-soft-blue-300"
                      }`}
                    >
                      <span>Next</span>
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        className="h-4 w-4 rotate-180"
                      />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Edit Patient Modal */}
      {showModal && currentPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Edit Patient Information
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="text-red-500"
                      />
                      {error}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <form onSubmit={handleUpdatePatient} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Mobile<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="mobile"
                        value={editFormData.mobile}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Date of Birth<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={editFormData.dob}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Age<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={editFormData.age}
                        onChange={handleInputChange}
                        min="0"
                        max="150"
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Gender<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Treatment Type<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="treatment_id"
                        value={editFormData.treatment_id}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      >
                        <option value="">Select Treatment Type</option>
                        {treatmentData.map((treatment) => (
                          <option key={treatment.id} value={treatment.id}>
                            {treatment.treatment_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Care Of<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="care_of"
                        value={editFormData.care_of}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-soft-blue-600 text-white rounded-md hover:bg-soft-blue-700 transition duration-300 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faSave} />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManage;
