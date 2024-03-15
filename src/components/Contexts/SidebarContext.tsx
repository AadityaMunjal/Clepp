import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

const SidebarContext = createContext<{
  selectedItem: string | null;
  setSelectedItem: Dispatch<SetStateAction<string | null>>;
}>({
  selectedItem: null,
  setSelectedItem: () => {},
});

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <SidebarContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
