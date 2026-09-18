"use client";

import { useState } from "react";
import { EventDialog } from "./EventDialog";
import { Button } from "./Button";

export function CreateEventButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => setOpen(true)}>
        + Event erstellen
      </Button>
      {open ? <EventDialog mode="create" onCloseAction={() => setOpen(false)} /> : null}
    </>
  );
}
