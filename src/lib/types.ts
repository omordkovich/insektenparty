export type GuestDto = {
  id: string;
  name: string;
  additionalGuests: number;
  additionalGuestNames: string[];
  /** Null only for a declined guest. */
  arrivalTime: string | null;
  arrivalEndTime: string | null;
  departureTime: string | null;
  departureEndTime: string | null;
  bringingSomething: boolean;
  bringingDescription: string | null;
  hasMessage: boolean;
  message: string | null;
  declined: boolean;
  createdAt: string;
  updatedAt: string;
};
