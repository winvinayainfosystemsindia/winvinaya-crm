import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import UserManagement from '../pages/user/UserManagement';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import CandidateRegistration from '../pages/candidates/CandidateRegistration';
import CandidateList from '../pages/candidates/CandidateList';
import ProfileList from '../pages/profiling/ProfileList';
import CounselingList from '../pages/counseling/CounselingList';
import SuccessPage from '../pages/common/SuccessPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import MaintenancePage from '../pages/common/MaintenancePage';

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
					{/* Protected Routes */}
					<Route element={<MainLayout />}>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="dashboard" element={<Home />} />
						<Route path="users" element={<UserManagement />} />

						<Route path="candidates">
							<Route index element={<CandidateList />} />
							<Route path="list" element={<CandidateList />} />
							<Route path="profiling" element={<ProfileList />} />
							<Route path="counseling" element={<CounselingList />} />
						</Route>

						{/* Add more protected routes here */}
					</Route>
				</Route>

				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
