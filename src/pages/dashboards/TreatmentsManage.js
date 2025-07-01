import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
  faTimes,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";

const TreatmentsManage = () => {
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    treatment_name: "",
    created_by: localStorage.getItem("user_id"),
  });
  const [editFormData, setEditFormData] = useState({
    id: "",
    treatment_name: "",
    created_by: localStorage.getItem("user_id"),
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTreatments();
      setTreatments(response || []);
    } catch (error) {
      console.error("Error fetching treatments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("treatment_name", formData.treatment_name);
      submitData.append("created_by", formData.created_by);

      await adminService.addTreatment(submitData);
      await fetchTreatments();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding treatment:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      treatment_name: "",
      created_by: localStorage.getItem("user_id"),
    });
  };

  const handleDeleteClick = (treatment) => {
    setTreatmentToDelete(treatment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!treatmentToDelete) return;

    try {
      setLoading(true);
      await adminService.deleteTreatment(treatmentToDelete.id);
      setTreatments(
        treatments.filter((item) => item.id !== treatmentToDelete.id)
      );
      setShowDeleteModal(false);
      setTreatmentToDelete(null);
    } catch (error) {
      console.error("Error deleting treatment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (treatment) => {
    setEditFormData({
      id: treatment.id,
      treatment_name: treatment.treatment_name,
      created_by: localStorage.getItem("user_id"),
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("treatment_name", editFormData.treatment_name);
      submitData.append("updated_by", editFormData.created_by);

      await adminService.updateTreatment(editFormData.id, submitData);
      setTreatments(
        treatments.map((treatment) =>
          treatment.id === editFormData.id
            ? { ...treatment, treatment_name: editFormData.treatment_name }
            : treatment
        )
      );

      setShowEditModal(false);
      setEditFormData({
        id: "",
        treatment_name: "",
        created_by: localStorage.getItem("user_id"),
      });
    } catch (error) {
      console.error("Error updating treatment:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.treatment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 max-w-[2000px] mx-auto">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-soft-blue-600 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center gap-2 shadow-md group"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white order-first w-full sm:w-auto sm:order-none text-center sm:text-left mb-4 sm:mb-0">
            Manage Treatments
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-white text-soft-blue-600 rounded-lg hover:bg-blue-50 transition duration-300 flex items-center gap-2 shadow-md"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Treatment</span>
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center bg-white rounded-lg p-2 w-full md:w-1/3 shadow-sm border border-gray-200">
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 mr-2 ml-2"
            />
            <input
              type="text"
              placeholder="Search treatments..."
              className="bg-transparent border-none outline-none w-full p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-soft-blue-500"></div>
            </div>
          ) : filteredTreatments.length > 0 ? (
            filteredTreatments.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                onClick={() =>
                  navigate(`/admin/procedures/${treatment.id}`, {
                    state: { treatment },
                  })
                }
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {treatment.treatment_name}
                  </h3>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="p-2 bg-soft-blue-50 text-soft-blue-600 rounded-full hover:bg-soft-blue-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(treatment);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(treatment);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-xl"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No treatments found
              </h3>
              <p className="text-gray-500 text-center">
                Try adjusting your search or add a new treatment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Treatment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Add New Treatment
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Treatment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="treatment_name"
                      value={formData.treatment_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={
                        "px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors font-medium flex items-center gap-2 " +
                        (loading ? "opacity-70 cursor-not-allowed" : "")
                      }
                    >
                      {loading ? "Adding..." : "Add Treatment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Treatment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Edit Treatment
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditFormData({
                        id: "",
                        treatment_name: "",
                        created_by: localStorage.getItem("user_id"),
                      });
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Treatment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="treatment_name"
                      value={editFormData.treatment_name}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditFormData({
                          id: "",
                          treatment_name: "",
                          created_by: localStorage.getItem("user_id"),
                        });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={
                        "px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition-colors font-medium flex items-center gap-2 " +
                        (loading ? "opacity-70 cursor-not-allowed" : "")
                      }
                    >
                      {loading ? "Updating..." : "Update Treatment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && treatmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Confirm Delete Treatment
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setTreatmentToDelete(null);
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faTrash} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      {treatmentToDelete.treatment_name}
                    </h4>
                    <p className="text-gray-500">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setTreatmentToDelete(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    Delete Treatment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentsManage;
