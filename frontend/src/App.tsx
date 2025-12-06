// import { Routes, Route } from "react-router-dom";

// import Navbar from "./components/navbar";
// import GoogleTranslateClient from "./components/GoogleTranslateClient";
// import { ToastProvider } from "./contexts/toast-context";

// // Public pages
// // import Login from "./pages/Login";
// // import Register from "./pages/Register";
// // import ForgotPassword from "./pages/forgot-password/ForgotPassword";
// // import ResetPassword from "./pages/reset-password/ResetPassword";

// // // User pages
// // import UserDashboard from "./pages/user/UserDashboard";
// // import UserRecords from "./pages/user/records/UserRecords";
// // import UserConfigLogs from "./pages/user/config-logs/UserConfigLogs";
// // import UserDeviceDetails from "./pages/user/device/[deviceName]/UserDeviceDetails";

// // // Admin pages
// // import AdminDashboard from "./pages/admin/AdminDashboard";
// // import AdminCustomers from "./pages/admin/customers/AdminCustomers";
// // import AdminPresets from "./pages/admin/presets/AdminPresets";

// import ProtectedRoute from "./routes/ProtectedRoute";

// export default function App() {
//   return (
//     <ToastProvider>
//       <GoogleTranslateClient />

//       <Navbar />

//       <main className="min-h-screen">
//         <Routes>

//           {/* ---------- PUBLIC ROUTES ---------- */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />

//           {/* ---------- USER ROUTES ---------- */}
//           <Route
//             path="/user-dashboard"
//             element={
//               <ProtectedRoute role="user">
//                 <UserDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/user-dashboard/records"
//             element={
//               <ProtectedRoute role="user">
//                 <UserRecords />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/user-dashboard/config-logs"
//             element={
//               <ProtectedRoute role="user">
//                 <UserConfigLogs />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/user-dashboard/device/:deviceName"
//             element={
//               <ProtectedRoute role="user">
//                 <UserDeviceDetails />
//               </ProtectedRoute>
//             }
//           />

//           {/* ---------- ADMIN ROUTES ---------- */}
//           <Route
//             path="/admin-dashboard"
//             element={
//               <ProtectedRoute role="admin">
//                 <AdminDashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin-dashboard/customers"
//             element={
//               <ProtectedRoute role="admin">
//                 <AdminCustomers />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/admin-dashboard/presets"
//             element={
//               <ProtectedRoute role="admin">
//                 <AdminPresets />
//               </ProtectedRoute>
//             }
//           />

//         </Routes>
//       </main>
//     </ToastProvider>
//   );
// }


import { Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar";
import GoogleTranslateClient from "./components/GoogleTranslateClient";
import { ToastProvider } from "./contexts/toast-context";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AboutPage from "./components/about/AboutPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDashboardPage from "./pages/admin-dashboard/AdminDashboardPage";
import AdminPresetsPage from "./pages/admin-dashboard/AdminPresetsPage";
import Firmware from "./pages/admin-dashboard/Firmware";
import DeviceHistoryPage from "./pages/admin-dashboard/device/DeviceHistoryPage";
import CustomerData from "./pages/admin-dashboard/customers/CustomerData";
import CustomerDevice from "./pages/admin-dashboard/customers/devices/CustomerDevicesPage";
import DeviceDetailsPage from "./pages/admin-dashboard/customers/devices/DeviceDetailsPage";
import DeviceLogsPage from "./pages/admin-dashboard/customers/devices/logs/DeviceLogsPage";
import DeviceControl from "./pages/admin-dashboard/customers/devices/control/DeviceControl";
import UserDashboardPage from "./pages/user-dashboard/UserDashboardPage";
import History from "./pages/user-dashboard/records/History";
import Configurations from "./pages/user-dashboard/config-logs/Configurations";
import ViewData from "./pages/user-dashboard/ViewData";
import ControlDevice from "./pages/user-dashboard/control/ControlDevice";







import Home from "./pages/Login";

export default function App() {
  return (
    <ToastProvider>
      <GoogleTranslateClient />
      <Navbar />

      <main className="min-h-screen">
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/firmware" element={<Firmware />} />

          
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/presets"
            element={
              <ProtectedRoute role="admin">
                <AdminPresetsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/device/:device"
            element={
              <ProtectedRoute role="admin">
                <DeviceHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/customers"
            element={
              <ProtectedRoute role="admin">
                <CustomerData />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/customers/:id/devices"
            element={
              <ProtectedRoute role="admin">
                <CustomerDevice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/customers/:id/devices/:deviceId"
            element={
              <ProtectedRoute role="admin">
                <DeviceDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/customers/:id/devices/:deviceId/logs"
            element={
              <ProtectedRoute role="admin">
                <DeviceLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard/customers/:id/devices/:deviceId/control"
            element={
              <ProtectedRoute role="admin">
                <DeviceControl />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard/records"
            element={
              <ProtectedRoute role="user">
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard/config-logs"
            element={
              <ProtectedRoute role="user">
                <Configurations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard/:deviceName"
            element={
              <ProtectedRoute role="user">
                <ViewData />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard/:deviceName/control"
            element={
              <ProtectedRoute role="user">
                <ControlDevice />
              </ProtectedRoute>
            }
          />



        </Routes>
      </main>
    </ToastProvider>
  );
}
