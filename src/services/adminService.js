import apiClient from "./apiClient";

class AdminService {
  /**
   * Get current user data
   * @returns {Object} - User data
   */
  async getCurrentUser() {
    const userId = localStorage.getItem("user_id");
    try {
      const response = await apiClient.get(`/admin/view/${userId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  /**
   * Get pending registration approvals
   * @returns {Promise} - API response with pending approvals
   */
  async getPendingApprovals() {
    try {
      const response = await apiClient.get("/patient/read");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Approve a user registration
   * @param {String} userId - ID of the user to approve
   * @returns {Promise} - API response
   */
  async approveUser(patientId) {
    try {
      let userType = localStorage.getItem("userType");
      let approved_by = localStorage.getItem("user_id");
      if (userType === "admin") {
        const response = await apiClient.put(
          `/auth/api/patient_approval/${patientId}`,
          { approved_by }
        );
        return response.data;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async TotalPatientCount() {
    try {
      const response = await apiClient.get("/admin/patient_total_count");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reject a user registration
   * @param {String} userId - ID of the user to reject
   * @param {Object} decline_userData - Data for decline including reason
   * @returns {Promise} - API response
   */
  async rejectUser(decline_userData, userId) {
    try {
      const response = await apiClient.post(
        `/auth/api/patient_decline/${userId}`,
        decline_userData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all doctors in the system
   * @returns {Promise} - API response with doctors data
   */
  async getDoctors() {
    let currentUser = localStorage.getItem("user_id");
    try {
      const response = await apiClient.get(
        `/doctor/doctor_list/${currentUser}`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all patients in the system
   * @returns {Promise} - API response with patients data
   */
  async getApprovePatients() {
    let currentUser = localStorage.getItem("user_id");
    try {
      const response = await apiClient.get(
        `/patient/approved_patient_list/${currentUser}`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all patients in the system
   * @returns {Promise} - API response with patients data
   */
  async getNonApprovePatients() {
    try {
      const response = await apiClient.get("/patient/declined_patient_list");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a new doctor to the system
   * @param {Object} doctorData - Doctor details
   * @returns {Promise} - API response
   */
  async addDoctor(doctorData) {
    try {
      const response = await apiClient.post(
        "/auth/api/doctor_register",
        doctorData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing doctor's details
   * @param {String} doctorId - ID of the doctor to update
   * @param {Object} doctorData - Updated doctor details
   * @returns {Promise} - API response
   */
  async updateDoctor(doctorId, doctorData) {
    try {
      const response = await apiClient.put(
        `/doctor/update/${doctorId}`,
        doctorData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing patient's details
   * @param {String} patientId - ID of the patient to update
   * @param {Object} patientData - Updated patient details
   * @returns {Promise} - API response
   */
  async updatePatient(patientId, patientData) {
    try {
      const response = await apiClient.put(
        `/patient/update/${patientId}`,
        patientData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a doctor from the system
   * @param {String} doctorId - ID of the doctor to delete
   * @returns {Promise} - API response
   */
  async deleteDoctor(doctorId) {
    try {
      const response = await apiClient.delete(`/doctor/delete/${doctorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all treatments
   * @returns {Promise} - API response with treatments data
   */
  async getTreatments() {
    try {
      const response = await apiClient.get("/treatment/read");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get treatment details by ID including procedures
   * @param {string} treatmentId - ID of the treatment to view
   * @returns {Promise} - API response with treatment details and procedures
   */
  async getTreatmentById(treatmentId) {
    try {
      const response = await apiClient.get(`/treatment/view/${treatmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a new treatment
   * @param {FormData} treatmentData - Treatment data including files
   * @returns {Promise} - API response
   */
  async addTreatment(treatmentData) {
    try {
      const response = await apiClient.post(
        "/treatment/create",
        treatmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing treatment
   * @param {String} treatmentId - ID of the treatment to update
   * @param {FormData} treatmentData - Updated treatment data including files
   * @returns {Promise} - API response
   */
  async updateTreatment(treatmentId, treatmentData) {
    try {
      const response = await apiClient.put(
        `/treatment/update/${treatmentId}`,
        treatmentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a treatment
   * @param {String} treatmentId - ID of the treatment to delete
   * @returns {Promise} - API response
   */
  async deleteTreatment(treatmentId) {
    try {
      const response = await apiClient.delete(
        `/treatment/delete/${treatmentId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a new procedure
   * @param {FormData} procedureData - Procedure data including files (procedure_name, treatment_id, images, videos, description, created_by)
   * @returns {Promise} - API response
   */
  async addProcedure(procedureData) {
    try {
      const response = await apiClient.post(
        "/treatment/procedure/create",
        procedureData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing procedure
   * @param {String} procedureId - ID of the procedure to update
   * @param {FormData} procedureData - Updated procedure data including files
   * @returns {Promise} - API response
   */
  async updateProcedure(procedureId, procedureData) {
    try {
      const response = await apiClient.put(
        `/treatment/procedure/update/${procedureId}`,
        procedureData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  /**
   * Delete a procedure
   * @param {String} procedureId - ID of the procedure to delete
   * @returns {Promise} - API response
   */
  async deleteProcedure(procedureId) {
    try {
      const response = await apiClient.delete(
        `/treatment/procedure/delete/${procedureId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get system statistics
   * @returns {Promise} - API response with statistics
   */
  async getStatistics() {
    try {
      const response = await apiClient.get("/admins/statistics");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate system reports
   * @param {String} reportType - Type of report to generate
   * @param {Object} params - Report parameters
   * @returns {Promise} - API response with report data
   */
  async generateReport(reportType, params = {}) {
    try {
      const response = await apiClient.post("/admins/reports", {
        reportType,
        ...params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Object} error - Error object
   * @returns {Object} - Formatted error
   * @private
   */
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        message: error.response.data.message || "An error occurred",
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 500,
        message: "No response received from server",
        data: null,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 500,
        message: error.message || "An unknown error occurred",
        data: null,
      };
    }
  }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;
