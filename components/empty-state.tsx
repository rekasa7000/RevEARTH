import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Reusable empty state component
 * Displays when there's no data to show with optional call-to-action
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      {Icon && (
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
          <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Compact empty state for smaller areas (e.g., within cards)
 */
export function EmptyStateCompact({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      {Icon && (
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
      )}
      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3 max-w-sm">
        {description}
      </p>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Minimal empty state for inline use (e.g., charts, tables)
 */
export function EmptyStateInline({
  icon: Icon,
  message,
  className = "",
}: {
  icon?: LucideIcon;
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-6 ${className}`}>
      {Icon && <Icon className="h-5 w-5 text-gray-400 mr-2" />}
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
