export interface LocationOption {
  id: string;
  label: string;
  emoji: string;
}

export interface EnvelopeConfig {
  teaser: string;
  openLabel: string;
  letterHint: string;
}

export interface InvitationTextConfig {
  greeting: string;
  greetingFallbackName: string;
  question: string;
}

export interface ButtonsConfig {
  yes: string;
  no: string;
  noTeasers: readonly string[];
}

export interface PlannerErrorsConfig {
  location: string;
  customLocation: string;
  date: string;
  datePast: string;
  time: string;
  timePast: string;
}

export interface PlannerConfig {
  title: string;
  subtitle: string;
  locationLabel: string;
  locations: readonly LocationOption[];
  allowCustomLocation: boolean;
  customLocationLabel: string;
  customLocationEmoji: string;
  customLocationInputLabel: string;
  customLocationPlaceholder: string;
  dateLabel: string;
  defaultDate: string;
  timeLabel: string;
  customTimeLabel: string;
  defaultTime: string;
  timeSlots: readonly string[];
  noteLabel: string;
  notePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  errors: PlannerErrorsConfig;
}

export interface CelebrationConfig {
  title: string;
  subtitle: string;
  closing: string;
  planTitle: string;
  placeLabel: string;
  dateLabel: string;
  timeLabel: string;
  noteLabel: string;
  replayLabel: string;
}

export interface ReportConfig {
  timezone: string;
}

export interface MetaConfig {
  title: string;
  description: string;
}

export interface InvitationConfig {
  /** Her name. An empty string shows the fallback greeting. */
  girlName: string;
  envelope: EnvelopeConfig;
  invitation: InvitationTextConfig;
  buttons: ButtonsConfig;
  planner: PlannerConfig;
  celebration: CelebrationConfig;
  report: ReportConfig;
  meta: MetaConfig;
}

export const invitationConfig: InvitationConfig = {
  girlName: "Madina",
  envelope: {
    teaser: "Senga kichik bir xabarim bor...",
    openLabel: "Xatni ochish",
    letterHint: "Faqat sen uchun",
  },
  invitation: {
    // {name} is replaced with girlName (or the fallback below).
    greeting: "Salom, {name}! ❤️",
    greetingFallbackName: "go‘zal inson",
    question: "Men bilan uchrashuvga borasanmi?",
  },
  buttons: {
    yes: "Ha, albatta! ❤️",
    no: "Yo‘q 🙈",
    noTeasers: [
      "Ishonchingiz komilmi? 🥺",
      "Qochib ketdim! 😜",
      "Tutolmaysan! 🏃‍♂️",
      "Yana bir o‘ylab ko‘r 🤭",
      "Bu tugma ishlamaydi 😇",
      "“Ha” ni bos, iltimos 🌸",
    ],
  },
  planner: {
    title: "Qayerga va qachon boramiz? 🌷",
    subtitle: "Hammasini sen tanlaysan, men esa tayyorlab qo‘yaman.",
    locationLabel: "Joy",
    locations: [
      { id: "cafe", label: "Shinam kafe", emoji: "☕" },
      { id: "park", label: "Park bo‘ylab sayr", emoji: "🌳" },
      { id: "restaurant", label: "Kechki ovqat", emoji: "🍝" },
      { id: "cinema", label: "Kino", emoji: "🎬" },
      { id: "dessert", label: "Shirinliklar", emoji: "🍰" },
    ],
    allowCustomLocation: true,
    customLocationLabel: "O‘zim tanlayman",
    customLocationEmoji: "✍️",
    customLocationInputLabel: "Qayerga borishni xohlaysan?",
    customLocationPlaceholder: "Masalan: tog‘lar, ko‘l bo‘yi...",
    dateLabel: "Sana",
    defaultDate: "2026-02-14",
    timeLabel: "Soat",
    customTimeLabel: "Boshqa vaqt",
    defaultTime: "19:00",
    timeSlots: ["12:00", "15:00", "18:00", "19:00", "20:00"],
    noteLabel: "Izoh",
    notePlaceholder: "Istagingni yoz... (ixtiyoriy)",
    submitLabel: "Tasdiqlash 💌",
    sendingLabel: "Yuborilmoqda...",
    errors: {
      location: "Qayerga borishimizni tanla.",
      customLocation: "Joy nomini yoz.",
      date: "Sanani tanla.",
      datePast: "Bu kun o‘tib ketgan, boshqa kunni tanla.",
      time: "Vaqtni tanla.",
      timePast: "Bu vaqt bugun o‘tib ketgan, kechroq vaqtni tanla.",
    },
  },
  celebration: {
    title: "Yeeee! ❤️ Bilardim, rozi bo‘lasan!",
    subtitle: "Unda bizni chiroyli uchrashuv kutmoqda!",
    closing: "Bu kunni esda qolarli qilamiz! 🌷",
    planTitle: "Bizning uchrashuv",
    placeLabel: "Joy",
    dateLabel: "Sana",
    timeLabel: "Soat",
    noteLabel: "Izoh",
    replayLabel: "Yana bir bor ko‘rish",
  },
  report: {
    timezone: "Asia/Tashkent",
  },
  meta: {
    title: "Senga kichik xat 💌",
    description: "Faqat sen uchun yozilgan kichik taklifnoma.",
  },
};

export function getGreeting(
  config: InvitationConfig = invitationConfig,
): string {
  const name = config.girlName.trim() || config.invitation.greetingFallbackName;
  return config.invitation.greeting.replace("{name}", name);
}
