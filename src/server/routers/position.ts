import { z } from "zod";
import { procedure, router } from "../trpc";
import { prisma } from "@/server/prisma";
import { Prisma } from "@prisma/client";

export type Role = {
  role: string;
  level: number;
};

export const roles: Role[] = [
  { role: "Director", level: 0 },
  { role: "Senior Manager", level: 1 },
  { role: "Manager", level: 2 },
  { role: "Senior Developer", level: 3 },
  { role: "Junior Developer", level: 4 },
  { role: "No Role", level: 5 },
];

export const positionRouter = router({
  types: procedure
    .input(
      z.object({
        isNoRole: z.boolean(),
      })
    )
    .query(async function ({ input }) {
      const { isNoRole } = input;
      const where: Prisma.PositionWhereInput = {};

      if (isNoRole) {
        where.employee = {
          is: null,
        };
      }

      let types = await prisma.position.findMany({
        select: {
          title: true,
        },
        // where,
        distinct: ["title"],
      });

      if (isNoRole) {
        const director = await prisma.position.findFirst({
          where: {
            title: "Director",
            employeeId: {
              not: null,
            },
          },
        });
  
        if (director) {
          types = types.filter((t) => t.title !== director.title);
        }
      }

      return types;
    }),

  list: procedure
    .input(
      z.object({
        title: z.string(),
        page: z.number().min(1),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async function ({ input }) {
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
                },
              },
            },
          },
        },
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
                },
              },
            },
          },
        },
      });
    }),

  vacate: procedure
    .input(
      z.object({
        id: z.number(),
        employeeId: z.number(),
      })
    )
    .mutation(async function ({ input }) {
      const { id, employeeId } = input;

      let [prevRole, noRole] = await Promise.all([
        prisma.position.update({
          where: {
            id,
          },
          data: {
            employeeId: null,
          },
        }),
        prisma.position.findFirst({
          where: {
            title: "No Role",
            employeeId: null,
          },
        }),
      ]);

      if (!noRole) {
        noRole = await prisma.position.create({
          data: {
            title: "No Role",
            employeeId,
            level: 5,
          },
        });
      }

      const res = await prisma.position.update({
        where: {
          id: noRole?.id,
        },
        data: {
          employeeId,
        },
      });
      console.log(res, prevRole, noRole);
      //@todos: update tenure record of employee

      return res;
    }),

  fill: procedure
    .input(
      z.object({
        title: z.string(),
        employeeId: z.number(),
      })
    )
    .mutation(async function ({ input }) {
      const { title, employeeId } = input;

      let res;
      let position = await prisma.position.findFirst({
        where: {
          title: title,
          employeeId: {
            equals: null,
          },
        },
      });

      if (position) {
        // since position-employee relation is 1:N
        // we can't use the employee record to update its position in one go
        await prisma.position.delete({
          where: {
            employeeId: employeeId,
          },
        });
      } else if (title === "Director") {
        throw new Error("Only one director is allowed");
      } else {
        position = await prisma.position.create({
          data: {
            title,
            level: roles.filter((r) => r.role === title)[0].level,
          },
        });
      }
      // New title/role that is not No Role
      res = await prisma.position.update({
        where: {
          id: position.id,
        },
        data: {
          employeeId: employeeId,
        },
      });

      //@todos: add tenure record
      return res;
    }),
});
