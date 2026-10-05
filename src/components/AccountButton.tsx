"use client";

import { useState } from "react";
import type { SignInMethods } from "@/lib/account";
import { AccountDialog } from "./AccountDialog";
import { Button } from "./Button";

type AccountButtonProps = {
  email: string;
  name: string | null;
  methods: SignInMethods;
};

export function AccountButton({ email, name, methods }: AccountButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Mein Konto
      </Button>

      {open ? (
        <AccountDialog
          email={email}
          name={name}
          methods={methods}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
