import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { prisma } from "@/server/prisma";

export const employeeRouter = router({
  list: procedure.input(z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
  })).query(async function ({ input }) {
    const { limit, page } = input;

    const employees = await prisma.employee.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return employees;
  }),
});
