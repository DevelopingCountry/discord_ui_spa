type TabItemProps = {
  label: string;
  isSelected: boolean;
  onClick: () => void;
};

const TabItem = ({ label, isSelected, onClick }: TabItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-md flex-shrink-0 mx-1 ${
        isSelected ? "bg-gray-600 text-white" : "bg-discord1and4 text-gray-300 hover:bg-gray-600 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
};

export default TabItem;
