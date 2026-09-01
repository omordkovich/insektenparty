export type PartyConfig = {
  kicker: string;
  title: string;
  greeting: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  defaultArrivalTime: string;
  /** ISO date (YYYY-MM-DD) and 24h times (HH:MM), used to build the "add to
   * calendar" link - kept separate from the human-readable labels above
   * since those aren't reliably machine-parseable. */
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  assets: {
    logo: string;
    plantsLeft: string;
    plantsRight: string;
    accentOne: string;
    accentTwo: string;
  };
};
