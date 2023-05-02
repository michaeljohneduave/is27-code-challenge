import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "../prisma";

export const tenureRouter = router({
  list: procedure.input(z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
  })).query(async function ({ input }) {
    const { limit, page } = input;

    const tenures = await prisma.tenure.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return tenures;
  }),
});
