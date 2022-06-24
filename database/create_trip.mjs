export default () => { };

export async function createTrip(db, {
  name,
  desc,
  imageUrl,
  price,
  start,
  end,
  seats,
}) {
  try {
    if (!db.trips) {
      throw new Error('no trips in db');
    }
    const newTrip = await db.trips.create({
      name,
      desc,
      short_desc: desc,
      img: imageUrl,
      price,
      start_date: start,
      end_date: end,
      free_seats: seats,
    });
    return newTrip;
  } catch (error) {
    console.error('Failed to add trip');
    throw error;
  }
}

export async function sampleTrip(db) {
  try {
    await db.sequelize.sync({ force: true });
    const wycieczka = await createTrip(db, {
      name: 'Wycieczka',
      desc: 'Tak',
      imageUrl: 'https://cdn.mos.cms.futurecdn.net/VWNYrSJUdBNoJbdK9WHgCA-970-80.jpg',
      price: 15,
      start: '2022-07-16',
      end: '2022-07-31',
      seats: 6,
    });
    await createTrip(db, {
      name: 'Nie wycieczka',
      desc: 'Nie',
      imageUrl: 'https://www.nintendo.pl/switch/assets/img/kirby-and-the-forgotten-land/kirby_cone.png',
      price: 8,
      start: '2022-04-16',
      end: '2022-05-30',
      seats: 5,
    });
    const drugaWycieczka = await createTrip(db, {
      name: 'Kolejna wycieczka',
      desc: 'Ta się odbędzie trochę później',
      imageUrl: 'https://image.ceneostatic.pl/data/article_picture/40/84/c815-7612-495d-9c80-d3133481dbfd_large.jpg',
      price: 13,
      start: '2022-08-01',
      end: '2022-08-14',
      seats: 10,
    });
    const signUp1 = await db.reservations.create({
      name: 'Andrzej',
      surname: 'Nowak',
      email: 'andrzej.nowak@wp.pl',
      seats: 3,
    });
    const signUp2 = await db.reservations.create({
      name: 'Alojzy',
      surname: 'Kowalski',
      email: 'alojzy.kowalski@gmail.com',
      seats: 4,
    });
    await wycieczka.addReservation(signUp1);
    await drugaWycieczka.addReservation(signUp2);
  } catch (error) {
    console.log('sampleTrip failed');
    console.error(error);
  }
}
