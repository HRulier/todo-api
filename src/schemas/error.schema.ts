import z from "~/utils/zod/zod-extended";
import registry from "~/openapi/registry";

const ErrorSchema = z.object({
  status: z.string().openapi({ example: "error" }),
  message: z.string().openapi({ example: "An error occured" }),
  errors: z.array(
    z.object({
      path: z.string(),
      message: z.string(),
    })
  ),
});

// Enregistrer les schémas dans le registry
registry.register("Error", ErrorSchema);

export { ErrorSchema };
