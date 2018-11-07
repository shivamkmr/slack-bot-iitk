/**
* @module skills/Helpers/Status.js
*/

let fs = require("fs");
let path = require('path');
const sqlite3 = require('sqlite3').verbose();

const BUSY_NOW = `The table seems to be busy at the moment.`;
const PEOPLE_PRESENT = `The schedule seems clear, but there are people present at the table.`;
const TABLE_FREE = `The table seems to be free at the moment!`;
const TABLE_FUTURE_SUGGESTIONS = `The table seems to be free during the following slot(s).`;
const BUSY_FOR_LONG = `Unfortunately, the table doesn't seem to be free in the foreseeable future. :confused:`;

let getTime = function() {
   let date = new Date();
   return date.getHours().toString() + '.' + parseInt(date.getMinutes()/15)*15;
}

let makeQuery = function(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      rows.forEach((row) => {
        if (row.isBooked == 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      resolve(true);
    });
  })
}

module.exports = async function(bot, message) {
  let isFreeSrcDB = true;
  let isFreeSrcFeed = true;

  // Open the database.
  let db = new sqlite3.Database(path.join(__dirname, '../../db/test.db'));
  let currTime = getTime();
  let sql = `SELECT * FROM bookings WHERE startTime = ${currTime}`;

  isFreeSrcDB = await makeQuery(db, sql)

  // Close the database connection.
  db.close(); 

  if (isFreeSrcDB) {
    let status = fs.readFileSync(path.join(__dirname, `../../real-time-object-detection/status.txt`), 'utf8');
    if (status === '1') {
      isFreeSrcFeed = false;
    }
  }

  if (!isFreeSrcDB) {
    bot.reply(message, BUSY_NOW);
    // let suggestions = getSuggestions();

    if (!suggestions) {
      bot.reply(message, BUSY_FOR_LONG);
    } else {
      bot.reply(message, `${TABLE_FUTURE_SUGGESTIONS}\n${suggestions}`);
    }
  } else if (!isFreeSrcFeed) {
    bot.reply(message, PEOPLE_PRESENT);
  } else {
    bot.reply(message, `${TABLE_FREE}`);
  }
}
