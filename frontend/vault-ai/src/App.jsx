import { useState } from "react";
import { Header } from "./components";
import { VaultProvider } from "./context/VaultContext";
import HomePage from "./pages/HomePage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <VaultProvider>
      <div className="app">
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <HomePage isSidebarOpen={isSidebarOpen} onCloseSidebar={closeSidebar} />
      </div>
    </VaultProvider>
  );
}

export default App;
