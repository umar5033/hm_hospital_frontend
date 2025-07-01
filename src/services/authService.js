import apiClient from './apiClient';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/api/patient_register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async treatment() {
    try {
      const response = await apiClient.get('/treatment/read');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - API response with user data and token
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/api/login', credentials);
      
      // Store token and user type in localStorage
      // console.log(response.data.data)
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('userType', response.data.data.userType);
        localStorage.setItem('user_id', response.data.data.user_id);

      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user_id');
    window.location.href = '/login';
  }

  /**
   * Logout user
   */
  getUserDetail_from_local() {
    localStorage.getItem('userType');
    localStorage.getItem('user_id');
  }

  /**
   * Check if user is authenticated
   * @returns {Boolean} - Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    // Check if both token and userType exist
    return !!(token && userType);
  }

  /**
   * Get user type (doctor, admin, patient)
   * @returns {String} - User type
   */
  getUserType() {
    return localStorage.getItem('userType') || '';
  }

  /**
   * Handle browser history navigation
   * This prevents authenticated users from accessing login page via browser back button
   */
  handleBrowserNavigation() {
    if (this.isAuthenticated()) {
      window.history.pushState(null, '', window.location.pathname);
      
      window.addEventListener('popstate', () => {
        const userType = this.getUserType();
        
        // Redirect based on user type
        if (userType === 'doctor') {
          window.location.replace('/doctor-dashboard');
        } else if (userType === 'admin') {
          window.location.replace('/admin-dashboard');
        } else if (userType === 'patient') {
          window.location.replace('/patient-dashboard');
        }
      });
    }
  }

  /**
   * Request password reset by sending OTP to email
   * @param {Object} data - Contains email
   * @returns {Promise} - API response
   */
  async forgotPassword(data) {
    try {
      const response = await apiClient.post('/auth/api/forgot_password', data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify OTP sent to email
   * @param {Object} data - Contains email and OTP
   * @returns {Promise} - API response
   */
  async verifyOtp(data) {
    try {
      const response = await apiClient.post('/auth/api/otp_verification', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with new password
   * @param {Object} data - Contains email and new password
   * @returns {Promise} - API response
   */
  async resetPassword(data) {
    try {
      const response = await apiClient.post('/auth/api/reset_password', data);
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
    let message = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // Server responded with error
      message = error.response.data.message || message;
    } else if (error.request) {
      // Request made but no response
      message = 'No response from server. Please try again later.';
    }
    
    return {
      message,
      originalError: error
    };
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;