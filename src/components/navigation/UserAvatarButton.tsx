interface UserAvatarButtonProps {
  user: { name: string; imageUrl: string };
}

/** Round avatar button for the (not yet implemented) user menu. */
export const UserAvatarButton = ({ user }: UserAvatarButtonProps) => (
  <button
    type="button"
    aria-label={`${user.name} account menu`}
    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
  >
    <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" width={32} height={32} />
  </button>
);
