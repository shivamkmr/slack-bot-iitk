/**
* @module skills/Helpers/Status.js
*/

let fs = require("fs");
let path = require('path');
const sqlite3 = require('sqlite3').verbose();

const HELP_MESSAGE = "Hi I am Natasha. Thanks to Invictus, I am here to make your lives @Tower simpler by assisting you in your journey to becoming a Tower Table Tennis Champion \nUnlike the people @ tower, I need some rest so my consulting hours are 10 a.m. to 8 p.m.\nPS: You can call me Nat.\n\nHere is what all I can do for u\nstatus                    Current status of the TT Table\nschedule                next 2 hours TT table booking schedule\nschedule  1 pm  2:30pm    TT table booking schedule from 1 to 2;30 pm\nbook ___                Book table from this to this for us __\nmy_bookings            show my bookings for today\nunbook    _____            unbook booking starting at ___\ni am bored        snappy comebacks / memes\nhelp                     To get this menu back"

module.exports = async function(bot, message) {
    bot.reply(message, HELP_MESSAGE);
}
