import { faker } from "@faker-js/faker";
import { Employee, Position, Prisma, PrismaClient } from "@prisma/client";
import https from "https";
import { genConfig } from "react-nice-avatar";

const prisma = new PrismaClient();

type Role = {
  role: string;
  level: number;
};

const roles: Role[] = [
  { role: "Director", level: 0 },
  { role: "Senior Manager", level: 1 },
  { role: "Manager", level: 2 },
  { role: "Senior Developer", level: 3 },
  { role: "Junior Developer", level: 4 },
];


async function createPositions(role: Role, posCount: number): Promise<void> {
  const vacantCount = Math.floor(posCount * 0.2);
  let employees = 0;
  let positions = 0;
  // createMany isn't supported by SQLite
  for (let i = 0; i < posCount - vacantCount; i += 1) {
    const positionRec = await prisma.position.create({
      data: {
        title: role.role,
        level: role.level,
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

    if (positionRec.employee?.id) {
      await prisma.tenure.create({
        data: {
          employeeId: positionRec.employee?.id,
          startDate: new Date(),
          position: role.role,
        },
      });
    }

    employees += 1;
  }

  for (let i = 0; i < vacantCount; i += 1) {
    const positionRec = await prisma.position.create({
      data: {
        title: role.role,
        level: role.level,
      },
    });

    positions += 1;
  }

  console.log(`Created ${employees} filled positions for ${role.role}`);
  console.log(`Created ${positions} vacant positions for ${role.role}`);
}

async function main() {
  let count = 2;

  await createPositions(roles[0], 1);

  for (let i = 1; i < roles.length; i += 1) {
    count = count * 1.618;
    await createPositions(roles[i], Math.ceil(count));
  }
}

main()
  .catch(function (e) {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
