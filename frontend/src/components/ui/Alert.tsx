type AlertVariant = "error" | "info" | "success";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
};

export function Alert({ variant = "info", title, message }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`}>
      {title ? <p className="mb-1 font-medium">{title}</p> : null}
      <p>{message}</p>
    </div>
  );
}
