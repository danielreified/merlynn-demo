import type { Meta, StoryObj } from "storybook/react";
import { expect, within } from "storybook/test";
import { Card, CardHeader, CardTitle, CardContent } from "../src/card";
import { Badge } from "../src/badge";
import { Button } from "../src/button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const StatCard: Story = {
  render: () => (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>Total Decisions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-white">1,247</p>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Renders title and value", async () => {
      await expect(canvas.getByText("Total Decisions")).toBeInTheDocument();
      await expect(canvas.getByText("1,247")).toBeInTheDocument();
    });
  },
};

export const HighRiskCard: Story = {
  render: () => (
    <Card className="w-64 border-red-500/30">
      <CardHeader>
        <CardTitle>High Risk</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-red-400">23</p>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Renders high risk title and count", async () => {
      await expect(canvas.getByText("High Risk")).toBeInTheDocument();
      await expect(canvas.getByText("23")).toBeInTheDocument();
    });
  },
};

export const DashboardRow: Story = {
  name: "Dashboard Stats Row",
  render: () => (
    <div className="flex gap-4">
      <Card className="w-56">
        <CardHeader>
          <CardTitle>Total Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">1,247</p>
          <p className="mt-1 text-xs text-emerald-400">+12.3% from last week</p>
        </CardContent>
      </Card>

      <Card className="w-56 border-red-500/20">
        <CardHeader>
          <CardTitle>High Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-400">23</p>
          <p className="mt-1 text-xs text-red-400">+5 since yesterday</p>
        </CardContent>
      </Card>

      <Card className="w-56">
        <CardHeader>
          <CardTitle>Model Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-400">97.2%</p>
          <p className="mt-1 text-xs text-slate-400">Across all models</p>
        </CardContent>
      </Card>

      <Card className="w-56">
        <CardHeader>
          <CardTitle>Avg. Latency</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">
            142<span className="text-lg text-slate-400">ms</span>
          </p>
          <p className="mt-1 text-xs text-emerald-400">-8ms from baseline</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const DetailCard: Story = {
  name: "Decision Detail Card",
  render: () => (
    <Card className="w-[420px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 font-mono text-xs text-slate-500">DEC-0042</p>
            <h3 className="text-base font-semibold text-slate-100">Credit Approval Request</h3>
          </div>
          <Badge variant="high">HIGH</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Model</p>
              <p className="text-sm font-medium text-slate-200">CreditScore v2.4</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Risk Score</p>
              <p className="font-mono text-sm font-bold text-red-400">0.92</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Timestamp</p>
              <p className="text-sm text-slate-200">2026-03-16 14:32:01</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-sm font-medium text-amber-400">Pending Review</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="mb-1.5 text-xs font-medium text-slate-400">Key Risk Factors</p>
            <ul className="space-y-1 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Debt-to-income ratio exceeds threshold (0.78)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Recent credit inquiries: 6 in last 30 days
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Employment tenure under 12 months
              </li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm">Approve</Button>
            <Button size="sm" variant="destructive">
              Reject
            </Button>
            <Button size="sm" variant="outline">
              Request Info
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ModelHealthCard: Story = {
  name: "Model Health Card",
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Model Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            {
              name: "CreditScore v2.4",
              accuracy: 97.2,
              status: "healthy" as const,
              decisions: "1.2k",
            },
            {
              name: "Fraud Detection v3.1",
              accuracy: 94.8,
              status: "warning" as const,
              decisions: "856",
            },
            {
              name: "KYC Verify v1.8",
              accuracy: 99.1,
              status: "healthy" as const,
              decisions: "2.4k",
            },
            {
              name: "Rate Limit v1.0",
              accuracy: 87.3,
              status: "critical" as const,
              decisions: "433",
            },
          ].map((model) => (
            <div
              key={model.name}
              className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    model.status === "healthy"
                      ? "bg-emerald-400"
                      : model.status === "warning"
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">{model.name}</p>
                  <p className="text-xs text-slate-500">{model.decisions} decisions</p>
                </div>
              </div>
              <span
                className={`font-mono text-sm font-semibold ${
                  model.accuracy >= 95
                    ? "text-emerald-400"
                    : model.accuracy >= 90
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {model.accuracy}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
};
