const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();
const { faker } = require("@faker-js/faker")

async function main(){
    await prisma.product.deleteMany()
    
    const dataFaker = []
    
    const numberRandom = 10

    for (i = 0; i < numberRandom; i++){
        const data = {
            name: faker.food.meat(),
            price: +faker.commerce.price({min:5, max: 20, dec: 0})
        }
        dataFaker.push(data)
    }

    await prisma.product.createMany({
        data: dataFaker,
        skipDuplicates: true,
    })
    console.log(`Products creados correctamente`)
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });