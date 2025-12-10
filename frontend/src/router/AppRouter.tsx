import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import CandidateRegistration from '../pages/Candidates/CandidateRegistration';

const AppRouter: React.FC = () => {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/candidate-registration" element={<CandidateRegistration />} />

				<Route element={<ProtectedRoute />}>
					<Route element={<MainLayout />}>
						<Route path="/dashboard" element={<Home />} />
						{/* Add more protected routes here */}
					</Route>
				</Route>

				<Route path="/" element={<Navigate to="/dashboard" replace />} />
				<Route path="*" element={<Navigate to="/dashboard" replace />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
