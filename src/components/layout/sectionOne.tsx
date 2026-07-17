function SectionOne({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "px-4 shadow-elevationLow z-20 min-h-[48px] bg-discord1and4 flex justify-between items-center relative"
      }
    >
      {children}
    </div>
  );
}

export default SectionOne;
