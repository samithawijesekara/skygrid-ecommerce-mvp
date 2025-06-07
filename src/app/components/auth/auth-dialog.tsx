"use client";

import React, { useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

interface AuthDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  defaultTab: string;
  children?: React.ReactNode;
}

export function AuthDialog({ open, setOpen, defaultTab, children }: AuthDialogProps) {
  const [tab, setTab] = useState(defaultTab);

  // Keep tab in sync with defaultTab prop
  React.useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Modern Store</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onClose={handleClose} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm onSuccess={handleClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
