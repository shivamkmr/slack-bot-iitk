/**
* @module skills/Helpers/Schedule.js
*/

let path = require('path');
const sqlite3 = require('sqlite3').verbose();


const rep2 = "babe"
module.exports = async function(bot, message) {
    bot.reply(message, rep2);
}


let getTime = function(hours) {
   let date = new Date();
   hrs = date.getHours()+hours
   min = parseInt(date.getMinutes()/15)*15
   if (hrs >= 24){
     hrs = 23
     min = 59
   }
   return hrs.toString() + '.' + min.toString() ;
}

let parseTime = function(time, hours, min) {
  let tim = time.split(":");
  let h = parseInt(tim[0]);
  let m = parseInt(tim[1]);
  m = Math.ceil(m/15)*15;

  if (min) {
    m += min;
  }

  if (m >=60) {
    m -= 60;
    h++;
  }

  if (hours) {
    h += hours;
  }
  if (h >= 24) {
    return "23.59"
  } else {
    return h.toString()+ "." + m.toString()
  }
}


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
      schedule += "Start Time \t End Time \t Booked\n"
      rows.forEach((row) => {
        schedule += "      " 
        schedule += row.startTime.toFixed(2) 
        schedule += " \t\t   " 
        schedule += endTime(row.startTime).toFixed(2) 
        schedule += " \t\t   " 
        if(row.isBooked==1) {
          schedule += "Booked\n" 
        }
        else{
          schedule += "Free\n"  
        }
      });
      resolve(schedule);
    });
  });
}

module.exports = async function(bot, message) {
  let command = message.text.split(' ');
  console.log(command);
  let usageError = false;
  let schedule;

  // open the database
  let db = new sqlite3.Database(path.join(__dirname, '../../db/test.db'));
  let startTime;
  let endTime;

  // Three Cases: schedule | schedule from <> | schedule from <> to <>
  if (command.length === 1) {
    // Query Database for schedule of next 2 hours
    startTime = getTime(0);
    endTime = getTime(2);
  } else if (command.length === 3) {
    // Query Database for schedule of 2 hours from specified time
    startTime = parseTime(command[2]);
    endTime = parseTime(command[2], 2);
  } else {
    // Query Database for schedule from specified time to specified time
    startTime = parseTime(command[2]);
    endTime = parseTime(command[4]);
  }

  console.log(startTime, endTime);

  let sql = `SELECT * FROM bookings WHERE startTime BETWEEN ${startTime} and ${endTime}`;
  let response = await makeQuery(db, sql);
  
  bot.reply(message, response);

  // close the database connection
  db.close();
}
