import { Address, User, USER_ROLES } from "client/utils";
import faker from "faker";

const getData = () =>
  faker.datatype.array(faker.datatype.number({ min: 10, max: 100 })).flatMap<User>(() => {
    const totalBalance = faker.datatype.number({ min: 0, max: 10000000 });
    const investedBalance = faker.datatype.number({ min: 0, max: totalBalance });
    const registrationDate = faker.date.past();
    return {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      title: faker.name.prefix(),
      forenames: faker.name.firstName(),
      surname: faker.name.lastName(),
      password: faker.internet.password(),
      isConfirmed: faker.datatype.boolean(),
      registrationDate,
      registrationDateFormatted: registrationDate.toLocaleDateString(),
      role: faker.random.arrayElement(USER_ROLES),
      personalDetails: !faker.datatype.boolean()
        ? undefined
        : {
            dob: faker.date.past(),
            contactNumber: faker.phone.phoneNumber(),
            addressHistory: faker.datatype.array(faker.datatype.number({ min: 1, max: 3 })).map<Address>(() => ({
              addressLineOne: faker.address.streetAddress(),
              addressLineTwo: faker.address.secondaryAddress(),
              city: faker.address.city(),
              country: faker.address.country(),
              postcode: faker.address.zipCode(),
              lengthYears: faker.datatype.number({ min: 1, max: 10 }),
              lengthMonths: faker.datatype.number({ min: 1, max: 12 }),
            })),
          },
      balances: {
        total: totalBalance,
        invested: investedBalance,
        available: totalBalance - investedBalance,
      },
    };
  });

export default getData;
