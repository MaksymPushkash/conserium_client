import type { ApiSchema } from "./generated";

export type Note = ApiSchema<"NoteResponse">;
export type NoteVersion = ApiSchema<"NoteVersionResponse">;
export type NoteListItem = ApiSchema<"NoteListItemResponse">;
export type NoteListResponse = ApiSchema<"NoteListResponse">;
