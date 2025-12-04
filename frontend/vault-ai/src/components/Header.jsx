import Icon from "./Icon";

export default function Header({ onMenuToggle, isSidebarOpen }) {
  return (
    <header className="app-header" role="banner">
      <button
        className="menu-toggle"
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={isSidebarOpen}
      >
        <Icon name={isSidebarOpen ? "x" : "menu"} size={24} ariaHidden={true} />
      </button>
      <div className="logo">
        <Icon name="vault" size={28} ariaHidden={true} />
        <h1 className="logo-title">AI Document Vault</h1>
      </div>
    </header>
  );
}
