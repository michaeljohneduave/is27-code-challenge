import { faker } from "@faker-js/faker";
import { Employee, Position, Prisma, PrismaClient } from "@prisma/client";
import https from "https";

const prisma = new PrismaClient();

const roles: string[] = [
  "Director",
  "Senior Manager",
  "Manager",
  "Senior Developer",
  "Junior Developer",
];

function get(url: string, callback: (arg0: any | null, arg1: string | null) => void) {
  https
    .get(url, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        get(res.headers.location, callback);
      } else {
        callback(null, url);
      }
    })
    .on("error", (error: any) => {
      callback(error, null);
    });
}

function getImage(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    get("https://xsgames.co/randomusers/avatar.php?g=pixel", (error, url) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    })
  });
}

async function createPositions(role: string, posCount: number): Promise<void> {
  const vacantCount = Math.floor(posCount * 0.2);
  let employees = 0;
  let positions = 0;
  // createMany isn't supported by SQLite
  for (let i = 0; i < posCount - vacantCount; i += 1) {
    const positionRec = await prisma.position.create({
      data: {
        title: role,
        Employee: {
          create: {
            name: faker.name.fullName({}),
            profileImage: await getImage(),
          },
        },
      },
      select: {
        Employee: true,
      },
    });

    await prisma.tenure.create({
      data: {
        employeeId: positionRec.Employee[0].id,
        startDate: new Date(),
        position: role,
      },
    });

    employees += 1;
  }

  for (let i = 0; i < vacantCount; i += 1) {
    const positionRec = await prisma.position.create({
      data: {
        title: role,
      },
    });

    positions += 1;
  }

  console.log(`Created ${employees} filled positions for ${role}`);
  console.log(`Created ${positions} vacant positions for ${role}`);
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
