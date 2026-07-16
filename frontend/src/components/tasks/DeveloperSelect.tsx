import type { Developer } from "@/types/developer.types";

interface DeveloperSelectProps {
  taskId: number;
  value: number | null;
  developers: Developer[];
  disabled?: boolean;
  error?: string;
  onChange: (developerId: number | null) => void;
}

export function DeveloperSelect({
  taskId,
  value,
  developers,
  disabled,
  error,
  onChange,
}: DeveloperSelectProps) {
  const selectId = `developer-${taskId}`;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-xs font-medium text-slate-600">
        Assigned Developer
      </label>
      <select
        id={selectId}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue === "" ? null : Number(nextValue));
        }}
        className={[
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
          "focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
          error ? "border-red-300" : "border-slate-300",
          disabled ? "cursor-not-allowed bg-slate-50 text-slate-500" : "",
        ].join(" ")}
      >
        <option value="">Unassigned</option>
        {developers.map((developer) => (
          <option key={developer.id} value={developer.id}>
            {developer.name}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
