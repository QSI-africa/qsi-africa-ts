import React from "react";
import ProfileHeader, { type ProfileHeaderProps } from "./ProfileHeader";

interface EntityProfileViewProps extends ProfileHeaderProps {
  children: React.ReactNode;
  contentWidthClassName?: string;
}

const EntityProfileView: React.FC<EntityProfileViewProps> = ({
  children,
  contentWidthClassName = "max-w-6xl",
  ...headerProps
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-y-auto no-scrollbar">
      <ProfileHeader {...headerProps} />
      <section className={`${contentWidthClassName} mx-auto w-full px-6 md:px-8 pb-12 space-y-8`}>
        {children}
      </section>
    </div>
  );
};

export default EntityProfileView;
