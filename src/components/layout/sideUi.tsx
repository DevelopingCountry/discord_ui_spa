export default function SideUi({ children }: { children: React.ReactNode }) {
  return (
    <aside className={"flex flex-col w-[72px] min-w-[72px] items-center overflow-y-auto hide-scrollbar"}>
      {children}
    </aside>
  );
}
