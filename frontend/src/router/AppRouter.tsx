import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
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
import AttendanceTrackerPage from '../pages/training/AttendanceTrackerPage';
import AssignmentMatrixPage from '../pages/training/AssignmentMatrixPage';
import MockInterviewPage from '../pages/training/MockInterviewPage';
import WeeklyTrainingPlanPage from '../pages/training/WeeklyTrainingPlanPage';
import SuccessPage from '../pages/common/SuccessPage';
import NotFoundPage from '../pages/common/NotFoundPage';
import MaintenancePage from '../pages/common/MaintenancePage';
import DocumentCollectionList from '../pages/documents/DocumentCollectionList';
import DocumentCollection from '../pages/documents/DocumentCollection';
import CandidateDetail from '../pages/Candidates/CandidateDetail';
import CandidateEdit from '../pages/Candidates/CandidateEdit';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import Support from '../pages/support/Support';
import CompanyManagement from '../pages/crm/CompanyManagement';
import CompanyDetail from '../pages/crm/CompanyDetail';
import ContactManagement from '../pages/crm/ContactManagement';
import LeadManagement from '../pages/crm/LeadManagement';
import DealManagement from '../pages/crm/DealManagement';
import TaskManagement from '../pages/crm/TaskManagement';
import CRMDashboard from '../pages/crm/CRMDashboard';

const AppRouter: React.FC = () => {
	return (
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
					<Route path="dashboard" element={<Dashboard />} />
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
						<Route path="edit/:publicId" element={<CandidateEdit />} />
					</Route>

					<Route path="training">
						<Route path="batches" element={<TrainingBatchList />} />
						<Route path="batches/:id" element={<TrainingBatchDetail />} />
						<Route path="allocation" element={<CandidateAllocation />} />
						<Route path="attendance" element={<AttendanceTrackerPage />} />
						<Route path="assignment" element={<AssignmentMatrixPage />} />
						<Route path="mock-interview" element={<MockInterviewPage />} />
						<Route path="weekly-plan" element={<WeeklyTrainingPlanPage />} />
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


					{/* Add more protected routes here */}
				</Route>
			</Route>

			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
};

export default AppRouter;
