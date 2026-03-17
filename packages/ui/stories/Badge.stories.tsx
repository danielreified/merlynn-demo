import type { Meta, StoryObj } from "storybook/react";
import { expect, within } from "storybook/test";
import { Badge } from "../src/badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const High: Story = {
  args: { variant: "high", children: "HIGH" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Renders HIGH text", async () => {
      await expect(canvas.getByText("HIGH")).toBeInTheDocument();
    });
  },
};

export const Medium: Story = {
  args: { variant: "medium", children: "MEDIUM" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Renders MEDIUM text", async () => {
      await expect(canvas.getByText("MEDIUM")).toBeInTheDocument();
    });
  },
};

export const Low: Story = {
  args: { variant: "low", children: "LOW" },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Renders LOW text", async () => {
      await expect(canvas.getByText("LOW")).toBeInTheDocument();
    });
  },
};

export const Default: Story = {
  args: { variant: "default", children: "DEFAULT" },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div className="space-y-8 p-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Risk Levels
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="high">HIGH</Badge>
          <Badge variant="medium">MEDIUM</Badge>
          <Badge variant="low">LOW</Badge>
          <Badge variant="default">DEFAULT</Badge>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          In Context — Risk Assessment Table
        </h3>
        <div className="w-[540px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 font-medium text-slate-400">Decision ID</th>
                <th className="px-4 py-3 font-medium text-slate-400">Model</th>
                <th className="px-4 py-3 font-medium text-slate-400">Risk</th>
                <th className="px-4 py-3 font-medium text-slate-400">Score</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              <tr className="border-b border-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">DEC-0042</td>
                <td className="px-4 py-3">Credit Approval</td>
                <td className="px-4 py-3">
                  <Badge variant="high">HIGH</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-red-400">0.92</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">DEC-0041</td>
                <td className="px-4 py-3">Fraud Detection</td>
                <td className="px-4 py-3">
                  <Badge variant="medium">MEDIUM</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-amber-400">0.64</td>
              </tr>
              <tr className="border-b border-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">DEC-0040</td>
                <td className="px-4 py-3">KYC Verification</td>
                <td className="px-4 py-3">
                  <Badge variant="low">LOW</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-emerald-400">0.18</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">DEC-0039</td>
                <td className="px-4 py-3">Rate Limit Check</td>
                <td className="px-4 py-3">
                  <Badge variant="default">N/A</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-slate-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
};
