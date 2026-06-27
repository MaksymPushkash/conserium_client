import type { components } from "@/lib/api/generated/v1";

export type ApiSchema<Name extends keyof components["schemas"]> = components["schemas"][Name];
