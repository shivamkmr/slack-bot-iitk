/**
* @module skills/Helpers/MyBookings.js
*/

let path = require('path');
const sqlite3 = require('sqlite3').verbose();

let endTime = function(time) {
  let h = Math.floor(time)
  let m = Math.round((time-h)*100)
  m += 15;
  if (m >=60) {
    m -= 60;
    h++;
  }

  if (h >= 24) {
    return 23.59
  } else {
    return h+(m/100.0)
  }
}

let makeQuery = function(db, sql) {
  return new Promise((resolve, reject) => {
    let schedule = '';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(rows)
      schedule += "Start Time\tEnd Time\n"
      rows.forEach((row) => {
        schedule += "      "
        schedule += row.startTime.toFixed(2) 
        schedule += "\t\t" 
        schedule += endTime(row.startTime).toFixed(2)
        schedule += '\n';
      });
      resolve(schedule);
    });
  });
}

module.exports = async function(bot, message) {
  // open the database
  let db = new sqlite3.Database(path.join(__dirname, '../../db/test.db'));

  let sql = `SELECT * FROM bookings WHERE bookedBy = '${message.user}'`;

  try {
    let response = await makeQuery(db, sql);
    bot.reply(message, response);
  } catch (error) {
    console.error(error);
    bot.reply(message, `Sorry, couldn't find any bookings in your name!`);
  }

  // close the database connection
  db.close();
}
