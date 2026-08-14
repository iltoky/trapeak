import { z } from "zod";

export const deletionConfirmationSchema = z.literal(true).describe(
  "Must be true. Set this only after the user explicitly asks to permanently delete this specific record.",
);
