type TabItemProps = {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
};

const TabItem = ({ label, isSelected, onClick, count }: TabItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-md flex-shrink-0 mx-1 flex items-center gap-1.5 ${
        isSelected ? "bg-gray-600 text-white" : "bg-discord1and4 text-gray-300 hover:bg-gray-600 hover:text-white"
      }`}
    >
      {label}
      {!!count && count > 0 && (
        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-semibold">
          {count}
        </span>
      )}
    </button>
  );
};

export default TabItem;
