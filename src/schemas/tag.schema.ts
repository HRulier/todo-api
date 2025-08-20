import registry from "~/openapi/registry";
import z from "~/utils/zod/zod-extended";

const TagSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  label: z.string().openapi({ example: "Lorem ipsum" }),
  color: z.string().openapi({ example: "#FFF000" }),
  user: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")
    .openapi({
      example: "67c5c2e9656ca8c7f95f7d52",
    }),
  createdAt: z.coerce.date().openapi({ example: "2025-07-18T14:55:37.403Z" }),
  updatedAt: z.coerce.date().openapi({ example: "2025-07-18T14:55:37.403Z" }),
});

const CreateTagSchema = TagSchema.pick({ label: true });
registry.register("Tag", TagSchema);

export { TagSchema, CreateTagSchema };
