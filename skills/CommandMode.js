/**
* @module skills/CommandMode.js
*/

let path = require('path');

let book = require(path.join(__dirname, 'Helpers/Book.js'));
let myBookings = require(path.join(__dirname, 'Helpers/MyBookings.js'));
let unbook = require(path.join(__dirname, 'Helpers/Unbook.js'));
let status = require(path.join(__dirname, 'Helpers/Status.js'));
let schedule = require(path.join(__dirname, 'Helpers/Schedule.js'));
let meme = require(path.join(__dirname, 'Helpers/Meme.js'));
let help = require(path.join(__dirname, 'Helpers/Help.js'));
let reset = require(path.join(__dirname, 'Helpers/ResetAll.js'));

const TIME = `(?:0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]`;
const SCHEDULE_COMMANDS = ['\\s*getSchedule\\s*$', `\\s*getSchedule from ${TIME}\\s*$`, `\\s*getSchedule from ${TIME} to ${TIME}\\s*$`]
const UNBOOK_COMMANDS = ['\\s*unbook all\\s*$', `\\s*unbook ${TIME}\\s*$`]

module.exports = function(controller) {
  controller.hears(['howdy'], 'direct_message', function(bot, message) {
      bot.reply(message, ':taco:');
  });

  controller.hears(['identify yourself'], 'direct_message', function(bot, message) {
      bot.reply(message, 'I am a robot, I cannot lie.');
  });

  controller.hears('\\s*status$', 'direct_message', function(bot, message) {
    status(bot, message);
  });

  controller.hears('\\s*i am bored$', 'direct_message', function(bot, message) {
    meme(bot, message);
  });

  controller.hears('\\s*help$', 'direct_message', function(bot, message) {
    help(bot, message);
  });

  controller.hears(SCHEDULE_COMMANDS, 'direct_message', function(bot, message) {
    schedule(bot, message);
  });

  controller.hears('my bookings', 'direct_message', function(bot, message) {
    myBookings(bot, message);
  });

  controller.hears('^book$', 'direct_message', function(bot, message) {
    book(bot, message);
  });

  controller.hears(UNBOOK_COMMANDS, 'direct_message', function(bot, message) {
    unbook(bot, message);
  });

  controller.hears('^reset_all$', 'direct_message', function(bot, message) {
    reset(bot, message);
  });
};
