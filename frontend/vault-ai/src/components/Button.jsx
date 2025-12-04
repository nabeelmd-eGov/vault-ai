export default function Button({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </button>
  );
}
