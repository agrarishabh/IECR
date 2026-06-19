import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';

const DEFAULT_BACKDROP = 'https://c4.wallpaperflare.com/wallpaper/382/816/853/joker-2019-movie-joker-joaquin-phoenix-super-villain-movie-characters-hd-wallpaper-preview.jpg';

const movies = [
  { _id: '1',  id: 1,  title: 'Pather Panchali',                        release_year: 1955, runtime: '2h 5m',  rating: '8.2', votes: '42K' },
  { _id: '2',  id: 2,  title: 'The World of Apu',                        release_year: 1959, runtime: '1h 45m', rating: '8.4', votes: '20K' },
  { _id: '3',  id: 3,  title: 'Anand',                                   release_year: 1971, runtime: '2h 2m',  rating: '8.1', votes: '38K' },
  { _id: '4',  id: 4,  title: 'Sholay',                                  release_year: 1975, runtime: '3h 24m', rating: '8.1', votes: '63K' },
  { _id: '5',  id: 5,  title: 'Gol Maal',                                release_year: 1979, runtime: '2h',     rating: '8.5', votes: '22K' },
  { _id: '6',  id: 6,  title: 'Mr. India',                               release_year: 1987, runtime: '2h 59m', rating: '7.7', votes: '20K' },
  { _id: '7',  id: 7,  title: 'Nayakan',                                 release_year: 1987, runtime: '2h 25m', rating: '8.6', votes: '28K' },
  { _id: '8',  id: 8,  title: 'Jo Jeeta Wohi Sikandar',                  release_year: 1992, runtime: '2h 54m', rating: '8.1', votes: '28K' },
  { _id: '9',  id: 9,  title: 'Baazigar',                                release_year: 1993, runtime: '2h 55m', rating: '7.6', votes: '32K' },
  { _id: '10', id: 10, title: 'Darr',                                    release_year: 1993, runtime: '2h 58m', rating: '7.6', votes: '27K' },
  { _id: '11', id: 11, title: 'Kabhi Haan Kabhi Naa',                    release_year: 1994, runtime: '2h 38m', rating: '7.6', votes: '20K' },
  { _id: '12', id: 12, title: 'Hum Aapke Hain Koun...!',                 release_year: 1994, runtime: '3h 26m', rating: '7.5', votes: '24K' },
  { _id: '13', id: 13, title: 'Andaz Apna Apna',                         release_year: 1994, runtime: '2h 40m', rating: '8.0', votes: '58K' },
  { _id: '14', id: 14, title: 'Dilwale Dulhania Le Jayenge',             release_year: 1995, runtime: '3h 9m',  rating: '8.0', votes: '86K' },
  { _id: '15', id: 15, title: 'Border',                                  release_year: 1997, runtime: '2h 44m', rating: '8.0', votes: '20K' },
  { _id: '16', id: 16, title: 'Dil to Pagal Hai',                        release_year: 1997, runtime: '2h 59m', rating: '7.0', votes: '27K' },
  { _id: '17', id: 17, title: 'Dil Se..',                                release_year: 1998, runtime: '2h 24m', rating: '7.5', votes: '34K' },
  { _id: '18', id: 18, title: 'Kuch Kuch Hota Hai',                      release_year: 1998, runtime: '3h 5m',  rating: '7.5', votes: '63K' },
  { _id: '19', id: 19, title: 'Sarfarosh',                               release_year: 1999, runtime: '2h 54m', rating: '8.1', votes: '29K' },
  { _id: '20', id: 20, title: 'Hum Dil De Chuke Sanam',                  release_year: 1999, runtime: '3h 8m',  rating: '7.4', votes: '21K' },
  { _id: '21', id: 21, title: 'Hera Pheri',                              release_year: 2000, runtime: '2h 36m', rating: '8.2', votes: '81K' },
  { _id: '22', id: 22, title: 'Mohabbatein',                             release_year: 2000, runtime: '3h 36m', rating: '7.1', votes: '37K' },
  { _id: '23', id: 23, title: 'Lagaan: Once Upon a Time in India',       release_year: 2001, runtime: '3h 44m', rating: '8.1', votes: '130K' },
  { _id: '24', id: 24, title: 'Dil Chahta Hai',                          release_year: 2001, runtime: '3h 3m',  rating: '8.0', votes: '80K' },
  { _id: '25', id: 25, title: 'Monsoon Wedding',                         release_year: 2001, runtime: '1h 54m', rating: '7.3', votes: '27K' },
  { _id: '26', id: 26, title: 'Kabhi Khushi Kabhie Gham...',             release_year: 2001, runtime: '3h 30m', rating: '7.5', votes: '63K' },
  { _id: '27', id: 27, title: 'Devdas',                                  release_year: 2002, runtime: '3h 2m',  rating: '7.6', votes: '52K' },
  { _id: '28', id: 28, title: 'Anbe Sivam',                              release_year: 2003, runtime: '2h 40m', rating: '8.6', votes: '28K' },
  { _id: '29', id: 29, title: 'Koi... Mil Gaya',                         release_year: 2003, runtime: '2h 51m', rating: '7.2', votes: '31K' },
  { _id: '30', id: 30, title: 'In Your Name',                            release_year: 2003, runtime: '2h 12m', rating: '7.2', votes: '23K' },
  { _id: '31', id: 31, title: 'Kal Ho Naa Ho',                           release_year: 2003, runtime: '3h 6m',  rating: '7.9', votes: '82K' },
  { _id: '32', id: 32, title: 'Munna Bhai M.B.B.S.',                     release_year: 2003, runtime: '2h 36m', rating: '8.2', votes: '98K' },
  { _id: '33', id: 33, title: 'Main Hoon Na',                            release_year: 2004, runtime: '3h 2m',  rating: '7.1', votes: '45K' },
  { _id: '34', id: 34, title: 'Lakshya',                                 release_year: 2004, runtime: '3h 6m',  rating: '7.8', votes: '28K' },
  { _id: '35', id: 35, title: 'Black Friday',                            release_year: 2004, runtime: '2h 23m', rating: '8.4', votes: '26K' },
  { _id: '36', id: 36, title: 'Veer Zaara',                              release_year: 2004, runtime: '3h 12m', rating: '7.8', votes: '67K' },
  { _id: '37', id: 37, title: 'Swades: We, the People',                  release_year: 2004, runtime: '3h 30m', rating: '8.2', votes: '106K' },
  { _id: '38', id: 38, title: 'Black',                                   release_year: 2005, runtime: '2h 2m',  rating: '8.1', votes: '38K' },
  { _id: '39', id: 39, title: 'Anniyan',                                 release_year: 2005, runtime: '3h 1m',  rating: '8.4', votes: '27K' },
  { _id: '40', id: 40, title: 'Rang De Basanti',                         release_year: 2006, runtime: '2h 47m', rating: '8.1', votes: '127K' },
  { _id: '41', id: 41, title: 'Fanaa',                                   release_year: 2006, runtime: '2h 48m', rating: '7.1', votes: '37K' },
  { _id: '42', id: 42, title: 'Phir Hera Pheri',                         release_year: 2006, runtime: '2h 33m', rating: '7.4', votes: '32K' },
  { _id: '43', id: 43, title: 'Omkara',                                  release_year: 2006, runtime: '2h 35m', rating: '8.0', votes: '24K' },
  { _id: '44', id: 44, title: 'Lage Raho Munna Bhai',                    release_year: 2006, runtime: '2h 24m', rating: '8.0', votes: '54K' },
  { _id: '45', id: 45, title: 'Khosla Ka Ghosla!',                       release_year: 2006, runtime: '2h 15m', rating: '8.2', votes: '27K' },
  { _id: '46', id: 46, title: 'Don',                                     release_year: 2006, runtime: '2h 58m', rating: '7.2', votes: '45K' },
  { _id: '47', id: 47, title: 'Guru',                                    release_year: 2007, runtime: '2h 42m', rating: '7.7', votes: '26K' },
  { _id: '48', id: 48, title: 'Namastey London',                         release_year: 2007, runtime: '2h 8m',  rating: '7.1', votes: '24K' },
  { _id: '49', id: 49, title: 'Sivaji',                                  release_year: 2007, runtime: '3h 8m',  rating: '7.6', votes: '24K' },
  { _id: '50', id: 50, title: 'Chak De! India',                          release_year: 2007, runtime: '2h 33m', rating: '8.1', votes: '92K' },
  { _id: '51', id: 51, title: 'Dhamaal',                                 release_year: 2007, runtime: '2h 16m', rating: '7.6', votes: '23K' },
  { _id: '52', id: 52, title: 'Bhool Bhulaiyaa',                         release_year: 2007, runtime: '2h 39m', rating: '7.5', votes: '39K' },
  { _id: '53', id: 53, title: 'Jab We Met',                              release_year: 2007, runtime: '2h 18m', rating: '7.9', votes: '66K' },
  { _id: '54', id: 54, title: 'Welcome',                                 release_year: 2007, runtime: '2h 30m', rating: '7.2', votes: '30K' },
  { _id: '55', id: 55, title: 'Like Stars on Earth',                     release_year: 2007, runtime: '2h 42m', rating: '8.3', votes: '233K' },
  { _id: '56', id: 56, title: 'Jodhaa Akbar',                            release_year: 2008, runtime: '3h 33m', rating: '7.5', votes: '37K' },
  { _id: '57', id: 57, title: 'Jaane Tu... Ya Jaane Na',                 release_year: 2008, runtime: '2h 35m', rating: '7.4', votes: '30K' },
  { _id: '58', id: 58, title: 'Rock On!!',                               release_year: 2008, runtime: '2h 25m', rating: '7.7', votes: '24K' },
  { _id: '59', id: 59, title: 'A Wednesday',                             release_year: 2008, runtime: '1h 44m', rating: '8.1', votes: '86K' },
  { _id: '60', id: 60, title: 'Rab Ne Bana Di Jodi',                     release_year: 2008, runtime: '2h 47m', rating: '7.2', votes: '60K' },
  { _id: '61', id: 61, title: 'Ghajini',                                 release_year: 2008, runtime: '3h 6m',  rating: '7.4', votes: '72K' },
  { _id: '62', id: 62, title: 'Dev.D',                                   release_year: 2009, runtime: '2h 24m', rating: '7.9', votes: '34K' },
  { _id: '63', id: 63, title: 'Magadheera',                              release_year: 2009, runtime: '2h 46m', rating: '7.7', votes: '28K' },
  { _id: '64', id: 64, title: 'Wake Up Sid',                             release_year: 2009, runtime: '2h 18m', rating: '7.6', votes: '37K' },
  { _id: '65', id: 65, title: '3 Idiots',                                release_year: 2009, runtime: '2h 50m', rating: '8.4', votes: '484K' },
  { _id: '66', id: 66, title: 'Rocket Singh: Salesman of the Year',      release_year: 2009, runtime: '2h 30m', rating: '7.5', votes: '25K' },
  { _id: '67', id: 67, title: 'My Name Is Khan',                         release_year: 2010, runtime: '2h 45m', rating: '7.9', votes: '123K' },
  { _id: '68', id: 68, title: 'Udaan',                                   release_year: 2010, runtime: '2h 14m', rating: '8.1', votes: '50K' },
  { _id: '69', id: 69, title: 'Raajneeti',                               release_year: 2010, runtime: '2h 43m', rating: '7.1', votes: '20K' },
  { _id: '70', id: 70, title: 'Once Upon a Time in Mumbaai',             release_year: 2010, runtime: '2h 14m', rating: '7.4', votes: '21K' },
  { _id: '71', id: 71, title: 'Enthiran',                                release_year: 2010, runtime: '2h 35m', rating: '7.2', votes: '34K' },
  { _id: '72', id: 72, title: 'Guzaarish',                               release_year: 2010, runtime: '2h 6m',  rating: '7.4', votes: '21K' },
  { _id: '73', id: 73, title: 'Golmaal Fun Unlimited',                   release_year: 2006, runtime: '2h 30m', rating: '7.5', votes: '22K' },
];

const run = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/IECR`);
    console.log('[SEED] Connected to MongoDB');

    // Only insert, never wipe — safe operation
    let inserted = 0;
    let skipped = 0;

    for (const movie of movies) {
      const exists = await Movie.findById(movie._id);
      if (exists) {
        skipped++;
        continue;
      }
      await Movie.create({ ...movie, backdrop_path: DEFAULT_BACKDROP });
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
