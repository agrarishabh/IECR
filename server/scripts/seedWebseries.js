import 'dotenv/config';
import mongoose from 'mongoose';
import Webseries from '../models/Webseries.js';

const DEFAULT_BACKDROP = 'https://c4.wallpaperflare.com/wallpaper/382/816/853/joker-2019-movie-joker-joaquin-phoenix-super-villain-movie-characters-hd-wallpaper-preview.jpg';

const webseries = [
  { _id: '1',  id: 1,  title: 'Ramayan',                              release_year: 1987, seasons: 1, rating: '9.0', votes: '28K' },
  { _id: '2',  id: 2,  title: 'Mahabharat',                           release_year: 1988, seasons: 1, rating: '8.9', votes: '27K' },
  { _id: '3',  id: 3,  title: 'Permanent Roommates',                  release_year: 2014, seasons: 1, rating: '8.6', votes: '27K' },
  { _id: '4',  id: 4,  title: 'TVF Pitchers',                         release_year: 2015, seasons: 1, rating: '9.0', votes: '80K' },
  { _id: '5',  id: 5,  title: 'Tripling',                             release_year: 2016, seasons: 1, rating: '8.5', votes: '21K' },
  { _id: '6',  id: 6,  title: 'Flames',                               release_year: 2018, seasons: 1, rating: '8.8', votes: '34K' },
  { _id: '7',  id: 7,  title: 'Breathe',                              release_year: 2018, seasons: 1, rating: '8.2', votes: '23K' },
  { _id: '8',  id: 8,  title: 'Sacred Games',                         release_year: 2018, seasons: 1, rating: '8.5', votes: '98K' },
  { _id: '9',  id: 9,  title: 'Yeh Meri Family',                      release_year: 2018, seasons: 1, rating: '8.9', votes: '28K' },
  { _id: '10', id: 10, title: 'College Romance',                       release_year: 2018, seasons: 1, rating: '8.3', votes: '30K' },
  { _id: '11', id: 11, title: 'Mirzapur',                              release_year: 2018, seasons: 1, rating: '8.4', votes: '94K' },
  { _id: '12', id: 12, title: 'Apharan',                               release_year: 2018, seasons: 1, rating: '8.2', votes: '21K' },
  { _id: '13', id: 13, title: 'Criminal Justice',                      release_year: 2019, seasons: 1, rating: '8.1', votes: '23K' },
  { _id: '14', id: 14, title: 'Delhi Crime',                           release_year: 2019, seasons: 1, rating: '8.4', votes: '31K' },
  { _id: '15', id: 15, title: 'Kota Factory',                          release_year: 2019, seasons: 1, rating: '9.0', votes: '93K' },
  { _id: '16', id: 16, title: 'Gullak',                                release_year: 2019, seasons: 1, rating: '9.1', votes: '31K' },
  { _id: '17', id: 17, title: 'The Family Man',                        release_year: 2019, seasons: 1, rating: '8.7', votes: '113K' },
  { _id: '18', id: 18, title: 'Hostel Daze',                           release_year: 2019, seasons: 1, rating: '8.5', votes: '23K' },
  { _id: '19', id: 19, title: 'Asur: Welcome to Your Dark Side',       release_year: 2020, seasons: 1, rating: '8.5', votes: '71K' },
  { _id: '20', id: 20, title: 'Panchayat',                             release_year: 2020, seasons: 1, rating: '9.0', votes: '118K' },
  { _id: '21', id: 21, title: 'Special OPS',                           release_year: 2020, seasons: 1, rating: '8.5', votes: '44K' },
  { _id: '22', id: 22, title: 'Paatal Lok',                            release_year: 2020, seasons: 1, rating: '8.2', votes: '75K' },
  { _id: '23', id: 23, title: 'Bandish Bandits',                       release_year: 2020, seasons: 1, rating: '8.6', votes: '21K' },
  { _id: '24', id: 24, title: 'Crackdown',                             release_year: 2020, seasons: 1, rating: '7.3', votes: '21K' },
  { _id: '25', id: 25, title: 'Bicchoo Ka Khel',                       release_year: 2020, seasons: 1, rating: '7.0', votes: '20K' },
  { _id: '26', id: 26, title: 'Aspirants',                             release_year: 2021, seasons: 1, rating: '9.1', votes: '319K' },
  { _id: '27', id: 27, title: 'Sunflower',                             release_year: 2021, seasons: 1, rating: '7.4', votes: '25K' },
  { _id: '28', id: 28, title: 'Mumbai Diaries',                        release_year: 2021, seasons: 1, rating: '8.4', votes: '32K' },
  { _id: '29', id: 29, title: 'Rocket Boys',                           release_year: 2022, seasons: 1, rating: '8.8', votes: '20K' },
  { _id: '30', id: 30, title: 'NCR Days',                              release_year: 2022, seasons: 1, rating: '8.9', votes: '46K' },
  { _id: '31', id: 31, title: 'Farzi',                                 release_year: 2023, seasons: 1, rating: '8.3', votes: '56K' },
  { _id: '32', id: 32, title: 'Sandeep Bhaiya',                        release_year: 2023, seasons: 1, rating: '9.0', votes: '77K' },
  { _id: '33', id: 33, title: 'Lucky Guy',                             release_year: 2023, seasons: 1, rating: '8.5', votes: '23K' },
  { _id: '34', id: 34, title: 'Sapne Vs Everyone',                     release_year: 2023, seasons: 1, rating: '9.2', votes: '85K' },
  { _id: '35', id: 35, title: 'Murder in Mahim',                       release_year: 2024, seasons: 1, rating: '7.3', votes: '42K' },
  { _id: '36', id: 36, title: 'The Bastards of Bollywood',             release_year: 2025, seasons: 1, rating: '7.5', votes: '42K' },
  { _id: '37', id: 37, title: 'Ekaki',                                 release_year: 2025, seasons: 1, rating: '8.1', votes: '37K' },
  { _id: '38', id: 38, title: 'Dhindora',                              release_year: 2021, seasons: 1, rating: '8.8', votes: '127K' },
  { _id: '39', id: 39, title: 'Taaza Khabar',                          release_year: 2023, seasons: 1, rating: '8.0', votes: '58K' },
];

const run = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/IECR`);
    console.log('[SEED] Connected to MongoDB');

    let inserted = 0;
    let skipped = 0;

    for (const series of webseries) {
      const exists = await Webseries.findById(series._id);
      if (exists) { skipped++; continue; }
      await Webseries.create({ ...series, backdrop_path: DEFAULT_BACKDROP });
      inserted++;
    }

    console.log(`[SEED] ✅ Done! Inserted: ${inserted}, Skipped (already exist): ${skipped}`);
  } catch (err) {
    console.error('[SEED] ❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
