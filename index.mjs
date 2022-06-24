import app from './app.mjs';
import { sampleTrip } from './database/create_trip.mjs';
import { getDBPostgres, getDBLocal } from './database/db.mjs';

const db = await getDBPostgres();
// await sampleTrip(db);
app(db);
