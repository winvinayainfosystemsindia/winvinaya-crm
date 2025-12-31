import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addNotification, setLastCandidateId } from '../store/slices/notificationSlice';
import candidateService from '../services/candidateService';

/**
 * Hook to watch for new candidate registrations via polling.
 * Uses a baseline comparison to detect new entries since the last check.
 */
export const useNotificationWatcher = () => {
	const dispatch = useAppDispatch();
	const { lastCandidateId } = useAppSelector((state) => state.notifications);

	const lastSeenIdRef = useRef<string | null>(lastCandidateId);
	const pollingActive = useRef(false);

	// Sync ref with Redux state
	useEffect(() => {
		lastSeenIdRef.current = lastCandidateId;
	}, [lastCandidateId]);

	useEffect(() => {
		// Sync with localStorage on mount if Redux state is empty
		const savedId = localStorage.getItem('winvinaya_last_candidate_id');
		if (!lastSeenIdRef.current && savedId) {
			dispatch(setLastCandidateId(savedId));
			lastSeenIdRef.current = savedId;
		}
	}, [dispatch]);

	useEffect(() => {
		const checkForNewCandidates = async () => {
			if (pollingActive.current) return;

			try {
				pollingActive.current = true;

				// Fetch last 5 candidates with explicit sorting.
				// We fetch multiple to handle cases where several registrations occur between polls.
				const response = await candidateService.getAll(0, 5, undefined, 'created_at', 'desc');
				const items = response.items || [];

				if (items.length > 0) {
					const latestItem = items[0];
					const latestId = latestItem.public_id;

					// Case A: First time establishing a baseline for the session/system
					if (lastSeenIdRef.current === null) {
						dispatch(setLastCandidateId(latestId));
						localStorage.setItem('winvinaya_last_candidate_id', latestId);
						lastSeenIdRef.current = latestId;
						return;
					}

					// Case B: Potential new items detected
					if (latestId !== lastSeenIdRef.current) {
						const newItems = [];
						for (const candidate of items) {
							if (candidate.public_id === lastSeenIdRef.current) break;
							newItems.push(candidate);
						}

						if (newItems.length > 0) {
							// Notify for new candidates (oldest first for chronological order)
							newItems.reverse().forEach((candidate) => {
								dispatch(addNotification({
									id: `reg-${candidate.public_id}-${Date.now()}`,
									title: 'New Candidate Registered',
									message: `${candidate.name} has registered.`,
									timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
									type: 'registration',
									link: `/candidates/${candidate.public_id}`
								}));
							});

							// Update global state and persistence
							dispatch(setLastCandidateId(latestId));
							localStorage.setItem('winvinaya_last_candidate_id', latestId);
							lastSeenIdRef.current = latestId;
						}
					}
				} else if (lastSeenIdRef.current === null) {
					// Handle completely empty database initially
					const baseBaseline = 'EMPTY_DB';
					dispatch(setLastCandidateId(baseBaseline));
					localStorage.setItem('winvinaya_last_candidate_id', baseBaseline);
					lastSeenIdRef.current = baseBaseline;
				}
			} catch (error) {
				// Silently fail polling errors to avoid user disruption, but log for dev
				console.error('[NotificationWatcher] Poll error:', error);
			} finally {
				pollingActive.current = false;
			}
		};

		// Slight delay for initial check on mount
		const initialTimeout = setTimeout(checkForNewCandidates, 2000);

		// Poll every 30 seconds for balance between responsiveness and server load
		const intervalId = setInterval(checkForNewCandidates, 30000);

		return () => {
			clearTimeout(initialTimeout);
			clearInterval(intervalId);
		};
	}, [dispatch]);
};
