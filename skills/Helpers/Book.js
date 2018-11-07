/**
* @module skills/Helpers/Schedule.js
*/

let path = require('path');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(path.join(__dirname, '../../db/test.db'));

const SALUTATIONS = [`Hey! Great to see you here.`, `Ola! Welcome back!`];
const BOOKING_TIME = [`So, what time are we looking at?`];
const BOOKING_TIME_AGAIN = [`There seems to be a booking at the provided slot. Would you like to try for a different time?`];
const BOOKING_DURATION = [`Cool! And for how long should I book the room?`];
const DURATION_REMINDER = [`P.S.: Only 15 minutes or 30 minutes allowed! :wink:`]
const UNAVAILABLE = [`Oops! The given time doesn't seem to be available :confused:`]
const EXIT_MESSAGE = [`At any time, enter 'quit' to exit this conversation, yeah?`];
const WRONG_TIME = [`I'm sorry, I couldn't understand the provided time. Are you sure it was in 24 hour HH:MM format?`];
const WRONG_DURATION = [`The duration should either be 15 or 30 (minutes).`];
const ASK_JOINEES = [`We're all set! Should I notify people on your behalf? (Unless you plan to ask them personally :wink:)`];

let salutation = SALUTATIONS[Math.floor(Math.random()*SALUTATIONS.length)];
let exitMessage = EXIT_MESSAGE[Math.floor(Math.random()*EXIT_MESSAGE.length)];
let bookingTime = BOOKING_TIME[Math.floor(Math.random()*BOOKING_TIME.length)];
let bookingTimeAgain = BOOKING_TIME_AGAIN[Math.floor(Math.random()*BOOKING_TIME_AGAIN.length)];
let bookingDuration = BOOKING_DURATION[Math.floor(Math.random()*BOOKING_DURATION.length)];
let durationReminder = DURATION_REMINDER[Math.floor(Math.random()*DURATION_REMINDER.length)];
let unavailable = UNAVAILABLE[Math.floor(Math.random()*UNAVAILABLE.length)];
let wrongTime = WRONG_TIME[Math.floor(Math.random()*WRONG_TIME.length)];
let wrongDuration = WRONG_DURATION[Math.floor(Math.random()*WRONG_DURATION.length)];
let askJoinees = ASK_JOINEES[Math.floor(Math.random()*ASK_JOINEES.length)];

let time;
let botCopy;
let duration;
let callee;
let joinregexp = new RegExp('<@((?:[A-Z]|[0-9])*)>');
let joinees;

let timeCheck = new RegExp(`^(?:1[0-9]):[0-5][0-9]$`);
let durationCheck = new RegExp(`15|30`);

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

let checkAvail = function(db, sql) {
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

let workOnTime = function(response, convo) {
  time = response.text;
  if (timeCheck.test(time)) {
    convo.gotoThread('askDuration');
  } else {
    convo.gotoThread('invalidTime');
  }
};

let workOnDuration = async function(response, convo) {
  duration = response.text;
  if (durationCheck.test(duration)) {
    let startTime = parseTime(time, 0, 0);
    let endTime = parseTime(time, 0, duration);
    let sql = `SELECT * FROM bookings WHERE startTime BETWEEN ${startTime} and ${endTime}`;
    let available = await checkAvail(db, sql);

    if (available) {
      try {
        sql = `UPDATE bookings SET isBooked = ?, P1 = ?, bookedBy = ? WHERE startTime = ?`;
        let args = [1, callee, callee, startTime];
        await update(db, sql, args);
        if (duration === '30') {
          startTime = parseTime(time, 0, 15);
          args = [1, callee, callee, startTime];
          await update(db, sql, args);
        }
        convo.gotoThread('askJoinees');
      } catch (error) {
        convo.say(`I'm sorry, an unexpected error occurred.`);
        console.error(error);
        convo.next();
      }
    } else {
      convo.say(unavailable);
      convo.gotoThread(`askTime`);
    }
  } else {
    convo.gotoThread('invalidDuration');
  }
};

let workOnJoinees = function(response, convo) {
  let temp = joinregexp.exec(response.text);
  if (temp.length > 1) {
    joinees = temp.slice(1);
    joinees.forEach(function(joinee) {
      botCopy.api.conversations.open({users: joinee}, function(err, response) {
        botCopy.api.chat.postMessage({channel: response.channel.id, text: `You've been invited to play T.T at ${time}`});
      })
    });
    convo.say(`Invitations sent!`);
  } else {
    convo.say(`Uh-oh! I was expecting some direct mentions here :confused:\nIn any case, your booking's done!`);
  }
  db.close();
  convo.next()
}

module.exports = function(bot, message) {
  botCopy = bot;
  callee = message.user;
  let exitConvo = {
    pattern: 'quit',
    callback: function(response, convo) {
      convo.next();
      db.close();
    },
  };

  bot.createPrivateConversation(message, function(err, convo) {
    convo.addQuestion(`${salutation}\n${exitMessage}\n${bookingTime}`, [
      exitConvo,
      {
        default: true,
        callback: workOnTime,
      },
    ], {}, 'default');

    convo.addQuestion(wrongTime, [
      exitConvo,
      {
        default: true,
        callback: workOnTime,
      }
    ], {}, 'invalidTime');

    convo.addQuestion(bookingTimeAgain, [
      exitConvo,
      {
        default: true,
        callback: workOnTime,
      }
    ], {}, 'askTime');

    convo.addQuestion(`${bookingDuration}\n${durationReminder}`, [
      exitConvo,
      {
        default: true,
        callback: workOnDuration,
      },
    ], {}, 'askDuration');

    convo.addQuestion(wrongDuration, [
      exitConvo,
      {
        default: true,
        callback: workOnDuration,
      },
    ], {}, 'invalidDuration');

    convo.addQuestion(askJoinees, [
      exitConvo,
      {
        pattern: 'no',
        callback: function(response, convo) {
          convo.say('All right then. Enjoy the game!');
          db.close();
          convo.next();
        },
      },
      {
        default: true,
        callback: workOnJoinees,
      },
    ], {}, 'askJoinees');

    convo.activate();
  });
}
