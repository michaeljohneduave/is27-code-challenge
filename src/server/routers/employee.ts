import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { prisma } from "@/server/prisma";
import { pageObject } from "@/utils/trpc";

export const employeeRouter = router({
  list: procedure.input(z.object(pageObject)).query(async function ({ input }) {
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
