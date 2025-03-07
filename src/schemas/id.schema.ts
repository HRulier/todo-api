import { z } from "zod";

const idSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
});

export default idSchema;
