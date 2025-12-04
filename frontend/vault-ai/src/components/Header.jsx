import Icon from "./Icon";

export default function Header() {
  return (
    <header className="app-header" role="banner">
      <div className="logo">
        <Icon name="vault" size={28} ariaHidden={true} />
        <h1 className="logo-title">AI Document Vault</h1>
      </div>
    </header>
  );
}
