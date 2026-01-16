import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import UserManagement from '../pages/user/UserManagement';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import CandidateRegistration from '../pages/Candidates/CandidateRegistration';
import CandidateList from '../pages/Candidates/CandidateList';
import ScreeningList from '../pages/screening/ScreeningList';
import CounselingList from '../pages/counseling/CounselingList';
import TrainingBatchList from '../pages/training/TrainingBatchList';
import TrainingBatchDetail from '../pages/training/TrainingBatchDetail';
import CandidateAllocation from '../pages/training/CandidateAllocation';
import SuccessPage from '../pages/common/SuccessPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import MaintenancePage from '../pages/common/MaintenancePage';
import DocumentCollectionList from '../pages/documents/DocumentCollectionList';
import DocumentCollection from '../pages/documents/DocumentCollection';
import CandidateDetail from '../pages/Candidates/CandidateDetail';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import Support from '../pages/support/Support';
import MigrationPanel from '../pages/admin/MigrationPanel';
import CompanyManagement from '../pages/crm/CompanyManagement';
import CompanyDetail from '../pages/crm/CompanyDetail';
import ContactManagement from '../pages/crm/ContactManagement';
import LeadManagement from '../pages/crm/LeadManagement';
import DealManagement from '../pages/crm/DealManagement';
import TaskManagement from '../pages/crm/TaskManagement';
import CRMDashboard from '../pages/crm/CRMDashboard';

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
						<Route path="reports" element={<Reports />} />
						<Route path="settings" element={<Settings />} />
						<Route path="support" element={<Support />} />

						<Route path="candidates">

							<Route index element={<CandidateList />} />
							<Route path="list" element={<CandidateList />} />
							{/* <Route path="overview" element={<SourcingAnalytics />} /> */}
							<Route path="screening" element={<ScreeningList />} />
							<Route path="counseling" element={<CounselingList />} />
							<Route path="documents" element={<DocumentCollectionList />} />
							<Route path="documents/:id" element={<DocumentCollection />} />
							<Route path=":publicId" element={<CandidateDetail />} />
						</Route>

						<Route path="training">
							<Route path="batches" element={<TrainingBatchList />} />
							<Route path="batches/:id" element={<TrainingBatchDetail />} />
							<Route path="allocation" element={<CandidateAllocation />} />
						</Route>

						<Route path="crm">
							<Route index element={<CRMDashboard />} />
							<Route path="dashboard" element={<CRMDashboard />} />
							<Route path="companies" element={<CompanyManagement />} />
							<Route path="companies/:publicId" element={<CompanyDetail />} />
							<Route path="contacts" element={<ContactManagement />} />
							<Route path="leads" element={<LeadManagement />} />
							<Route path="deals" element={<DealManagement />} />
							<Route path="tasks" element={<TaskManagement />} />
						</Route>

						<Route path="admin/migration" element={<MigrationPanel />} />

						{/* Add more protected routes here */}
					</Route>
				</Route>

				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
