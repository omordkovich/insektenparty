export type GuestDto = {
  id: string;
  name: string;
  additionalGuests: number;
  additionalGuestNames: string[];
  arrivalTime: string;
  arrivalEndTime: string | null;
  departureTime: string | null;
  departureEndTime: string | null;
  bringingSomething: boolean;
  bringingDescription: string | null;
  hasMessage: boolean;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};
