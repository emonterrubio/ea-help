import { MdNotificationsActive, MdNotificationsNone } from 'react-icons/md';
import { setIncidentFollowed } from '@/services/ea-api/api';
import { useIsFollowing } from './useIncidents';

/** Subscribe once, get notified when the status changes (cuts repeat contacts). */
export const FollowIncidentButton = ({ incidentId }: { incidentId: string }) => {
  const isFollowing = useIsFollowing(incidentId);
  const Icon = isFollowing ? MdNotificationsActive : MdNotificationsNone;

  return (
    <button
      type="button"
      aria-pressed={isFollowing}
      onClick={() => void setIncidentFollowed(incidentId, !isFollowing)}
      className={`inline-flex items-center gap-x-1.5 rounded-md border border-solid px-2.5 py-1.5 electronicArtsTextBold text-xs tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
        isFollowing
          ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
          : 'border-gray-400 bg-white text-gray-800 hover:border-gray-600'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {isFollowing ? 'Following' : 'Follow this issue'}
    </button>
  );
};
