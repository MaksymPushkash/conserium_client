import type { components } from "@/lib/api/generated/v1";

export type ApiSchema<Name extends keyof components["schemas"]> = components["schemas"][Name];

export type RequiredApiFields<T, Keys extends keyof T> = Omit<T, Keys> & {
  [Key in Keys]-?: Exclude<T[Key], undefined>;
};
