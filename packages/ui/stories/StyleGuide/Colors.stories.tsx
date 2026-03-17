import type { Meta, StoryObj } from "storybook/react";

const meta: Meta = {
  title: "Style Guide/Colors",
};

export default meta;
type Story = StoryObj;

function Swatch({ name, hex, className }: { name: string; hex: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-16 w-28 rounded-lg border border-slate-700 ${className}`} />
      <p className="text-xs font-medium text-slate-200">{name}</p>
      <p className="text-xs text-slate-500">{hex}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="flex flex-wrap gap-6">{children}</div>
    </div>
  );
}

export const Palette: Story = {
  render: () => (
    <div className="space-y-10 p-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-white">Color Palette</h2>
        <p className="text-sm text-slate-400">
          Dark fintech theme with semantic color coding for risk levels.
        </p>
      </div>

      <Section title="Backgrounds">
        <Swatch name="Background" hex="#0a0f1e" className="bg-[#0a0f1e]" />
        <Swatch name="Surface" hex="#111827" className="bg-[#111827]" />
        <Swatch name="Surface Light" hex="#1e293b" className="bg-[#1e293b]" />
        <Swatch name="Elevated" hex="#334155" className="bg-slate-700" />
      </Section>

      <Section title="Primary">
        <Swatch name="Blue 500" hex="#3b82f6" className="bg-blue-500" />
        <Swatch name="Blue 600" hex="#2563eb" className="bg-blue-600" />
        <Swatch name="Blue 700" hex="#1d4ed8" className="bg-blue-700" />
      </Section>

      <Section title="Risk — High">
        <Swatch name="Red 400" hex="#f87171" className="bg-red-400" />
        <Swatch name="Red 500" hex="#ef4444" className="bg-red-500" />
        <Swatch name="Red 600" hex="#dc2626" className="bg-red-600" />
        <Swatch name="Red 500/15" hex="#ef4444 15%" className="bg-red-500/15" />
      </Section>

      <Section title="Risk — Medium">
        <Swatch name="Amber 400" hex="#fbbf24" className="bg-amber-400" />
        <Swatch name="Amber 500" hex="#f59e0b" className="bg-amber-500" />
        <Swatch name="Amber 500/15" hex="#f59e0b 15%" className="bg-amber-500/15" />
      </Section>

      <Section title="Risk — Low">
        <Swatch name="Emerald 400" hex="#34d399" className="bg-emerald-400" />
        <Swatch name="Emerald 500" hex="#10b981" className="bg-emerald-500" />
        <Swatch name="Emerald 500/15" hex="#10b981 15%" className="bg-emerald-500/15" />
      </Section>

      <Section title="Text">
        <Swatch name="Slate 100" hex="#f1f5f9" className="bg-slate-100" />
        <Swatch name="Slate 200" hex="#e2e8f0" className="bg-slate-200" />
        <Swatch name="Slate 400" hex="#94a3b8" className="bg-slate-400" />
        <Swatch name="Slate 500" hex="#64748b" className="bg-slate-500" />
      </Section>

      <Section title="Borders">
        <Swatch name="Slate 700" hex="#334155" className="bg-slate-700" />
        <Swatch name="Slate 800" hex="#1e293b" className="bg-slate-800" />
      </Section>
    </div>
  ),
};
