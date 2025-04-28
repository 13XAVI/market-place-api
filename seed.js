const {PrismaClient} =  require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{name: "ADMIN"}, {name: "SHOPPER"}, {name: "SELLER"}],
    skipDuplicates: true,
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
