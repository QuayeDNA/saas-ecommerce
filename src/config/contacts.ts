export const CONTACTS = {
  support: {
    phone: "+233548983019",
    waLink: "https://wa.me/+233548983019",
    waLinkWithMsg: (msg: string) =>
      `https://wa.me/+233548983019?text=${encodeURIComponent(msg)}`,
  },
  community: {
    waGroupLink: "https://chat.whatsapp.com/EstSwEm3q9Z4sS42Ed5N8u",
  },
} as const;
