import de from "../../messages/de.json";
import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import type { Locale } from "./config";

export type Messages = typeof de;

export const MESSAGES: Record<Locale, Messages> = { de, en, ru };
