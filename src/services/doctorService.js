import apiClient from "./apiClient";

class DoctorService {
  /**
   * Get current doctor data
   * @returns {Object} - Doctor data
   */
  async getCurrentUser() {
    const userId = localStorage.getItem("user_id");
    try {
      const response = await apiClient.get(`/doctor/view/${userId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all patients assigned to the logged-in doctor
   * @returns {Promise} - API response with patients data
   */
  async getAssignedPatients() {
    try {
      const response = await apiClient.get("/doctor/assigned_patients");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get assigned patients with their last login time
   * @returns {Promise} - API response with patients data including last login
   */
  async getAssignedPatientsWithStatus() {
    try {
      const response = await apiClient.get("/doctor/assigned_patients_status");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get patient queries for the logged-in doctor
   * @returns {Promise} - API response with queries data
   */
  async getPatientQueries() {
    try {
      const response = await apiClient.get("/doctor/patient_queries");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reply to a patient query
   * @param {String} queryId - ID of the query to reply to
   * @param {String} replyText - The doctor's reply text
   * @returns {Promise} - API response
   */
  async replyToQuery(queryId, replyText) {
    try {
      const response = await apiClient.post(`/doctor/reply_query/${queryId}`, {
        reply: replyText,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get patient details by ID
   * @param {String} patientId - ID of the patient
   * @returns {Promise} - API response with patient data
   */
  async getPatientDetails(patientId) {
    try {
      const response = await apiClient.get(`/doctor/patient/${patientId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTotalDoctorCount() {
    try {
      const response = await apiClient.get("/doctors/me/patients/count");
      return response.data.count;
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

  // /**
  //  * Get chat history with a specific patient
  //  * @param {string} patientId - The patient's ID
  //  * @returns {Array} - List of chat messages
  //  */
  // async getChatHistory(patientId) {
  //   const userId = localStorage.getItem('user_id');
  //   try {
  //     const response = await apiClient.get(`/queries/doctor/${userId}/chat/${patientId}`);
  //     return response.data.data;
  //   } catch (error) {
  //     throw this.handleError(error);
  //   }
  // }

  /**
   * Get chat history with a specific doctor
   * @param {string} patientId - The doctor's ID
   * @returns {Array} - List of chat messages
   */
  async getChatHistory(patientId) {
    const doctorId = localStorage.getItem("user_id");
    try {
      const response = await apiClient.get(
        `/queries/doctor/${doctorId}/patient/${patientId}`
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  /**
   * Send a chat message to a patient
   * @param {string} message - The message text
   * @returns {Object} - Message response data
   */
  async sendChatMessage(message) {
    try {
      const response = await apiClient.post(`/queries/doctor_create`, message);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Create instance before exporting
const doctorService = new DoctorService();
export default doctorService;
