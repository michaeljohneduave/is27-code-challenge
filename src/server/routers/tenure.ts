import { z } from "zod";
import { procedure, router } from "../trpc";
import { pageObject } from "@/utils/trpc";
import { prisma } from "../prisma";

export const tenureRouter = router({
  list: procedure.input(z.object(pageObject)).query(async function ({ input }) {
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
