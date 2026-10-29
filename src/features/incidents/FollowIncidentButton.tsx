import { MdNotificationsActive, MdNotificationsNone } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { setIncidentFollowed } from '@/services/ea-api/api';
import { useIsFollowing } from './useIncidents';

/** Subscribe once, get notified when the status changes (cuts repeat contacts). */
export const FollowIncidentButton = ({ incidentId }: { incidentId: string }) => {
  const isFollowing = useIsFollowing(incidentId);
  const Icon = isFollowing ? MdNotificationsActive : MdNotificationsNone;

  return (
    <span className="shrink-0 whitespace-nowrap">
      <Button
        buttonStyle="btn-alert-info"
        buttonSize="btn-md"
        buttonWidth="w-auto"
        aria-pressed={isFollowing}
        onClick={() => void setIncidentFollowed(incidentId, !isFollowing)}
      >
        <Icon className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
        {isFollowing ? 'Following' : 'Follow this issue'}
      </Button>
    </span>
  );
};
