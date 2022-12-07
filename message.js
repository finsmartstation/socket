const moment = require('moment');

function formatMessage(s_id, text) {
  return {
    "user_id":s_id,
    "message":text,
    "time": moment().format('h:mm a')
  };
}

module.exports = formatMessage;