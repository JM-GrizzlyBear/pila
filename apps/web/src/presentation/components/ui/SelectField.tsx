import { useId } from "react";
import { inputBase } from "./styles";

// A labelled dropdown with its error message underneath
export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        className={`${inputBase} h-11 ${error ? "border-danger" : "border-edge"}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {note && (
        <p
          id={noteId}
          className={`text-sm ${error ? "font-medium text-danger" : "text-muted"}`}
        >
          {note}
        </p>
      )}
    </div>
  );
}
