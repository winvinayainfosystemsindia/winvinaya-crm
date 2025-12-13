import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import UserManagement from '../pages/UserManagement';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import CandidateRegistration from '../pages/Candidates/CandidateRegistration';
import CandidateList from '../pages/Candidates/CandidateList';
import SuccessPage from '../pages/SuccessPage';
import NotFoundPage from '../pages/NotFoundPage';
import MaintenancePage from '../pages/MaintenancePage';

const AppRouter: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/candidate-registration" element={<CandidateRegistration />} />

				{/* Public Support Pages */}
				<Route path="/success" element={<SuccessPage />} />
				<Route path="/maintenance" element={<MaintenancePage />} />

				<Route element={<ProtectedRoute />}>
					<Route element={<MainLayout />}>
						<Route path="/dashboard" element={<Home />} />
						<Route path="/users" element={<UserManagement />} />
						<Route path="/candidates" element={<CandidateList />} />
						{/* Add more protected routes here */}
					</Route>
				</Route>

				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
