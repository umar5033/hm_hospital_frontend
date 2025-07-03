import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserInjured,
  faSignOutAlt,
  faUser,
  faCaretDown,
  faBolt,
  faUserMd,
  faCommentMedical,
  faBars,
  faTimes,
  // faPlayCircle,
  faImage,
  // faStepForward,
  faChevronLeft,
  // faChevronRight,
  faFileVideo,
  faExpand,
  faNotesMedical,
  faChevronUp,
  faChevronDown,
  faSearch,
  faPaperPlane,
  faComments,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import authService from "../../services/authService";
import patientService from "../../services/patientService";

import adminService from "../../services/adminService";

// Define a unique symbol for the "no procedure expanded" state
const NO_PROCEDURE_EXPANDED = Symbol("NO_PROCEDURE_EXPANDED");

const PatientDashboard = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  // const [treatmentSteps, setTreatmentSteps] = useState([]);
  // const [currentStep, setCurrentStep] = useState(0);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const [doctors, setDoctors] = useState([]);
  // const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [queryText, setQueryText] = useState("");
  // const [queryStatus, setQueryStatus] = useState("");

  const [treatments, setTreatments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [expandedProcedure, setExpandedProcedure] = useState(
    NO_PROCEDURE_EXPANDED
  );

  // Pagination states for doctors and treatments
  const [currentPage, setCurrentPage] = useState(1);
  const [treatmentsCurrentPage, setTreatmentsCurrentPage] = useState(1);
  const recordsPerPage = 15;

  // Chat states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // Chat polling interval reference
  const chatPollingIntervalRef = useRef(null);

  useEffect(() => {
    // Prevent authenticated users from going back to login page
    authService.handleBrowserNavigation();

    const fetchUserData = async () => {
      try {
        const userData = await adminService.getCurrentUser();
        // console.log('User data from API:', userData);
        setCurrentUser(userData);
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
          case "doctors":
            let doctorsList = await adminService.getDoctors();
            // console.log("Doctors data from API:", doctorsList);
            setDoctors(doctorsList || []);
            break;
          case "queries":
            let doctorsListQueries = await adminService.getDoctors();
            // console.log("Doctors data from API:", doctorsListQueries);
            // const replies = await patientService.getDoctorReplies();
            // setQueries(replies || []);
            setDoctors(doctorsListQueries || []);
            break;
          case "treatments":
            const patientInfo = await patientService.getCurrentUser();
            setLoadingProcedures(true);
            if (patientInfo?.patientDetails_list?.treatment_id) {
              try {
                const treatmentData = await adminService.getTreatmentById(
                  patientInfo.patientDetails_list.treatment_id
                );
                console.log("Treatment data received:", treatmentData);
                if (
                  treatmentData?.data &&
                  Array.isArray(treatmentData.data) &&
                  treatmentData.data.length > 0
                ) {
                  console.log("Processing treatment data:", treatmentData.data);
                  // Map the procedure data
                  const procedures = treatmentData.data.map((item) => {
                    let parsedMedia = [];
                    try {
                      if (typeof item.media === "string") {
                        parsedMedia = JSON.parse(item.media);
                      } else if (Array.isArray(item.media)) {
                        parsedMedia = item.media;
                      }
                    } catch (error) {
                      console.error("Error parsing media:", error);
                    }
                    return {
                      id: item.id,
                      procedure_name: item.procedure_name,
                      description: item.description,
                      media: parsedMedia,
                    };
                  });
                  setProcedures(procedures);
                } else {
                  setProcedures([]);
                }
              } catch (error) {
                console.error("Error fetching treatment data:", error);
                setProcedures([]);
              }
            } else {
              setProcedures([]);
            }
            setLoadingProcedures(false);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (activeTab === "treatments") {
          setProcedures([]);
          setLoadingProcedures(false);
        }
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== "dashboard") {
      fetchData();
    }
  }, [activeTab]);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleClickOutside = (e) => {
    if (showUserMenu && e.target.closest(".user-menu-container") === null) {
      setShowUserMenu(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]); // useEffect for ensuring Google Translate is properly initialized
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

  // Navigate through treatment steps
  // const goToNextStep = () => {
  //   if (currentStep < treatmentSteps.length - 1) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  // const goToPreviousStep = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };
  const openFullscreenMedia = (mediaData) => {
    setFullscreenMedia(mediaData);
  };

  const closeFullscreenMedia = () => {
    setFullscreenMedia(null);
  };

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate current records for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDoctors.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Calculate current treatments for pagination
  const treatmentsIndexOfLastRecord = treatmentsCurrentPage * recordsPerPage;
  const treatmentsIndexOfFirstRecord =
    treatmentsIndexOfLastRecord - recordsPerPage;
  const currentTreatments = treatments.slice(
    treatmentsIndexOfFirstRecord,
    treatmentsIndexOfLastRecord
  );

  const totalPages = Math.ceil(doctors.length / recordsPerPage);
  const treatmentsTotalPages = Math.ceil(treatments.length / recordsPerPage);

  // const handleSendQuery = async () => {
  //   if (!queryText.trim()) {
  //     setQueryStatus("Please enter your question");
  //     return;
  //   }

  //   setQueryStatus("Sending...");
  //   try {
  //     await patientService.queryDoctor(queryText);
  //     setQueryStatus("Question sent successfully!");
  //     setQueryText("");
  //     // Refresh queries list
  //     const replies = await patientService.getDoctorReplies();
  //     setQueries(replies || []);
  //   } catch (error) {
  //     setQueryStatus("Failed to send question. Please try again.");
  //   }
  // };

  const toggleProcedure = (procedureId) => {
    if (expandedProcedure === procedureId) {
      setExpandedProcedure(NO_PROCEDURE_EXPANDED); // Use the symbol when closing
    } else {
      setExpandedProcedure(procedureId);
    }
  }; // Chat functions
  const handleDoctorSelect = async (doctor) => {
    // Clear previous polling
    if (chatPollingIntervalRef.current) {
      clearInterval(chatPollingIntervalRef.current);
      chatPollingIntervalRef.current = null;
    }

    setSelectedDoctor(doctor);
    // Reset unread count for this doctor
    setUnreadMessages((prev) => ({ ...prev, [doctor.id]: 0 }));
    setIsChatLoading(true);

    try {
      const history = await patientService.getChatHistory(doctor.id);
      setChatMessages(history || []);

      let doctorsList = await adminService.getDoctors();
      // console.log('Doctors data from API:', doctorsList);
      setDoctors(doctorsList || []);

      // Start polling for new messages every 5 seconds
      chatPollingIntervalRef.current = setInterval(() => {
        fetchLatestMessages(doctor.id);
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
    if (!chatMessage.trim() || !selectedDoctor) return;
    const tempMessage = {
      patientId: localStorage.getItem("user_id"),
      doctorId: selectedDoctor.id,
      sender_id: localStorage.getItem("user_id"),
      message: chatMessage,
      timestamp: new Date().toISOString(),
      pending: true,
    };

    setChatMessages((prev) => [...prev, tempMessage]);
    setChatMessage("");

    try {
      await patientService.sendChatMessage(tempMessage);
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

  // Function to fetch latest messages
  const fetchLatestMessages = async (doctorId) => {
    if (!doctorId) return;
    try {
      const history = await patientService.getChatHistory(doctorId);
      console.log("Fetched latest messages:", history);

      // detect new messages
      const currentUserId = localStorage.getItem("user_id");
      const newMsgs = history.filter(
        (msg) =>
          msg.sender_id !== currentUserId &&
          !chatMessages.some((m) => m.id === msg.id)
      );
      if (selectedDoctor?.id !== doctorId && newMsgs.length) {
        setUnreadMessages((prev) => ({
          ...prev,
          [doctorId]: (prev[doctorId] || 0) + newMsgs.length,
        }));
      }
      setChatMessages(history);
    } catch (error) {
      console.error("Error polling for new messages:", error);
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

  // Cleanup polling interval when component unmounts or selected doctor changes
  useEffect(() => {
    return () => {
      if (chatPollingIntervalRef.current) {
        clearInterval(chatPollingIntervalRef.current);
        chatPollingIntervalRef.current = null;
      }
    };
  }, [selectedDoctor]);

  // Global cleanup when component unmounts entirely
  useEffect(() => {
    return () => {
      if (chatPollingIntervalRef.current) {
        clearInterval(chatPollingIntervalRef.current);
        chatPollingIntervalRef.current = null;
      }
    };
  }, []);

  // farooq changes

  const intervalRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        let doctorsList = await adminService.getDoctors();
        // console.log('Doctors data from API:', doctorsList);
        setDoctors(doctorsList || []);
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
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Welcome, {currentUser?.name || "Patient"}!
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Here's your health dashboard. You can communicate with doctors,
                view treatment videos, and manage your medical queries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Doctor Access Card */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 sm:p-3 rounded-full bg-soft-blue-100 text-soft-blue-600 mr-3 sm:mr-4">
                    <FontAwesomeIcon
                      icon={faUserMd}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-800">
                      Available Doctors
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      View and contact your doctors
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className="w-full mt-2 p-2 bg-soft-blue-50 text-soft-blue-600 rounded-md hover:bg-soft-blue-100 text-sm sm:text-base"
                >
                  View Doctors
                </button>
              </div>

              {/* Treatments Card */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 mr-3 sm:mr-4">
                    <FontAwesomeIcon
                      icon={faNotesMedical}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-800">
                      Treatments
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      View your treatment procedures
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("treatments")}
                  className="w-full mt-2 p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm sm:text-base"
                >
                  View Treatments
                </button>
              </div>

              {/* Medical Queries Card */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600 mr-3 sm:mr-4">
                    <FontAwesomeIcon
                      icon={faCommentMedical}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-800">
                      Medical Queries
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Ask questions and view replies
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("queries")}
                  className="w-full mt-2 p-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-sm sm:text-base"
                >
                  View Queries
                </button>
              </div>
            </div>
          </div>
        );
      case "doctors":
        return (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                <FontAwesomeIcon
                  icon={faUserMd}
                  className="mr-2 text-soft-blue-600"
                />
                Available Doctors
              </h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRecords.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col items-center">
                    {doctor.avatar ? (
                      <img
                        src={doctor.avatar}
                        alt={doctor.name}
                        className="h-24 w-24 rounded-full mb-4 border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-soft-blue-100 flex items-center justify-center mb-4 border-4 border-white shadow-md">
                        <FontAwesomeIcon
                          icon={faUserMd}
                          className="text-3xl text-soft-blue-600"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900">
                      Dr. {doctor.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
                      <FontAwesomeIcon
                        icon={faCircle}
                        className="text-green-400 text-xs"
                      />
                      <span>Available</span>
                    </div>{" "}
                    <button
                      onClick={() => {
                        setActiveTab("queries");
                        // Use a small delay to ensure the chat container is mounted
                        setTimeout(() => {
                          handleDoctorSelect(doctor);
                        }, 50);
                      }}
                      className="w-full bg-soft-blue-500 text-white py-2 px-4 rounded-md hover:bg-soft-blue-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faComments} />
                      <span>Chat Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
                    }`}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === i + 1
                          ? "bg-soft-blue-600 text-white"
                          : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-soft-blue-100 text-soft-blue-700 hover:bg-soft-blue-200"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        );
      case "queries":
        return (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
              {/* Doctors List - Hidden on mobile when doctor is selected */}
              <div
                className={`w-full lg:w-1/3 ${
                  selectedDoctor ? "hidden lg:block" : "block"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    <FontAwesomeIcon
                      icon={faUserMd}
                      className="mr-2 text-soft-blue-600"
                    />
                    Available Doctors
                  </h2>
                  <div className="lg:hidden">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-32 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Search Box - Hidden on mobile */}
                <div className="hidden lg:block mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                  </div>
                </div>

                {/* Doctors List */}
                <div className="space-y-2 h-[calc(100vh-300px)] overflow-y-auto rounded-lg">
                  {currentRecords.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                        selectedDoctor?.id === doctor.id
                          ? "bg-soft-blue-50 border-soft-blue-500"
                          : "hover:bg-gray-50 border-transparent"
                      } border`}
                    >
                      <div className="flex-shrink-0">
                        {doctor.avatar ? (
                          <img
                            src={doctor.avatar}
                            alt={doctor.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-soft-blue-100 flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faUserMd}
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
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. {doctor.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {doctor.specialization}
                          </p>
                        </div>{" "}
                        {/* unread notification */}
                        <div>
                          {doctor.unreadCountValue > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                              {doctor.unreadCountValue}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div
                className={`flex-1 flex flex-col h-full bg-gray-50 rounded-lg ${
                  selectedDoctor ? "block" : "hidden lg:block"
                }`}
              >
                {selectedDoctor ? (
                  <>
                    {/* Chat Header with Back Button on Mobile */}
                    <div className="p-4 border-b bg-white rounded-t-lg">
                      <div className="flex items-center space-x-3">
                        {" "}
                        <button
                          onClick={() => setSelectedDoctor(null)}
                          className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        {selectedDoctor.avatar ? (
                          <img
                            src={selectedDoctor.avatar}
                            alt={selectedDoctor.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-soft-blue-100 flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faUserMd}
                              className="text-soft-blue-600"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Dr. {selectedDoctor.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedDoctor.specialization}
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
                          <p className="text-gray-500">Loading messages...</p>
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
                            Start a conversation with Dr. {selectedDoctor.name}!
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
                                    : "bg-white text-gray-900"
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

                    {/* Message Input - Fixed at Bottom */}
                    <div className="p-3 sm:p-4 border-t bg-white rounded-b-lg">
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
                          className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!chatMessage.trim()}
                          className={`p-2 sm:p-3 rounded-full ${
                            chatMessage.trim()
                              ? "bg-soft-blue-500 hover:bg-soft-blue-600 text-white"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="text-sm sm:text-base"
                          />
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
                      Select a doctor from the list to start chatting
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "treatments":
        return (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              <FontAwesomeIcon
                icon={faNotesMedical}
                className="mr-2 text-green-600"
              />
              Your Treatment Procedures
            </h2>{" "}
            {loadingProcedures ? (
              <div className="text-center text-gray-500 py-8">
                Loading procedures...
              </div>
            ) : !procedures ||
              procedures.length === 0 ||
              procedures.filter(
                (procedure) =>
                  procedure?.procedure_name && procedure.procedure_name.trim()
              ).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 text-center">
                <FontAwesomeIcon
                  icon={faNotesMedical}
                  className="text-gray-400 text-4xl sm:text-5xl mb-4"
                />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No Procedures Available
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  Your treatment procedures will appear here once they are
                  assigned.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {procedures
                  .filter(
                    (procedure) =>
                      procedure?.procedure_name &&
                      procedure.procedure_name.trim()
                  )
                  .map((procedure, index) => (
                    <div
                      key={procedure?.id || index}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* Procedure header */}
                      <button
                        onClick={() => toggleProcedure(procedure.id)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                      >
                        {" "}
                        <span className="font-medium text-gray-700 text-sm sm:text-base">
                          {procedure.procedure_name}
                        </span>
                        <FontAwesomeIcon
                          icon={
                            expandedProcedure === procedure.id
                              ? faChevronUp
                              : faChevronDown
                          }
                          className="text-gray-500"
                        />
                      </button>

                      {/* Expanded content */}
                      {expandedProcedure === procedure.id && (
                        <div className="p-3 sm:p-4">
                          <p className="text-sm sm:text-base text-gray-600 mb-4">
                            {procedure.description ||
                              "No description available"}
                          </p>

                          {/* Media grid */}
                          {Array.isArray(procedure.media) &&
                          procedure.media.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                              {procedure.media.map((value, mediaIndex) =>
                                value?.mediaFilename && value?.mediaType ? (
                                  <div
                                    key={mediaIndex}
                                    className="relative group cursor-pointer aspect-w-16 aspect-h-9"
                                    onClick={() => {
                                      const mediaUrl =
                                        value.mediaType === "video/mp4"
                                          ? `${process.env.REACT_APP_API_URL}/uploads/videos/${value.mediaFilename}`
                                          : `${process.env.REACT_APP_API_URL}/uploads/images/${value.mediaFilename}`;
                                      openFullscreenMedia({
                                        url: mediaUrl,
                                        type:
                                          value.mediaType === "video/mp4"
                                            ? "video"
                                            : "image",
                                      });
                                    }}
                                  >
                                    {value.mediaType === "video/mp4" ? (
                                      <>
                                        <FontAwesomeIcon
                                          icon={faFileVideo}
                                          className="absolute top-2 right-2 text-white text-base sm:text-xl z-10"
                                        />
                                        <video
                                          src={`${process.env.REACT_APP_API_URL}/uploads/videos/${value.mediaFilename}`}
                                          className="w-full h-full object-cover rounded-lg transition-transform transform group-hover:scale-105"
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <FontAwesomeIcon
                                          icon={faImage}
                                          className="absolute top-2 right-2 text-white text-base sm:text-xl z-10"
                                        />
                                        <img
                                          src={`${process.env.REACT_APP_API_URL}/uploads/images/${value.mediaFilename}`}
                                          alt={`${
                                            procedure.procedure_name ||
                                            "Procedure"
                                          } procedure visualization ${
                                            mediaIndex + 1
                                          }`}
                                          className="w-full h-full object-cover rounded-lg transition-transform transform group-hover:scale-105"
                                        />
                                      </>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                                      <FontAwesomeIcon
                                        icon={faExpand}
                                        className="text-white opacity-0 group-hover:opacity-100 text-base sm:text-xl"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    key={mediaIndex}
                                    className="text-xs sm:text-sm text-red-400"
                                  >
                                    Invalid media item
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-sm sm:text-base text-gray-400 italic">
                              No media files attached for this procedure.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-soft-blue-600 text-white shadow fixed w-full z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex justify-between items-center">
            {" "}
            <div className="flex items-center">
              <button
                className="text-white p-2 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-white"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
              >
                <FontAwesomeIcon
                  icon={mobileMenuOpen ? faTimes : faBars}
                  className="h-5 w-5"
                />
              </button>
              <h1 className="text-lg sm:text-xl font-bold flex items-center ml-2 lg:ml-0">
                <FontAwesomeIcon icon={faUserInjured} className="mr-2" />
                Patient Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {" "}
              {/* Language Switcher Quick Access */}
              <div className="relative flex items-center">
                <div className="hidden sm:block"></div>
              </div>
              <div className="relative user-menu-container">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 bg-soft-blue-700 hover:bg-soft-blue-800 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-colors"
                >
                  {" "}
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-sm sm:text-base"
                  />
                  <span className="hidden sm:inline font-medium text-sm">
                    {currentUser?.name || "Patient"}
                  </span>
                  <FontAwesomeIcon icon={faCaretDown} className="text-xs" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Language
                      </p>
                      <div className="flex justify-between space-x-2">
                        {" "}
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
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.name || "Patient"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {currentUser?.email || "No email"}
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
      <div className="pt-14 sm:pt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
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
                        Doctors
                      </button>
                    </li>{" "}
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
                        {" "}
                        <FontAwesomeIcon
                          icon={faNotesMedical}
                          className="mr-3 w-5"
                        />
                        Treatments
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
                        Medical Queries
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block flex-shrink-0 w-64">
              <nav className="bg-white rounded-lg shadow overflow-hidden sticky top-20">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">
                    Navigation
                  </h2>
                </div>
                <ul className="divide-y divide-gray-200">
                  <li>
                    <button
                      onClick={() => setActiveTab("dashboard")}
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
                      onClick={() => setActiveTab("doctors")}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeTab === "doctors"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <FontAwesomeIcon icon={faUserMd} className="mr-3 w-5" />
                      Doctors
                    </button>
                  </li>{" "}
                  <li>
                    <button
                      onClick={() => setActiveTab("treatments")}
                      className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 ${
                        activeTab === "treatments"
                          ? "bg-soft-blue-50 text-soft-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {" "}
                      <FontAwesomeIcon
                        icon={faNotesMedical}
                        className="mr-3 w-5"
                      />
                      Treatments
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("queries")}
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
                      Medical Queries
                    </button>
                  </li>
                </ul>
              </nav>
            </aside>{" "}
            {/* Main Content Area */}
            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </div>

      {/* Fullscreen Media Viewer */}
      {fullscreenMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 p-2 sm:p-4">
          <div className="relative h-full flex flex-col items-center justify-center">
            <button
              onClick={closeFullscreenMedia}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 p-2"
              aria-label="Close preview"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl sm:text-2xl" />
            </button>
            {fullscreenMedia.type === "video" ? (
              <video
                src={fullscreenMedia.url}
                className="w-full h-auto max-h-[90vh] rounded-lg"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={fullscreenMedia.url}
                alt="Fullscreen view"
                className="w-auto h-auto max-w-full max-h-[90vh] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
