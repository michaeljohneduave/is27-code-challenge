import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@/server/prisma";
import { Prisma } from "@prisma/client";

export const positionRouter = router({
  types: procedure.query(async function () {
    const types = await prisma.position.findMany({
      select: {
        title: true,
      },
      distinct: ['title']
    })

    return types;
  }),

  list: procedure.input(z.object({
    title: z.string(),
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
  })).query(async function ({ input }) {
    const { limit, page, title } = input;
    const where: Prisma.PositionWhereInput = {};

    if (title) {
      where.title = title;
    }

    const positions = await prisma.position.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employee: {
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
        include: {
          employee: {
            include: {
              Tenure: {
                select: {
                  startDate: true,
                  endDate: true,
                }
              }
            }
          }
        }
      });
    }),
});
