import type { Meta, StoryObj } from "storybook/react";

const meta: Meta = {
  title: "Style Guide/Typography",
};

export default meta;
type Story = StoryObj;

function Row({ label, className, text }: { label: string; className: string; text?: string }) {
  return (
    <div className="flex items-baseline gap-6 border-b border-slate-800 py-4">
      <span className="w-40 shrink-0 text-xs text-slate-500">{label}</span>
      <span className={className}>{text ?? "Risk Monitor Dashboard"}</span>
    </div>
  );
}

export const Scale: Story = {
  name: "Type Scale",
  render: () => (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-white">Typography</h2>
        <p className="text-sm text-slate-400">
          System font stack. All text uses Tailwind utility classes.
        </p>
      </div>

      <div className="space-y-0">
        <Row label="text-3xl / bold" className="text-3xl font-bold text-white" />
        <Row label="text-2xl / bold" className="text-2xl font-bold text-white" />
        <Row label="text-xl / semibold" className="text-xl font-semibold text-white" />
        <Row label="text-lg / semibold" className="text-lg font-semibold text-slate-100" />
        <Row label="text-base / medium" className="text-base font-medium text-slate-200" />
        <Row
          label="text-sm / medium"
          className="text-sm font-medium text-slate-300"
          text="Card titles, labels, and secondary text"
        />
        <Row
          label="text-sm / normal"
          className="text-sm text-slate-400"
          text="Body text and descriptions"
        />
        <Row
          label="text-xs / semibold / uppercase"
          className="text-xs font-semibold uppercase tracking-wider text-slate-400"
          text="Badge labels & section headers"
        />
        <Row
          label="text-xs / normal"
          className="text-xs text-slate-500"
          text="Captions and metadata"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Font Weights
        </h3>
        <div className="flex gap-8">
          <span className="text-sm font-normal text-slate-300">Normal (400)</span>
          <span className="text-sm font-medium text-slate-300">Medium (500)</span>
          <span className="text-sm font-semibold text-slate-300">Semibold (600)</span>
          <span className="text-sm font-bold text-slate-300">Bold (700)</span>
        </div>
      </div>
    </div>
  ),
};
