const { duration } = require("moment");

const users = [];
// Join user to chat
function userJoin(id,s_id,room) {
  const user = { id,s_id,room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  
  return users.filter(user => user.room === room);
}

//  function getAudioDurationInSeconds(fileName){
//   // do your work to find the duration and return a promise. In case of error return Promise.reject();
//   return Promise.resolve(duration);
// }


module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
