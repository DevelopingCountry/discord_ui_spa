import React from "react";

const SectionThree = ({ children }: { children: React.ReactNode }) => {
  return <div className={"flex-1 bg-discord2and3  overflow-y-auto custom-scrollbar"}>{children}</div>;
};

export default SectionThree;
