export type GuestDto = {
  id: string;
  name: string;
  additionalGuests: number;
  additionalGuestNames: string[];
  arrivalTime: string;
  bringingSomething: boolean;
  bringingDescription: string | null;
  hasMessage: boolean;
  message: string | null;
  createdAt: string;
  updatedAt: string;
};
