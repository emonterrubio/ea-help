interface EntityLogoProps {
  src: string;
  alt: string;
}

/** Game/product logo shown at the top of a case or infraction details view. */
export const EntityLogo = ({ src, alt }: EntityLogoProps) => (
  <div className="my-8 w-auto h-16 overflow-hidden">
    <img className="h-full object-cover" src={src} alt={alt} />
  </div>
);
