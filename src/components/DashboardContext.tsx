import { createContext, useContext } from "react";

type DashboardContextType = {
  search: string;
  setSearch: (value: string) => void;
};

export const DashboardContext = createContext<DashboardContextType>({
  search: "",
  setSearch: () => {},
});

export const useDashboardSearch = () => useContext(DashboardContext);
