import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faSignOutAlt,
  faUser,
  faCaretDown,
  faBolt,
  faHospitalUser,
  faCommentMedical,
  faBars,
  faTimes,
  // faReply,
  // faCheckCircle,
  faList,
  faPaperPlane,
  faChevronLeft,
  faComments,
  // faBell,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../../services/authService";
import doctorService from "../../services/doctorService";
import adminService from "../../services/adminService";

const DoctorDashboard = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [queryStatus, setQueryStatus] = useState("");
  const [treatments, setTreatments] = useState([]);
  // Chat functionality
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const chatPollingIntervalRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    // Prevent authenticated users from going back to login page
    authService.handleBrowserNavigation();

    const fetchUserData = async () => {
      try {
        const userData = await adminService.getCurrentUser();
        // console.log('Doctor data from API:', userData);
        setCurrentUser(userData || {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "patients":
            const patientList = await adminService.getApprovePatients();
            // console.log("Patients data from API:", patientList);
            setPatients(patientList || []);
            break;
          case "queries":
            const patientListQueries = await adminService.getApprovePatients();
            // console.log("Patients data from API:", patientList);
            setPatients(patientListQueries || []);
            break;
          case "treatments":
            const treatmentsList = await adminService.getTreatments();
            setTreatments(treatmentsList || []);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== "dashboard") {
      fetchData();
    }
  }, [activeTab]);

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !selectedQuery) {
      setQueryStatus("Please enter your reply");
      return;
    }

    setQueryStatus("Sending reply...");
    try {
      await doctorService.replyToQuery(selectedQuery.id, replyText);
      setQueryStatus("Reply sent successfully!");
      setReplyText("");
      setSelectedQuery(null);

      // Refresh queries list
      const updatedQueries = await doctorService.getPatientQueries();
      setQueries(updatedQueries || []);
    } catch (error) {
      setQueryStatus("Failed to send reply. Please try again.");
    }
  };
  // Function to fetch latest messages
  const fetchLatestMessages = async (patientId) => {
    if (!patientId) return;

    try {
      const history = await doctorService.getChatHistory(patientId);
      if (history && history.length > 0) {
        // Only update if we have new messages or different message count
        if (
          chatMessages.length !== history.length ||
          JSON.stringify(history) !== JSON.stringify(chatMessages)
        ) {
          setChatMessages(history);
          // Scroll to bottom when new messages are fetched
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error fetching latest messages:", error);
    }
  };
  const handlePatientSelect = async (patient) => {
    // Clear any existing polling interval when switching patients
    if (chatPollingIntervalRef.current) {
      clearInterval(chatPollingIntervalRef.current);
    }

    setSelectedPatient(patient);
    setIsChatLoading(true);
    try {
      const history = await doctorService.getChatHistory(patient.id);
      setChatMessages(history || []);
      const patientList = await adminService.getApprovePatients();
      // console.log("Patients data from API:", patientList);
      setPatients(patientList || []);

      // Setup polling for new messages every 5 seconds
      chatPollingIntervalRef.current = setInterval(() => {
        fetchLatestMessages(patient.id);
      }, 5000);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsChatLoading(false);
      // Scroll to bottom after a small delay to ensure DOM is updated
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedPatient) return;

    const tempMessage = {
      doctorId: localStorage.getItem("user_id"),
      patientId: selectedPatient.id,
      sender_id: localStorage.getItem("user_id"),
      message: chatMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, tempMessage]);
    setChatMessage("");

    try {
      await doctorService.sendChatMessage(tempMessage);
      // Update the message to remove pending status
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, pending: false } : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the failed message
      setChatMessages((prev) =>
        prev.filter((msg) => msg.id !== tempMessage.id)
      );
    }
  };
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Scroll to bottom when chat loading completes
  useEffect(() => {
    if (!isChatLoading && chatContainerRef.current && chatMessages.length > 0) {
      setTimeout(() => {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [isChatLoading, chatMessages.length]);

  // Cleanup polling interval when component unmounts or tab changes
  useEffect(() => {
    return () => {
      if (chatPollingIntervalRef.current) {
        clearInterval(chatPollingIntervalRef.current);
      }
    };
  }, [activeTab]);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleClickOutside = (e) => {
    const menu = document.querySelector(".user-menu-container");
    if (menu && !menu.contains(e.target)) {
      setShowUserMenu(false);
    }
  };

  useEffect(() => {
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);
  // Initialize Google Translate when the user menu becomes visible
  useEffect(() => {
    if (showUserMenu) {
      const initializeGoogleTranslate = () => {
        // Check if Google Translate is available
        if (
          window.google &&
          window.google.translate &&
          typeof window.google.translate.TranslateElement === "function"
        ) {
          const translateElement = document.getElementById(
            "google_translate_element"
          );
          // Initialize if the element exists and hasn't been initialized (i.e., is empty)
          if (translateElement && translateElement.children.length === 0) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages: "en,hi",
                layout:
                  window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              },
              "google_translate_element"
            );
          }
        }
      };
      // Call initialization logic
      // A slight delay can sometimes help ensure the DOM is fully ready and Google's scripts are loaded
      setTimeout(initializeGoogleTranslate, 300);
    }
  }, [showUserMenu]);

  // useEffect for ensuring Google Translate is properly initialized
  useEffect(() => {
    // Monitor for changes to detect when Google Translate is loaded
    const observer = new MutationObserver((mutations) => {
      if (
        document.querySelector(".goog-te-combo, .VIpgJd-ZVi9od-l4eHX-hSRGPd")
      ) {
        console.log("Google Translate widget detected in DOM");
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);
  // Function to change language
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

  // Calculate current records for pagination
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPatients.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

  const calculateDaysSinceLastLogin = (lastLoginTime) => {
    if (!lastLoginTime) {
      return {
        status: "warning",
        text: "Never logged in",
      };
    }

    const lastLogin = new Date(lastLoginTime);
    const now = new Date();
    const diffTime = Math.abs(now - lastLogin);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    let text;
    let status;

    if (diffMinutes < 60) {
      text = diffMinutes === 0 ? "Just now" : `${diffMinutes} minutes ago`;
      status = "active";
    } else if (diffHours < 24) {
      text = `${diffHours} hours ago`;
      status = "active";
    } else if (diffDays === 0) {
      text = "Today";
      status = "active";
    } else if (diffDays === 1) {
      text = "Yesterday";
      status = "active";
    } else if (diffDays <= 7) {
      text = `${diffDays} days ago`;
      status = "warning";
    } else {
      text = `${diffDays} days ago`;
      status = "inactive";
    }

    return {
      status,
      text,
    };
  };

  // farooq changes

  const intervalRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientList = await adminService.getApprovePatients();
        // console.log("Patients data from API:", patientList);
        setPatients(patientList || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (activeTab === "queries") {
      fetchData();
      intervalRef.current = setInterval(fetchData, 5000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [activeTab]); // Runs whenever activeTab changes

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Welcome, Dr. {currentUser?.name}!
              </h2>
              <p className="text-gray-600">
                Here's your medical dashboard. You can manage your patients,
                respond to queries, and view your schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Assigned Patients Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-soft-blue-100 text-soft-blue-600 mr-4">
                    <FontAwesomeIcon icon={faHospitalUser} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Assigned Patients
                    </h3>
                    <p className="text-sm text-gray-500">
                      View and manage your patients
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("patients")}
                  className="w-full mt-2 p-2 bg-soft-blue-50 text-soft-blue-600 rounded-md hover:bg-soft-blue-100"
                >
                  View Patients
                </button>
              </div>

              {/* Patient Queries Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FontAwesomeIcon icon={faCommentMedical} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Patient Queries
                    </h3>
                    <p className="text-sm text-gray-500">
                      Respond to patient questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("queries")}
                  className="w-full mt-2 p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                >
                  View Queries
                </button>
              </div>

              {/* Today's Schedule Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <FontAwesomeIcon icon={faList} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      Treatment
                    </h3>
                    <p className="text-sm text-gray-500">
                      View patient treatments
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("treatments")}
                  className="w-full mt-2 p-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
                >
                  View Treatments
                </button>
              </div>
            </div>
          </div>
        );
      case "patients":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              <FontAwesomeIcon
                icon={faHospitalUser}
                className="mr-2 text-soft-blue-600"
              />
              Your Patients
            </h2>

            {/* Search Box */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search patients by name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Treatment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Login Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.map((patient) => {
                    const loginStatus = calculateDaysSinceLastLogin(
                      patient.last_login_time
                    );
                    return (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {patient.avatar ? (
                                <img
                                  src={patient.avatar}
                                  alt={patient.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-soft-blue-100 flex items-center justify-center">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    className="text-soft-blue-600"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {patient.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {patient.age} years
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.gender}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-soft-blue-100 text-soft-blue-800">
                            {patient.treatment_name || "Not specified"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-soft-blue-100 text-soft-blue-800">
                            {patient.login_count || 0} times
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              loginStatus.status === "active"
                                ? "bg-green-100 text-green-800"
                                : loginStatus.status === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {loginStatus.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {currentRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No patients assigned yet.
                </div>
              ) : (
                currentRecords.map((patient) => {
                  const loginStatus = calculateDaysSinceLastLogin(
                    patient.last_login_time
                  );
                  return (
                    <div
                      key={patient.id}
                      className="bg-white shadow rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {patient.avatar ? (
                            <img
                              src={patient.avatar}
                              alt={patient.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-soft-blue-100 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-soft-blue-600"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.email}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {patient.age} years • {patient.gender}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-soft-blue-100 text-soft-blue-800">
                              {patient.treatment_name || "No treatment"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                loginStatus.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : loginStatus.status === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {loginStatus.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      case "queries":
        return (
          <div className="flex h-[calc(100vh-160px)]">
            {/* Left Side - Patient List - Hidden on mobile when a patient is selected */}
            <div
              className={`w-full md:w-1/3 bg-white p-4 overflow-y-auto border-r ${
                selectedPatient ? "hidden md:block" : "block"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Patients</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full px-3 py-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "bg-soft-blue-50 border-soft-blue-500"
                        : "hover:bg-gray-50 border-transparent"
                    } border`}
                  >
                    <div className="flex-shrink-0">
                      {patient.avatar ? (
                        <img
                          src={patient.avatar}
                          alt={patient.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-soft-blue-100 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-soft-blue-600"
                          />
                        </div>
                      )}
                    </div>
                    <div
                      className="flex-1 text-left"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {" "}
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient.treatment_name || "No treatment"}
                        </p>
                      </div>{" "}
                      {/* unread notification */}
                      {patient.unreadCountValue ? (
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm transform transition-transform duration-200 hover:scale-110">
                              {patient.unreadCountValue}
                            </span>
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse"></span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div
              className={`flex-1 flex flex-col bg-gray-50 ${
                selectedPatient ? "block" : "hidden md:block"
              }`}
            >
              {selectedPatient ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-white border-b">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <div className="flex-shrink-0">
                        {selectedPatient.avatar ? (
                          <img
                            src={selectedPatient.avatar}
                            alt={selectedPatient.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-soft-blue-100 flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-soft-blue-600"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedPatient.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedPatient.treatment_name ||
                            "No active treatment"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {isChatLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">
                          Loading conversation history...
                        </p>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-full text-center px-4">
                        <FontAwesomeIcon
                          icon={faComments}
                          className="text-gray-300 text-4xl mb-3"
                        />
                        <p className="text-gray-500">
                          No messages yet.
                          <br />
                          Start a conversation with {selectedPatient.name}
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isCurrentUser =
                          msg.sender_id === localStorage.getItem("user_id");
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${
                                isCurrentUser
                                  ? "bg-soft-blue-500 text-white"
                                  : "bg-white shadow text-gray-900"
                              } ${msg.pending ? "opacity-50" : ""}`}
                            >
                              <p className="break-words text-sm sm:text-base">
                                {msg.message}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser
                                    ? "text-soft-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border rounded-full"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessage.trim()}
                        className={`p-2 rounded-full ${
                          chatMessage.trim()
                            ? "bg-soft-blue-500 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <FontAwesomeIcon
                    icon={faComments}
                    className="text-gray-300 text-5xl mb-4"
                  />
                  <p className="text-gray-500">
                    Select a patient from the list to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "treatments":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              <FontAwesomeIcon icon={faList} className="mr-2 text-purple-600" />
              Available Treatments
            </h2>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Treatment Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {treatments.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-center text-gray-500">
                        No treatments available.
                      </td>
                    </tr>
                  ) : (
                    treatments.map((treatment) => (
                      <tr key={treatment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {treatment.treatment_name}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {treatments.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No treatments available.
                </div>
              ) : (
                treatments.map((treatment) => (
                  <div
                    key={treatment.id}
                    className="bg-white shadow rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faList}
                            className="text-purple-600"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {treatment.treatment_name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
                <FontAwesomeIcon icon={faUserMd} className="mr-2" />
                Doctor Dashboard
              </h1>
            </div>{" "}
            {/* Header Right Section */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher Quick Access */}
              <div className="relative flex items-center">
                <div className="hidden sm:block"></div>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative user-menu-container">
                {" "}
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-soft-blue-700 hover:bg-soft-blue-800 text-white px-3 py-2 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span className="hidden md:inline font-medium">
                    Dr. {currentUser?.name || "Doctor"}
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
                        {currentUser?.name || "Doctor"}
                      </p>
                      <p className="text-sm leading-5 text-gray-600 truncate">
                        {currentUser?.email || "doctor@example.com"}
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
            {/* Sidebar Navigation */}
            <aside
              className={`lg:block flex-shrink-0 w-full lg:w-64 transition-all duration-300 ${
                mobileMenuOpen ? "block" : "hidden"
              }`}
            >
              <nav className="bg-white rounded-lg shadow overflow-hidden sticky top-20">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">
                    Navigation
                  </h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("dashboard");
                        if (mobileMenuOpen) toggleSidebar();
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
                        setActiveTab("patients");
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeTab === "patients"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faHospitalUser}
                        className="mr-3 w-5"
                      />
                      Patients
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("queries");
                        if (mobileMenuOpen) toggleSidebar();
                      }}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeTab === "queries"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faCommentMedical}
                        className="mr-3 w-5"
                      />
                      Queries
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab("treatments");
                        if (mobileMenuOpen) toggleSidebar();
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
            </aside>

            {/* Mobile Sidebar Navigation */}
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
                    <h2 className="text-lg font-medium text-gray-800">
                      Navigation
                    </h2>
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
                          setActiveTab("patients");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                          activeTab === "patients"
                            ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={faHospitalUser}
                          className="mr-3 w-5"
                        />
                        Patients
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setActiveTab("queries");
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                          activeTab === "queries"
                            ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={faCommentMedical}
                          className="mr-3 w-5"
                        />
                        Queries
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
            </aside>

            {/* Content Area */}
            <main className="flex-1">{renderContent()}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
