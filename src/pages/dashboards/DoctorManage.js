import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faArrowLeft,
  faSearch,
  faTimes,
  faSave,
  faBolt,
  faUserMd,
  faHospitalUser,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import adminService from "../../services/adminService";

const DoctorManage = () => {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailDoctor, setDetailDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    password: "",
    created_by: localStorage.getItem("user_id"),
    specialization: "",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("doctors");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDoctors();
      setDoctors(response || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const AddDoctor = () => {
    setFormData({
      name: "",
      email: "",
      gender: "",
      specialization: "",
      mobile: "",
      password: "",
      created_by: localStorage.getItem("user_id"),
    });
    setIsEditing(false);
    setEditingDoctorId(null);
    setError(null);
    setShowModal(true);
  };

  const EditDoctor = (doctor) => {
    setFormData({
      name: doctor.name,
      email: doctor.email,
      gender: doctor.gender || "",
      specialization: doctor.specialization,
      mobile: doctor.mobile,
      password: "", // Initialize empty password for editing
      updated_by: localStorage.getItem("user_id"),
    });
    setIsEditing(true);
    setEditingDoctorId(doctor.id);
    setError(null);
    setShowModal(true);
  };

  const openDetailModal = (doctor) => {
    setDetailDoctor(doctor);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  const closeDetailModal = () => setShowDetailModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!formData.mobile.trim()) {
      errors.mobile = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errors.mobile = "Contact number must be 10 digits";
    }
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.specialization.trim())
      errors.specialization = "Specialization is required";

    return Object.keys(errors).length === 0 ? null : errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (formErrors) {
      setError("Please fill in all required fields correctly");
      return;
    }

    try {
      if (isEditing) {
        await adminService.updateDoctor(editingDoctorId, formData);
      } else {
        await adminService.addDoctor(formData);
      }
      await fetchDoctors();
      closeModal();
    } catch (error) {
      console.error("Error saving doctor:", error);
      setError(error.message || "Failed to save doctor. Please try again.");
    }
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await adminService.deleteDoctor(doctorToDelete.id);
      // console.log('Doctor deleted:', doctorToDelete.id);
      await fetchDoctors();
      setShowDeleteModal(false);
      setDoctorToDelete(null);
    } catch (error) {
      console.error("Error deleting doctor:", error);
      setError("Failed to delete doctor. Please try again.");
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSidebar = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      {" "}
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
              Manage Doctors
            </h2>
            <button
              onClick={AddDoctor}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-soft-blue-600 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center gap-2 shadow-md group"
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="group-hover:rotate-90 transition-transform"
              />
              <span className="hidden sm:inline">Add Doctor</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20"></div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm flex items-center transform hover:scale-[1.01] transition-transform">
              <div className="mr-3 text-red-500">
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </div>
              <div>{error}</div>
            </div>
          )}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-2/3 md:w-1/3">
                <div className="flex items-center bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 mr-2 ml-2 transform transition-transform focus-within:scale-110"
                  />
                  <input
                    type="text"
                    placeholder="Search doctors..."
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
                  Total doctors:{" "}
                  <strong className="text-soft-blue-600 font-medium">
                    {doctors.length}
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
                Loading doctors...
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Please wait while we fetch the data
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-white">
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Number
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {" "}
                          <div className="flex items-center gap-4 py-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-soft-blue-100 to-soft-blue-200 flex items-center justify-center text-soft-blue-600 shadow-sm transform transition-transform group-hover:scale-110">
                              <FontAwesomeIcon icon={faUserMd} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">
                                {doc.name}
                              </span>
                              {/* <span className="text-xs text-gray-500">Doctor ID: {doc.id}</span> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.email}
                        </td>{" "}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs font-semibold border border-blue-200 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {doc.specialization}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.mobile}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDetailModal(doc)}
                              title="View Details"
                              className="p-2 bg-soft-blue-50 text-soft-blue-600 rounded-lg hover:bg-soft-blue-100 transition-colors duration-200"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              onClick={() => EditDoctor(doc)}
                              title="Edit Doctor"
                              className="p-2 bg-soft-blue-50 text-soft-blue-600 rounded-lg hover:bg-soft-blue-100 transition-colors duration-200"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>{" "}
                            <button
                              onClick={() => handleDeleteClick(doc)}
                              title="Delete Doctor"
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                            <FontAwesomeIcon icon={faUserMd} size="2x" />
                          </div>
                          <p className="text-gray-800 font-semibold text-xl mb-2">
                            No doctors found
                          </p>
                          <p className="text-gray-600 text-sm mb-6 max-w-xs">
                            {searchTerm
                              ? "No doctors match your search criteria. Try adjusting your search term."
                              : "Your doctor list is empty. Add your first doctor to get started."}
                          </p>
                          {searchTerm ? (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="px-6 py-2 text-soft-blue-600 hover:text-soft-blue-700 bg-soft-blue-50 rounded-lg hover:bg-soft-blue-100 transition-colors"
                            >
                              Clear search
                            </button>
                          ) : (
                            <button
                              onClick={AddDoctor}
                              className="px-6 py-2 text-white bg-soft-blue-600 rounded-lg hover:bg-soft-blue-700 transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faPlus} />
                              Add Doctor
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-0 z-20 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div
          className="absolute inset-0 bg-gray-600 bg-opacity-75"
          onClick={toggleSidebar}
        ></div>
        <div className="relative bg-white w-64 h-full">
          <nav className="h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Navigation</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              <li>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                    activeTab === "dashboard"
                      ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={faBolt} className="mr-3 w-5" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("doctors");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                    activeTab === "doctors"
                      ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={faUserMd} className="mr-3 w-5" />
                  Manage Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("patients");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                    activeTab === "patients"
                      ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={faHospitalUser} className="mr-3 w-5" />
                  Manage Patients
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab("treatments");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                    activeTab === "treatments"
                      ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon icon={faList} className="mr-3 w-5" />
                  Treatments
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>{" "}
      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    {isEditing ? "Edit Doctor" : "Add New Doctor"}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {" "}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Name<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition pl-10"
                          placeholder="Enter full name"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">
                          <FontAwesomeIcon icon={faUserMd} />
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Email<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition"
                        placeholder="doctor@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Gender<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        Contact Number<span className="text-red-500">*</span>
                      </label>
                      <input
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Specialization<span className="text-red-500">*</span>
                    </label>
                    <input
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition"
                      placeholder="e.g. Cardiology, Neurology, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Password
                      {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition"
                        placeholder={
                          isEditing
                            ? "Leave blank to keep current password"
                            : "Enter password"
                        }
                        {...(!isEditing ? { required: true } : {})}
                      />
                    </div>
                    {isEditing && (
                      <p className="mt-1.5 text-sm text-gray-500 flex items-center">
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="mr-1 text-gray-400"
                        />
                        Enter new password only if you want to change it
                      </p>
                    )}
                  </div>

                  <div className="sticky bottom-0 bg-white pt-5 border-t mt-6">
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors duration-200 w-full sm:w-auto"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {isEditing ? "Update Doctor" : "Create Doctor"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      {/* View Doctor Details Modal */}
      {showDetailModal && detailDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden">
            <div className="bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Doctor Details
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="space-y-6">
                {" "}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-soft-blue-500 to-soft-blue-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-5xl font-bold shadow-lg border-4 border-white transform transition-transform group-hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="relative">
                        {detailDoctor.name.charAt(0)}
                      </span>
                    </div>
                    {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-gray-200">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-600 font-medium">
                          Active
                        </span>
                      </span>
                    </div> */}
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    {detailDoctor.name}
                  </h4>
                  <p className="text-soft-blue-600 font-medium inline-flex items-center gap-2 bg-soft-blue-50 px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faUserMd} className="text-sm" />
                    {detailDoctor.specialization}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 divide-y divide-gray-200/75 shadow-inner">
                  <div className="py-4 grid grid-cols-3 items-center">
                    <span className="font-medium text-gray-500 col-span-1">
                      Email:
                    </span>
                    <span className="text-gray-800 col-span-2 break-all">
                      {detailDoctor.email}
                    </span>
                  </div>
                  <div className="py-4 grid grid-cols-3 items-center">
                    <span className="font-medium text-gray-500 col-span-1">
                      Gender:
                    </span>
                    <span className="text-gray-800 col-span-2">
                      {detailDoctor.gender || "Not specified"}
                    </span>
                  </div>
                  <div className="py-4 grid grid-cols-3 items-center">
                    <span className="font-medium text-gray-500 col-span-1">
                      Contact:
                    </span>
                    <span className="text-gray-800 col-span-2">
                      {detailDoctor.mobile}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    EditDoctor(detailDoctor);
                    closeDetailModal();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 mr-3"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && doctorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-red-600 p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Confirm Delete Doctor
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDoctorToDelete(null);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 p-4 rounded-lg mb-5 border border-red-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-red-600 text-lg"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-lg">
                      {doctorToDelete.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doctorToDelete.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doctorToDelete.specialization}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-5 border border-yellow-100 flex items-start">
                <div className="text-yellow-600 mr-3 mt-0.5">
                  <FontAwesomeIcon icon={faBolt} />
                </div>
                <p className="text-gray-700">
                  Are you sure you want to delete this doctor? This action{" "}
                  <span className="font-bold">cannot be undone</span>. All
                  associated data will be permanently removed.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDoctorToDelete(null);
                  }}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center w-full sm:w-auto mb-2 sm:mb-0"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManage;
