"use client";

import React, { useActionState, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@merlynn/ui";
import type { TransactionType } from "@merlynn/db";
import { createDecision, type CreateDecisionState } from "@/app/actions/decisions";

const initialState: CreateDecisionState = { success: false };

export function AddDecisionDialog(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("PAYMENT");
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(createDecision, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      formRef.current?.reset();
      setTransactionType("PAYMENT");
    }
  }, [state]);

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = transactionType;
    }
  }, [transactionType]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Decision</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Transaction for Risk Assessment</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="mt-4 space-y-4">
          {state.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Amount ($)</label>
            <input
              name="amount"
              type="number"
              required
              min="1"
              step="0.01"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Supplier Name</label>
            <input
              name="supplierName"
              type="text"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter supplier name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Country</label>
            <input
              name="country"
              type="text"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter country"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Transaction Type
            </label>
            <input
              ref={hiddenInputRef}
              type="hidden"
              name="transactionType"
              value={transactionType}
            />
            <Select
              value={transactionType}
              onValueChange={(v) => setTransactionType(v as TransactionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
                <SelectItem value="PROCUREMENT">Procurement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Assessing..." : "Submit for Assessment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
