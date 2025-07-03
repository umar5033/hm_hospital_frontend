import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faSignOutAlt,
  faUserCheck,
  faUserTimes,
  faUserMd,
  faHospitalUser,
  faStethoscope,
  // faUserCog,
  // faClipboardCheck,
  // faChartLine,
  faExclamationTriangle,
  faUser,
  faCaretDown,
  faCheck,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faBolt,
  faBars,
  // faList,
} from "@fortawesome/free-solid-svg-icons";

import adminService from "../../services/adminService";
import authService from "../../services/authService";

const AdminDashboard = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const [totalPatients, setTotalPatients] = useState([]);
  // const [totalDoctors, setTotalDoctors] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedPatients, setApprovedPatients] = useState([]);
  const [nonApprovedPatients, setNonApprovedPatients] = useState([]);
  // const [pendingPatientsList, setPendingPatientsList] = useState([]);
  // const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState({});
  const [approveAndDeclineCount, setApproveAndDeclineCount] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [allPatients, setAllPatients] = useState([]);
  // const [approvedPatientsList, setApprovedPatientsList] = useState([]);
  // const [nonApprovedPatientsList, setNonApprovedPatientsList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("pending"); // 'pending', 'approved', 'nonapproved'

  // Pagination states for each tab
  const [currentPage, setCurrentPage] = useState({
    pending: 1,
    approved: 1,
    nonapproved: 1,
  });
  const recordsPerPage = 15;

  // Function to sort patients by name in ascending order
  const sortPatientsByName = (patients) => {
    console.log(patients, "patients");
    let value = patients.sort((a, b) => b.id - a.id);
    return value;
  };

  // New states for mobile responsiveness
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Function to change language
  const changeLanguage = (lang) => {
    console.log(`Changing language to: ${lang}`);

    // Check if Google Translate is available through global function
    if (window.doGTranslate) {
      try {
        window.doGTranslate("en|" + lang);
        console.log("Used doGTranslate function");
        return;
      } catch (error) {
        console.error("Error using doGTranslate:", error);
      }
    }

    // Try the classic Google Translate widget as fallback
    try {
      if (window.google && window.google.translate) {
        const teCombo = document.querySelector(".goog-te-combo");
        if (teCombo) {
          teCombo.value = lang;
          if (document.createEvent) {
            const event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            teCombo.dispatchEvent(event);
          } else {
            teCombo.fireEvent("onchange");
          }
          console.log("Used Google Translate widget");
          return;
        }
      } else {
        console.log("Google Translate not fully loaded yet");
        // Store selected language for later use
        window.pendingLanguageChange = `en|${lang}`;
      }
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };
  // Toggle sidebar for smaller screens
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // State for confirmation modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [confirmationType, setConfirmationType] = useState(null); // 'approve' or 'deny'

  useEffect(() => {
    // Prevent authenticated users from going back to login page
    authService.handleBrowserNavigation();

    // Fetch user data from your auth service or API
    const fetchUserData = async () => {
      try {
        const userData = await adminService.getCurrentUser(); // Adjust this method as necessary
        const TotalCount = await adminService.TotalPatientCount();
        // console.log('User data:', userData, TotalCount);
        setApproveAndDeclineCount(TotalCount);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const Approvals = async () => {
      try {
        const pending = await adminService.getPendingApprovals();
        const approvedList = await adminService.getApprovePatients();
        const nonApprovedList = await adminService.getNonApprovePatients();
        // console.log('Pending approvals:', approvedList);
        setNonApprovedPatients(sortPatientsByName(nonApprovedList));
        setApprovedPatients(sortPatientsByName(approvedList));
        setPendingApprovals(pending);
      } catch (error) {
        console.error("Error fetching pending approvals:", error);
        setError("Failed to load pending approvals");
      }
    };
    Approvals();
  }, []);
  // useEffect for ensuring Google Translate is properly initialized
  useEffect(() => {
    // Using a safer approach to monitor Google Translate initialization
    let translateInitCheckInterval;

    const checkTranslateInitialization = () => {
      if (window.google && window.google.translate) {
        console.log("Google Translate has been initialized");
        clearInterval(translateInitCheckInterval);

        // Apply any pending language change if needed
        if (window.pendingLanguageChange) {
          setTimeout(() => {
            if (window.doGTranslate) {
              window.doGTranslate(window.pendingLanguageChange);
              window.pendingLanguageChange = null;
            }
          }, 500);
        }
      }
    };

    // Check every second instead of using MutationObserver
    translateInitCheckInterval = setInterval(
      checkTranslateInitialization,
      1000
    );

    return () => {
      clearInterval(translateInitCheckInterval);
    };
  }, []);

  // Pagination helper functions
  const indexOfLastRecord = (category) =>
    currentPage[category] * recordsPerPage;
  const indexOfFirstRecord = (category) =>
    indexOfLastRecord(category) - recordsPerPage;

  // Get current records for each category
  const currentPendingRecords = pendingApprovals.slice(
    indexOfFirstRecord("pending"),
    indexOfLastRecord("pending")
  );
  const currentApprovedRecords = approvedPatients.slice(
    indexOfFirstRecord("approved"),
    indexOfLastRecord("approved")
  );
  const currentNonApprovedRecords = nonApprovedPatients.slice(
    indexOfFirstRecord("nonapproved"),
    indexOfLastRecord("nonapproved")
  );

  // Calculate total pages for each category
  const totalPendingPages = Math.ceil(pendingApprovals.length / recordsPerPage);
  const totalApprovedPages = Math.ceil(
    approvedPatients.length / recordsPerPage
  );
  const totalNonApprovedPages = Math.ceil(
    nonApprovedPatients.length / recordsPerPage
  );

  // Page change handler
  const handlePageChange = (category, pageNumber) => {
    setCurrentPage({
      ...currentPage,
      [category]: pageNumber,
    });
  };

  // Pagination component
  const Pagination = ({ category, totalPages }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() =>
              handlePageChange(category, Math.max(1, currentPage[category] - 1))
            }
            disabled={currentPage[category] === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage[category] === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
            }`}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {[...Array(totalPages)].map((_, i) => {
            // Show limited page numbers for better UI
            if (totalPages > 7) {
              // Always show first page, last page, current page, and pages adjacent to current
              if (
                i === 0 ||
                i === totalPages - 1 ||
                i === currentPage[category] - 1 ||
                i === currentPage[category] - 2 ||
                i === currentPage[category] ||
                (i === currentPage[category] - 3 &&
                  currentPage[category] > 3) ||
                (i === currentPage[category] + 1 &&
                  currentPage[category] < totalPages - 2)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(category, i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage[category] === i + 1
                        ? "bg-soft-blue-600 text-white"
                        : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
              // Show ellipsis in the middle
              if (
                (i === 1 && currentPage[category] > 3) ||
                (i === totalPages - 2 && currentPage[category] < totalPages - 2)
              ) {
                return (
                  <span key={i} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            }

            // For fewer pages, show all page numbers
            return (
              <button
                key={i}
                onClick={() => handlePageChange(category, i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage[category] === i + 1
                    ? "bg-soft-blue-600 text-white"
                    : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}

          <button
            onClick={() =>
              handlePageChange(
                category,
                Math.min(totalPages, currentPage[category] + 1)
              )
            }
            disabled={currentPage[category] === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage[category] === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
            }`}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    );
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  const handleDocotrs = () => {
    window.location.href = "/doctor-manage";
  };

  const handlePatient = () => {
    window.location.href = "/patient-manage";
  };

  const handleTreatment = () => {
    window.location.href = "/treatments-manage";
  };

  const handleLogout = () => {
    authService.logout(); // Call the logout function from your auth service
  };

  // Close the menu when clicking outside
  const handleClickOutside = (e) => {
    if (showUserMenu && e.target.closest(".user-menu-container") === null) {
      setShowUserMenu(false);
    }
  };

  // Add event listener when component mounts
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleApproveClick = (patient) => {
    setSelectedPatient(patient);
    setConfirmationType("approve");
    setShowApprovalModal(true);
  };

  const handleDenyClick = (patient) => {
    setSelectedPatient(patient);
    setConfirmationType("deny");
    setShowRejectionModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedPatient) return;

    try {
      await adminService.approveUser(selectedPatient.id);

      // Remove from pending and add to approved
      setPendingApprovals((prevPending) =>
        prevPending.filter((patient) => patient.id !== selectedPatient.id)
      );
      setApprovedPatients((prevApproved) =>
        sortPatientsByName([...prevApproved, selectedPatient])
      );

      // Refresh the count
      const TotalCount = await adminService.TotalPatientCount();
      setApproveAndDeclineCount(TotalCount);

      setShowApprovalModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error approving patient:", error);
      setError("Failed to approve patient");
    }
  };

  const handleDeny = (patientId, name, email, mobile, care_of, gender) => {
    let declinePatientDetails = {
      patientId,
      name,
      email,
      mobile,
      care_of,
      gender,
      decline_by: localStorage.getItem("user_id"),
    };
    setSelectedPatientDetail(declinePatientDetails);
    setShowRejectionModal(true);
  };

  const handleConfirmDeny = async () => {
    if (!selectedPatientDetail) return;

    try {
      await adminService.rejectUser(
        selectedPatientDetail,
        selectedPatientDetail.patientId
      );

      // Remove from pending
      setPendingApprovals((prevPending) =>
        prevPending.filter(
          (patient) => patient.id !== selectedPatientDetail.patientId
        )
      );

      // Add to non-approved list
      setNonApprovedPatients((prevNonApproved) => [
        ...prevNonApproved,
        {
          id: selectedPatientDetail.patientId,
          name: selectedPatientDetail.name,
          email: selectedPatientDetail.email,
          mobile: selectedPatientDetail.mobile,
          care_of: selectedPatientDetail.care_of,
          gender: selectedPatientDetail.gender,
        },
      ]);

      // Refresh the count
      const TotalCount = await adminService.TotalPatientCount();
      setApproveAndDeclineCount(TotalCount);

      // Close modal and reset state
      setShowRejectionModal(false);

      setSelectedPatientDetail(null);
    } catch (error) {
      console.error("Error denying patient:", error);
      setError("Failed to deny patient");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {" "}
      {/* Header */}
      <header className="bg-soft-blue-600 text-white shadow fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                className="text-white p-2 rounded-md lg:hidden"
                onClick={toggleSidebar}
              >
                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
              </button>
              <h1 className="text-xl font-bold flex items-center ml-2 lg:ml-0">
                <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Language Switcher Quick Access */}
              <div className="relative flex items-center"></div>
              {/* User Profile Dropdown */}
              <div className="relative user-menu-container">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-soft-blue-700 hover:bg-soft-blue-800 text-white px-3 py-2 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span className="hidden md:inline font-medium">
                    {currentUser?.name || "Admin"}
                  </span>
                  <FontAwesomeIcon icon={faCaretDown} className="text-xs" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Language
                      </p>{" "}
                      <div className="flex justify-between space-x-2">
                        <button
                          onClick={() => changeLanguage("en")}
                          className="flex items-center justify-center px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          English
                        </button>
                        <button
                          onClick={() => changeLanguage("hi")}
                          className="flex items-center justify-center px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                        >
                          हिन्दी
                        </button>
                      </div>
                      <div id="google_translate_element" className="mt-2"></div>
                    </div>
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm leading-5 font-medium text-gray-900">
                        {currentUser?.name || "Admin"}
                      </p>
                      <p className="text-sm leading-5 text-gray-600 truncate">
                        {currentUser?.email || "admin@example.com"}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <FontAwesomeIcon
                          icon={faSignOutAlt}
                          className="mr-2 text-gray-500"
                        />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */} {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
                onClick={() => setMobileMenuOpen(false)}
              ></div>
            )}
            {/* Sidebar */}
            <aside
              className={`fixed lg:static inset-y-0 left-0 z-30 lg:z-0 w-64 transform transition-transform duration-300 ease-in-out lg:transform-none ${
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0 lg:flex-shrink-0 h-[calc(100vh-4rem)] lg:h-auto overflow-y-auto bg-white shadow-lg lg:shadow-none`}
            >
              <nav className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">
                    Navigation
                  </h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  <li>
                    <button
                      onClick={() => {
                        setActiveCategory("dashboard");
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeCategory === "dashboard"
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
                        setActiveCategory("pending");
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeCategory === "pending"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="mr-3 w-5"
                      />
                      Pending Approvals
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveCategory("approved");
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeCategory === "approved"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className="mr-3 w-5"
                      />
                      Approved Patients
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveCategory("nonapproved");
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeCategory === "nonapproved"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faUserTimes}
                        className="mr-3 w-5"
                      />
                      Non-Approved Patients
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleDocotrs();
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <FontAwesomeIcon icon={faUserMd} className="mr-3 w-5" />
                      Manage Doctors
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handlePatient();
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faHospitalUser}
                        className="mr-3 w-5"
                      />
                      Manage Patients
                    </button>
                    <button
                      onClick={() => {
                        handleTreatment();
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <FontAwesomeIcon
                        icon={faStethoscope}
                        className="mr-3 w-5"
                      />
                      Manage Treatments
                    </button>
                  </li>
                </ul>
              </nav>
            </aside>
            {/* Main Content Area */}
            <div className="flex-1">
              {activeCategory === "dashboard" ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Welcome, {currentUser?.name || "Admin"}!
                    </h2>
                    <p className="text-gray-600">
                      Here's your admin dashboard. Manage patients, doctors, and
                      hospital operations.
                    </p>
                  </div>

                  {approveAndDeclineCount.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {/* Pending Approvals Card */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">
                              Pending Approvals
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item?.patientPendingCount} new registrations
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveCategory("pending")}
                          className="w-full mt-2 p-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100"
                        >
                          View Pending
                        </button>
                      </div>

                      {/* Approved Patients Card */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <FontAwesomeIcon icon={faUserCheck} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">
                              Approved Patients
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item?.patientApprovedCount} approved
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveCategory("approved")}
                          className="w-full mt-2 p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                        >
                          View Approved
                        </button>
                      </div>

                      {/* Non-Approved Patients Card */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                            <FontAwesomeIcon icon={faUserTimes} />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">
                              Non-Approved
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item?.patientDeclineCount} declined
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveCategory("nonapproved")}
                          className="w-full mt-2 p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        >
                          View Non-Approved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Rest of the content for other categories (tables)
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    <FontAwesomeIcon
                      icon={
                        activeCategory === "pending"
                          ? faExclamationTriangle
                          : activeCategory === "approved"
                          ? faUserCheck
                          : faUserTimes
                      }
                      className={`mr-2 ${
                        activeCategory === "pending"
                          ? "text-yellow-600"
                          : activeCategory === "approved"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                    {activeCategory === "pending"
                      ? "Pending Patients"
                      : activeCategory === "approved"
                      ? "Approved Patients"
                      : "Non-Approved Patients"}
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Care Of
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Mobile No
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Gender
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeCategory === "pending" &&
                          (currentPendingRecords.length === 0 ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-4 py-4 text-center text-gray-500"
                              >
                                No pending patients.
                              </td>
                            </tr>
                          ) : (
                            currentPendingRecords.map((patient) => (
                              <tr key={patient.id}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.email}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.careOf || patient.care_of || ""}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.mobile}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.gender || ""}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                      onClick={() =>
                                        handleApproveClick(patient)
                                      }
                                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center justify-center w-full sm:w-auto"
                                    >
                                      <FontAwesomeIcon
                                        icon={faCheck}
                                        className="mr-1"
                                      />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeny(
                                          patient.id,
                                          patient.name,
                                          patient.email,
                                          patient.gender,
                                          patient.mobile || patient.mobile,
                                          patient.careOf || patient.care_of
                                        )
                                      }
                                      className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center w-full sm:w-auto"
                                    >
                                      <FontAwesomeIcon
                                        icon={faTimes}
                                        className="mr-1"
                                      />
                                      Deny
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ))}
                        {activeCategory === "approved" &&
                          (currentApprovedRecords.length === 0 ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-4 py-4 text-center text-gray-500"
                              >
                                No approved patients.
                              </td>
                            </tr>
                          ) : (
                            currentApprovedRecords.map((patient) => (
                              <tr key={patient.id}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.email}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.care_Of || patient.care_of || ""}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.mobile}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.gender || ""}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center w-fit">
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className="mr-1"
                                    />
                                    Approved
                                  </span>
                                </td>
                              </tr>
                            ))
                          ))}
                        {activeCategory === "nonapproved" &&
                          (currentNonApprovedRecords.length === 0 ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-4 py-4 text-center text-gray-500"
                              >
                                No non-approved patients.
                              </td>
                            </tr>
                          ) : (
                            currentNonApprovedRecords.map((patient) => (
                              <tr key={patient.id}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.email}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.care_Of || patient.care_of || ""}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.mobile}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {patient.gender || ""}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded flex items-center w-fit">
                                    <FontAwesomeIcon
                                      icon={faTimes}
                                      className="mr-1"
                                    />
                                    Denied
                                  </span>
                                </td>
                              </tr>
                            ))
                          ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {(activeCategory === "pending" && totalPendingPages > 1) ||
                    (activeCategory === "approved" && totalApprovedPages > 1) ||
                    (activeCategory === "nonapproved" &&
                      totalNonApprovedPages > 1) ? (
                      <div className="mt-6">
                        <Pagination
                          category={activeCategory}
                          totalPages={
                            activeCategory === "pending"
                              ? totalPendingPages
                              : activeCategory === "approved"
                              ? totalApprovedPages
                              : totalNonApprovedPages
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Rejection Modal */}
      {showRejectionModal && selectedPatientDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Deny Patient Registration
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUserTimes}
                    className="text-red-600"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedPatientDetail.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPatientDetail.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Mobile:</span>{" "}
                  {selectedPatientDetail.mobile}
                </p>
                <p>
                  <span className="font-medium">Care of:</span>{" "}
                  {selectedPatientDetail.care_of}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to deny this patient's registration? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedPatientDetail(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeny}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Confirm Deny
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Approval Confirmation Modal */}
      {showApprovalModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Patient Approval
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-soft-blue-100 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-soft-blue-600"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedPatient.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Mobile:</span>{" "}
                  {selectedPatient.mobile}
                </p>
                <p>
                  <span className="font-medium">Care of:</span>{" "}
                  {selectedPatient.care_of}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this patient's registration? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedPatient(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
