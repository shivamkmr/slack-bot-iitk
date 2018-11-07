/**
* @module skills/Helpers/Status.js
*/

let path = require('path');
const sqlite3 = require('sqlite3').verbose();

const BUSY_NOW = `The table seems to be busy at the moment.`;
const PEOPLE_PRESENT = `The schedule seems clear, but there are people present at the table.`;
const TABLE_FREE = `The table seems to be free at the moment!`;
const TABLE_FUTURE_SUGGESTIONS = `The table seems to be free during the following slot(s).`;
const BUSY_FOR_LONG = `Unfortunately, the table doesn't seem to be free in the foreseeable future. :confused:`;

const urls = [
"https://i.imgur.com/6ovEqpJ.jpg",
"https://i.imgur.com/6ovEqpJ.jpg",
"https://i.imgur.com/6ovEqpJ.jpg",
"https://i.imgur.com/6ovEqpJ.jpg"
]
module.exports = async function(bot, message) {
  let isFreeSrcDB = true;
  let isFreeSrcFeed = true;
  var rn = require('random-number');
  var options = {
    min: 0,
    max: urls.length-1,
    integer: true
  }
  bot.reply(message, {
  "attachments": [
      {
          "fallback": "Error 404: Meme not found!! Try Kicking your PC",
          "image_url": urls[rn(options)]
      }
    ]
  } 
  );
    
}


