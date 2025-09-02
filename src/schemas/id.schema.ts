import z from "~/utils/zod/zod-extended";

const IdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID"),
});

export const SlackIdSchema = z.object({
  slackId: z.string().regex(/^[0-9a-zA-Z]{11}$/, "Invalid Slack ID"),
});

export default IdSchema;
