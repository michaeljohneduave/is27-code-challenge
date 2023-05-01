import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@/server/prisma";
import { pageObject } from "@/utils/trpc";

export const positionRouter = router({
  list: procedure.input(z.object(pageObject)).query(async function ({ input }) {
    const { limit, page } = input;

    const positions = await prisma.position.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Employee: {
          include: {
            Tenure: {
              select: {
                startDate: true,
                endDate: true,
              }
            },
          }
        }
      }
    });

    return positions;
  }),

  byId: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async function ({ input }) {
      const { id } = input;

      return await prisma.position.findFirst({
        where: {
          id,
        },
      });
    }),
});
