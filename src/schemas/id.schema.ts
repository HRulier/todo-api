import z from "~/utils/zod/zod-extended";

const IdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
});

export default IdSchema;
