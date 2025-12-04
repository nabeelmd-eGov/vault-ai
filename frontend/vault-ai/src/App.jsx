import { useState } from "react";
import { Header } from "./components";
import HomePage from "./pages/HomePage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app">
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <HomePage isSidebarOpen={isSidebarOpen} onCloseSidebar={closeSidebar} />
    </div>
  );
}

export default App;
