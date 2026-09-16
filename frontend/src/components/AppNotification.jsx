import { useEffect } from "react";

/**
 * Reusable AppNotification popup component.
 * Matches the exact styling, structure, and behavior of the Add Asset page.
 *
 * @param {Object} props
 * @param {"success" | "error"} props.type - Type of notification ("success" or "error")
 * @param {string} [props.title] - Optional title. Defaults to "Success" or "Error".
 * @param {string} props.message - The message text to display.
 * @param {Function} props.onClose - Callback when dismissed or auto-closed.
 * @param {number} [props.duration=4000] - Duration in ms before auto-dismiss (0 to disable).
 */
export default function AppNotification({
  type = "success",
  title,
  message,
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message) return;

    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";
  const defaultTitle = isSuccess ? "Success" : "Error";

  return (
    <div
      className={`app-notification app-notification-${isSuccess ? "success" : "error"}`}
      role={isSuccess ? "status" : "alert"}
    >
      <div className="app-notification-icon">{isSuccess ? "✓" : "!"}</div>

      <div className="app-notification-content">
        <strong>{title || defaultTitle}</strong>
        <span>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          className="app-notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}
