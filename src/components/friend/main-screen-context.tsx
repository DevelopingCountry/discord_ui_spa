import { createContext, useContext, useState } from "react";
export interface MainScreenContextProps {
  state: string;
  setState: (state: string) => void;
}
const MainScreenContext = createContext<MainScreenContextProps | null>(null);
export const useMainScreenContext = () => useContext(MainScreenContext);

export const MainScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<string>("getFriends");
  return <MainScreenContext.Provider value={{ state, setState }}>{children}</MainScreenContext.Provider>;
};
