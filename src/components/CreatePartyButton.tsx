"use client";

import { useState } from "react";
import { CreatePartyDialog } from "./CreatePartyDialog";
import { Button } from "./Button";

export function CreatePartyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => setOpen(true)}>
        + Party erstellen
      </Button>
      {open ? <CreatePartyDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
