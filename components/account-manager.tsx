"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Calendar } from "lucide-react";
import { calendarStore } from "@/lib/calendar-store";

const ACCOUNT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

export default function AccountManager() {
  const [open, setOpen] = useState(false);
  const accounts = useSyncExternalStore(
    (callback) => calendarStore.subscribe(callback),
    () => calendarStore.getAccounts(),
    () => []
  );

  useEffect(() => {
    calendarStore.loadFromLocalStorage();
  }, []);

  const handleConnectGoogle = async () => {
    // Redirect to Google OAuth
    window.location.href = "/api/auth/google";
  };

  const handleConnectMicrosoft = async () => {
    // Redirect to Microsoft OAuth
    window.location.href = "/api/auth/microsoft";
  };

  const handleRemoveAccount = (accountId: string) => {
    calendarStore.removeAccount(accountId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Accounts ({accounts.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Calendar Accounts</DialogTitle>
          <DialogDescription>
            Connect multiple calendar accounts to see all your events in one place.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connected Accounts */}
          {accounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Connected Accounts</h4>
              {accounts.map((account, index) => (
                <Card key={account.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                      <div>
                        <p className="text-sm font-medium">{account.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {account.provider}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAccount(account.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add New Account */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Add New Account</h4>
            <div className="grid gap-2">
              <Button
                onClick={handleConnectGoogle}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  G
                </div>
                Connect Google Calendar
              </Button>
              <Button
                onClick={handleConnectMicrosoft}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                Connect Microsoft 365
              </Button>
            </div>
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No accounts connected yet. Add your first calendar account to get started.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
