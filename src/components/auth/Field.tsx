export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-mist bg-ice px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-azure"
      />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: {
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-mist bg-ice px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-azure"
      >
        {children}
      </select>
    </label>
  );
}

