import apiClient from "./apiClient";

class PatientService {
  /**
   * Get current user data
   * @returns {Object} - User data
   */
  async getCurrentUser() {
    const userId = localStorage.getItem("user_id");

    try {
      const response = await apiClient.get(`/patient/view/${userId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a query to a doctor
   * @param {string} query - The query text
   * @returns {Object} - Query response data
   */
  async queryDoctor(query) {
    const userId = localStorage.getItem("user_id");

    try {
      const response = await apiClient.post(`/patient/${userId}/query-doctor`, {
        query,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get doctor replies to patient queries
   * @returns {Array} - List of doctor replies
   */
  async getDoctorReplies() {
    const userId = localStorage.getItem("user_id");

    try {
      const response = await apiClient.get(`/patient/${userId}/doctor-replies`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of doctors
   * @returns {Array} - List of doctors
   */
  async getDoctorList() {
    try {
      const response = await apiClient.get("/doctors");
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get chat history with a specific doctor
   * @param {string} doctorId - The doctor's ID
   * @returns {Array} - List of chat messages
   */
  async getChatHistory(doctorId) {
    const patientId = localStorage.getItem("user_id");
    try {
      const response = await apiClient.get(
        `/queries/patient/${patientId}/doctor/${doctorId}`
      );
      
      return response.data.data;

    } catch (error) {
      throw this.handleError(error);
    }
  }
  

  /**
   * Send a chat message to a doctor
   * @param {string} message - The message text
   * @returns {Object} - Message response data
   */
  async sendChatMessage(message) {
    try {
      const response = await apiClient.post(`/queries/patient_create`, message);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Object} error - Error object
   * @returns {Object} - Standardized error object
   */
  handleError(error) {
    let message = "Something went wrong. Please try again.";

    if (error.response) {
      // Server responded with error
      message = error.response.data.message || message;
    } else if (error.request) {
      // Request made but no response
      message = "No response from server. Please try again later.";
    }

    return {
      message,
      originalError: error,
    };
  }
}

// Create instance before exporting
const patientService = new PatientService();
export default patientService;
