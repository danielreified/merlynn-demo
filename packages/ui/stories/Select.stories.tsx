import type { Meta, StoryObj } from "storybook/react";
import { expect, within, userEvent } from "storybook/test";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../src/select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select risk level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="HIGH">High</SelectItem>
        <SelectItem value="MEDIUM">Medium</SelectItem>
        <SelectItem value="LOW">Low</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Trigger is rendered", async () => {
      const trigger = canvas.getByRole("combobox");
      await expect(trigger).toBeInTheDocument();
    });
    await step("Click opens dropdown with options", async () => {
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await expect(document.querySelector("[role='option']")).toBeInTheDocument();
    });
  },
};

export const FilterPanel: Story = {
  name: "Filter Panel",
  render: () => (
    <div className="w-[600px] space-y-5 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Filter Decisions</h3>
        <p className="text-xs text-slate-500">Narrow down the decision log</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Risk Level</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Model</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="credit">CreditScore v2.4</SelectItem>
              <SelectItem value="fraud">Fraud Detection v3.1</SelectItem>
              <SelectItem value="kyc">KYC Verify v1.8</SelectItem>
              <SelectItem value="rate">Rate Limit v1.0</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Status</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Time Range</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ),
};
