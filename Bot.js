let Botkit = require('botkit');
let path = require("path");
let fs = require("fs");

let env = require('node-env-file');
env(path.join(__dirname, '/.env'));
let cron = require('node-cron');

const sqlite3 = require('sqlite3').verbose();

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

let update = function(db, sql, args) {
  return new Promise((resolve, reject) => {
    db.run(sql, args, function(err) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
    });
    resolve(true);
  });
}

cron.schedule('0 0 0 * * *', function() {
  // open the database
  let db = new sqlite3.Database(path.join(__dirname, '../../db/test.db'));
  let sql = `UPDATE bookings SET isBooked = ?, P1 = ?, P2 = ?, P3 = ?, P4 = ?, bookedBy = ?`;
  let args = [0, '', '', '', '', ''];

  try {
    update(db, sql, args);
    console.log('All bookings successfully removed.');
  } catch (error) {
    console.error(error);
  }

  // close the database connection
  db.close();
});

// Create the Botkit controller, which controls all instances of the bot.
let controller = Botkit.slackbot({
    // debug: true,
    retry: 10,
});

// Spawn a single instance of the bot to connect to your Slack team.
let bot = controller.spawn({
  token: process.env.bot_token,
}).startRTM();

let normalizedPath = path.join(__dirname, "skills");

fs.readdirSync(normalizedPath).forEach(function(file) {
  filepath = path.join(`${__dirname}/skills/`, file);
  if (fs.lstatSync(filepath).isFile()) {
    require(filepath)(controller);
  }
});
