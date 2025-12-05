import { useState } from "react";
import { Header, ToastContainer } from "./components";
import { VaultProvider } from "./context/VaultContext";
import { ToastProvider } from "./context/ToastContext";
import HomePage from "./pages/HomePage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <ToastProvider>
      <VaultProvider>
        <div className="app">
          <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <HomePage isSidebarOpen={isSidebarOpen} onCloseSidebar={closeSidebar} />
        </div>
        <ToastContainer />
      </VaultProvider>
    </ToastProvider>
  );
}

export default App;
