import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { prisma } from "@/server/prisma";
import { faker } from "@faker-js/faker";
import { genConfig } from "react-nice-avatar";

export const employeeRouter = router({
  create: procedure
  .mutation(async function () {
    const positionRec = await prisma.position.create({
      data: {
        title: "No Role",
        level: 5,
        employee: {
          create: {
            name: faker.name.fullName({}),
            avatar: genConfig(),
          },
        },
      },
      select: {
        employee: true,
      },
    });
  }),

  list: procedure
    .input(
      z.object({
        page: z.number().min(1),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async function ({ input }) {
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

  update: procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    )
    .mutation(async function ({ input }) {
      const { name, id } = input;

      return prisma.employee.update({
        where: {
          id,
        },
        data: {
          name: name,
        },
      });
    }),

  promote: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async function ({ input }) {
      // @todos: implement promote
    }),

  demote: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async function ({ input }) {
      // @todos: implement demote
    }),
});
