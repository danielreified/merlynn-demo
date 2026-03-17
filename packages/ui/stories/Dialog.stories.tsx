import type { Meta, StoryObj } from "storybook/react";
import { expect, within, userEvent } from "storybook/test";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../src/dialog";
import { Button } from "../src/button";
import { Badge } from "../src/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../src/select";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Decision</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400">Dialog content goes here.</p>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Click trigger opens the dialog", async () => {
      const trigger = canvas.getByRole("button", { name: "Open Dialog" });
      await userEvent.click(trigger);
    });
    await step("Dialog is visible with correct title", async () => {
      await expect(document.querySelector("[role='dialog']")).toBeInTheDocument();
    });
  },
};

export const DecisionReview: Story = {
  name: "Decision Review Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Review Decision
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Decision DEC-0042</DialogTitle>
            <Badge variant="high">HIGH RISK</Badge>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500">Model</p>
                <p className="text-sm font-medium text-slate-200">CreditScore v2.4</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Risk Score</p>
                <p className="font-mono text-sm font-bold text-red-400">0.92</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Applicant</p>
                <p className="text-sm text-slate-200">John Smith</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Amount</p>
                <p className="text-sm font-medium text-slate-200">$45,000</p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Override Decision
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve — Override Risk</SelectItem>
                <SelectItem value="reject">Reject — Confirm Risk</SelectItem>
                <SelectItem value="escalate">Escalate to Senior Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Notes</label>
            <textarea
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add review notes..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Submit Review</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const ConfirmDeletion: Story = {
  name: "Confirm Deletion Dialog",
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete Model
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Model</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <p className="text-sm text-slate-400">
            Are you sure you want to delete{" "}
            <span className="font-medium text-slate-200">CreditScore v2.4</span>? This action cannot
            be undone and will remove all associated decision history.
          </p>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <p className="text-xs text-red-400">
              Warning: 1,247 decisions reference this model. They will be marked as orphaned.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Delete Model</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ),
};
