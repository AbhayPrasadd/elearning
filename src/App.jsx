import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Layout from "./components/Layout";
import { auth, db } from "./firebase";

// Student feature pages
import Courses from "./pages/Courses";
import Lectures from "./pages/Lectures";
import Assignments from "./pages/Assignments";
import Quizzes from "./pages/Quizzes";
import Grades from "./pages/Grades";

//faculty features pages
import CourseCreation from "./pages/CourseCreation";
import AssignmentManagement from "./pages/AssignmentManagement";
import QuizManagement from "./pages/QuizManagement";
import StudentTracking from "./pages/StudentTracking";

//Admin feature pages
import UserManagement from "./pages/UserManagement";
import ReportGeneration from "./pages/ReportGeneration";
import Announcements from "./pages/Announcements";
import CourseManagement from "./pages/CourseCreation";

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const role = await getUserRole(currentUser.uid);
        setUser(currentUser);
        setRole(role);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getUserRole = async (uid) => {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data().role : null;
  };

  const getDashboard = () => {
    switch (role) {
      case "admin":
        return <Layout role="admin"><AdminDashboard /></Layout>;
      case "faculty":
        return <Layout role="faculty"><FacultyDashboard /></Layout>;
      case "student":
        return <Layout role="student"><StudentDashboard /></Layout>;
      default:
        return <Navigate to="/login" />;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={user ? getDashboard() : <Navigate to="/login" state={{ from: location }} />}
      />

      {/* Student Role Specific Pages */}
      {role === "student" && (
        <>
          <Route path="/student/courses" element={<Layout role="student"><Courses /></Layout>} />
          <Route path="/student/lectures" element={<Layout role="student"><Lectures /></Layout>} />
          <Route path="/student/assignments" element={<Layout role="student"><Assignments /></Layout>} />
          <Route path="/student/quizzes" element={<Layout role="student"><Quizzes /></Layout>} />
          <Route path="/student/grades" element={<Layout role="student"><Grades /></Layout>} />
        </>
      )}

      {/* Admin Specific Routes */}
    {user && role === "admin" && (
    <>
    <Route path="/admin/user-management" element={<Layout role="admin"><UserManagement /></Layout>} />
    <Route path="/admin/report-generation" element={<Layout role="admin"><ReportGeneration /></Layout>} />
    <Route path="/admin/announcements" element={<Layout role="admin"><Announcements /></Layout>} />
    <Route path="/admin/course-management" element={<Layout role="admin"><CourseManagement /></Layout>} />
  </>
)}
  
   {/* faculty Specific Routes */}
{user && role === "faculty" && (
  <>
    <Route path="/faculty/course-creation" element={<Layout role="faculty"><CourseCreation /></Layout>} />
    <Route path="/faculty/assignment-management" element={<Layout role="faculty"><AssignmentManagement /></Layout>} />
    <Route path="/faculty/quiz-management" element={<Layout role="faculty"><QuizManagement /></Layout>} />
    <Route path="/faculty/student-tracking" element={<Layout role="faculty"><StudentTracking /></Layout>} />
  </>
)}


      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
