export const NAME_MAX_LENGTH = 100;
export const BRINGING_DESCRIPTION_MAX_LENGTH = 1000;
export const MAX_ADDITIONAL_GUESTS = 30;
export const ARRIVAL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type GuestInput = {
  name: string;
  additionalGuests: number;
  additionalGuestNames: string[];
  arrivalTime: string;
  bringingSomething: boolean;
  bringingDescription: string | null;
};

export type ValidationResult =
  | { ok: true; data: GuestInput }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateGuestInput(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: "Ungültige Anfragedaten." };
  }

  if (typeof body.name !== "string") {
    return { ok: false, error: "Name ist erforderlich." };
  }

  const name = body.name.trim();
  if (!name) {
    return { ok: false, error: "Name darf nicht leer sein." };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Name darf höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
    };
  }

  const rawAdditional = body.additionalGuests;
  let additionalGuests: number;

  if (typeof rawAdditional === "number") {
    additionalGuests = rawAdditional;
  } else if (typeof rawAdditional === "string" && rawAdditional.trim() !== "") {
    additionalGuests = Number(rawAdditional);
  } else {
    return {
      ok: false,
      error: "Zusätzliche Personen müssen eine Zahl sein.",
    };
  }

  if (
    !Number.isInteger(additionalGuests) ||
    additionalGuests < 0 ||
    !Number.isFinite(additionalGuests)
  ) {
    return {
      ok: false,
      error: "Zusätzliche Personen müssen eine ganze Zahl ab 0 sein.",
    };
  }

  if (additionalGuests > MAX_ADDITIONAL_GUESTS) {
    return {
      ok: false,
      error: `Zusätzliche Personen dürfen höchstens ${MAX_ADDITIONAL_GUESTS} sein.`,
    };
  }

  const rawNames = body.additionalGuestNames;
  if (!Array.isArray(rawNames)) {
    return {
      ok: false,
      error: "Namen der zusätzlichen Personen sind ungültig.",
    };
  }
  if (rawNames.length !== additionalGuests) {
    return {
      ok: false,
      error:
        "Anzahl der Namen muss der Anzahl zusätzlicher Personen entsprechen.",
    };
  }
  const additionalGuestNames: string[] = [];
  for (const rawName of rawNames) {
    if (typeof rawName !== "string") {
      return {
        ok: false,
        error: "Namen der zusätzlichen Personen sind ungültig.",
      };
    }
    const trimmedName = rawName.trim();
    if (!trimmedName) {
      return {
        ok: false,
        error: "Namen der zusätzlichen Personen dürfen nicht leer sein.",
      };
    }
    if (trimmedName.length > NAME_MAX_LENGTH) {
      return {
        ok: false,
        error: `Namen der zusätzlichen Personen dürfen höchstens ${NAME_MAX_LENGTH} Zeichen lang sein.`,
      };
    }
    additionalGuestNames.push(trimmedName);
  }

  if (typeof body.arrivalTime !== "string") {
    return { ok: false, error: "Ankunftszeit ist erforderlich." };
  }

  const arrivalTime = body.arrivalTime.trim();
  if (!arrivalTime) {
    return { ok: false, error: "Ankunftszeit ist erforderlich." };
  }
  if (!ARRIVAL_TIME_PATTERN.test(arrivalTime)) {
    return {
      ok: false,
      error: "Ankunftszeit muss im Format HH:mm angegeben werden.",
    };
  }

  const bringingSomething = body.bringingSomething === true;

  let bringingDescription: string | null = null;
  if (bringingSomething) {
    if (typeof body.bringingDescription !== "string") {
      return { ok: false, error: "Bitte gib an, was du mitbringst." };
    }
    const trimmedDescription = body.bringingDescription.trim();
    if (!trimmedDescription) {
      return { ok: false, error: "Bitte gib an, was du mitbringst." };
    }
    if (trimmedDescription.length > BRINGING_DESCRIPTION_MAX_LENGTH) {
      return {
        ok: false,
        error: `Die Angabe darf höchstens ${BRINGING_DESCRIPTION_MAX_LENGTH} Zeichen lang sein.`,
      };
    }
    bringingDescription = trimmedDescription;
  }

  return {
    ok: true,
    data: {
      name,
      additionalGuests,
      additionalGuestNames,
      arrivalTime,
      bringingSomething,
      bringingDescription,
    },
  };
}

export function normalizeArrivalTime(value: string): string {
  // Postgres TIME may come back as HH:mm:ss
  return value.slice(0, 5);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
