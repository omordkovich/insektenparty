export type PartyConfig = {
  kicker: string;
  title: string;
  greeting: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  defaultArrivalTime: string;
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

export const eventConfig: PartyConfig = {
  kicker: "Kindergeburtstag",
  title: "Milans 7. Geburtstag",
  greeting:
    "Willkommen zur Insektenparty! Wir freuen uns riesig, mit euch zu krabbeln, flattern und toben.",
  dateLabel: "Sonntag, 13. September 2026",
  timeLabel: "09:00 – 11:30 Uhr",
  locationLabel: "Spielscheune, Krewelshof 1, 53797 Lohmar",
  defaultArrivalTime: "09:00",
  contact: {
    name: "Familie Mordkovich",
    phone: "+49(0)15254267014",
    email: "o.mordkovich@hotmail.com",
  },
  assets: {
    logo: "/milans7BD/logo.png",
    plantsLeft: "/milans7BD/plants-left.png",
    plantsRight: "/milans7BD/plants-right.png",
    accentOne: "/milans7BD/accent-1.png",
    accentTwo: "/milans7BD/accent-2.png",
  },
};

export const jugendidolenEventConfig: PartyConfig = {
  kicker: "WIR BLEIBEN JUNG UND WILD!",
  title: "Happy Birthday!",
  greeting:
    "Willkommen zur Jugendidolen-Party! Wir freuen uns riesig, mit euch zu feiern.",
  dateLabel: "Freitag, 4. September 2026",
  timeLabel: "ab 17:00 Uhr",
  locationLabel: "Am Mutzbach 24, 51969 Köln",
  defaultArrivalTime: "17:00",
  contact: {
    name: "Familie Mordkovich",
    phone: "+49(0)15254267014",
    email: "o.mordkovich@hotmail.com",
  },
  assets: {
    logo: "/xenis37BD/logo.png",
    plantsLeft: "/xenis37BD/plants-left.png",
    plantsRight: "/xenis37BD/plants-right.png",
    accentOne: "/xenis37BD/accent-1.png",
    accentTwo: "/xenis37BD/accent-2.png",
  },
};
