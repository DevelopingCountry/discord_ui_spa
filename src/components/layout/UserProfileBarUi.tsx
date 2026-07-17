import React from "react";

const UserProfileBarUi = ({ children }: { children: React.ReactNode }) => {
  return <section className={"absolute bottom-0 z-30 w-full bg-discordSidebar"}>{children}</section>;
};

export default UserProfileBarUi;
