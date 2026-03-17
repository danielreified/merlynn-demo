import type { Meta, StoryObj } from "storybook/react";

const meta: Meta = {
  title: "Style Guide/Spacing & Radii",
};

export default meta;
type Story = StoryObj;

function SpacingBar({ label, size }: { label: string; size: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-16 shrink-0 text-right text-xs text-slate-500">{label}</span>
      <div className={`h-4 rounded bg-blue-600 ${size}`} />
    </div>
  );
}

function RadiusBox({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-16 w-24 border border-slate-600 bg-slate-800 ${className}`} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function ShadowBox({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-16 w-24 rounded-lg bg-slate-800 ${className}`} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export const SpacingScale: Story = {
  name: "Spacing",
  render: () => (
    <div className="space-y-10 p-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-white">Spacing</h2>
        <p className="text-sm text-slate-400">
          Tailwind default spacing scale. Key values used in the design system.
        </p>
      </div>

      <div className="space-y-2">
        <SpacingBar label="0.5 (2px)" size="w-0.5" />
        <SpacingBar label="1 (4px)" size="w-1" />
        <SpacingBar label="1.5 (6px)" size="w-1.5" />
        <SpacingBar label="2 (8px)" size="w-2" />
        <SpacingBar label="3 (12px)" size="w-3" />
        <SpacingBar label="4 (16px)" size="w-4" />
        <SpacingBar label="6 (24px)" size="w-6" />
        <SpacingBar label="8 (32px)" size="w-8" />
        <SpacingBar label="10 (40px)" size="w-10" />
        <SpacingBar label="12 (48px)" size="w-12" />
        <SpacingBar label="16 (64px)" size="w-16" />
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  name: "Border Radius",
  render: () => (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-white">Border Radius</h2>
        <p className="text-sm text-slate-400">Rounded corners used across components.</p>
      </div>

      <div className="flex flex-wrap gap-6">
        <RadiusBox label="rounded-md" className="rounded-md" />
        <RadiusBox label="rounded-lg" className="rounded-lg" />
        <RadiusBox label="rounded-xl" className="rounded-xl" />
        <RadiusBox label="rounded-full" className="rounded-full" />
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  name: "Shadows",
  render: () => (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="mb-1 text-xl font-bold text-white">Shadows</h2>
        <p className="text-sm text-slate-400">Box shadows for elevation hierarchy.</p>
      </div>

      <div className="flex flex-wrap gap-8">
        <ShadowBox label="shadow-none" className="" />
        <ShadowBox label="shadow-lg" className="shadow-lg" />
        <ShadowBox label="shadow-xl" className="shadow-xl" />
        <ShadowBox label="shadow-2xl" className="shadow-2xl" />
      </div>
    </div>
  ),
};
