import { useState } from "react";
import { toast } from "sonner";
import { useDeskStore } from "@/lib/ict-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ConfirmDelete } from "./confirm-delete";
import { Field } from "./fields";
import { TRADING_TZ } from "@/lib/ict-time";
import type { DeskData } from "@/lib/ict-types";

export function SettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useDeskStore();
  const patchAccount = useDeskStore((s) => s.patchAccount);
  const rebuildProtocolDates = useDeskStore((s) => s.rebuildProtocolDates);
  const resetAll = useDeskStore((s) => s.resetAll);
  const replaceAll = useDeskStore((s) => s.replaceAll);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Account rules</SheetTitle>
          <SheetDescription>
            Funded-account constraints plus risk. ICT timing always uses {TRADING_TZ} — not the browser clock.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-5">
          <Field label="Account name">
            <Input value={data.accountName} onChange={(e) => patchAccount({ accountName: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Starting balance">
              <Input
                type="number"
                value={data.rules.startingBalance}
                onChange={(e) => patchAccount({ startingBalance: Number(e.target.value) })}
              />
            </Field>
            <Field label="Payout threshold %">
              <Input
                type="number"
                step="0.5"
                value={data.rules.payoutThresholdPct}
                onChange={(e) => patchAccount({ payoutThresholdPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Profit target %">
              <Input
                type="number"
                step="0.5"
                value={data.rules.profitTargetPct}
                onChange={(e) => patchAccount({ profitTargetPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Profit split %">
              <Input
                type="number"
                value={data.rules.profitSplit}
                onChange={(e) => patchAccount({ profitSplit: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max daily loss %">
              <Input
                type="number"
                step="0.1"
                value={data.rules.maxDailyLossPct}
                onChange={(e) => patchAccount({ maxDailyLossPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max total DD %">
              <Input
                type="number"
                step="0.1"
                value={data.rules.maxTotalDrawdownPct}
                onChange={(e) => patchAccount({ maxTotalDrawdownPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Normal risk %">
              <Input
                type="number"
                step="0.05"
                value={data.rules.normalRiskPct}
                onChange={(e) => patchAccount({ normalRiskPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="High-conviction %">
              <Input
                type="number"
                step="0.05"
                value={data.rules.highConvictionRiskPct}
                onChange={(e) => patchAccount({ highConvictionRiskPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max trades / day">
              <Input
                type="number"
                value={data.rules.maxTrades}
                onChange={(e) => patchAccount({ maxTrades: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max consecutive losses">
              <Input
                type="number"
                value={data.rules.maxConsecutiveLosses}
                onChange={(e) => patchAccount({ maxConsecutiveLosses: Number(e.target.value) })}
              />
            </Field>
            <Field label="Window start (NY)">
              <Input
                type="time"
                value={data.rules.windowStart}
                onChange={(e) => patchAccount({ windowStart: e.target.value })}
              />
            </Field>
            <Field label="Window end (NY)">
              <Input
                type="time"
                value={data.rules.windowEnd}
                onChange={(e) => patchAccount({ windowEnd: e.target.value })}
              />
            </Field>
            <Field label="Min trading days">
              <Input
                type="number"
                value={data.rules.minTradingDays}
                onChange={(e) => patchAccount({ minTradingDays: Number(e.target.value) })}
              />
            </Field>
            <Field label="Consistency cap %">
              <Input
                type="number"
                value={data.rules.consistencyPct}
                onChange={(e) => patchAccount({ consistencyPct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Max lots">
              <Input
                type="number"
                step="0.01"
                value={data.rules.maxPositionLots}
                onChange={(e) => patchAccount({ maxPositionLots: Number(e.target.value) })}
              />
            </Field>
            <Field label="Protocol start">
              <Input
                type="date"
                value={data.rules.protocolStartDate}
                onChange={(e) => rebuildProtocolDates(e.target.value)}
              />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2">
            <span className="text-sm">News restricted</span>
            <Switch
              checked={data.rules.newsRestricted}
              onCheckedChange={(v) => patchAccount({ newsRestricted: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2">
            <span className="text-sm">Weekend restricted</span>
            <Switch
              checked={data.rules.weekendRestricted}
              onCheckedChange={(v) => patchAccount({ weekendRestricted: v })}
            />
          </div>
          <Field label="Scaling note">
            <Input
              value={data.rules.scalingNote}
              onChange={(e) => patchAccount({ scalingNote: e.target.value })}
            />
          </Field>
          <Field label="Mantra">
            <Textarea value={data.mantra} onChange={(e) => patchAccount({ mantra: e.target.value })} />
          </Field>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(useDeskStore.getState(), null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "first-payout-desk.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                Import
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void file.text().then((text) => {
                      try {
                        replaceAll(JSON.parse(text) as DeskData);
                        toast.success("Desk restored");
                      } catch {
                        toast.error("Invalid file");
                      }
                    });
                  }}
                />
              </label>
            </Button>
            <Button variant="destructive" onClick={() => setResetOpen(true)}>
              Reset sample data
            </Button>
          </div>
        </div>
      </SheetContent>
      <ConfirmDelete
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset the desk?"
        description="This replaces everything with the sample ICT journal."
        onConfirm={() => {
          resetAll();
          setResetOpen(false);
          toast.success("Desk reset");
        }}
      />
    </Sheet>
  );
}
