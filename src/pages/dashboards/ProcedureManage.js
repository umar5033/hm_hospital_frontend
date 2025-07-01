import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faImage,
  faFileVideo,
  faEdit,
  faTrash,
  faTimes,
  faSave,
  // faExpand,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";

const ProcedureManage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const treatment = location.state?.treatment;

  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const userId = localStorage.getItem("user_id");
  const [formData, setFormData] = useState({
    procedure_name: "",
    description: "",
    treatment_id: "",
    media: [],
    created_by: userId,
  });
  const [editFormData, setEditFormData] = useState({
    procedure_name: "",
    description: "",
    treatment_id: "",
    media: [],
    updated_by: userId,
    newMedia: [], // For newly uploaded media files
  });

  // Add this helper function at the top of your component
  const normalizeMedia = (media) => {
    if (!media) return [];
    if (typeof media === "string") {
      try {
        return JSON.parse(media);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(media) ? media : [];
  };

  useEffect(() => {
    if (!treatment) {
      navigate("/treatments-manage");
      return;
    }
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTreatmentById(treatment.id);
      if (response && response.data) {
        // Transform the data to ensure media is always an array
        const transformedProcedures = response.data
          .filter((proc) => proc && proc.procedure_name)
          .map((proc) => ({
            ...proc,
            media: normalizeMedia(proc.media),
          }));
        setProcedures(transformedProcedures);
      }
    } catch (error) {
      console.error("Error fetching procedures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (procedure) => {
    setSelectedProcedure(procedure);
    setEditFormData({
      procedure_name: procedure.procedure_name,
      description: procedure.description,
      treatment_id: treatment.id,
      media: normalizeMedia(procedure.media) || [],
      newMedia: [],
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (procedure) => {
    setSelectedProcedure(procedure);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      // Add basic procedure information
      formData.append("procedure_name", editFormData.procedure_name);
      formData.append("description", editFormData.description);
      formData.append("updated_by", userId);

      // Append previous media as a JSON string (e.g., list of filenames or IDs)
      if (editFormData.media && editFormData.media.length > 0) {
        formData.append("previous_media", JSON.stringify(editFormData.media));
      }

      // Append new media files
      if (editFormData.newMedia && editFormData.newMedia.length > 0) {
        editFormData.newMedia.forEach((file) => {
          formData.append("media", file);
        });
      }

      await adminService.updateProcedure(selectedProcedure.id, formData);
      await fetchProcedures();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating procedure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await adminService.deleteProcedure(selectedProcedure.id);
      setProcedures(procedures.filter((p) => p.id !== selectedProcedure.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting procedure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    const newFiles = Array.from(files);

    // Limit to 5 files
    const allowedFiles = newFiles.slice(0, 5 - formData.media.length);

    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...allowedFiles].slice(0, 5),
    }));
  };

  const removeMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const handleEditFileChange = (e) => {
    const { files } = e.target;
    const newFiles = Array.from(files);

    // Limit total media to 5 (existing media + new media)
    const totalAllowedFiles = 5 - editFormData.media.length;
    const allowedFiles = newFiles.slice(0, totalAllowedFiles);

    setEditFormData((prev) => ({
      ...prev,
      newMedia: [...prev.newMedia, ...allowedFiles].slice(0, totalAllowedFiles),
    }));
  };

  const removeEditMedia = (index, isExisting = false) => {
    setEditFormData((prev) => ({
      ...prev,
      ...(isExisting
        ? { media: prev.media.filter((_, i) => i !== index) }
        : { newMedia: prev.newMedia.filter((_, i) => i !== index) }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append("procedure_name", formData.procedure_name);
      submitData.append("description", formData.description);
      submitData.append("treatment_id", treatment.id);
      submitData.append("created_by", userId);

      // Append each media file individually
      if (formData.media && formData.media.length > 0) {
        formData.media.forEach((file) => {
          console.log(file, "file");
          submitData.append("media", file);
        });
      }

      await adminService.addProcedure(submitData);
      await fetchProcedures();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding procedure:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      procedure_name: "",
      description: "",
      treatment_id: "",
      media: [],
      created_by: userId,
    });
  };

  const openFullscreenMedia = (media) => {
    setFullscreenMedia(media);
  };
  const filteredProcedures = procedures.filter(
    (procedure) =>
      procedure?.procedure_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) || false
  );
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}{" "}
      <div className="bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"></div>
        <div className="max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => navigate("/treatments-manage")}
              className="order-2 sm:order-none w-full sm:w-auto px-4 py-2 bg-white text-soft-blue-600 rounded-md hover:bg-soft-blue-50 hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-sm relative z-20"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Treatments
            </button>
            <h2 className="order-1 sm:order-none text-2xl sm:text-3xl font-bold text-white">
              Procedures for {treatment?.treatment_name}
            </h2>
            <div className="order-3 sm:order-none w-full sm:w-auto"></div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[2000px] mx-auto">
        {/* Search and Add Button */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center bg-white rounded-lg p-2 w-full md:w-1/3 shadow-sm border border-gray-200">
            <FontAwesomeIcon
              icon={faSearch}
              className="text-gray-400 mr-2 ml-2"
            />
            <input
              type="text"
              placeholder="Search procedures..."
              className="bg-transparent border-none outline-none w-full p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-soft-blue-600 text-white rounded-lg hover:bg-soft-blue-700 transition duration-300 flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Procedure</span>
          </button>
        </div>

        {/* Procedures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-soft-blue-500"></div>
            </div>
          ) : filteredProcedures.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faEye}
                  className="text-gray-400 text-xl"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No procedures found
              </h3>
              <p className="text-gray-500 text-center">
                Try adjusting your search or add a new procedure
              </p>
            </div>
          ) : (
            filteredProcedures.map((procedure) => (
              <div
                key={procedure.id}
                className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md hover:border-soft-blue-200 transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-soft-blue-600 transition-colors">
                      {procedure.procedure_name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(procedure)}
                        className="p-2 bg-soft-blue-50 text-soft-blue-600 rounded-full hover:bg-soft-blue-100 transition-colors shadow-sm"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(procedure)}
                        className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors shadow-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {procedure.description}
                  </p>

                  {/* Media Preview */}
                  {procedure.media && procedure.media?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {procedure.media.map((media, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => openFullscreenMedia(media)}
                        >
                          {media.mediaType === "video/mp4" ? (
                            <>
                              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all"></div>
                              <FontAwesomeIcon
                                icon={faFileVideo}
                                className="absolute top-2 right-2 text-white text-xl z-10"
                              />
                              <video
                                src={`${process.env.REACT_APP_API_URL}/uploads/videos/${media.mediaFilename}`}
                                className="w-full h-32 object-cover rounded-lg transform group-hover:scale-105 transition-transform"
                              />
                            </>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all"></div>
                              <FontAwesomeIcon
                                icon={faImage}
                                className="absolute top-2 right-2 text-white text-xl z-10"
                              />
                              <img
                                src={`${process.env.REACT_APP_API_URL}/uploads/images/${media.mediaFilename}`}
                                alt={`Procedure ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg transform group-hover:scale-105 transition-transform"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Add Procedure Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Add New Procedure
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
                    <label className="block text-gray-700 font-medium mb-1">
                      Procedure Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="procedure_name"
                      value={formData.procedure_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          procedure_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-soft-blue-500 focus:border-soft-blue-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Media (Images/Videos - Max 5 files)
                      <span className="text-sm text-gray-500 ml-2">
                        {formData.media.length}/5 files selected
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="w-full mb-2"
                      multiple
                      disabled={formData.media.length >= 5}
                    />
                    {/* Media Preview */}
                    {formData.media.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {formData.media.map((file, index) => (
                          <div key={index} className="relative group">
                            {file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-24 object-cover rounded-lg"
                                controls
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="w-3 h-3"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-3 py-2 bg-soft-blue-600 text-white rounded-md hover:bg-soft-blue-700 text-sm ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Adding..." : "Add Procedure"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Procedure Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-soft-blue-600 to-soft-blue-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Edit Procedure
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Procedure Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.procedure_name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          procedure_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      rows="4"
                    />
                  </div>

                  {/* Existing Media */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Current Media
                      <span className="text-sm text-gray-500 ml-2">
                        ({editFormData.media.length} files)
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {editFormData.media.map((media, index) => (
                        <div key={index} className="relative group">
                          <button
                            type="button"
                            onClick={() => removeEditMedia(index, true)}
                            className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              className="w-3 h-3"
                            />
                          </button>
                          {media.mediaType === "video/mp4" ? (
                            <>
                              <FontAwesomeIcon
                                icon={faFileVideo}
                                className="absolute top-2 right-2 text-white text-xl z-10"
                              />
                              <video
                                src={`${process.env.REACT_APP_API_URL}/uploads/videos/${media.mediaFilename}`}
                                className="w-full h-24 object-cover rounded-lg"
                                controls
                              />
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faImage}
                                className="absolute top-2 right-2 text-white text-xl z-10"
                              />
                              <img
                                src={`${process.env.REACT_APP_API_URL}/uploads/images/${media.mediaFilename}`}
                                alt={`Media ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* New Media Upload */}
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Add New Media
                      <span className="text-sm text-gray-500 ml-2">
                        (Max {5 - editFormData.media.length} additional files)
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleEditFileChange}
                      className="w-full mb-2"
                      multiple
                      disabled={
                        editFormData.media.length +
                          editFormData.newMedia.length >=
                        5
                      }
                    />
                    {/* New Media Preview */}
                    {editFormData.newMedia.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {editFormData.newMedia.map((file, index) => (
                          <div key={index} className="relative group">
                            <button
                              type="button"
                              onClick={() => removeEditMedia(index, false)}
                              className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="w-3 h-3"
                              />
                            </button>
                            {file.type.startsWith("image/") ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-24 object-cover rounded-lg"
                                controls
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 bg-soft-blue-600 text-white rounded-md hover:bg-soft-blue-700 flex items-center ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md my-8">
            <div className="max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
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
                      Delete this procedure?
                    </h4>
                    <p className="text-gray-500">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    Delete Procedure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Media Modal */}
      {fullscreenMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center">
            <button
              onClick={() => setFullscreenMedia(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
            {fullscreenMedia.mediaType === "video/mp4" ? (
              <video
                src={`${process.env.REACT_APP_API_URL}/uploads/videos/${fullscreenMedia.mediaFilename}`}
                className="w-full h-auto max-h-[85vh] rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads/images/${fullscreenMedia.mediaFilename}`}
                alt="Fullscreen view"
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcedureManage;
