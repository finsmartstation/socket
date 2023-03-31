//const { Console, count } = require('console');
// const { getAudioDurationInSeconds } = require('get-audio-duration');
// const { getVideoDurationInSeconds } = require('get-video-duration')
//const { response } = require('express');
//const { dashLogger } = require("./logger");
require('dotenv').config();
const queries=require('./queries/queries');
const functions=require('./functions/function');
require('events').EventEmitter.defaultMaxListeners = Infinity;

const https = require('https');
const axios = require('axios');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["secretHeader"],
    credentials: true
  }
});

const BASE_URL=process.env.BASE_URL;
console.log('base ',BASE_URL)
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  //res.send('Welcome to Smart Station')
});

const con = require('./db_connection');

const db= require('./models/index')
const formatMessage = require('./message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./users');
const { url } = require('inspector');
const { exit } = require('process');
const { duration } = require('moment');
const { resolve } = require('path');
const e = require('express');
const { on } = require('events');
const { where } = require('sequelize');
const botName = 'Smart_Station_Bot';
const port = process.env.PORT || 3000;
db.sequelize.sync();

// Results will be an empty array and metadata will contain the number of affected rows.
// var s_id = '';
var r_id = '';
// var sid = '';
// var rid = '';
var room = '';
var newRoom = '';
// var user
// var date_status = 0;
var base_url = "http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/";
var soc = [];


var sockets=[];
var online_user_room_data=[];
  //samples to check data exist in associative array
  // var arr = [{ id: 1, username: 'fred' }, 
  // { id: 2, username: 'bill'}, 
  // { id: 3, username: 'ted' }];
  // function userExists(username,id) {
  //   return arr.some(function(el) {
  //     return el.username === username && el.id==id;
  //   }); 
  // }

  function check_online_user_room_data(sid,rid,room){
    //console.log('online ',online_user_room_data)
    return online_user_room_data.some(function (online_user_array){
      return online_user_array.sid == sid && online_user_array.rid == rid && online_user_array.room == room;
    });
  }

  //console.log(userExists('fred','1')); // true
  function  get_datetime() {
    var current_date = new Date();
    var date = current_date.toISOString().slice(0, 10);
    //console.log(date);
    var hours = current_date.getHours();
    var minute = current_date.getMinutes();
    var second = current_date.getSeconds();
    var hr_str = "" + hours;
    var min_str = "" + minute;
    var sec_str = "" + second;
    var pad = "00"
    var hr = pad.substring(0, pad.length - hr_str.length) + hr_str;
    var min = pad.substring(0, pad.length - min_str.length) + min_str;
    var sec = pad.substring(0, pad.length - sec_str.length) + sec_str;
    var time = hr + ":" + min + ":" + sec;
    var datetime = date + " " + time;
    return datetime;
}


// async function get_all_temporary_socket_data(){
//   let temporary_socket_data=await queries.get_temporary_socket_data();
//   console.log('temporary socket data',temporary_socket_data);
//   soc=temporary_socket_data[0].socket_users;
//   online_user_room_data=temporary_socket_data[0].online_user_room_data;
// }

// get_all_temporary_socket_data();
//console.log(soc,online_user_room_data)
io.sockets.on('connection',async function (socket) {
  try{
    console.log("socket::");
    // chat room
    // let temporary_socket_data=await queries.get_temporary_socket_data();
    // //console.log('temporary socket data',temporary_socket_data);
    // soc=temporary_socket_data[0].socket_users;
    // online_user_room_data=temporary_socket_data[0].online_user_room_data;
    // console.log('temporary',soc,online_user_room_data);
    socket.on('room', async function (room_data) {
      // console.log('test socket client',io.engine.clientsCount)
      // console.log('check room input data type ',typeof(room_data));
      try{
        if(typeof(room_data)=='object'){
          //console.log('yes type is object');
        
          s_id = room_data.sid;
          r_id = room_data.rid;
          var room = room_data.room;
          //checking condition for group chat
          if (room_data.room) {
            const user = userJoin(socket.id, room_data.sid, room);
            socket.join(user.room);
            //we need to emit different message to each user in the room
            socket.join(room_data.room+'_'+room_data.userid);
            console.log('new room ', room_data.room+'_'+room_data.userid)
            last_seen = get_datetime();
            const results = db.sequelize.query("UPDATE user SET online_status = '1', last_seen='" + last_seen + "' WHERE id = '" + room_data.userid + "'");
            // Welcome current user
            //io.emit('w_message', formatMessage(botName, 'Welcome to SmartStation Group Chat'));
            // Broadcast when a user connects
            // socket.broadcast
            //   .to(user.room)
            //   .emit(
            //     'broadcast_message',
            //     formatMessage(botName, `${user.s_id} has joined the chat`)
            //   );
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
            });
            

          } else {
            //individual chat room joining
            console.log('sender & receiver', typeof s_id, typeof r_id)
            // individual chat room creation
            if (Number(s_id) > Number(r_id)) {
              console.log('ssss')
              var temp = s_id;
              s_id = r_id;
              r_id = temp;
              room = '' + s_id + r_id;
              console.log('room id in if' + room);
            } else {
              room = '' + s_id + r_id;
              console.log('room id in else', room);
            }
            // socket joining to room
            console.log("room::", room)
            socket.join(room);
            //new method of joining socket user by their id
            socket.join(room+'_'+room_data.sid);
            //socket.join(room+'_'+room_data.rid);
            console.log('joined room', room);
            socket.room = room;
            console.log('socket room userid',room_data.sid,socket.id)
            newRoom = socket.room;
            sockets.push(socket.id)
            console.info(socket.id + ' joined room ', room, socket.room);
            io.sockets.in(socket.room).emit('room_notification', `'joined room-' ${room}`);
            var s_id = room_data.sid;
            soc[room_data.sid] = socket.id;
            //set online user's room
            let room_user_data={
              sid: room_data.sid,
              rid: room_data.rid,
              room: room
            }
            
            // if(online_user_room_data.includes(room_user_data)){
            //   console.log('yes')
            // }else{
            //   console.log('no')
            //   //online_user_room_data.push(room_user_data);
            // }

            if(online_user_room_data.length>0){
              //console.log('ssss')
              // console.log('online room user count ',online_user_room_data.length)
              // for(var i=0; i<online_user_room_data.length; i++){
              //   console.log(online_user_room_data[i].sid+'--'+room_data.sid,online_user_room_data[i].room+'--'+room)
              //   if(online_user_room_data[i].sid==room_data.sid && online_user_room_data[i].rid==room_data.rid){
              //     console.log('yes user already exist in the room');
              //   }else{
              //     console.log('user is not already exist in the room');
              //     online_user_room_data.push(room_user_data);
              //     break;
              //   }
              // }
              let check_user_room_data=check_online_user_room_data(room_data.sid,room_data.rid,room);
              console.log('check ',check_user_room_data);
              if(check_user_room_data==false){
                online_user_room_data.push(room_user_data);
              }
              console.log('available users',online_user_room_data)
            }else{
              console.log('count is zero')
              online_user_room_data.push(room_user_data);
            }
            //console.log('sockets', soc);
            //console.log('set online users ',online_user_room_data)
            var last_seen = get_datetime();
            //updating online status and lastseen
            const results =  db.sequelize.query("UPDATE user SET online_status = '1', last_seen='" + last_seen + "' WHERE id = '" + room_data.sid + "'");
            console.log(soc,room_data.rid)
            //check user privacy for show last seen and online
            let online_status_value='';
            let last_seen_value='';
            let same_as_last_seen='';
            let check_user_privacy_for_last_seen_and_online=await queries.check_user_privacy_for_last_seen_and_online(room_data.rid);
            console.log(`user id ${room_data.rid}'s privacy `,check_user_privacy_for_last_seen_and_online,check_user_privacy_for_last_seen_and_online.length)
            if (soc[room_data.rid] != undefined) {
              console.log('user is online')
              //const results = db.sequelize.query("UPDATE user SET online_status = '1', last_seen='" + last_seen + "' WHERE id = '" + room_data.sid + "'");
              // old query var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + room_data.sid + "'";
              //get online status to emit
              var online_s=await queries.select_online_status(room_data.rid);
              //console.log('140 in app.js',online_s)
            // try{
                console.log('online user', newRoom)
                let data_array=[{
                  online_status:1,
                  last_seen: online_s[0].last_seen
                }]
              //io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": online_s[0][0].online_status, "last_seen": online_s[0][0].last_seen });
              //io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": online_s });
              if(check_user_privacy_for_last_seen_and_online.length){
                if(check_user_privacy_for_last_seen_and_online.length==1){
                  console.log('count 1')
                  if(check_user_privacy_for_last_seen_and_online[0].type=='last_seen'){
                    console.log('last seen exist')
                    let options=check_user_privacy_for_last_seen_and_online[0].options;
                      if(options==0){
                        console.log('everyone')
                        last_seen_value=online_s[0].last_seen;
                        same_as_last_seen="1";
                      }else if(options==1){
                        console.log('my contact')
                        let get_user_chat_list_data=await queries.user_chat_list_details(room_data.rid);
                        console.log(get_user_chat_list_data)
                        let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(room_data.sid,get_user_chat_list_data);
                        console.log(check_user_exist_in_chat_list)
                        if(check_user_exist_in_chat_list){
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="1";
                        }else{
                          last_seen_value="";
                          same_as_last_seen="";
                        }
                      }else if(options==2){
                        console.log('my contact except')
                        let except_users=check_user_privacy_for_last_seen_and_online[0].except_users;
                        if(except_users!=''){
                          except_users=JSON.parse(check_user_privacy_for_last_seen_and_online[0].except_users);
                        }else{
                          except_users=[];
                        }
                        if(except_users.includes(room_data.sid)){
                          last_seen_value="";
                          same_as_last_seen="";
                        }else{
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="1";
                        }
                      }else if(options==3){
                        console.log('nobody')
                        last_seen_value="";
                        same_as_last_seen="";
                      }
                  }else{
                    console.log('last_seen else part')
                    last_seen_value=online_s[0].last_seen;
                  }
                  if(check_user_privacy_for_last_seen_and_online[0].type=='online'){
                    console.log('online exist')
                    let options=check_user_privacy_for_last_seen_and_online[0].options;
                      if(options==0){
                        online_status_value="1"
                      }else if(options==1){
                        //same as last seen 
                        online_status_value=same_as_last_seen;
                      }
                  }else{
                    console.log('online else part')
                    online_status_value="1";
                  }
                }else{
                  for(var i=0; i<check_user_privacy_for_last_seen_and_online.length; i++){
                    if(check_user_privacy_for_last_seen_and_online[i].type=='last_seen'){
                      console.log('last seen ')
                      let options=check_user_privacy_for_last_seen_and_online[i].options;
                      if(options==0){
                        console.log('everyone')
                        last_seen_value=online_s[0].last_seen;
                        same_as_last_seen="1";
                      }else if(options==1){
                        console.log('my contact')
                        let get_user_chat_list_data=await queries.user_chat_list_details(room_data.rid);
                        console.log(get_user_chat_list_data)
                        let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(room_data.sid,get_user_chat_list_data);
                        console.log(check_user_exist_in_chat_list)
                        if(check_user_exist_in_chat_list){
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="1";
                        }else{
                          last_seen_value="";
                          same_as_last_seen="";
                        }
                      }else if(options==2){
                        console.log('my contact except')
                        let except_users=check_user_privacy_for_last_seen_and_online[i].except_users;
                        if(except_users!=''){
                          except_users=JSON.parse(check_user_privacy_for_last_seen_and_online[i].except_users);
                        }else{
                          except_users=[];
                        }
                        if(except_users.includes(room_data.sid)){
                          last_seen_value="";
                          same_as_last_seen="";
                        }else{
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="1";
                        }
                      }else if(options==3){
                        console.log('nobody')
                        last_seen_value="";
                        same_as_last_seen="";
                      }
                    }else if(check_user_privacy_for_last_seen_and_online[i].type=='online'){
                      console.log('online')
                      let options=check_user_privacy_for_last_seen_and_online[i].options;
                      if(options==0){
                        online_status_value="1"
                      }else if(options==1){
                        //same as last seen 
                        online_status_value=same_as_last_seen;
                      }
                    }
                  }
                }
              }else{
                online_status_value="1";
                last_seen_value=online_s[0].last_seen;
              }
              io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": online_status_value, "last_seen": last_seen_value});
              //io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": "1", "last_seen": online_s[0].last_seen});
              // }catch(e){
              //   console.log('online_s ', e)
              // }
            } else {
              console.log('user is offline now');
              var online_s=await queries.select_online_status(room_data.rid);
              let data_array=[{
                online_status:0,
                last_seen: online_s[0].last_seen
              }]
              console.log(data_array)
              if(check_user_privacy_for_last_seen_and_online.length){
                if(check_user_privacy_for_last_seen_and_online.length==1){
                  console.log('count 1')
                  if(check_user_privacy_for_last_seen_and_online[0].type=='last_seen'){
                    console.log('last seen exist')
                    let options=check_user_privacy_for_last_seen_and_online[0].options;
                      if(options==0){
                        console.log('everyone')
                        last_seen_value=online_s[0].last_seen;
                        same_as_last_seen="0";
                      }else if(options==1){
                        console.log('my contact')
                        let get_user_chat_list_data=await queries.user_chat_list_details(room_data.rid);
                        console.log(get_user_chat_list_data)
                        let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(room_data.sid,get_user_chat_list_data);
                        console.log(check_user_exist_in_chat_list)
                        if(check_user_exist_in_chat_list){
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="0";
                        }else{
                          last_seen_value="";
                          same_as_last_seen="";
                        }
                      }else if(options==2){
                        console.log('my contact except')
                        let except_users=check_user_privacy_for_last_seen_and_online[0].except_users;
                        if(except_users!=''){
                          except_users=JSON.parse(check_user_privacy_for_last_seen_and_online[0].except_users);
                        }else{
                          except_users=[];
                        }
                        if(except_users.includes(room_data.sid)){
                          last_seen_value="";
                          same_as_last_seen="";
                        }else{
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="0";
                        }
                      }else if(options==3){
                        console.log('nobody')
                        last_seen_value="";
                        same_as_last_seen="";
                      }
                  }else{
                    console.log('last_seen else part')
                    last_seen_value=online_s[0].last_seen;
                  }
                  if(check_user_privacy_for_last_seen_and_online[0].type=='online'){
                    console.log('online exist')
                    let options=check_user_privacy_for_last_seen_and_online[0].options;
                      if(options==0){
                        online_status_value="0"
                      }else if(options==1){
                        //same as last seen 
                        online_status_value=same_as_last_seen;
                      }
                  }else{
                    console.log('online else part')
                    online_status_value="0";
                  }
                }else{
                  for(var i=0; i<check_user_privacy_for_last_seen_and_online.length; i++){
                    if(check_user_privacy_for_last_seen_and_online[i].type=='last_seen'){
                      console.log('last seen ')
                      let options=check_user_privacy_for_last_seen_and_online[i].options;
                      if(options==0){
                        console.log('everyone')
                        last_seen_value=online_s[0].last_seen;
                        same_as_last_seen="0";
                      }else if(options==1){
                        console.log('my contact')
                        let get_user_chat_list_data=await queries.user_chat_list_details(room_data.rid);
                        console.log(get_user_chat_list_data)
                        let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(room_data.sid,get_user_chat_list_data);
                        console.log(check_user_exist_in_chat_list)
                        if(check_user_exist_in_chat_list){
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="0";
                        }else{
                          last_seen_value="";
                          same_as_last_seen="";
                        }
                      }else if(options==2){
                        console.log('my contact except')
                        let except_users=check_user_privacy_for_last_seen_and_online[i].except_users;
                        if(except_users!=''){
                          except_users=JSON.parse(check_user_privacy_for_last_seen_and_online[i].except_users);
                        }else{
                          except_users=[];
                        }
                        if(except_users.includes(room_data.sid)){
                          last_seen_value="";
                          same_as_last_seen="";
                        }else{
                          last_seen_value=online_s[0].last_seen;
                          same_as_last_seen="0";
                        }
                      }else if(options==3){
                        console.log('nobody')
                        last_seen_value="";
                        same_as_last_seen="";
                      }
                    }else if(check_user_privacy_for_last_seen_and_online[i].type=='online'){
                      console.log('online')
                      let options=check_user_privacy_for_last_seen_and_online[i].options;
                      if(options==0){
                        online_status_value="0"
                      }else if(options==1){
                        //same as last seen 
                        online_status_value=same_as_last_seen;
                      }
                    }
                  }
                }
              }else{
                online_status_value="0";
                last_seen_value=online_s[0].last_seen;
              }
              io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": online_status_value, "last_seen": last_seen_value});
              //io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": "0", "last_seen": online_s[0].last_seen});
            }
          }
        }else{
          //console.log('type not an object');
          console.error('Input type is string');
        }
      }catch(e){
        //dashLogger.error(`Error : ${e}`);
        //console.log('error occurs', e)
        console.error('error occurs ', e);
      }
    });
    // socket.on('set_online_users', async function (data) {
    //   var s_id = data.sid;
    //   soc[s_id] = socket.id;
    //   var last_seen = get_datetime();
    //   console.log('get date time',last_seen);
    //   var update_query = await queries.update_online_status(last_seen,s_id);
    //   //console.log(update_query);
    // })
    //not converted
    // socket.on('check_online_users', function (data) {
    //   console.log('sockets',soc);
    //   if (soc[data.rid] != undefined) {
    //     //console.log('user is online')
    //     var last_seen = get_datetime();
    //     var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + data.sid + "'";
    //     //con.query(update_query, function (err, result) {
    //       var select = "select online_status,last_seen from user where id='" + data.sid + "'";
    //       //con.query(select, function (err, result) {
    //         io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
    //     //   })
    //     // })
    //   } else {
    //     // console.log('user is offline');
    //     var select = "select online_status,DATE_FORMAT(last_seen,'%Y-%m-%d %H:%i:%s') as last_seen from user where id='" + data.sid + "'";
    //     //con.query(select, function (err, result) {
    //       io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
    //     //})
    //   }
    // })
    socket.on('message', async function (data) {
      
      //console.log('message data')
      try{
        
      var s_id = data.sid;
      var r_id = data.rid;
      var message = data.message;
      var type = data.type;
      var duration=data.duration ? data.duration : '0';
      var optional_text=data.optional_text ? data.optional_text : '';
      var thumbnail=data.thumbnail ? data.thumbnail : '';
      // var room=data.room;
      //entering to group chat
       
      if (data.room) {
        //group chat
        
        var current_date = new Date();
        var date = current_date.toISOString().slice(0, 10);
        var datetime = get_datetime();

        //check message_id exist for replay_id
        let message_id=0;
        if(data.message_id){
          message_id=data.message_id;
        }

      //final var qur = db.sequelize.query("SELECT t1.created_datetime as created_date, t2.count FROM `group_list` t1 JOIN (select COUNT(*) as count from `chat_list` WHERE date(date)='" + date + "' and room='" + data.room + "') t2 where t1.group_id='" + data.room + "'")
      var x=await queries.get_current_date(date,data.room);
        //console.log('x is here',x[0][0]['created_date']); 
      var group_created_date_time = x[0][0]['created_date']; 
      var group_created_date = group_created_date_time.toISOString().slice(0,10);
      var today_message_count = x[0][0]['count'];
      var user_id_quotes='"'+data.sid+'"'
        //  const group_chat_response=await queries.sample(data.sid,user_id_quotes,data.room);
        //  console.log('group_chat_response',group_chat_response);
        if (date == group_created_date && today_message_count == 0) {
          console.log('testing succeded')
        } else {
          console.log('failed')
        }
        //set group_status data for messages
        var get_group_users = await queries.get_group_users(data.room);
        var group_status_array = [];
        var group_current_members;
        if(get_group_users.length>0){
          group_current_members=JSON.parse(get_group_users[0].current_members);
          //get all group users id
          get_group_users='';
          for(var group_users=0;group_users<group_current_members.length; group_users++){
            get_group_users=get_group_users+"'"+group_current_members[group_users].user_id+"',"
          }
          get_group_users=get_group_users.replace(/(^,)|(,$)/g, "")
          console.log(get_group_users)
          let set_query="SELECT * FROM `user_chat_privacy` where user_id in ("+get_group_users+") and type='read_receipts' and options='1'";
          //replace(/(^,)|(,$)/g, "")
          console.log(set_query)
          //exit ()
          let check_group_chat_read_receipts=await queries.check_group_chat_read_receipts(set_query);
          console.log(check_group_chat_read_receipts);
          
          for(var group_user=0; group_user<group_current_members.length; group_user++){
            //console.log('user id',group_current_members[group_user].user_id)
            let message_read_datetime='';
            let message_status=1;
            if(data.sid==group_current_members[group_user].user_id){
              message_read_datetime=datetime;
              message_status=0;
            }
            let read_receipt_status=0;
            //console.log('count ',check_group_chat_read_receipts.length)
            for(var read_receipt_i=0; read_receipt_i<check_group_chat_read_receipts.length; read_receipt_i++){
              if(group_current_members[group_user].user_id==check_group_chat_read_receipts[read_receipt_i].user_id){
                read_receipt_status=1;
                //console.log(read_receipt_status)
                break;
              }
            }
            //exit ()
            group_status_array.push({ user_id: group_current_members[group_user].user_id, username: group_current_members[group_user].username, datetime: datetime, message_status: message_status, message_read_datetime: message_read_datetime, read_receipt: read_receipt_status, status: 1 })
          }

          // console.log(group_status_array)
          // exit ()
          
        }
        var member_json_data = JSON.stringify(group_status_array);
        //checking  first message or not for the current date
        if ((date == group_created_date && today_message_count > 0) || (date != group_created_date && today_message_count > 0)) {
          // var get_group_users = await queries.get_group_users(data.room);
          // // console.log('get',get_group_users);
          // var group_status_array = [];
          // var grp_mmbr=await queries.get_group_users(data.room);
          //  console.log('group member',grp_mmbr);
          // grp_mmbr.forEach(element=>{
          //   // console.log('e ',element)
          //   //var group_members=JSON.parse(element[0].members);
          //   //changed this we need to keep current members only
          //   var group_members=JSON.parse(element[0].current_members) 
          //   // console.log('group member',JSON.parse(group_members))
          //   group_members.forEach(members=>{
          //     console.log('mem',members)
          //     group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })
          //   })
            
          // })
          // var member_json_data = JSON.stringify(group_status_array);
          
          if(type=='text'){
            await queries.post_text_message(datetime,s_id,message,data.room,member_json_data,message_id,optional_text)
          }else if(type=='image'){
            let split_path=message.split(',');
            //console.log(split_path)
            for(var i=0;i<split_path.length;i++){
              //console.log(split_path[i])
              if(i==0){
                await queries.post_image_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,optional_text)
              }else{
                await queries.post_image_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,'')
              }
            }
            //exit_s
          //await queries.post_image_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='voice'){
            let split_path=message.split(',');
            for(var i=0;i<split_path.length;i++){
              if(i==0){
                await queries.post_voice_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,optional_text) 
              }else{
                await queries.post_voice_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,'') 
              }
            }
            //await queries.post_voice_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
          }else if(type=='doc'){
            let split_path=message.split(',');
            for(var i=0;i<split_path.length;i++){
              if(i==0){
                await queries.post_doc_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,optional_text) 
              }else{
                await queries.post_doc_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,'') 
              }
              
            }
            //await queries.post_doc_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='video'){
            let split_path=message.split(',');
            let split_thumbnail=thumbnail.split(',');
            for(var i=0;i<split_path.length;i++){
              let thumbnail_path=split_thumbnail[i] ? split_thumbnail[i] : '';
              if(i==0){
                await queries.post_video_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,optional_text,thumbnail_path) 
              }else{
                await queries.post_video_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,'',thumbnail_path) 
              }
              
            }
            //await queries.post_video_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
          }else{
            type=''
          }
          // console.log('mmm',member_json_data)
        }else{
          // var get_group_users=await queries.get_group_u(data.room);
          // console.log('heee',get_group_users)
          // var flag = 0;
          // var group_status_array = []
          // get_group_users.forEach(elements=>{
          //   // console.log('members',element.members);
          // // var group_members = JSON.parse(elements[0].members);
          // var group_members = JSON.parse(elements[0].current_members);
          // console.log('members',group_members);
          // group_members.forEach(members=>{
          //   group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })
          // })
          // })
          // var member_json_data = JSON.stringify(group_status_array);
          var grp=queries.date_inserting(datetime,s_id,data.room,member_json_data)
          if(type=='text'){
            await queries.post_text_message(datetime,s_id,message,data.room,member_json_data,message_id,optional_text)
          }else if(type=='image'){
            let split_path=message.split(',');
            for(var i=0;i<split_path.length;i++){
              if(i==0){
                await queries.post_image_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,optional_text)
              }else{
                await queries.post_image_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,'')
              }
            }
            //await queries.post_image_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='voice'){
            let split_path=message.split(',');
            for(var i=0;i<split_path.length;i++){
              if(i==0){
                await queries.post_voice_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,optional_text)
              }else{
                await queries.post_voice_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,'')
              }
              
            }
            //await queries.post_voice_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
          }else if(type=='doc'){
            let split_path=message.split(',');
            for(var i=0;i<split_path.length;i++){
              if(i==0){
                await queries.post_doc_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,optional_text)
              }else{
                await queries.post_doc_message(datetime,s_id,split_path[i],data.room,member_json_data,message_id,'')
              }
              
            }
            //await queries.post_doc_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='video'){
            let split_path=message.split(',');
            let split_thumbnail=thumbnail.split(',');
            for(var i=0;i<split_path.length;i++){
              let thumbnail_path=split_thumbnail[i] ? split_thumbnail[i] : '';
              if(i==0){
                await queries.post_video_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,optional_text,thumbnail_path)
              }else{
                await queries.post_video_message(datetime,s_id,split_path[i],data.room,member_json_data,duration,message_id,'',thumbnail_path)
              }
              
            }
            //await queries.post_video_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
          }else{
            type=''
          }
        }
        
        //get group chat list response
        //let group_chat_response_data=await functions.get_group_chat_list_response(data.sid,data.room);
        //console.log('response data ',group_chat_response_data)
        //call firebase push notification
        //api call .....................................................................
        //get group chat details
        // var get_group=await queries.get_group_u(data.room);
        // var group_created_date=get_group[0][0].created_datetime;
        // var group_created_by=get_group[0][0].created_by;
        // console.log('group_created_by',group_created_by)
        // var group_name=get_group[0][0].group_name;
        // var check_user_exist_in_group=JSON.parse(get_group[0][0].current_members);
        // console.log('check_user_exist_in_group',check_user_exist_in_group);
        // var user_left_status=1;
        // if(check_user_exist_in_group != ''){
        //   check_user_exist_in_group.forEach((element,index, arr)=>{
        //     // console.log('userid',element.user_id)
        //     if(element.user_id==s_id){
        //       user_left_status=0;
        //       arr.length = index + 1;
        //     }
        //   })
        //   console.log('user_left_status',user_left_status)
        // }
        // var group_profile
        // if(get_group[0][0].profile_pic != ''){
        //   group_profile=base_url+get_group[0][0].profile_pic;
        // }else{
        //   group_profile=base_url+'uploads/default/group_profile.png';
        // }
        // get_group_message=[];
        // var set_group_started_date={"id":"","date":group_created_date,"senter_id":"","message":"","message_type":"",
        //                              "room":"","message_status":"","name":"","type":"date","status":""}
        // var group_created_msg; 
        // var add_msg=await queries.get_group_created_username(group_created_by)  
        // console.log('add_msg',add_msg)                        
        // if(group_created_by==s_id){
        //   group_created_msg=+"you created group".concat(group_name)
        // }else{
        //   group_created_msg=add_msg.concat(group_name)
        // }     
        // var set_group_created_message={"id":"","date":group_created_date,"senter_id":"","message":group_created_msg,"message_type":"notification","room":"","message_status":"","name":"","type":"notification","status":""}   
        // const group_chat_response=await queries.group_chat_response(data.sid,user_id_quotes,data.room);                     
        // var set_group_chat_response={"status":true,"statuscode":200,"message":"success",
        //                             "data":{"group_name":group_name,"id":data.room,"group_profile":group_profile,"created_datetime":group_created_date,
        //                             "user_left_status":user_left_status,
        //                              "list":group_chat_response}}
        //io.sockets.in(data.room).emit('message', set_group_chat_response); 
        let group_chat_response_data_for_sender=await functions.get_group_chat_list_response(data.sid,data.room);
        io.sockets.in(data.room+'_'+data.sid).emit('message', group_chat_response_data_for_sender);   
        //emit chat_list to the senter
        let get_recent_chat_response_senter=await functions.get_recent_chat_list_response(data.sid);
        io.sockets.in(data.sid).emit('chat_list',get_recent_chat_response_senter);
        //io.in(data.room+'_'+data.sid).emit('message', group_chat_response_data_for_sender);
        //we need to emit different message to each user in the room or group
        if(group_status_array.length>0){
          for(var emit_user=0; emit_user<group_status_array.length; emit_user++){
            //get group chat list response
            if(group_status_array[emit_user].user_id!=data.sid){
              let group_chat_response_data=await functions.get_group_chat_list_response(group_status_array[emit_user].user_id,data.room);
              io.sockets.in(data.room+'_'+group_status_array[emit_user].user_id).emit('message', group_chat_response_data);
              //io.in(data.room+'_'+group_status_array[emit_user].user_id).emit('message', group_chat_response_data);

              //emit chat_list to the receiver
              let get_recent_chat_response_for_receiver=await functions.get_recent_chat_list_response(group_status_array[emit_user].user_id);
              io.sockets.in(group_status_array[emit_user].user_id).emit('chat_list',get_recent_chat_response_for_receiver);
            }
            
          }
        }    
        
        // //emit chat_list to the senter
        // let get_recent_chat_response_senter=await functions.get_recent_chat_list_response(data.sid);
        // io.sockets.in(data.sid).emit('chat_list',get_recent_chat_response_senter);
        console.log(io.sockets.adapter.rooms)
        //send push notification
        //console.log('group_current_members', group_current_members)
        let group_chat_push_notification= await functions.group_chat_push_notification(data.sid,data.room,group_current_members,data.message,data.type);
      } else {
        
        //individual chat
        if (Number(s_id) > Number(r_id)) {
          //console.log('ssss')
          var temp = s_id;
          s_id = r_id;
          r_id = temp;
          room = '' + s_id + r_id;
          //console.log('room id in if' + room);
        } else {
          room = '' + s_id + r_id;
          //console.log('room id in else', room);
        }

       

        //check message_id exist for replay_id
        let message_id=0;
        if(data.message_id){
          message_id=data.message_id;
        }
        //console.log('sssss')
        
        //console.log('testing room line 327', room)
          //replay message
          // if(data.message_id){
          //   var group_status_data = [{
          //     "user_id": data.sid,
          //     "username": "",
          //     "datetime": datetime,
          //     "message_status": 0,
          //     "message_read_datetime": datetime,
          //     "status": 1
          //   }, {
          //     "user_id": data.rid,
          //     "username": "",
          //     "datetime": datetime,
          //     "message_status": 0,
          //     "message_read_datetime": "",
              
          //     "status": 1
          //   }]
          //   var group_status_json_data = JSON.stringify(group_status_data);
          //   var get_receiver_details=await queries.get_receiver_details(data.rid)
          //     console.log("get_receiver_details",get_receiver_details[0][0].name)
          //     var recever_name=get_receiver_details[0][0].name;
          //     var receiver_priofile=get_receiver_details[0][0].profile_pic;
          //     console.log(get_receiver_details[0][0].profile_pic,get_receiver_details[0][0].name)
          //     var get_messages=await queries.get_indv_messages(data.rid,room)
          //     console.log("get_messages",get_messages)
              
          //     if(get_messages!=''){
          //       var R_datetime=get_datetime()
          //       var update=await queries.reply_update(R_datetime,room,data.rid)
          //       console.log(update)
          //       get_messages.forEach(elements=>{
          //         //console.log("sid",elements[0].senter_id)
          //         var replay_id='0';
          //         var message='';          
          //         var message_type='';
          //         var forward_id='0';
          //         var forward_message_count='0';
          //         var forward_message_status="";
          //         var get_date=get_datetime();

          //       })
          //     }
              
          //     ///

          //   // var R_datetime=get_datetime()
          //   // var replay_qur="INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status,replay_id) VALUES ('" + R_datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','text','" + room + "','1','" + group_status_json_data + "','"+data.message_id+"')";
          //   // con.query(replay_qur,function(err,result){
          //   // })
          // }
          //replay message end
        var current_date = new Date();
        var date = current_date.toISOString().slice(0, 10);
        var hours = current_date.getHours();
        var minute = current_date.getMinutes();
        var second = current_date.getSeconds();
        var hr_str = "" + hours;
        var min_str = "" + minute;
        var sec_str = "" + second;
        var pad = "00"
        var hr = pad.substring(0, pad.length - hr_str.length) + hr_str;
        var min = pad.substring(0, pad.length - min_str.length) + min_str;
        var sec = pad.substring(0, pad.length - sec_str.length) + sec_str;
        var time = hr + ":" + min + ":" + sec;
        var datetime = date + " " + time;
        var individual_Date=await queries.individual_chat_date(date,room);
        //console.log('individual date length',individual_Date.length)
        //check user read receipt status
        let senter_read_receipt=0;
        let receiver_read_receipt=0;
        let check_private_chat_read_receipts=await queries.check_private_chat_read_receipts(data.sid,data.rid);
        if(check_private_chat_read_receipts.length>0){
          //console.log(check_private_chat_read_receipts)
          for(var i=0;i<check_private_chat_read_receipts.length;i++){
            console.log(check_private_chat_read_receipts[i],check_private_chat_read_receipts[i].user_id)
            //exit ()
            if(check_private_chat_read_receipts[i].user_id==data.sid){
              //console.log('senter id')
              senter_read_receipt=1;
            }else if(check_private_chat_read_receipts[i].user_id==data.rid){
              console.log('receiver id')
              receiver_read_receipt=1;
            }
          }
        }
        console.log(senter_read_receipt,receiver_read_receipt)  
        //exit ()    
          var group_status_data = [{
            "user_id": data.sid,
            "username": "",
            "datetime": datetime,
            "message_status": 0,
            "message_read_datetime": datetime,
            "read_receipt": senter_read_receipt,
            "status": 1
          }, {
            "user_id": data.rid,
            "username": "",
            "datetime": datetime,
            "message_status": 1,
            "message_read_datetime": "",
            "read_receipt": receiver_read_receipt,
            "status": 1
          }]
          console.log(group_status_data)
          //exit ()
          var group_status_json_data = JSON.stringify(group_status_data);
          if (individual_Date.length > 0) {
            if (type == 'text') {
              var result=await queries.individual_text_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,message_id,optional_text)
            }else if (type == 'image') {
              let split_path=message.split(',');
              for(var i=0;i<split_path.length;i++){
                if(i==0){
                  //insert optional text or caption only to the first entry data
                  var result=await queries.individual_image_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,message_id,optional_text) 
                }else{
                  var result=await queries.individual_image_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,message_id,'') 
                }
              }
              //var result=await queries.individual_image_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,message_id) 
            }else if (type == "voice") {
              let split_path=message.split(',');
              for(var i=0;i<split_path.length;i++){
                if(i==0){
                  var result=await queries.individual_voice_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,duration,message_id,optional_text)
                }else{
                  var result=await queries.individual_voice_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,duration,message_id,'')
                }
              }
              //var result=await queries.individual_voice_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,duration,message_id)
            }else if (type == "doc") {
              let split_path=message.split(',');
              for(var i=0;i<split_path.length;i++){
                if(i==0){
                  var result=await queries.individual_doc_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,duration,message_id,optional_text) 
                }else{
                  var result=await queries.individual_doc_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,duration,message_id,'')
                }
              }
              //var result=await queries.individual_doc_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,duration,message_id) 
            }else if (type == "video") {
              let split_path=message.split(',');
              let split_thumbnail=thumbnail.split(',');
              for(var i=0;i<split_path.length;i++){
                let thumbnail_path=split_thumbnail[i] ? split_thumbnail[i] : '';
                if(i==0){
                  var result=await queries.individual_video_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,duration,message_id,optional_text,thumbnail_path) 
                }else{
                  var result=await queries.individual_video_msg(datetime,data.sid,data.rid,split_path[i],room,group_status_json_data,duration,message_id,'',thumbnail_path) 
                }
              }
              //var result=await queries.individual_video_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,duration,message_id)
            } else {
              type = '';
            } 
              // //io.sockets.in(room).emit('message', setresponse);
              // let individual_chat_list_response=await functions.get_individual_chat_list_response(data.sid,data.rid,room);
              // //console.log(sockets,socket.id)
              //  //io.sockets.sockets[0].emit('message',sender_function_test_data)
              //  //socket.to(room).emit('message',sender_function_test_data);

              //  //io.sockets.in(room).emit('message',individual_chat_list_response);
              //  //io.sockets.connected[socketid]
              // //io.sockets.socket.id.emit('message','hello')
              // let receiver_function_test_data=await functions.get_individual_chat_list_response(data.rid,data.sid,room)
              
              // io.sockets.in(room+'_'+data.sid).emit('message',individual_chat_list_response);
              // io.sockets.in(room+'_'+data.rid).emit('message',receiver_function_test_data);
              //io.sockets.in(room.rid).emit('message', sender_function_test_data);
            // var results= await queries.get_recent_chat_accessToken(data.rid);
            // var accessToken=results[0][0].accessToken;
            // var get_user=await queries.get_user(data.rid,accessToken);
            // if(get_user !=''){
            //   var get_recent_chat=await queries.get_recent_chat(data.rid);
            //   io.sockets.in(data.rid).emit('chat_list', get_recent_chat)
            //   io.sockets.in(room).emit('chat_list', get_recent_chat);
            //   // if(deviceType=='android'){
            //   //   socket.to(room).emit('chat_list', get_recent_chat);
            //   // }else{
            //   //   io.sockets.in(data.rid).emit('chat_list', get_recent_chat);
            //   // } 
            // }

            //console.log('this loop',setresponse)
          } else {
            await queries.individual_date_insert(datetime,data.sid,data.rid,room,group_status_json_data,message_id);
            
            if (type == 'text') {
              await queries.individual_text_msg(datetime, datasid, datarid, message, room, group_status_json_data,message_id,optional_text)
            }
            else if (type == 'image') {
              let split_path=message.split(',');
              for(var i=0;i<split_path.length;i++){
                if(i==0){
                  await queries.individual_image_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data,message_id,optional_text)
                }else{
                  await queries.individual_image_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data,message_id,'')
                }
                
              }
              //await queries.individual_image_msg(datetime, data.sid, data.rid, message, room, group_status_json_data,message_id)
            }
            else if (type == "voice") {
              let split_path=message.split(',');
              for(var i=0;i<split_path.length;i++){
                if(i==0){
                  await queries.individual_voice_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data, duration,message_id,optional_text)
                }else{
                  await queries.individual_voice_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data, duration,message_id,'')
                }
                
              }
              //await queries.individual_voice_msg(datetime, data.sid, data.rid, message, room, group_status_json_data, duration,message_id)
            }
            else if (type == "doc") {
              let split_path=message.split(',');
              for(var i=0;i<split_path.length;i++){
                if(i==0){
                  await queries.individual_doc_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data,message_id,optional_text)
                }else{
                  await queries.individual_doc_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data,message_id,'')
                }
                
              }
              //await queries.individual_doc_msg(datetime, data.sid, data.rid, message, room, group_status_json_data,message_id)
            }
            else if (type == "video") {
              let split_path=message.split(',');
              let split_thumbnail=thumbnail.split(',');
              for(var i=0;i<split_path.length;i++){
                let thumbnail_path=split_thumbnail[i] ? split_thumbnail[i] : '';
                if(i==0){
                  await queries.individual_video_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data, duration,message_id,optional_text,thumbnail_path)
                }else{
                  await queries.individual_video_msg(datetime, data.sid, data.rid, split_path[i], room, group_status_json_data, duration,message_id,'',thumbnail_path)
                }
                
              }
              //await queries.individual_video_msg(datetime, data.sid, data.rid, message, room, group_status_json_data, duration,message_id)
            } else {
              type = '';
            }
            // var result=await queries.send_indv_message(data.rid, room)
            // console.log('result data list check it',result)
            //   for (var i = 0; i < result.length; i++) {
            //     if (result[i].message_type == 'date') {
            //       result[i].type = 'date';
            //     }
            //   }
              
            //   let setresponse = {
            //     "status": true, "statuscode": 200, "message": "success", "data": {
            //       "name": "",
            //       "profile": "",
            //       "id": data.rid,
            //       "list": result
            //     }
            //   }
            //   io.sockets.in(room).emit('message', setresponse);

            //   var results= await queries.get_recent_chat_accessToken(data.rid);
            // var accessToken=results[0][0].accessToken;
            // var get_user=await queries.get_user(data.rid,accessToken);
            // if(get_user !=''){
            //   var get_recent_chat=await queries.get_recent_chat(data.rid);
            //   io.sockets.in(data.rid).emit('chat_list', get_recent_chat)
            //   io.sockets.in(room).emit('chat_list', get_recent_chat);
            // }

            // })
            //   var get_messages="select t1.id ,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.message,t1.message_type,if(ISNULL(t6.unread_message),0,t6.unread_message) as unread_message,case t1.senter_id when '"+data.rid+"' then t4.id else t3.id end as userid,case t1.senter_id when '"+data.rid+"' then t4.name else t3.name end as name,case t1.senter_id when '"+data.rid+"' then t4.profile_pic else t3.profile_pic end as profile from chat_list t1 join (SELECT room, MAX(id) max_id FROM chat_list GROUP BY room)t2 on t1.id = t2.max_id and t1.room = t2.room join `user` t3 on t3.id=t1.senter_id join `user` t4 on t1.receiver_id=t4.id left join (select sum(t5.message_status) as unread_message, t5.room from `chat_list` t5 where t5.senter_id!='"+data.rid+"' GROUP BY t5.room )t6 on t6.room=t1.room where t1.senter_id='"+data.rid+"' or t1.receiver_id='"+data.rid+"' ORDER BY id DESC";
            //   con.query(get_messages,function(err,result){
            //   var array=[]; 
            //     for(var i=0;i<result.length;i++){
            //       if(result[i].message_type=='date'){
            //         result[i].type='date';
            //         console.log('first ', result[i].type)
            //       }
            //       var a={"id":result[i].id,"date":result[i].date,"message":result[i].message,"userid":result[i].userid,
            //       "name":result[i].name, "message_type":result[i].message_type,"profile":base_url+result[i].profile,"unread_message":JSON.stringify(result[i].unread_message),
            //       "type":result[i].type}
            //       array.push(a);
            //     }
            //     io.sockets.in(data.rid).emit('chat_list',{"status":"true","statuscode":"200","message":"success","data":array});
            // })

            //get chat list for opponent
          
          }

          //emit message
          //io.sockets.in(room).emit('message', setresponse);
          let individual_chat_list_response_sender=await functions.get_individual_chat_list_response(data.sid,data.rid,room);
          io.sockets.in(room+'_'+data.sid).emit('message',individual_chat_list_response_sender);
          let individual_chat_list_response_receiver=await functions.get_individual_chat_list_response(data.rid,data.sid,room);
          //console.log(sockets,socket.id)
          //io.sockets.sockets[0].emit('message',sender_function_test_data)
          //socket.to(room).emit('message',sender_function_test_data);

          //io.sockets.in(room).emit('message',individual_chat_list_response);
          //io.sockets.connected[socketid]
          //io.sockets.socket.id.emit('message','hello')
          //let receiver_function_test_data=await functions.get_individual_chat_list_response(data.rid,data.sid,room)
          //io.sockets.in(room).emit('message', individual_chat_list_response);
          
          io.sockets.in(room+'_'+data.rid).emit('message',individual_chat_list_response_receiver);
          //chat_list
          // var results= await queries.get_recent_chat_accessToken(data.rid);
          // var accessToken=results[0][0].accessToken;
          // console.log('access token ',accessToken)
          // var get_user=await queries.get_user(data.rid,accessToken);
          // console.log('receiver data', get_user);
          // if(get_user !=''){
          //   var get_recent_chat=await queries.get_recent_chat(data.rid);
          //   io.sockets.in(data.rid).emit('chat_list', get_recent_chat)
          //   io.sockets.in(room).emit('chat_list', get_recent_chat);
          // }
          let get_recent_chat_response_senter=await functions.get_recent_chat_list_response(data.sid);
          //io.sockets.in(room+'_'+data.sid).emit('chat_list', get_recent_chat_response_senter);
          io.sockets.in(data.sid).emit('chat_list', get_recent_chat_response_senter);
          //get recent chat response
          let get_recent_chat_response_receiver=await functions.get_recent_chat_list_response(data.rid);
          //io.sockets.in(room+'_'+data.rid).emit('chat_list', get_recent_chat_response_receiver)
          io.sockets.in(data.rid).emit('chat_list', get_recent_chat_response_receiver)
          
          //push notification
          //get receiver device token
          //let receiver_devicetoken=await queries.get_device_token(data.rid);
          let send_push_notification=await functions.individual_chat_push_notification(data.sid,data.rid,room,data.message,data.type);
        //let individual_push_notification_data = { user_id: data.sid, accessToken: data.accessToken, receiver_id: data.rid, message: message, message_type: data.type }
        // axios({
        //   method: 'post',

        //   url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/individual_chat_push_notification',

        //   data: individual_push_notification_data
        // }).then(res => {

        // }).catch(e => {
        //   console.log(e)
        // })
      }
      
    }catch(e){
      //dashLogger.error(`Error : ${e}`);
      //console.log('error occured',e)
      console.error('error occurs ', e);
    }
    });

    // socket.on('chat_list1', function (input) {
    //   user_id = input.user_id;
    //   var accessToken = input.accessToken;
    //   if (user_id != '' && accessToken != '') {
    //     soc[user_id] = socket.id;
    //     if (soc[user_id] != undefined) {
    //       var last_seen = get_datetime();
    //       var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + user_id + "'";
    //       con.query(update_query, function (err, result) {
    //         console.log(result)
    //       })
    //     }
    //     var check_user = "SELECT * FROM user WHERE id='" + user_id + "' AND accessToken='" + accessToken + "'";
    //     con.query(check_user, function (err, result) {
    //       //if user exist
    //       if (result != '') {
    //         //get messages
    //         var get_messages = "select t1.id ,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.message,t1.message_type,if(ISNULL(t6.unread_message),0,t6.unread_message) as unread_message,case t1.senter_id when '" + user_id + "' then t4.id else t3.id end as userid,case t1.senter_id when '" + user_id + "' then t4.name else t3.name end as name,case t1.senter_id when '" + user_id + "' then t4.profile_pic else t3.profile_pic end as profile from chat_list t1 join (SELECT room, MAX(id) max_id FROM chat_list GROUP BY room)t2 on t1.id = t2.max_id and t1.room = t2.room join `user` t3 on t3.id=t1.senter_id join `user` t4 on t1.receiver_id=t4.id left join (select sum(t5.message_status) as unread_message, t5.room from `chat_list` t5 where t5.senter_id!='" + user_id + "' GROUP BY t5.room )t6 on t6.room=t1.room where t1.senter_id='" + user_id + "' or t1.receiver_id='" + user_id + "' ORDER BY id DESC"
    //         console.log('get messages', get_messages)
    //         con.query(get_messages, function (err, result) {
    //           console.log(result)
    //           var array = [];
    //           console.log("getmessages ")
    //           for (var i = 0; i < result.length; i++) {
    //             if (result[i].message_type == 'date') {
    //               result[i].type = 'date';
    //               console.log('first ', result[i].type)
    //             }
    //             var a = {
    //               "id": result[i].id, "date": result[i].date, "message": result[i].message, "userid": result[i].userid,
    //               "name": result[i].name, "message_type": result[i].message_type, "profile": base_url + result[i].profile, "unread_message": result[i].unread_message.toString(),
    //               "type": result[i].type
    //             }
    //             array.push(a);
    //           }
    //           console.log(array);
    //           socket.join(user_id);
    //           //sending response to the user
    //           io.sockets.in(user_id).emit('chat_list1', { "status": "true", "statuscode": "200", "message": "success", "data": array });
    //         })
    //       }
    //     })
    //   }
    // })

    socket.on('typing_individual', function (data) {
      try{
        console.log(typeof(data))
        if(typeof(data)=='object'){
          var r_id = data.rid;
          var s_id = data.sid;
          var status = data.status;
          console.log('r_id', r_id);
          console.log('status', status);
          if (Number(s_id) > Number(r_id)) {
            console.log('ssss')
            var temp = s_id;
            s_id = r_id;
            r_id = temp;
            newRoom = '' + s_id + r_id;
            console.log('room id in if' + newRoom);
          } else {
            newRoom = '' + s_id + r_id;
            console.log('room id in else', newRoom);
          }

          if (status == 1) {
            io.sockets.in(newRoom).emit('typing_individual_room', { "status": "true", "statuscode": "200", "message": "success", "typing": "1", "user_id": data.sid });
            io.sockets.in(data.rid).emit('typing_individual_chatlist', { "status": "true", "statuscode": "200", "message": "success", "typing": "1", "user_id": data.sid });
          } else {
            io.sockets.in(newRoom).emit('typing_individual_room', { "status": "true", "statuscode": "200", "message": "success", "typing": "0", "user_id": data.sid });
            io.sockets.in(data.rid).emit('typing_individual_chatlist', { "status": "true", "statuscode": "200", "message": "success", "typing": "0", "user_id": data.sid });
          }
        }else{
          console.log('Input datatype is string')
        }
      }catch(e){
        //console.log(e)
        console.error('error occurs ', e);
      }
    })

    socket.on('dis', async function (input) {
      try{
        // console.log(online_user_room_data);
        // console.log('inside disconnect')
        var s_id = input.s_id;
        //console.log('[socket]', 'leave room :');
        var last_seen = get_datetime();
        //console.log(s_id)
        // var update_query = "update user set online_status='0',last_seen='" + last_seen + "' where id='" + s_id + "'";
        // con.query(update_query, function (err, result) {
        //   console.log(result);
        //   var select = "select online_status,last_seen from user where id='" + s_id + "'";
        //   con.query(select, function (err, result) {
        //     io.sockets.in(s_id).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
        //   })
        // })

        //update offline status to db 
        let update_offline_status=await queries.update_user_online_offline_status(input.s_id,last_seen,0)

        //get data based on user privacy -- last_seen and online
        let online_status_value='';
        let last_seen_value='';
        let same_as_last_seen='';
        let check_user_privacy_for_last_seen_and_online=await queries.check_user_privacy_for_last_seen_and_online(input.s_id);
        let get_user_chat_list_data=await queries.user_chat_list_details(input.s_id);
        console.log('check_user_privacy_for_last_seen_and_online ',check_user_privacy_for_last_seen_and_online);
        //emit to other user's in the room when he/she disconnect
        if(online_user_room_data.length>0){
          console.log('user in the room', online_user_room_data)
          for(var i=0; i<online_user_room_data.length; i++){
            //console.log('initial loop',i)
            let flag_status=false;
            console.log(online_user_room_data[i].sid+'--'+online_user_room_data[i].rid+'--'+online_user_room_data[i].room)
            if(input.s_id==online_user_room_data[i].rid || input.s_id==online_user_room_data[i].sid){
              flag_status=true;
              console.log('user is already in the list', i)
              //emit user has left or leave message to other room
              let data_array=[{
                online_status:0,
                last_seen: last_seen
              }]
              console.log(online_user_room_data[i].room+'_'+online_user_room_data[i].sid)
              if(input.s_id!=online_user_room_data[i].sid){
                if(check_user_privacy_for_last_seen_and_online.length>0){
                  if(check_user_privacy_for_last_seen_and_online.length==1){
                    console.log('1')
                    if(check_user_privacy_for_last_seen_and_online[0].type=='last_seen'){
                      console.log('last seen')
                      let options=check_user_privacy_for_last_seen_and_online[0].options;
                      console.log(options);
                      if(options==0){
                        same_as_last_seen="0";
                        last_seen_value=last_seen;
                      }else if (options==1){
                        //get user chat_list
                        console.log(get_user_chat_list_data)
                        let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(online_user_room_data[i].sid,get_user_chat_list_data);
                        console.log(check_user_exist_in_chat_list);
                        if(check_user_exist_in_chat_list){
                          same_as_last_seen="0";
                          last_seen_value=last_seen;
                        }else{
                          same_as_last_seen="";
                          last_seen_value="";
                        }
                      }else if(options==2){
                        let excepted_users=check_user_privacy_for_last_seen_and_online[0].except_users;
                        if(excepted_users!=''){
                          excepted_users=JSON.parse(check_user_privacy_for_last_seen_and_online[0].except_users);
                        }else{
                          excepted_users=[];
                        }
                        if(excepted_users.includes(online_user_room_data[i].sid)){
                          same_as_last_seen="";
                          last_seen_value="";
                        }else{
                          same_as_last_seen="0";
                          last_seen_value=last_seen;
                        }
                      }else if(options==3){
                        same_as_last_seen="";
                        last_seen_value="";
                      }
                    }else{
                      last_seen_value=last_seen;
                    }

                    if(check_user_privacy_for_last_seen_and_online[0].type=='online'){
                      console.log('online')
                      let options=check_user_privacy_for_last_seen_and_online[0].options;
                      if(options==0){
                        online_status_value="0";
                      }else if(options==1){
                        online_status_value=same_as_last_seen;
                      }
                    }else{
                      online_status_value="0";
                    }
                  }else{
                    console.log('greater than 1')
                    for(var j=0; j<check_user_privacy_for_last_seen_and_online.length; j++){
                      if(check_user_privacy_for_last_seen_and_online[j].type=='last_seen'){
                        let options=check_user_privacy_for_last_seen_and_online[j].options;
                        if(options==0){
                          last_seen_value=last_seen;
                          same_as_last_seen="0"
                        }else if(options==1){
                          let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(online_user_room_data[i].sid,get_user_chat_list_data);
                          //console.log(check_user_exist_in_chat_list);
                          if(check_user_exist_in_chat_list){
                            same_as_last_seen="0";
                            last_seen_value=last_seen;
                          }else{
                            same_as_last_seen="";
                            last_seen_value="";
                          }
                        }else if(options==2){
                          let excepted_users=check_user_privacy_for_last_seen_and_online[j].except_users;
                          if(excepted_users!=''){
                            excepted_users=JSON.parse(check_user_privacy_for_last_seen_and_online[j].except_users);
                          }else{
                            excepted_users=[];
                          }
                          if(excepted_users.includes(online_user_room_data[i].sid)){
                            same_as_last_seen="";
                            last_seen_value="";
                          }else{
                            same_as_last_seen="0";
                            last_seen_value=last_seen;
                          }
                        }else if(options==3){
                          same_as_last_seen="";
                          last_seen_value="";
                        }
                      }else if(check_user_privacy_for_last_seen_and_online[j].type=='online'){
                        let options=check_user_privacy_for_last_seen_and_online[j].options;
                        if(options==0){
                          online_status_value="0";
                        }else if(options==1){
                          online_status_value=same_as_last_seen;
                        }
                      }
                    }
                  }
                }else{
                  online_status_value="0";
                  last_seen_value=last_seen;
                }
                io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "online_status": online_status_value, "last_seen": last_seen_value});
                //io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "online_status": "0", "last_seen": last_seen})
              }
              //io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "data": data_array})
              // online_user_room_data.splice(i,1);
              if(input.s_id==online_user_room_data[i].sid){
                online_user_room_data.splice(i,1);
              }
            }else{
              console.log('user is not in the list')
            }
            // if(flag_status){
            //   online_user_room_data.splice(i,1);
            //   console.log('balance users',online_user_room_data)
            // }
          }
          console.log(online_user_room_data)
        }else{
          console.log('no user in the room')
        }
        
        soc.splice(input.s_id, 1);
        console.log('available user list ',soc)
      }catch(e){
        //console.log(e)
        console.error('error occurs ', e);
      }
    })
    //individual chat end
    //group chat/////////////////////////////////////////////////////////////////////////////////////////////
    socket.on('joinRoom', function (input) {
      // console.log("input",input);
      const user = userJoin(socket.id, input.userid, input.room);

      socket.join(user.room);
      last_seen = get_datetime();
      var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + input.userid + "'";
      //  console.log(update_query)
      con.query(update_query, function (err, result) {
        // console.log('update online status',result)
      })

      // Welcome current user
      io.emit('w_message', formatMessage(botName, 'Welcome to SmartStation Group Chat'));

      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'broadcast_message',
          formatMessage(botName, `${user.userid} has joined the chat`)
        );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    // sending api result of recent chat 

    socket.on('chat_list',async function (input) {
      try{
        //console.log(input)
        if(typeof(input)=='object'){
          // let user_data = {
          //   user_id: input.user_id,
          //   accessToken: input.accessToken
          // }
          // console.log(user_data)
          socket.join(input.user_id)
          //check user is valided or not
          let check_user_is_valid=await queries.check_user_valid(input.user_id,input.accessToken)
          if(check_user_is_valid.length>0){
            //update user online status
            let datetime=get_datetime();
            soc[input.user_id] = socket.id;
            
            let update_online_offline_status=await queries.update_user_online_offline_status(input.user_id,datetime,1)
            let get_recent_chat_response=await functions.get_recent_chat_list_response(input.user_id);
            //console.log('recent',get_recent_chat_response)
            
            io.sockets.in(input.user_id).emit('chat_list', get_recent_chat_response);
            console.log(soc)
            //get data based on user privacy -- last_seen and online
            let online_status_value='';
            let last_seen_value='';
            let same_as_last_seen='';
            let check_user_privacy_for_last_seen_and_online=await queries.check_user_privacy_for_last_seen_and_online(input.user_id);
            let get_user_chat_list_data=await queries.user_chat_list_details(input.user_id);
            //console.log('check_user_privacy_for_last_seen_and_online ',check_user_privacy_for_last_seen_and_online);
            
            //emit online_users -- to show user is online
            console.log(`online user's room `,online_user_room_data)
            if(online_user_room_data.length>0){
              //console.log('sssss')
              for(var i=0; i<online_user_room_data.length; i++){
                if(input.user_id==online_user_room_data[i].sid || input.user_id==online_user_room_data[i].rid){
                  //console.log('yes')
                  if(input.user_id!=online_user_room_data[i].sid){
                    //console.log('emit online user ',online_user_room_data[i].room+'_'+online_user_room_data[i].sid)
                    if(check_user_privacy_for_last_seen_and_online.length>0){
                      if(check_user_privacy_for_last_seen_and_online.length==1){
                        if(check_user_privacy_for_last_seen_and_online[0].type=='last_seen'){
                          console.log('last seen')
                          let options=check_user_privacy_for_last_seen_and_online[0].options;
                          console.log(options);
                          if(options==0){
                            same_as_last_seen="1";
                            last_seen_value=datetime;
                          }else if (options==1){
                            //get user chat_list
                            //console.log(get_user_chat_list_data)
                            let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(online_user_room_data[i].sid,get_user_chat_list_data);
                            //console.log(check_user_exist_in_chat_list);
                            if(check_user_exist_in_chat_list){
                              same_as_last_seen="1";
                              last_seen_value=datetime;
                            }else{
                              same_as_last_seen="";
                              last_seen_value="";
                            }
                          }else if(options==2){
                            let excepted_users=check_user_privacy_for_last_seen_and_online[0].except_users;
                            if(excepted_users!=''){
                              excepted_users=JSON.parse(check_user_privacy_for_last_seen_and_online[0].except_users);
                            }else{
                              excepted_users=[];
                            }
                            if(excepted_users.includes(online_user_room_data[i].sid)){
                              same_as_last_seen="";
                              last_seen_value="";
                            }else{
                              same_as_last_seen="1";
                              last_seen_value=datetime;
                            }
                          }else if(options==3){
                            same_as_last_seen="";
                            last_seen_value="";
                          }
                        }else{
                          last_seen_value=datetime;
                        }
    
                        if(check_user_privacy_for_last_seen_and_online[0].type=='online'){
                          console.log('online')
                          let options=check_user_privacy_for_last_seen_and_online[0].options;
                          if(options==0){
                            online_status_value="1";
                          }else if(options==1){
                            online_status_value=same_as_last_seen;
                          }
                        }else{
                          online_status_value="1"
                        }
                      }else{
                        //console.log('greater than 1')
                        for(var j=0; j<check_user_privacy_for_last_seen_and_online.length; j++){
                          if(check_user_privacy_for_last_seen_and_online[j].type=='last_seen'){
                            let options=check_user_privacy_for_last_seen_and_online[j].options;
                            if(options==0){
                              last_seen_value=datetime;
                              same_as_last_seen="1"
                            }else if(options==1){
                              let check_user_exist_in_chat_list=await functions.check_user_data_exist_in_array(online_user_room_data[i].sid,get_user_chat_list_data);
                              //console.log(check_user_exist_in_chat_list);
                              if(check_user_exist_in_chat_list){
                                same_as_last_seen="1";
                                last_seen_value=datetime;
                              }else{
                                same_as_last_seen="";
                                last_seen_value="";
                              }
                            }else if(options==2){
                              let excepted_users=check_user_privacy_for_last_seen_and_online[j].except_users;
                              if(excepted_users!=''){
                                excepted_users=JSON.parse(check_user_privacy_for_last_seen_and_online[j].except_users);
                              }else{
                                excepted_users=[];
                              }
                              if(excepted_users.includes(online_user_room_data[i].sid)){
                                same_as_last_seen="";
                                last_seen_value="";
                              }else{
                                same_as_last_seen="1";
                                last_seen_value=datetime;
                              }
                            }else if(options==3){
                              same_as_last_seen="";
                              last_seen_value="";
                            }
                          }else if(check_user_privacy_for_last_seen_and_online[j].type=='online'){
                            let options=check_user_privacy_for_last_seen_and_online[j].options;
                            if(options==0){
                              online_status_value="1";
                            }else if(options==1){
                              online_status_value=same_as_last_seen;
                            }
                          }
                        }
                      }
                    }else{
                      online_status_value="1";
                      last_seen_value=datetime;
                    }
                    io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "online_status": online_status_value, "last_seen": last_seen_value})
                    //io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "online_status": "1", "last_seen": datetime})
                  }
                }
              }
            }
          }else{
            console.log('no user found')
            let set_response={
              status: true,
              statuscode: 200,
              message: 'No user data found',
              data: []
            }
            io.sockets.in(input.user_id).emit('chat_list', set_response);
          }
        }else{
          console.log('Input datatype is string');
          // let set_response={
          //   status: true,
          //   statuscode: 400,
          //   message: 'Input datatype is text',
          //   data: []
          // }
          // io.sockets.in(input.user_id).emit('chat_list', set_response);
        }
        
      }catch(e){
        //dashLogger.error(`Error : ${e}`);
        //console.log(e)
        console.error('error occurs ', e);
        let set_response={
          status: true,
          statuscode: 200,
          message: 'Error found',
          data: []
        }
        io.sockets.in(input.user_id).emit('chat_list', set_response);
      }
      //console.log('process end')
    })

    //forward message
    socket.on('forward_message',async function (input){
      //{"sid": "5","accessToken":"5","to_users":"1:p,62:p,53:p,69:p,2:p,","message_ids":"2,4"}
      //console.log(input.sid)
      //to show forward_message response status to the user --- so I have created temporary room 
      socket.join(input.sid+'_forward_message');
      let emit_users=[];
      let datetime=get_datetime();
      let send_forward_message_status=false;
      try{
        console.log(typeof(input))
        if(typeof(input)=='object'){
          if(input.message_ids!=''){
            let message_ids=input.message_ids.split(',')
            if(message_ids.length>0){
              var set_emit_users=0;
              for(var i=0; i<message_ids.length; i++){
                let forword_message_id=message_ids[i];
                //get forward message data
                let get_forward_message_data=await queries.get_forward_message_data(message_ids[i]);
                console.log(get_forward_message_data)
                let forward_message=get_forward_message_data[0].message;
                let forward_message_type=get_forward_message_data[0].message_type;
                let forward_duration=get_forward_message_data[0].duration;
                //console.log('message id ',message_ids[i])
                let to_users=input.to_users.split(',');
                for(var j=0;j<to_users.length;j++){
                //to_users.forEach(async res=>{
                  //console.log(res)
                  //let id=res.split(':');
                  let id=to_users[j].split(':');
                  console.log(id,id[0],id[1]);
                  let receiver_id=id[0];
                  let type=id[1];
                  //type -- p = private, g = group
                  if(type=='p'){
                    //private
                    console.log('private')
                    let room;
                    console.log('users data ',input.sid,receiver_id)
                    if(Number(input.sid)<Number(receiver_id)){
                      console.log("sender id is less")
                      room=input.sid+receiver_id;
                    }else{
                      console.log("receiver id is less")
                      room=receiver_id+input.sid;
                    }
                    console.log(room)
                    let group_status_data = [{
                      "user_id": input.sid,
                      "username": "",
                      "datetime": datetime,
                      "message_status": 0,
                      "message_read_datetime": datetime,
                      "status": 1
                    }, {
                      "user_id": receiver_id,
                      "username": "",
                      "datetime": datetime,
                      "message_status": 0,
                      "message_read_datetime": "",
                      "status": 1
                    }]
                    var group_status_json_data = JSON.stringify(group_status_data);
                    //console.log(group_status_json_data);
                    //save forward message
                    
                    let save_individual_forward_message=await queries.save_individual_forward_message(message_ids[i],datetime,input.sid,receiver_id,forward_message,forward_message_type,room,forward_duration,group_status_json_data)
                    //console.log(save_individual_forward_message)
                    if(save_individual_forward_message.length>0){
                      send_forward_message_status=true;
                      console.log('data saved successfully', room)
                      //emit data to user
                      if(set_emit_users==0){
                        emit_users.push({
                          sid: input.sid,
                          rid: receiver_id,
                          room: room,
                          type: "private"
                        })
                      }
                      //  let individual_chat_list_response_sender=await functions.get_individual_chat_list_response(input.sid,receiver_id,room);
                      //  let individual_chat_list_response_receiver=await functions.get_individual_chat_list_response(receiver_id,input.sid,room);
      
                      // io.sockets.in(room+'_'+input.sid).emit('message',individual_chat_list_response_sender);
                      // io.sockets.in(room+'_'+receiver_id).emit('message',individual_chat_list_response_receiver);
                      //emit chat list
                    }
                  }else if(type=='g'){
                    //group
                    console.log('group forward msg ',message_ids[i])
                    
                    //get group current users
                    let room=receiver_id;
                    let get_group_current_users=await queries.get_group_current_users(room);
                    let group_current_users=JSON.parse(get_group_current_users[0].current_members);
                    console.log(group_current_users);
                    if(group_current_users.length>0){
                      let group_status_data = [];
                      for(var group_user=0; group_user<group_current_users.length; group_user++){
                        console.log('group user id ',group_current_users[group_user].user_id)
                        
                        if(group_current_users[group_user].user_id==input.sid){
                          group_status_data.push({
                            "user_id": group_current_users[group_user].user_id,
                            "username": "",
                            "datetime": datetime,
                            "message_status": 0,
                            "message_read_datetime": datetime,
                            "status": 1
                          })
                          //save forward message for group
                          //let save_group_forward_message=await queries.save_group_forward_message(message_ids[i],datetime,input.sid,0,forward_message,forward_message_type,room,forward_duration,group_status_json_data);
                        }else{
                          group_status_data.push({
                            "user_id": group_current_users[group_user].user_id,
                            "username": "",
                            "datetime": datetime,
                            "message_status": 0,
                            "message_read_datetime": "",
                            "status": 1
                          })
                        }
                        if(set_emit_users==0){
                          //emit data to user
                          emit_users.push({
                            sid: input.sid,
                            rid: group_current_users[group_user].user_id,
                            room: room,
                            type: "group"
                          })
                        }
                        
                      }
                      //console.log(group_status_data)
                      //save forward message for group
                      //console.log('group forward msg ',forword_message_id)
                      let save_group_forward_message=await queries.save_group_forward_message(forword_message_id,datetime,input.sid,0,forward_message,forward_message_type,room,forward_duration,JSON.stringify(group_status_data));
                      console.log('save_group_forward_message ',save_group_forward_message)
                      if(save_group_forward_message.length>0){
                        send_forward_message_status=true;
                        // let group_chat_response_data_for_sender=await functions.get_group_chat_list_response(input.sid,data.room);
                        // //io.sockets.in(data.room+'_'+data.sid).emit('message', group_chat_response_data_for_sender);   
                        // io.in(data.room+'_'+data.sid).emit('message', group_chat_response_data_for_sender);
                        console.log('success')
                        
                      console.log('after success ',emit_users)
                      }else{

                      }
                    }else{
                      console.log('no active members')
                    }
                  }
      
                //})
                }
                set_emit_users++;
              }
              console.log('emit users ',emit_users)
              //send message list
              if(emit_users.length>0){
                //success message for forward_message emit 
                if(send_forward_message_status){
                  let forward_response={
                    status: true,
                    statuscode: 200,
                    message: "success"
                  }
                  io.sockets.in(input.sid+'_forward_message').emit('forward_message',forward_response);
                
                
                let emit_sender_i=0;
                let sender_group_emitted_array=[];
                for(var k=0; k<emit_users.length; k++){
                  //console.log(emit_users[k].room,' - ',emit_users[k].rid,' - ', emit_users[k].type)
                  if(emit_users[k].type=='private'){
                    //console.log('private ',input.sid,emit_users[k].rid,emit_users[k].room)
                    //emit to senter 
                    let individual_chat_list_response_senter=await functions.get_individual_chat_list_response(input.sid,emit_users[k].rid,emit_users[k].room);
                    io.sockets.in(emit_users[k].room+'_'+input.sid).emit('message',individual_chat_list_response_senter);
                    //emit to receiver
                    let individual_chat_list_response_receiver=await functions.get_individual_chat_list_response(emit_users[k].rid,input.sid,emit_users[k].room);
                    io.sockets.in(emit_users[k].room+'_'+emit_users[k].rid).emit('message',individual_chat_list_response_receiver);
      
                    //emit chat list in future
                    let receiver_chatlist_response=await functions.get_recent_chat_list_response(emit_users[k].rid);
                    console.log('response data ', receiver_chatlist_response);
                    //emit to receiver
                    io.sockets.in(emit_users[k].rid).emit('chat_list',receiver_chatlist_response);
                    //emit to senter
                    let senter_chatlist_response=await functions.get_recent_chat_list_response(input.sid);
                    io.sockets.in(input.sid).emit('chat_list',senter_chatlist_response);
                  }else{
                    //emit to senter 
                    // if(!sender_group_emitted_array.includes(emit_users[k].room)){
                    //   //console.log('ssss ',emit_users[k].room, emit_users[k].room+'_'+input.sid)
                    //   let group_chat_list_response_senter=await functions.get_group_chat_list_response(input.sid,emit_users[k].room);
                    //   io.sockets.in(emit_users[k].room+'_'+input.sid).emit('message',group_chat_list_response_senter);
                    //   sender_group_emitted_array.push(emit_users[k].room);
                    // }
                    
                    //emit to receiver
                    console.log('group emit',emit_users[k].rid,emit_users[k].room)
                    let group_chat_list_response_receiver=await functions.get_group_chat_list_response(emit_users[k].rid,emit_users[k].room);
                    io.sockets.in(emit_users[k].room+'_'+emit_users[k].rid).emit('message',group_chat_list_response_receiver);
      
                    //emit chat list in future
                    let chatlist_response=await functions.get_recent_chat_list_response(emit_users[k].rid);
                    io.sockets.in(emit_users[k].rid).emit('chat_list',chatlist_response);
                  }
                }
              }else{
                let forward_response={
                  status: true,
                  statuscode: 200,
                  message: "Message not forwarded"
                }
                io.sockets.in(input.sid+'_forward_message').emit('forward_message',forward_response);
              }
              }else{
                let forward_response={
                  status: false,
                  statuscode: 400,
                  message: "Message not forwarded"
                }
                io.sockets.in(input.sid+'_forward_message').emit('forward_message',forward_response);
              }
              
            }else{
              console.log('no forward message id found')
              let forward_message_response={
                status: true,
                statuscode: 200,
                message: "No forward message id found"
              }
              io.sockets.in(input.sid+'_forward_message').emit('forward_message',forward_message_response);
            }
          }else{
            console.log('no forward message id found and empty data')
            let forward_message_response={
              status: true,
              statuscode: 200,
              message: "Forward message id is empty"
            }
            io.sockets.in(input.sid+'_forward_message').emit('forward_message',forward_message_response);
          }
        }else{
          console.log('Input data is string')
        }
      }catch(e){
        //console.log(e)
        console.error('error occurs ', e);
        //dashLogger.error(`Error : ${e}`);
        let forward_message_response={
          status: false,
          statuscode: 400,
          message: `Error : ${e}`
        }
        io.sockets.in(input.sid+'_forward_message').emit('forward_message', forward_message_response);
      }
      
      //remove temporary room
      socket.leave(input.sid+'_forward_message');
    })

    socket.on('delete_message',async function (data){
      //{"user_id":"5","accessToken":"e72469d31d74439f274635f587d27cfc","id":"1174","type":"for_one"}
      //console.log('delete message',data,data.user_id, data.accessToken);
      //to show delete_message response status to the user --- so I have created temporary room 
      socket.join(data.user_id+'_delete_message');
      let emit_user=[];
      let sender_room;
      let update_delete_message;
      let set_emit_users=0;
      let private_group;
      let first_receiver_id;
      try{
        if(typeof(data)=='object'){
        let check_user_valid=await queries.check_user_valid(data.user_id, data.accessToken);
        if(check_user_valid.length>0){
          //split message id's
          if(data.id!=''){
            let message_ids=data.id.split(',');
            console.log('message id'.message_ids)
            if(message_ids.length>0){
              for(var i=0; i<message_ids.length; i++){
                //console.log(message_ids[i])
                let message_id=message_ids[i];
                //check message id exist in chat_list
                let check_message_id=await queries.check_message_id(message_id);
                if(check_message_id.length>0){
                  //console.log('message data',check_message_id);
                  let group_status=JSON.parse(check_message_id[0].group_status);
                  let room=check_message_id[0].room;
                  private_group=check_message_id[0].private_group;
                  sender_room=room;
                  // for(var j=0; j<group_status.length; j++){
                  //   let emit_room_user=room+'_'+group_status[j].user_id;
                  //   if(!emit_user.includes(emit_room_user)){
                  //     emit_user.push(emit_room_user);
                  //   }
                  // }
                  if(data.type=="for_everyone"){
                    for(var k=0; k<group_status.length; k++){
                      let emit_room_user=room+'_'+group_status[k].user_id;
                      if(set_emit_users==0){
                        if(group_status[k].user_id!=data.user_id){
                          first_receiver_id=group_status[k].user_id;
                          emit_user.push({
                            sid:data.user_id,
                            rid:group_status[k].user_id,
                            room:emit_room_user,
                            type: private_group
                          });
                        }
                        
                      }
                      group_status[k].status=0;
                      group_status[k].deleted_by=data.user_id;
                    }
                  }else if(data.type="for_one"){
                    for(var l=0; l<group_status.length; l++){
                      let emit_room_user=room+'_'+group_status[l].user_id;
                      if(set_emit_users==0){
                        if(group_status[l].user_id!=data.user_id){
                          first_receiver_id=group_status[l].user_id;
                          emit_user.push({
                            sid:data.user_id,
                            rid:group_status[l].user_id,
                            room:emit_room_user,
                            type: private_group
                          });
                        }
                        
                      }
                      if(group_status[l].user_id==data.user_id){
                        group_status[l].status=2;
                        group_status[l].deleted_by=data.user_id;
                      }
                    }
                  }
                  if(data.type=="for_everyone"){
                    //console.log('for every one group deleted ',group_status)
                    //update to db
                    update_delete_message=await queries.update_delete_message_for_everyone(0,JSON.stringify(group_status),message_id);
                  }else if(data.type=="for_one"){
                    //console.log('for one group deleted ',group_status)
                    update_delete_message=await queries.update_delete_message_for_one(JSON.stringify(group_status),message_id);
                  }
                  set_emit_users++;
                }else{
                  //else no message exist
                  let delete_message_response={
                    status: false,
                    statuscode: 200,
                    message: "Message id not found"
                  }
                  
                  io.sockets.in(data.user_id+'_delete_message').emit('delete_message', delete_message_response); 
                  //console.log(emit_user)
                }
                
                //update to the db
              }
              //console.log('update response',update_delete_message, update_delete_message.affectedRows)
              if(update_delete_message.affectedRows>0){
                //emit success to to 
                let delete_message_response={
                  status: true,
                  statuscode: 200,
                  message: "success"
                }
                
                io.sockets.in(data.user_id+'_delete_message').emit('delete_message', delete_message_response); 
                console.log(emit_user)
                
                
                console.log('private_group',private_group)
                if(private_group==0){
                  //private message
                  //send emit message to sender -- who deleted the message
                  let message_response_for_sender=await functions.get_individual_chat_list_response(data.user_id,first_receiver_id,sender_room);
                  io.sockets.in(data.user_id+'_delete_message').emit('message', message_response_for_sender); 
                  //emit chat list
                  let sender_chat_list_response=await functions.get_recent_chat_list_response(data.user_id);
                  io.sockets.in(data.user_id).emit('chat_list', sender_chat_list_response);
                }else{
                  //group message
                  //send emit message to sender -- who deleted the message
                  let message_response_for_sender_group=await functions.get_group_chat_list_response(data.user_id,sender_room);
                  io.sockets.in(data.user_id+'_delete_message').emit('message', message_response_for_sender_group); 
                  //emit chat list
                  let sender_chat_list_response=await functions.get_recent_chat_list_response(data.user_id);
                  io.sockets.in(data.user_id).emit('chat_list', sender_chat_list_response);
                }
                //send emit message to receiver
                console.log('emit_user ',emit_user)
                for(var emit_user_i=0; emit_user_i<emit_user.length;emit_user_i++){
                  console.log(emit_user[emit_user_i])
                  if(emit_user[emit_user_i].type==0){
                    //private
                    let message_response_for_receiver=await functions.get_individual_chat_list_response(emit_user[emit_user_i].rid,data.user_id,sender_room);
                    //emit to normal room
                    console.log('delete emit test ',data.user_id,sender_room)
                    console.log('emit to receiver ', emit_user[emit_user_i].room+'_'+emit_user[emit_user_i].rid)
                    io.sockets.in(emit_user[emit_user_i].room).emit('message', message_response_for_receiver); 
                    //emit chat list
                    let receiver_chat_list_response=await functions.get_recent_chat_list_response(emit_user[emit_user_i].rid);
                    console.log('receiver chat list', receiver_chat_list_response);
                    io.sockets.in(emit_user[emit_user_i].rid).emit('chat_list',receiver_chat_list_response);
                  }else{
                    //group
                    let message_response_for_receiver=await functions.get_group_chat_list_response(emit_user[emit_user_i].rid,sender_room);
                    //emit to normal room
                    io.sockets.in(emit_user[emit_user_i].room).emit('message', message_response_for_receiver); 
                    //emit chat list
                    let receiver_chat_list_response=await functions.get_recent_chat_list_response(emit_user[emit_user_i].rid);
                    io.sockets.in(emit_user[emit_user_i].rid).emit('chat_list',receiver_chat_list_response);
                  }
                }
              }else{
                let delete_message_response={
                  status: false,
                  statuscode: 200,
                  message: "Not updated in db"
                }
                io.sockets.in(data.user_id+'_delete_message').emit('delete_message', delete_message_response); 
              }
            }else{
              //no message id found
              let delete_message_response={
                status: false,
                statuscode: 200,
                message: "No message id found"
              }
              io.sockets.in(data.user_id+'_delete_message').emit('delete_message', delete_message_response); 
            }
          }else{
            let delete_message_response={
              status: false,
              statuscode: 200,
              message: "Message id not found"
            }
            io.sockets.in(data.user_id+'_delete_message').emit('delete_message', delete_message_response); 
          }
        }else{
          //no user found
          //socket.join(data.user_id+'_delete_message');
          //console.log(io.sockets.adapter.rooms)
          //socket.leave(data.user_id+'_delete_message');
          //console.log(io.sockets.adapter.rooms)
          //console.log('no user data ',sender_room+'_'+data.user_id)
          let delete_message_response={
            status: false,
            statuscode: 200,
            message: "No user data found"
          }
          //io.sockets.in(sender_room+'_'+data.user_id).emit('delete_message',delete_message_response);
          io.sockets.in(data.user_id+'_delete_message').emit('delete_message',delete_message_response);
        }
      }else{
          console.log('Input datatype is string');
      }  
        
    }catch(e){
      //console.log(e)
      console.error('error occurs ', e);
      //dashLogger.error(`Error : ${e}`);
      let delete_message_response={
        status: false,
        statuscode: 400,
        message: `Error : ${e}`
      }
      io.sockets.in(data.user_id+'_delete_message').emit('delete_message', delete_message_response);
    }
    socket.leave(data.user_id+'_delete_message');
    //console.log(io.sockets.adapter.rooms)
    })


    //create new function for chat list
    // function get_chat_list_for_opponent(user_id, accessToken) {
    //   socket.on('chat_list', function (input) {
    //     console.log(input)
    //     let user_data = {
    //       user_id: user_id,
    //       accessToken: accessToken
    //     }
    //     console.log(user_data)
    //     axios({
    //       method: 'post',
    //       url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/getrecent_chat',
    //       data: user_data,
    //       headers: {
    //         'Content-Type': 'application/json',
    //       }
    //     }).then(res => {
    //       console.log(res)
    //       var out = res.data
    //       console.log('responsedata', out);
    //       socket.join(input.user_id)

    //       io.in(input.user_id).emit('chat_list', out);

    //     }).catch((err) => {
    //       console.log(err)
    //     })
    //   })
    // }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // socket.on('chatMessage', msg => {
    //   const user = getCurrentUser(socket.id);
    //   var sid = msg.sid;
    //   var room = msg.room;
    //   var type = msg.type;
    //   var message = msg.message;
    //   var current_date = new Date();
    //   var date = current_date.toISOString().slice(0, 10);
    //   var datetime = get_datetime();
    //   var qur = "SELECT * FROM `chat_list` t1 JOIN group_list t2 on date(t1.date)=date(t2.created_datetime) where t1.room='" + room + "' and t2.group_id='" + room + "' and date(t1.date)='" + date + "'";
    //   //var qur="SELECT * FROM `chat_list` t1 JOIN group_list t2 on date(t1.date)!=date(t2.created_datetime) where t1.room='"+room+"' and t2.group_id='"+room+"' and date(t1.date)='"+date+"'";
    //   console.log(qur);
    //   con.query(qur, function (err, result) {
    //     console.log('messages with length', result);
    //     if (result.length > 0) {
    //       var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + room + "'";
    //       con.query(get_group_users, function (err, result) {
    //         var group_status_array = []
    //         console.log('group users', result)
    //         result.forEach(element => {
    //           console.log('members', element.members)
    //           var group_members = JSON.parse(element.members);
    //           //group_status_array=group_members;
    //           group_members.forEach(members => {
    //             console.log('member name', members.username)
    //             group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })

    //           })
    //         });

    //         console.log('testing ', group_status_array)
    //         var member_json_data = JSON.stringify(group_status_array);
    //         if (type == 'text') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','text','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {
    //           })
    //         } else if (type == 'image') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','image','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {
    //           })
    //         } else if (type == 'voice') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','voice','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {

    //           })
    //         } else if (type == 'video') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','video','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {

    //           })
    //         } else {
    //           type = '';
    //         }
    //       })
    //     } else {
    //       var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + room + "'";
    //       con.query(get_group_users, function (err, result) {
    //         var group_status_array = []
    //         console.log('group users', result)
    //         result.forEach(element => {
    //           console.log('members', element.members)

    //           var group_members = JSON.parse(element.members);
    //           //group_status_array=group_members;
    //           group_members.forEach(members => {
    //             console.log('member name', members.username)
    //             group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })

    //           })
    //         });

    //         console.log('testing ', group_status_array)
    //         var member_json_data = JSON.stringify(group_status_array);
    //         var a = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','date','','" + room + "','0','1','" + member_json_data + "')"
    //         con.query(a, function (err, result) {

    //         });

    //         if (type == 'text') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','text','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {
  
    //           })
    //         } else if (type == 'image') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','image','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {

    //           })
    //         } else if (type == 'voice') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','voice','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {

    //           })

    //         } else if (type == 'video') {
    //           var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','video','" + room + "','1','1','" + member_json_data + "')"
    //           con.query(quer, function (err, result) {

    //           })

    //         } else {
    //           type = '';
    //         }
    //       })
    //     }
    //   })
    //   io.in(user.room).emit('chatMessage', formatMessage(user.sid, message));
    // });
  /////////////////////////////////////////////////////////////////////////////////////////////////
    // Runs when client disconnects
    // socket.on('disconnect_grp', () => {
    //   const user = userLeave(socket.id);
    //   if (user) {
    //     io.to(user.room).emit(
    //       'message',
    //       formatMessage(botName, `${user.userid} has left the chat`)
    //     );

    //     // Send users and room info
    //     io.to(user.room).emit('roomUsers', {
    //       room: user.room,
    //       users: getRoomUsers(user.room)
    //     });
    //   }
    // });
    socket.on('type_group', async function (data) {
      console.log('type_group')
      try{
        if(typeof(data)){
          console.log('type_group')
          var room = data.room;
          var status = data.status;
          var sid = data.sid;
          //get group current user
          let username=await queries.get_username(sid);
          let get_group_basic_details=await queries.get_group_basic_details(room);
          console.log(get_group_basic_details);
          if(get_group_basic_details.length>0){
            let current_group_members=JSON.parse(get_group_basic_details[0].current_members)
            //console.log(current_group_members)
            io.sockets.in(room).emit('type_group', { "status": "true", "statuscode": "200", "message": "success", "typing": status, "user_id": data.sid, "name": username});
            //typing_individual_chatlist
            //io.sockets.in(room).emit('typing_individual_chatlist', { "status": "true", "statuscode": "200", "message": "success", "typing": status, "user_id": data.sid, "name": username});
            // let active_rooms=io.sockets.adapter.rooms;
            // console.log(active_rooms.get('group_20221110045738'))
            console.log('sender user')
            for(var i=0; i<current_group_members.length; i++){
              if(sid!=current_group_members[i].user_id){
                console.log('sender user',current_group_members[i].user_id)
                //emit to the other user
                io.sockets.in(current_group_members[i].user_id).emit('typing_individual_chatlist', { "status": "true", "statuscode": "200", "message": "success", "typing": status, "user_id": data.sid, "name": username});
              }
            }
          }else{
            //no group data exist in db
            console.log('no group data exist in db')
          }
          
          // if (status == 1) {
          //   io.sockets.in(data.room).emit('type_group', { "status": "true", "statuscode": "200", "message": "success", "typing": "1", "user_id": data.sid, "name": result[0].name});
          // } else {
          //   io.sockets.in(data.room).emit('type_group', { "status": "true", "statuscode": "200", "message": "success", "typing": "0", "user_id": data.sid, "name": result[0].name});
          // } 
        }else{
          console.log('Input type is string')
        }
      }catch(e){
        //dashLogger.error(`Error : ${e}`);
        console.error('error occurs ', e);
      }
    })
    //group chat
    // socket.on('disconnect',function(data){
    //   console.log(data)
    //   //socket.broadcast.emit('disconnect',{status:true,statuscode:200,message:'socket is disconnected'});
     
    // })
    // socket.on('reconnect',function(data){
    //   console.log(data)
    // })

    socket.on('block',async function(data){
      //console.log('block',data)
      
      //input-- {"user_id":"","receiver_id":"","accessToken":""}
      try{
        if(typeof(data)=='object'){
          console.log('obj');
          if(data.user_id!='' && data.receiver_id!='' && data.accessToken!=''){
            socket.join(data.user_id+'_block');
            //check user_id and accessToken is valid
            let check_user_data=await queries.check_user_valid(data.user_id,data.accessToken);
            if(check_user_data.length>0){
              //check user already blocked or not
              let check_user_already_blocked=await queries.check_user_already_blocked(data.user_id,data.receiver_id);
              if(check_user_already_blocked.length>0){
                io.sockets.in(data.user_id+'_block').emit('block', { status: false, statuscode: 200, message: "User is blocked already"});
              }else{
                //block user 
                let datetime=get_datetime();
                let room;
                //set room
                if (Number(data.user_id) > Number(data.receiver_id)) {
                  room = '' + data.receiver_id + data.user_id;
                  console.log('user')
                } else {
                  room = '' + data.user_id + data.receiver_id;
                  console.log('receiver')
                }
                console.log(room)
                //save block data to the block_chat table
                let save_block_data=await queries.block_user_chat(data.user_id,data.receiver_id,room,datetime);
                console.log(save_block_data)
                if(save_block_data>0){
                  console.log('data saved to block table');
                  //also save the block message to chat_list table
                  let message='block';
                  let message_type='notification';
                  let message_status=0;
                  let status=1;
                  let online_status=0;
                  let private_group=0;
                  //set group status
                  let group_status=[];
                  group_status.push({
                    user_id: data.user_id,
                    username: await queries.get_username(data.user_id),
                    datetime: datetime,
                    message_status: 0,
                    message_read_status: datetime,
                    status: 1
                  })
                  group_status.push({
                    user_id: data.receiver_id,
                    username: await queries.get_username(data.receiver_id),
                    datetime: datetime,
                    message_status: 0,
                    message_read_status: datetime,
                    status: 1
                  })
                  //save block message in chat_list
                  let save_block_message=await queries.save_block_message(datetime,data.user_id,data.receiver_id,message,message_type,room,message_status,status,online_status,private_group,JSON.stringify(group_status));
                  console.log(save_block_message)
                  if(save_block_message>0){
                    console.log('Data saved to chat list')
                    io.sockets.in(data.user_id+'_block').emit('block', { status: true, statuscode: 200, message: "success"});
                    //emit to message
                    let sender_individual_chat_response=await functions.get_individual_chat_list_response(data.user_id,data.receiver_id,room);
                    io.sockets.in(room+'_'+data.user_id).emit('message',sender_individual_chat_response);
                    let receiver_individual_chat_response=await functions.get_individual_chat_list_response(data.receiver_id,data.user_id,room);
                    io.sockets.in(room+'_'+data.receiver_id).emit('message',receiver_individual_chat_response);
                    //emit to chat_list
                    let receiver_chat_list_response=await functions.get_recent_chat_list_response(data.receiver_id);
                    io.sockets.in(data.receiver_id).emit('chat_list',receiver_chat_list_response);
                    let senter_chat_list_response=await functions.get_recent_chat_list_response(data.user_id);
                    io.sockets.in(data.user_id).emit('chat_list',senter_chat_list_response);
                  }else{
                    console.error('Data not saved to chat list')
                    io.sockets.in(data.user_id+'_block').emit('block', { status: false, statuscode: 400, message: "Data not saved to chat list"});
                  }
                }else{
                  console.log('data not saved to block table');
                  io.sockets.in(data.user_id+'_block').emit('block', { status: false, statuscode: 400, message: "Data not saved to block table"});
                }
              }
            }else{
              io.sockets.in(data.user_id+'_block').emit('block', { status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(data.user_id+'_block');
            console.log(check_user_data);
          }else{
            socket.join(data.user_id+'_block');
            io.sockets.in(data.user_id+'_block').emit('block', { status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_block');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error('error occurs ', e);
      }
    })
    socket.on('unblock',async function(data){
      //input -- {"user_id":"50","accessToken":"7520ff1679b65593200acf473d159e5f","receiver_id":"53"}
      try{
        if(typeof(data)){
          if(data.user_id!='' && data.accessToken!='' && data.receiver_id!=''){
            socket.join(data.user_id+'_unblock');
            //check if user exist or not
            let check_user_data=await queries.check_user_valid(data.user_id,data.accessToken);
            if(check_user_data.length>0){
              console.log('user data is valid');
              //check block_chat table - already user and receiver is blocked
              let check_user_block=await queries.check_user_already_blocked(data.user_id,data.receiver_id);
              if(check_user_block.length>0){
                //unblock the user
                console.log('user blocked', check_user_block);
                console.log('block entry id ', check_user_block[0].id);
                //delete the block entry from block_chat table
                let delete_block_entry=await queries.delete_block_entry(check_user_block[0].id);
                console.log(delete_block_entry.affectedRows)
                if(delete_block_entry.affectedRows>0){
                  //set unblock message
                  let date_time=get_datetime();
                  let room;
                  //set room
                  if (Number(data.user_id) > Number(data.receiver_id)) {
                    room = '' + data.receiver_id + data.user_id;
                    console.log('user')
                  } else {
                    room = '' + data.user_id + data.receiver_id;
                    console.log('receiver')
                  }
                  let message='unblock';
                  let message_type='notification';
                  let message_status=0;
                  let status=1;
                  let online_status=0;
                  let private_group=0;
                  //set group status
                  let group_status=[];
                  group_status.push({
                    user_id: data.user_id,
                    username: await queries.get_username(data.user_id),
                    datetime: date_time,
                    message_status: 0,
                    message_read_status: date_time,
                    status: 1
                  })
                  group_status.push({
                    user_id: data.receiver_id,
                    username: await queries.get_username(data.receiver_id),
                    datetime: date_time,
                    message_status: 0,
                    message_read_status: date_time,
                    status: 1
                  })
                  //save unblock message in chat_list
                  let save_unblock_message=await queries.save_block_message(date_time,data.user_id,data.receiver_id,message,message_type,room,message_status,status,online_status,private_group,JSON.stringify(group_status));
                  console.log(save_unblock_message);
                  if(save_unblock_message>0){
                    console.log('Data saved to chat list')
                    io.sockets.in(data.user_id+'_unblock').emit('unblock', { status: true, statuscode: 200, message: "success"});
                    //emit to message
                    let sender_individual_chat_response=await functions.get_individual_chat_list_response(data.user_id,data.receiver_id,room);
                    io.sockets.in(room+'_'+data.user_id).emit('message',sender_individual_chat_response);
                    let receiver_individual_chat_response=await functions.get_individual_chat_list_response(data.receiver_id,data.user_id,room);
                    io.sockets.in(room+'_'+data.receiver_id).emit('message',receiver_individual_chat_response);
                    //emit to chat_list
                    let receiver_chat_list_response=await functions.get_recent_chat_list_response(data.receiver_id);
                    io.sockets.in(data.receiver_id).emit('chat_list',receiver_chat_list_response);
                    let senter_chat_list_response=await functions.get_recent_chat_list_response(data.user_id);
                    io.sockets.in(data.user_id).emit('chat_list',senter_chat_list_response);
                  }else{
                    console.error('Data not saved to chat list')
                    io.sockets.in(data.user_id+'_unblock').emit('unblock', { status: false, statuscode: 400, message: "Data not saved to chat list"});
                  }
                }else{
                  io.sockets.in(data.user_id+'_unblock').emit('unblock', { status: false, statuscode: 400, message: "Not deleted from table"});
                }
              }else{
                io.sockets.in(data.user_id+'_unblock').emit('unblock', { status: false, statuscode: 200, message: "User is not blocked"});
              }
            }else{
              io.sockets.in(data.user_id+'_unblock').emit('unblock', { status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(data.user_id+'_unblock');
          }else{
            socket.join(data.user_id+'_unblock');
            io.sockets.in(data.user_id+'_unblock').emit('unblock',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_unblock');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error('error occurs ', e)
      }
    });

    socket.on('exit_group_member', async function(data){
      //input -- {"user_id":"50","accessToken":"2a0c12a980ecfea89d91de250a1074fb","group_id":"group_20221003110216"}
      try{
        console.log('exit group member', data);
        if(typeof(data)=='object'){
          socket.join(data.group_id+'_'+data.user_id+'_left');
          //check user_id and accessToken are valided
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          console.log(user_id,accessToken,group_id)
          if(user_id!='' && accessToken!='' && group_id!=''){
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check group is valid
              let check_group_data=await queries.check_group_data(group_id);
              //console.log(check_group_data)
              if(check_group_data.length>0){
                let date_time=get_datetime();
                let new_group_members=[];
                let group_current_members=JSON.parse(check_group_data[0].current_members);
                let admin_user_check=false;
                let user_member_check=false;
                let check_user_in_group=false;
                let left_update_status=false;
                let admin_update_status=false;
                if(group_current_members.length>0){
                  for(var i=0; i<group_current_members.length; i++){
                    console.log(group_current_members[i].user_id)
                    if(group_current_members[i].user_id==user_id){
                      check_user_in_group=true;
                    }
                    if(group_current_members[i].user_id==user_id && group_current_members[i].type=='user'){
                      user_member_check=true;
                    }
                    if(group_current_members[i].user_id==user_id && group_current_members[i].type=='admin'){
                      admin_user_check=true;
                    }
                  }

                  
                }
                
                if(check_user_in_group){
                  console.log(check_user_in_group,user_member_check,admin_user_check);
                  if(user_member_check){
                    let left_members=check_group_data[0].left_members;
                    console.log(left_members)
                    if(left_members!=''){
                      console.log('left user is not empty',left_members)
                      left_members=JSON.parse(check_group_data[0].left_members);
                      console.log(left_members)
                      //add user to left members array
                      left_members.push({
                        user_id: user_id,
                        datetime: date_time
                      })
                    }else{
                      console.log('left user is empty')
                      left_members=[{
                        user_id: user_id,
                        datetime: date_time
                      }]
                    }
                    if(group_current_members.length>0){
                      for(var j=0; j<group_current_members.length; j++){
                        //new_group_members
                        //console.log(group_current_members[j])
                        if(user_id==group_current_members[j].user_id){
                          //not needed to add in the new_group_members array
                          console.log('left user index')
                        }else{
                          //console.log('other user index')
                          new_group_members.push({
                            user_id: group_current_members[j].user_id,
                            username: group_current_members[j].username,
                            type: group_current_members[j].type,
                            datetime: group_current_members[j].datetime ? group_current_members[j].datetime : '',
                            added_by: group_current_members[j].added_by
                          })
                        }
                      }
                    }
                    console.log('new group users ',new_group_members)
                    //update to group list db
                    let left_members_json_data=JSON.stringify(left_members);
                    let new_group_members_json_data=JSON.stringify(new_group_members);
                    //update group left users
                    let update_group_user_left_data=await queries.update_group_user_left_data(left_members_json_data,new_group_members_json_data,group_id);
                    console.log(update_group_user_left_data);
                    if(update_group_user_left_data.affectedRows>0){
                      console.log('updated to db')
                      //save new entry to chat_list table
                      let senter_id=user_id;
                      let message='left';
                      let message_type='notification';
                      let room=group_id;
                      let message_status=1;
                      let status=1;
                      let online_status=0;
                      let private_status=1;
                      let group_status=[];
                      for(var k=0; k<group_current_members.length; k++){
                        let message_status;
                        let message_read_datetime;
                        if(user_id==group_current_members[k].user_id){
                          message_status=0;
                          message_read_datetime=date_time;
                        }else{
                          message_status=1;
                          message_read_datetime='';
                        }
                        group_status.push({
                          user_id: group_current_members[k].user_id,
                          username: await queries.get_username(group_current_members[k].user_id),
                          datetime: date_time,
                          message_status: message_status,
                          message_read_status: message_read_datetime,
                          status: 1
                        })
                      }
                      let save_left_message=await queries.save_left_message(date_time,senter_id,message,message_type,room,message_status,status,online_status,private_status,JSON.stringify(group_status));
                      console.log(save_left_message)
                      if(save_left_message>0){
                        left_update_status=true;
                        io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                        //emit message to the user
                        let sender_group_chat_response=await functions.get_group_chat_list_response(user_id,group_id);
                        io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_response);
                        //emit message to chat_list
                        for(var group_user=0; group_user<new_group_members.length; group_user++){
                          //console.log('group other users ',new_group_members[group_user].user_id)
                          let receiver_group_chat_response=await functions.get_group_chat_list_response(new_group_members[group_user].user_id,group_id);
                          io.sockets.in(group_id+'_'+new_group_members[group_user].user_id).emit('message',receiver_group_chat_response);
                          let get_chat_list_response=await functions.get_recent_chat_list_response(new_group_members[group_user].user_id);
                          io.sockets.in(new_group_members[group_user].user_id).emit('chat_list',get_chat_list_response);
                        }

                        //emit chat_list to the senter
                        let get_senter_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                        io.sockets.in(user_id).emit('chat_list', get_senter_chat_list_response)
                        
                      }else{
                        io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not saved to db"});
                      }
                    }else{
                      io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not updated in db"});
                    }
                  }
                  if(admin_user_check){
                    console.log('user type is admin')
                    let left_members=check_group_data[0].left_members;
                    if(left_members!=''){
                      console.log('left user is not empty',left_members)
                      left_members=JSON.parse(check_group_data[0].left_members);
                      console.log(left_members)
                      //add user to left members array
                      left_members.push({
                        user_id: user_id,
                        datetime: date_time
                      })
                    }else{
                      console.log('left user is empty')
                      left_members=[{
                        user_id: user_id,
                        datetime: date_time
                      }]
                    }

                    if(group_current_members.length>0){
                      for(var j=0; j<group_current_members.length; j++){
                        //new_group_members
                        if(user_id==group_current_members[j].user_id){
                          //not needed to add in the new_group_members array
                          console.log('left user index')
                        }else{
                          //console.log('other user index')
                          new_group_members.push({
                            user_id: group_current_members[j].user_id,
                            username: group_current_members[j].username,
                            type: group_current_members[j].type,
                            datetime: group_current_members[j].datetime ? group_current_members[j].datetime : '',
                            added_by: group_current_members[j].added_by
                          })
                        }

                      }
                    }
                    console.log('new group users ',new_group_members)
                    //update to group list db
                    let left_members_json_data=JSON.stringify(left_members);
                    let new_group_members_json_data=JSON.stringify(new_group_members);
                    //update group left users
                    let update_group_user_left_data=await queries.update_group_user_left_data(left_members_json_data,new_group_members_json_data,group_id);
                    console.log(update_group_user_left_data);
                    if(update_group_user_left_data.affectedRows>0){
                      console.log('updated to db')
                      //save new entry to chat_list table
                      let senter_id=user_id;
                      let message='left';
                      let message_type='notification';
                      let room=group_id;
                      let message_status=1;
                      let status=1;
                      let online_status=0;
                      let private_status=1;
                      let group_status=[];
                      for(var k=0; k<group_current_members.length; k++){
                        let message_status;
                        let message_read_datetime;
                        if(user_id==group_current_members[k].user_id){
                          message_status=0;
                          message_read_datetime=date_time;
                        }else{
                          message_status=1;
                          message_read_datetime='';
                        }
                        group_status.push({
                          user_id: group_current_members[k].user_id,
                          username: await queries.get_username(group_current_members[k].user_id),
                          datetime: date_time,
                          message_status: message_status,
                          message_read_status: message_read_datetime,
                          status: 1
                        })
                      }
                      let save_left_message=await queries.save_left_message(date_time,senter_id,message,message_type,room,message_status,status,online_status,private_status,JSON.stringify(group_status));
                      console.log(save_left_message)
                      if(save_left_message>0){
                        console.log('saved');
                        left_update_status=true;
                        //emit message to left user
                        //emit message to chat_list
                        

                        //emit chat_list to the senter
                        let get_senter_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                        io.sockets.in(user_id).emit('chat_list', get_senter_chat_list_response)
                        //io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                        //check group has any other admin user
                        let overall_group_members=JSON.parse(check_group_data[0].members);
                        if(new_group_members.length>0){
                          console.log('new group users',new_group_members);
                          let group_admin_count=0;
                          let new_admin_user='';
                          let new_admin_user_member=[];
                          for(var m=0; m<new_group_members.length; m++){
                            if(new_group_members[m].type=='admin'){
                              group_admin_count=group_admin_count+1;
                            }else if(new_group_members[m].type=='user'){
                              new_admin_user=new_group_members[m].user_id;
                            }
                          }
                          // io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                          // //emit message to the user
                          // let sender_group_chat_response=await functions.get_group_chat_list_response(user_id,group_id);
                          // io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_response);
                          // //emit chat_list to the senter
                          // let get_senter_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                          // io.sockets.in(user_id).emit('chat_list', get_senter_chat_list_response);
                          // console.log('group admin ', group_admin_count,'new admin user ', new_admin_user);
                          if(group_admin_count==0){
                            if(new_admin_user!=''){
                              for(var n=0; n<new_group_members.length; n++){
                                //add to over group members array 
                                console.log(new_admin_user,new_group_members[n].user_id)
                                if(new_admin_user==new_group_members[n].user_id){
                                  new_admin_user_member.push({
                                    user_id: new_group_members[n].user_id,
                                    username: new_group_members[n].username,
                                    type: 'admin',
                                    datetime: date_time,
                                    added_by: new_group_members[n].added_by
                                  });
                                  overall_group_members.push({
                                    user_id: new_group_members[n].user_id,
                                    username: new_group_members[n].username,
                                    type: 'admin',
                                    datetime: date_time,
                                    added_by: new_group_members[n].added_by
                                  });
                                }else{
                                  new_admin_user_member.push({
                                    user_id: new_group_members[n].user_id,
                                    username: new_group_members[n].username,
                                    type: new_group_members[n].type,
                                    datetime: new_group_members[n].datetime,
                                    added_by: new_group_members[n].added_by
                                  });
                                }
                              }
                              console.log('datas ',new_admin_user_member, overall_group_members)
                              //save admin data
                              let group_current_member=JSON.stringify(new_admin_user_member);
                              let group_overall_members=JSON.stringify(overall_group_members);
                              //update to group table
                              let save_group_admin_data=await queries.save_group_admin_data(group_current_member,group_overall_members,data.group_id);
                              console.log('save data ',save_group_admin_data);
                              if(save_group_admin_data.affectedRows>0){
                                //save admin notification message in chat_list
                                let group_status=[];
                                for(var o=0; o<new_admin_user_member.length; o++){
                                  group_status.push({
                                    user_id: new_admin_user_member[o].user_id,
                                    username: new_admin_user_member[o].username,
                                    datetime: date_time,
                                    message_status: 1,
                                    message_read_status: '',
                                    status: 1
                                  })
                                }
                                let senter_id=user_id;
                                let message='admin';
                                let message_type='notification';
                                let room=group_id;
                                let message_status=1;
                                let status=1;
                                let online_status=0;
                                let private_status=1;
                                let save_admin_message=await queries.save_admin_message(date_time,senter_id,message,message_type,room,message_status,status,online_status,private_status,JSON.stringify(group_status));
                                if(save_admin_message>0){
                                  console.log('admin message saved')
                                  admin_update_status=true;
                                  io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                                  //emit message to chat_list
                                  for(var group_user=0; group_user<new_group_members.length; group_user++){
                                    console.log('group other users ',new_group_members[group_user].user_id)
                                    let receiver_group_chat_response=await functions.get_group_chat_list_response(new_group_members[group_user].user_id,group_id);
                                    io.sockets.in(group_id+'_'+new_group_members[group_user].user_id).emit('message',receiver_group_chat_response);
                                    let get_chat_list_response=await functions.get_recent_chat_list_response(new_group_members[group_user].user_id);
                                    io.sockets.in(new_group_members[group_user].user_id).emit('chat_list',get_chat_list_response);
                                  }

                                  
                                }else{
                                  io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Admin message not saved to db"});
                                }
                              }else{
                                io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Group admin not saved to db"});
                              }
                            }
                          }else{
                            //emit to other user in the group
                            io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                            //emit message to the user
                            let sender_group_chat_response=await functions.get_group_chat_list_response(user_id,group_id);
                            io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_response);
                            //emit chat_list to the senter
                            let get_senter_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                            io.sockets.in(user_id).emit('chat_list', get_senter_chat_list_response);
                            console.log('group admin ', group_admin_count,'new admin user ', new_admin_user);

                            for(var group_user=0; group_user<new_group_members.length; group_user++){
                              if(new_group_members[group_user].user_id!=user_id){
                                let receiver_group_chat_response=await functions.get_group_chat_list_response(new_group_members[group_user].user_id,group_id);
                                io.sockets.in(group_id+'_'+new_group_members[group_user].user_id).emit('message',receiver_group_chat_response);
                                let receiver_chat_list_response=await functions.get_recent_chat_list_response(new_group_members[group_user].user_id);
                                io.sockets.in(new_group_members[group_user].user_id).emit('chat_list',receiver_chat_list_response);
                              }
                            }
                          }
                        }
                      }else{
                        io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not saved to db"});
                      }
                    }else{
                      io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not updated in db"});
                    }
                  }
                  //console.log('left admin update status ', left_update_status)
                  // if(left_update_status){
                  //   //emit message to the user
                  //   let sender_group_chat_response=await functions.get_group_chat_list_response(data.user_id,data.group_id);
                  //   io.sockets.in(data.group_id+'_'+data.user_id).emit('message',sender_group_chat_response);
                  //   //emit message to chat_list
                    
                  // }
                  // if(admin_update_status){

                  // }
                }else{
                  io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "You are not in this group"})
                }
              }else{
                io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "No group data found"})
              }
            }else{
              io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "No user data found"})
            }
          }else{
            io.sockets.in(group_id+'_'+user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "No data found"})
          }
          socket.leave(group_id+'_'+user_id+'_left');
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    //create group
    socket.on('create_group', async function(data){
      try{
        //console.log('create group')
        //{"user_id":"51","accessToken":"825ed65d30bacd787ad2a687ee685389","group_name":"test","members":"1,2","group_profile":"/c:/iOS Developer/pictures.png"}
        if(typeof(data=='object')){
          
          //console.log(data.user_id,data.accessToken,data.group_name)
          let user_id= data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_name=data.group_name ? data.group_name : '';
          let members=data.members ? data.members : '';
          let group_profile=data.group_profile ? data.group_profile : 'uploads/default/group_profile.png';
          let datetime=get_datetime();
          if(members!=''){
            var split_members=members.split(',');
            members=split_members;
          }else{
            members=[];
          }
          socket.join(user_id+'_create_group');
          console.log(user_id, accessToken, group_name, members, group_profile)
          if(user_id!='' && accessToken!='' && group_name!='' && members.length>0){
            //socket.join(data.user_id+'_create_group');
            console.log('sssss')
            //check user_id and accessToken is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              console.log('user is valid')
              let group_id=await functions.create_group_id();
              console.log('group id', group_id)
              let group_users=[];
              group_users.push({
                user_id: user_id,
                username: await queries.get_username(user_id),
                type: 'admin',
                datetime: datetime,
                added_by: user_id
              });
              //console.log(group_users)
              if(members.length>0){
                for(var i=0; i<members.length; i++){
                  console.log('new users', members[i])
                  group_users.push({
                    user_id: members[i],
                    username: await queries.get_username(members[i]),
                    type: 'user',
                    datetime: datetime,
                    added_by: user_id
                  });
                }
              }

              // let created_by=;
              //   let created_datetime=$datetime;
              //   let group_id=$group_id;
              //   let group_name=$group_name;
              //   let group_profile='uploads/default/group_profile.png';
              //   let members= json_encode($new_member);
              //   let current_members= json_encode($new_member); 
              //   let status=1;
              
              //save group basic information to group_list
              let profile_pic_history=[];
              if(data.group_profile!=''){
                profile_pic_history.push({
                  user_id: user_id,
                  datetime: datetime,
                  profile_pic: data.group_profile
                });
              }
              let group_subject=[];
              group_subject.push({
                user_id: user_id,
                datetime: datetime,
                subject: group_name
              })
              
              let save_group_data=await queries.save_and_create_group(user_id,datetime,group_id,group_name,group_profile,JSON.stringify(group_users),JSON.stringify(group_users),JSON.stringify(profile_pic_history),JSON.stringify(group_subject));
              console.log('save group data', save_group_data)

              //console.log('group users ',group_users)

              if(save_group_data!=''){
                let room=save_group_data;
                if(group_users.length>0){
                  let group_status=[];
                  for(var j=0; j<group_users.length; j++){
                    let message_status=1;
                    let message_read_datetime='';
                    if(user_id==group_users[j].user_id){
                      message_status=0;
                      message_read_datetime=datetime;
                    }
                    group_status.push({
                      user_id: group_users[j].user_id,
                      username:group_users[j].username,
                      datetime: datetime,
                      message_status: message_status,
                      message_read_datetime: message_read_datetime,
                      status: 1
                    })
                  }
                  //save user added in group message to chat_list
                  let save_group_user_add_message=await queries.save_group_user_add_message(datetime,user_id,'added','notification',room,1,1,0,1,JSON.stringify(group_status));
                  //save change group icon message
                  if(data.group_profile!=''){
                    let save_group_icon_mesage=await queries.save_group_user_add_message(datetime,user_id,'changed_group_icon','notification',room,1,1,0,1,JSON.stringify(group_status));
                  }
                  
                  if(save_group_user_add_message>0){
                    //message saved
                    io.sockets.in(user_id+'_create_group').emit('create_group',{ status: true, statuscode: 200, message: "success"});
                    //emit message and chat_list to all user in the group
                    let message=await queries.get_username(user_id)+' added you';
                    for(var k=0; k<group_users.length; k++){
                      let group_members=[];
                      group_members.push({
                        user_id: group_users[k].user_id
                      })
                      let senter_chat_list_response=await functions.get_recent_chat_list_response(group_users[k].user_id);
                      io.sockets.in(group_users[k].user_id).emit('chat_list',senter_chat_list_response);
                      //send push notification for group created
                      let added_user_push_notification=await functions.group_chat_push_notification(user_id,room,group_members,message,'changed_group_icon');
                    }
                    
                    
                  }else{
                    //message not saved
                    io.sockets.in(user_id+'_create_group').emit('create_group',{ status: false, statuscode: 400, message: "Message not saved"})
                  }

                }
              }else{
                io.sockets.in(user_id+'_create_group').emit('create_group',{ status: false, statuscode: 400, message: "Group not created"})
              }
              
            }else{
              console.log('user is not valided')
              io.sockets.in(user_id+'_create_group').emit('create_group',{ status: false, statuscode: 200, message: "No user data found"})

            }
            socket.leave(user_id+'_create_group');
          }else{
            console.log('else')
            //No data found
            socket.join(data.user_id+'_create_group');
            io.sockets.in(data.user_id+'_create_group').emit('create_group',{ status: false, statuscode: 200, message: "No data found"})
            socket.leave(data.user_id+'_create_group');
          }
          
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    //add_group_member
    socket.on('add_group_member', async function(data){
      try{
        //console.log('create group')
        //{"user_id":"50","accessToken":"50","members":"5,6","group_id":"group_20220715112203"}
        if(typeof(data=='object')){
          let user_id= data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let members=data.members ? data.members : '';
          let group_id=data.group_id ? data.group_id : '';
          let datetime=get_datetime();
          if(members!=''){
            var split_members=members.split(',');
            members=split_members;
          }else{
            members=[];
          }
          socket.join(user_id+'_add_group_member');
          if(user_id!='' && accessToken!='' && group_id!='' && members.length>0){
            socket.join(user_id+'_add_group_member');
            //check user_id and accessToken is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check group is valid
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                //check user is admin
                let current_members=JSON.parse(check_group_data[0].current_members);
                let group_members=JSON.parse(check_group_data[0].members);
                let old_group_member_count=current_members.length;
                console.log(current_members,members)
                let check_user_is_admin=await functions.check_group_user_is_admin(user_id,current_members);
                console.log('check_group_user_is_admin',check_user_is_admin)
                if(check_user_is_admin){
                  //check user is member of the group
                  if(members.length>0){
                    for(var i=0; i<members.length; i++){
                      let check_user_already_member_in_group=await functions.check_user_already_member_in_group(members[i],current_members)
                      console.log('user ',check_user_already_member_in_group)
                      console.log('check_user_already_member_in_group ',check_user_already_member_in_group)
                      //if user not already exist then it will return false
                      if(check_user_already_member_in_group==false){
                        //user not already exist in the group
                        current_members.push({
                          user_id: members[i],
                          username: await queries.get_username(members[i]),
                          type: 'user',
                          datetime: datetime,
                          added_by: user_id
                        });
                        group_members.push({
                          user_id: members[i],
                          username: await queries.get_username(members[i]),
                          type: 'user',
                          datetime: datetime,
                          added_by: user_id
                        });
                      }
                      let new_group_member_count=current_members.length;
                      console.log(new_group_member_count,old_group_member_count,current_members)
                      if(new_group_member_count>old_group_member_count){
                        //update new users to group
                        let save_group_user=await queries.save_group_admin_data(JSON.stringify(current_members),JSON.stringify(group_members),group_id);
                        if(save_group_user.affectedRows>0){
                          console.log('new user added to the group')
                          //save added message to chat_list
                          let group_status=[];
                          for(var j=0; j<current_members.length; j++){
                            let message_status=1;
                            let message_read_datetime='';
                            if(user_id==current_members[j].user_id){
                              message_status=0;
                              message_read_datetime=datetime;
                            }
                            group_status.push({
                              user_id: current_members[j].user_id,
                              username:current_members[j].username,
                              datetime: datetime,
                              message_status: message_status,
                              message_read_datetime: message_read_datetime,
                              status: 1
                            })
                          }
                          let save_group_user_add_message=await queries.save_group_user_add_message(datetime,user_id,'added','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                          //console.log(save_group_user_add_message)
                          if(save_group_user_add_message>0){
                            io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: true, statuscode: 200, message: "success"});
                            //emit message and chat_list response to the user
                            let senter_group_chat_response=await functions.get_group_chat_list_response(user_id,group_id);
                            io.sockets.in(group_id+'_'+user_id).emit('message',senter_group_chat_response);
                            //emit to other user in the group
                            for(var k=0; k<current_members.length; k++){
                              //console.log(current_members,current_members[k].user_id)
                              //exit ()
                              if(current_members[k].user_id!=user_id){
                                let receiver_group_chat_response=await functions.get_group_chat_list_response(current_members[k].user_id,group_id);
                                io.sockets.in(group_id+'_'+current_members[k].user_id).emit('message',receiver_group_chat_response);
                                let receiver_chat_list_response=await functions.get_recent_chat_list_response(current_members[k].user_id);
                                io.sockets.in(current_members[k].user_id).emit('chat_list',receiver_chat_list_response);
                              }
                            }
                            let sender_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                            io.sockets.in(user_id).emit('chat_list',sender_chat_list_response);
                          }else{
                            io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 400, message: "Not saved in chat list db"});
                          }
                        }else{
                          console.log('user not added to the group')
                          io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 400, message: "Not updated in group list"});
                        }
                      }else{
                        io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 200, message: "User not  added"});
                      }
                    }
                  }else{
                    io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 200, message: "New member is empty"});
                  }
                
                }else{
                  io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 200, message: "You are not an admin"});
                }
                
              }else{
                io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 200, message: "No user data found"})
            }
            socket.leave(user_id+'_add_group_member');
          }else{
            //No data found
            socket.join(data.user_id+'_add_group_member');
            io.sockets.in(data.user_id+'_add_group_member').emit('add_group_member',{ status: false, statuscode: 200, message: "No data found"})
            socket.leave(data.user_id+'_add_group_member');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    //make_group_admin
    socket.on('make_group_admin', async function(data){
      //{"user_id":"50","accessToken":"7520ff1679b65593200acf473d159e5f","group_id":"group_20221003093352","new_admin_user_id":"66"}
      try{
        //console.log('make group admin')
        if(typeof(data=='object')){
          let user_id= data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let new_admin_user_id=data.new_admin_user_id ? data.new_admin_user_id : '';
          let datetime=get_datetime();
          socket.join(user_id+'_group_admin');
          if(user_id!='' && accessToken!='' && group_id!='' && new_admin_user_id!=''){
            socket.join(user_id+'_group_admin');
            //check user_id valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //console.log('user data found')
              //check group data
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                console.log('group already exist');
                let overall_members=JSON.parse(check_group_data[0].members);
                let current_members=JSON.parse(check_group_data[0].current_members);
                let admin_user_check=false;
                //let user_member_check=false;
                let check_new_user_in_group=false;
                let check_new_user_is_admin=false;
                for(var i=0; i<current_members.length; i++){
                  if(user_id==current_members[i].user_id && current_members[i].type=='admin'){
                    admin_user_check=true;
                  }
                  if(new_admin_user_id==current_members[i].user_id && current_members[i].type=='user'){
                    check_new_user_in_group=true;
                  }
                  if(new_admin_user_id==current_members[i].user_id && current_members[i].type=='admin'){
                    check_new_user_is_admin=true;
                  }
                  
                }
                if(admin_user_check){
                  console.log('you are admin')
                  // if(check_new_user_in_group){
                  //   console.log('you are a member in this group')
                    //check new_admin user is already an admin in this group
                    if(check_new_user_is_admin){
                      io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: false, statuscode: 200, message: "You are already an admin"});
                    }else{
                      //make new user as admin
                      //console.log('make admin')
                      let new_current_group_members=[];
                      for(var j=0; j<current_members.length; j++){
                        console.log(new_admin_user_id, current_members[j].user_id)
                        if(new_admin_user_id==current_members[j].user_id){
                          new_current_group_members.push({
                            user_id: current_members[j].user_id,
                            username: current_members[j].username,
                            type: 'admin',
                            datetime: datetime,
                            added_by: current_members[j].added_by
                          });
                          overall_members.push({
                            user_id: current_members[j].user_id,
                            username: current_members[j].username,
                            type: 'admin',
                            datetime: datetime,
                            added_by: current_members[j].added_by
                          });
                        }else{
                          new_current_group_members.push({
                            user_id: current_members[j].user_id,
                            username: current_members[j].username,
                            type: current_members[j].type,
                            datetime: current_members[j].datetime,
                            added_by: current_members[j].added_by
                          });
                        }
                      }

                      console.log('current group members ',new_current_group_members);
                      //update to group_list table
                      let update_admin_data=await queries.save_group_admin_data(JSON.stringify(new_current_group_members),JSON.stringify(overall_members),group_id);
                      console.log(update_admin_data)
                      if(update_admin_data.affectedRows>0){
                        //save admin message to chat_list
                        let group_status=[];
                        for(var k=0; k<new_current_group_members.length; k++){
                          let message_status=1;
                          let message_read_datetime='';
                          if(user_id==new_current_group_members[k].user_id){
                            message_status=0;
                            message_read_datetime=datetime;
                          }
                          group_status.push({
                            user_id: new_current_group_members[k].user_id,
                            username: new_current_group_members[k].username,
                            datetime: datetime,
                            message_status: message_status,
                            message_read_datetime: message_read_datetime,
                            status: 1
                          });
                        }
                        let save_admin_message=await queries.save_admin_message(datetime,user_id,'admin','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                        console.log(save_admin_message)
                        if(save_admin_message>0){
                          io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: true, statuscode: 200, message: "success"})
                          //emit message to user_list
                          let get_group_info_and_user_details=await functions.get_group_info(user_id,accessToken,group_id);
                          io.sockets.in(user_id+'_user_list').emit('get_group_user_list',get_group_info_and_user_details);
                          //emit message and chat_list to the user
                          let sender_group_chat_list=await functions.get_group_chat_list_response(user_id,group_id);
                          io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_list);
                          //emit to receiver side
                          let receiver_group_chat_list=await functions.get_group_chat_list_response(new_admin_user_id,group_id);
                          io.sockets.in(group_id+'_'+new_admin_user_id).emit('message',receiver_group_chat_list);
                          let receiver_chat_list_response=await functions.get_recent_chat_list_response(new_admin_user_id);
                          io.sockets.in(new_admin_user_id).emit('chat_list',receiver_chat_list_response);

                          //sender chat_list
                          let sender_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                          io.sockets.in(user_id).emit('chat_list',sender_chat_list_response);
                        }else{
                          io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: false, statuscode: 400, message: "Not saved to chat list"})
                        }
                      }else{
                        io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: false, statuscode: 400, message: "Not updated to group list"})
                      }

                    }
                  // }else{
                  //   io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: false, statuscode: 200, message: "You are not a member of this group"});
                  // }
                }else{
                  io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: false, statuscode: 200, message: "You are not an admin"});
                }

              }else{
                io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_group_admin');
          }else{
            //No data found
            socket.join(data.user_id+'_group_admin');
            io.sockets.in(data.user_id+'_group_admin').emit('make_group_admin',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_group_admin');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    //remove_group_member

    socket.on('remove_group_member',async function (data){
      //input --- {"user_id":"54","accessToken":"9187065509ff20e150a5e76d7153d11a","group_id":"group_20220930032107","remove_user_id":"56"}
      //console.log('remove_group_member')
      try{
        //check input data type is object
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : ''; 
          let remove_user_id=data.remove_user_id ? data.remove_user_id : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && group_id!='' && remove_user_id!=''){
            console.log('not empty')
            socket.join(user_id+'_remove');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              console.log('user is valid')
              //check group data is valid
              let check_group_data=await queries.check_group_data(group_id);
              console.log(check_group_data)
              if(check_group_data.length>0){
                console.log('group data is valid');
                let admin_user_check=false;
                let user_member_check=false;
                let group_current_member=JSON.parse(check_group_data[0].current_members);
                let removed_member=check_group_data[0].removed_members;
                let group_removed_member=[];
                let current_group_member=[];
                console.log(group_current_member,removed_member)
                if(group_current_member.length>0){
                  for(var i=0; i<group_current_member.length; i++){
                    if(group_current_member[i].user_id==user_id && group_current_member[i].type=='admin'){
                      admin_user_check=true;
                    }
                    if(group_current_member[i].user_id==remove_user_id){
                      user_member_check=true;
                    }
                  }
                  //console.log(admin_user_check, user_member_check)
                  if(admin_user_check){
                    //console.log('you have admin access')
                    if(user_member_check){
                      for(var j=0; j<group_current_member.length; j++){
                        if(group_current_member[j].user_id==remove_user_id){
                          if(removed_member!=''){
                            group_removed_member=JSON.parse(check_group_data[0].removed_members);
                            group_removed_member.push({
                              user_id: remove_user_id,
                              username: await queries.get_username(user_id),
                              type: group_current_member[j].type,
                              datetime: datetime,
                              removed_by: user_id
                            })
                          }else{
                            group_removed_member.push({
                              user_id: remove_user_id,
                              username: await queries.get_username(user_id),
                              type: group_current_member[j].type,
                              datetime: datetime,
                              removed_by: user_id
                            })
                          }
                        }else{
                          current_group_member.push({
                            user_id: group_current_member[j].user_id,
                            username: group_current_member[j].username,
                            type: group_current_member[j].type,
                            datetime: group_current_member[j].datetime,
                            added_by: group_current_member[j].added_by
                          });
                        }
                      }
                      console.log(current_group_member,'removed members', group_removed_member);
                      //update removed group member to db
                      let update_removed_group_member_data=await queries.update_removed_group_member_data(JSON.stringify(current_group_member),JSON.stringify(group_removed_member),group_id);
                      //console.log(update_removed_group_member_data)
                      if(update_removed_group_member_data.affectedRows>0){
                        //console.log('updated to db')
                        //save removed message data to chat_list table
                        let group_status=[];
                        let message_status=1;
                        let message_read_datetime='';
                        for(var k=0; k<group_current_member.length; k++){
                          if(group_current_member[k].user_id==user_id){
                            message_status=0;
                            message_read_datetime=datetime;
                          }else{
                            message_status=1;
                            message_read_datetime='';
                          }
                          group_status.push({
                            user_id: group_current_member[k].user_id,
                            username: group_current_member[k].username,
                            datetime: datetime,
                            message_status: message_status,
                            message_read_datetime: message_read_datetime,
                            status:1
                          })
                          //console.log('group ', group_status)
                        }
                        //.console.log(group_status,group_current_member)
                        let save_removed_message_data=await queries.save_removed_message(datetime,user_id,'removed','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                        //console.log(save_removed_message_data)
                        if(save_removed_message_data>0){
                          io.sockets.in(user_id+'_remove').emit('remove_group_member',{status: true, statuscode: 200, message: "success"})
                          //emit to user_list
                          let get_group_user_and_info_data=await functions.get_group_info(user_id,accessToken,group_id);
                          io.sockets.in(user_id+'_user_list').emit('get_group_user_list',get_group_user_and_info_data);
                          //emit message and chat_list to all group users
                          let sender_group_chat_data=await functions.get_group_chat_list_response(user_id,group_id);
                          io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_data);
                          //emit to other user
                          for(var m=0; m<group_current_member.length; m++){
                            console.log('user ',group_current_member[m].user_id)
                            if(group_current_member[m].user_id!=user_id){
                              let receiver_group_chat_data=await functions.get_group_chat_list_response(group_current_member[m].user_id,group_id);
                              io.sockets.in(group_id+'_'+group_current_member[m].user_id).emit('message',receiver_group_chat_data);
                              let receiver_chat_list_data=await functions.get_recent_chat_list_response(group_current_member[m].user_id);
                              io.sockets.in(group_current_member[m].user_id).emit('chat_list',receiver_chat_list_data);
                            }
                          }
                          //emit to senter chat_list
                          let sender_chat_list_data=await functions.get_recent_chat_list_response(user_id);
                          io.sockets.in(user_id).emit('chat_list',sender_chat_list_data);
                        }else{
                          io.sockets.in(user_id+'_remove').emit('remove_group_member',{status: false, statuscode: 400, message: "Not updated to chat list"})
                        }
                      }else{
                        //console.log('not updated to db')
                        io.sockets.in(user_id+'_remove').emit('remove_group_member',{status: false, statuscode: 400, message: "Not updated to group list"})
                      }
                    }else{
                      io.sockets.in(user_id+'_remove').emit('remove_group_member',{status: false, statuscode: 200, message: "You are not in the group"})
                    }
                  }else{
                    io.sockets.in(user_id+'_remove').emit('remove_group_member',{ status: false, statuscode: 200, message: "You not have admin access"});
                  }
                }else{
                  io.sockets.in(user_id+'_remove').emit('remove_group_member',{ status: false, statuscode: 200, message: "Group has no active members"});
                }
                
                
              }else{
                io.sockets.in(user_id+'_remove').emit('remove_group_member',{ status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_remove').emit('remove_group_member',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.join(user_id+'_remove');
          }else{
            socket.join(data.user_id+'_remove');
            io.sockets.in(data.user_id+'_remove').emit('remove_group_member',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_remove');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    //change_group_profile_pic
    socket.on('change_group_profile_pic',async function(data){
      //input -- {"user_id":"50","accessToken":"e5218fcd9971d86a675c8920824073fa","group_id":"group_20221002074630","group_profile":""}
      try{
        console.log('change_group_profile_pic');
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let group_profile=data.group_profile ? data.group_profile : '';
          let date_time=get_datetime();
          if(user_id!='' && accessToken!='' && group_id!='' && group_profile!=''){
            socket.join(user_id+'_group_profile_pic');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check group data
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                //check user in group
                let group_current_members=JSON.parse(check_group_data[0].current_members);
                let profile_pic_history=check_group_data[0].profile_pic_history;
                let profile_pic_history_array=[];
                if(profile_pic_history!=''){
                  profile_pic_history_array=JSON.parse(profile_pic_history);
                }else{
                  profile_pic_history_array=[];
                }
                console.log('profile_pic_history_array', profile_pic_history_array)
                //add profile_pic to profile_pic_history
                profile_pic_history_array.push({
                  user_id: user_id,
                  datetime: date_time,
                  profile_pic: group_profile
                })
                let check_user_member_in_group=await functions.check_user_already_member_in_group(user_id,group_current_members);
                //console.log(check_user_member_in_group)
                if(check_user_member_in_group){
                  //change profile pic
                  let update_group_profile_pic=await queries.update_group_profile_pic(group_profile,JSON.stringify(profile_pic_history_array),group_id);
                  if(update_group_profile_pic.affectedRows>0){
                    //update changed_group_icon message
                    //emit to user's message and chat_list
                    let group_status=[];
                    for(var z=0; z<group_current_members.length; z++){
                      let message_status;
                      let message_read_datetime;
                      if(group_current_members[z].user_id==user_id){
                        message_status=0;
                        message_read_datetime=date_time;
                      }else{
                        message_status=1;
                        message_read_datetime=''
                      }
                      group_status.push({
                        user_id: group_current_members[z].user_id,
                        username: await queries.get_username(group_current_members[z].user_id),
                        datetime: date_time,
                        message_status: message_status,
                        message_read_datetime: message_read_datetime,
                        status: 1
                      })
                    }
                    let save_group_icon_mesage=await queries.save_group_user_add_message(date_time,user_id,'changed_group_icon','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                    if(save_group_icon_mesage>0){
                      io.sockets.in(user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: true, statuscode: 200, message: "success"});
                      let sender_group_chat_data=await functions.get_group_chat_list_response(user_id,group_id);
                      io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_data);
                      for(let i=0; i<group_current_members.length; i++){
                        if(group_current_members[i].user_id!=user_id){
                          let receiver_group_chat_data=await functions.get_group_chat_list_response(group_current_members[i].user_id,group_id);
                          io.sockets.in(group_id+'_'+group_current_members[i].user_id).emit('message',receiver_group_chat_data);
                          let receiver_chat_list_data=await functions.get_recent_chat_list_response(group_current_members[i].user_id);
                          io.sockets.in(group_current_members[i].user_id).emit('chat_list',receiver_chat_list_data);
                        }
                      }
                      //emit chat_list to the use
                      let receiver_chat_list_data=await functions.get_recent_chat_list_response(user_id);
                      io.sockets.in(user_id).emit('chat_list',receiver_chat_list_data);
                    }else{
                      io.sockets.in(user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: false, statuscode: 400, message: "Not saved in chat list"});
                    }
                    
                  }else{
                    io.sockets.in(user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: false, statuscode: 400, message: "Not updated to db"});
                  }
                }else{
                  io.sockets.in(user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: false, statuscode: 200, message: "You are not a member in this group"});
                }
              }else{
                io.sockets.in(user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_group_profile_pic');
          }else{
            socket.join(data.user_id+'_group_profile_pic');
            io.sockets.in(data.user_id+'_group_profile_pic').emit('change_group_profile_pic',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_group_profile_pic');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    //update_group_profile_details
    //input -- {"user_id":"50","accessToken":"e5218fcd9971d86a675c8920824073fa","group_id":"group_20221002074630","group_profile":"","group_name":"Hello world"} 
    socket.on('update_group_profile_details',async function(data){
      //input -- {"user_id":"50","accessToken":"e5218fcd9971d86a675c8920824073fa","group_id":"group_20221002074630","group_profile":"","group_name":"Hello world"} 
      try{
        console.log('update_group_profile_details');
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let group_profile=data.group_profile ? data.group_profile : '';
          let group_name=data.group_name ? data.group_name : '';
          if(user_id!='' && accessToken!='' && group_id!=''){
            socket.join(user_id+'_group_profile_details');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check group data
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                //check user in group
                let group_current_members=JSON.parse(check_group_data[0].current_members);
                let check_user_member_in_group=await functions.check_user_already_member_in_group(user_id,group_current_members);
                //console.log(check_user_member_in_group)
                if(check_user_member_in_group){
                  //change profile pic details
                  let update_group_profile_details=await queries.update_group_profile_details(group_name,group_profile,group_id);
                  //console.log(update_group_profile_details)
                  if(update_group_profile_details.affectedRows>0){
                    io.sockets.in(user_id+'_group_profile_details').emit('update_group_profile_details',{ status: true, statuscode: 200, message: "success"});
                    //emit to user's message and chat_list
                    let sender_group_chat_data=await functions.get_group_chat_list_response(user_id,group_id);
                    io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_data);
                    for(let i=0; i<group_current_members.length; i++){
                      if(group_current_members[i].user_id!=user_id){
                        let receiver_group_chat_data=await functions.get_group_chat_list_response(group_current_members[i].user_id,group_id);
                        io.sockets.in(group_id+'_'+group_current_members[i].user_id).emit('message',receiver_group_chat_data);
                        let receiver_chat_list_data=await functions.get_recent_chat_list_response(group_current_members[i].user_id);
                        io.sockets.in(group_current_members[i].user_id).emit('chat_list',receiver_chat_list_data);
                      }
                    }
                    //emit chat_list to the use
                    let receiver_chat_list_data=await functions.get_recent_chat_list_response(user_id);
                    io.sockets.in(user_id).emit('chat_list',receiver_chat_list_data);
                  }else{
                    io.sockets.in(user_id+'_group_profile_details').emit('update_group_profile_details',{ status: false, statuscode: 400, message: "Not updated to db"});
                  }
                }else{
                  io.sockets.in(user_id+'_group_profile_details').emit('update_group_profile_details',{ status: false, statuscode: 200, message: "You are not a member in this group"});
                }
              }else{
                io.sockets.in(user_id+'_group_profile_details').emit('update_group_profile_details',{ status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_group_profile_details').emit('update_group_profile_details',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_group_profile_details');
          }else{
            socket.join(data.user_id+'_group_profile_details');
            io.sockets.in(data.user_id+'_group_profile_details').emit('update_group_profile_details',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_group_profile_details');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    socket.on('update_group_description',async function(data){
      try{
        //input -- {"user_id":"5","accessToken":"5","description":"hello","group_id":"group_20230212123759"}
        //console.log('group description')
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let description=data.description ? data.description : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && group_id!='' && description!=''){
            socket.join(user_id+'_group_description');
            //check user id and accesstoken is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              console.log('user found')
              //check group data
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                let current_group_members=check_group_data[0].current_members;
                let description_history=check_group_data[0].description_history;
                if(current_group_members!=''){
                  let group_members=JSON.parse(current_group_members);
                  //check group member
                  console.log(group_members)
                  let check_user_exist_in_group=await functions.check_user_already_member_in_group(user_id,group_members);
                  if(check_user_exist_in_group){
                    //save description to db
                    let description_history_array=[];
                    if(description_history!=''){
                      description_history_array=JSON.parse(description_history);
                    }else{
                      description_history_array=[];
                    }
                    description_history_array.push({
                      user_id: user_id,
                      datetime: datetime,
                      description: description
                    });
                    let save_description=await queries.save_group_description(group_id,description,datetime,JSON.stringify(description_history_array));
                    if(save_description.affectedRows>0){
                      //save message to db
                      console.log('saved to db')
                      let group_status=[];
                    for(var i=0; i<group_members.length; i++){
                      let message_status;
                      let message_read_datetime;
                      if(group_members[i].user_id==user_id){
                        message_status=0;
                        message_read_datetime=datetime;
                      }else{
                        message_status=1;
                        message_read_datetime=''
                      }
                      group_status.push({
                        user_id: group_members[i].user_id,
                        username: await queries.get_username(group_members[i].user_id),
                        datetime: datetime,
                        message_status: message_status,
                        message_read_datetime: message_read_datetime,
                        status: 1
                      })
                    }
                    let save_group_description_mesage=await queries.save_group_user_add_message(datetime,user_id,'changed_group_description','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                    if(save_group_description_mesage>0){
                      io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: true, statuscode: 200, message: "success"});
                      //emit to all the user in the group
                      let sender_group_chat_list_response=await functions.get_group_chat_list_response(user_id,group_id);
                      io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_list_response);
                      //emit to receiver 
                      for(var j=0; j<group_members.length; j++){
                        if(group_members[j].user_id!=user_id){
                          let receiver_group_chat_list_response=await functions.get_group_chat_list_response(group_members[j].user_id,group_id);
                          io.sockets.in(group_id+'_'+group_members[j].user_id).emit('message',receiver_group_chat_list_response);
                          let receiver_recent_chat_list_response=await functions.get_recent_chat_list_response(group_members[j].user_id);
                          io.sockets.in(group_members[j].user_id).emit('chat_list',receiver_recent_chat_list_response);
                        }
                      }
                      let sender_recent_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                      io.sockets.in(user_id).emit('chat_list',sender_recent_chat_list_response);
                    }else{
                      io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 400, message: "Not saved to chat list"});
                    }
                    }else{
                      io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 400, message: "Not saved to group list"});
                    }
                  }else{
                    io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 200, message: "You are not this group"});
                  }
                }else{
                  io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 200, message: "No user data found"});
                }
              }else{
                io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_group_description');
          }else{
            socket.join(data.user_id+'_group_description');
            io.sockets.in(data.user_id+'_group_description').emit('update_group_description',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_group_description');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    socket.on('update_group_name',async function(data){
      try{
        //input -- {"user_id":"5","accessToken":"5","description":"hello","group_name":"group_20230212123759"}
        console.log('group name')
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let name=data.name ? data.name : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && group_id!='' && name!=''){
            socket.join(user_id+'_group_name');
            //check user id and accesstoken is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              console.log('user found')
              //check group data
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                let current_group_members=check_group_data[0].current_members;
                let subject_history=check_group_data[0].subject_history;
                if(current_group_members!=''){
                  let group_members=JSON.parse(current_group_members);
                  //check group member
                  console.log(group_members)
                  let check_user_exist_in_group=await functions.check_user_already_member_in_group(user_id,group_members);
                  if(check_user_exist_in_group){
                    //save description to db
                    let subject_history_array=[];
                    if(subject_history!=''){
                      subject_history_array=JSON.parse(subject_history);
                    }else{
                      subject_history_array=[];
                    }
                    subject_history_array.push({
                      user_id: user_id,
                      datetime: datetime,
                      subject: name
                    });
                    let save_subject=await queries.save_group_name(group_id,name,JSON.stringify(subject_history_array));
                    if(save_subject.affectedRows>0){
                      //save message to db
                      console.log('saved to db')
                      let group_status=[];
                      for(var i=0; i<group_members.length; i++){
                        let message_status;
                        let message_read_datetime;
                        if(group_members[i].user_id==user_id){
                          message_status=0;
                          message_read_datetime=datetime;
                        }else{
                          message_status=1;
                          message_read_datetime=''
                        }
                        group_status.push({
                          user_id: group_members[i].user_id,
                          username: await queries.get_username(group_members[i].user_id),
                          datetime: datetime,
                          message_status: message_status,
                          message_read_datetime: message_read_datetime,
                          status: 1
                        })
                      }
                      let save_group_name_mesage=await queries.save_group_user_add_message(datetime,user_id,'changed_group_name','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                      if(save_group_name_mesage>0){
                        io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: true, statuscode: 200, message: "success"});

                        //emit to all the user in the group
                        let sender_group_chat_list_response=await functions.get_group_chat_list_response(user_id,group_id);
                        io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_chat_list_response);
                        //emit to receiver 
                        for(var j=0; j<group_members.length; j++){
                          if(group_members[j].user_id!=user_id){
                            let receiver_group_chat_list_response=await functions.get_group_chat_list_response(group_members[j].user_id,group_id);
                            io.sockets.in(group_id+'_'+group_members[j].user_id).emit('message',receiver_group_chat_list_response);
                            let receiver_recent_chat_list_response=await functions.get_recent_chat_list_response(group_members[j].user_id);
                            io.sockets.in(group_members[j].user_id).emit('chat_list',receiver_recent_chat_list_response);
                          }
                        }
                        let sender_recent_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                        io.sockets.in(user_id).emit('chat_list',sender_recent_chat_list_response);
                        
                      }else{
                        io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 400, message: "Not saved to chat list"});
                      }
                    }else{
                      io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 400, message: "Not saved to group list"});
                    }
                  }else{
                    io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 200, message: "You are not this group"});
                  }
                }else{
                  io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 200, message: "No user data found"});
                }
              }else{
                io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_group_name');
          }else{
            socket.join(data.user_id+'_group_name');
            io.sockets.in(data.user_id+'_group_name').emit('update_group_name',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_group_name');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    //clear_individual_chat
    //input -- {"accessToken":"7520ff1679b65593200acf473d159e5f","user_id":"50","receiver_id":"6","delete_starred_message":""}
    socket.on('clear_individual_chat',async function (data){
      //console.log('clear individual chat');
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let receiver_id=data.receiver_id ? data.receiver_id : '';
          let delete_starred_message=data.delete_starred_message ? data.delete_starred_message :'0';
          if(user_id!='' && accessToken!='' && receiver_id!='' && delete_starred_message!=''){
            socket.join(user_id+'_clear_chat');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check room
              let room='';
              if(Number(user_id)>Number(receiver_id)){
                room=receiver_id+user_id;
              }else{
                room=user_id+receiver_id;
              }
              console.log(room)
              //get room chat datas
              let room_chat_list=await queries.room_chat_list(room);
              console.log(room_chat_list);
              let clear_chat_status=false;
              let clear_chat_update_row_count=0;
              if(room_chat_list.length>0){
                if(delete_starred_message=="0"){
                  let set_query_case_data="";
                  let query_where_id="";
                  console.log('not deleted  starred message 0',room_chat_list)
                  for(var i=0; i<room_chat_list.length; i++){
                    let group_status=JSON.parse(room_chat_list[i].group_status);
                    let message_id=room_chat_list[i].id;
                    for(var j=0; j<group_status.length; j++){
                      
                      let starred_status=group_status[j].starred_status ? group_status[j].starred_status : '0';
                      console.log(`id ${message_id} starred status ${starred_status}`)
                      if(user_id==group_status[j].user_id && starred_status==0){
                        group_status[j].status=2;
                      }
                    }
                    set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                    query_where_id=query_where_id+"'"+message_id+"'"+",";
                  }

                  let query_case_data='case '+set_query_case_data+' end'
                  let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                  let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                  let update_clear_chat=await queries.update_clear_chat_with_single_query(query);

                  console.log('total affected row count ',clear_chat_update_row_count);

                  if(update_clear_chat.affectedRows>0){
                    io.sockets.in(user_id+'_clear_chat').emit('clear_individual_chat',{ status: true, statuscode: 200, message: "success"});
                    //emit individual chat list to user
                    let sender_chat_list_data=await functions.get_individual_chat_list_response(user_id,receiver_id,room)
                    io.sockets.in(room+'_'+user_id).emit('message',sender_chat_list_data);
                    let get_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                    io.sockets.in(user_id).emit('chat_list', get_chat_list_response);
                  }else{
                    io.sockets.in(user_id+'_clear_chat').emit('clear_individual_chat',{ status: false, statuscode: 400, message: "Not updated to db"});
                  }
                
                }else{
                  let set_query_case_data="";
                  let query_where_id="";
                  for(var i=0; i<room_chat_list.length; i++){
                    let group_status=JSON.parse(room_chat_list[i].group_status);
                    let message_id=room_chat_list[i].id;
                    for(var j=0; j<group_status.length; j++){
                      if(user_id==group_status[j].user_id){
                        group_status[j].status=2;
                      }
                    }
                    set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                    query_where_id=query_where_id+"'"+message_id+"'"+",";
                    //console.log('new data ', message_id, group_status)
                    //update to db
                    // let update_clear_chat_data=await queries.update_clear_chat(message_id,JSON.stringify(group_status));
                    // //console.log('clear chat status',update_clear_chat_data);
                    // if(update_clear_chat_data.affectedRows>0){
                    //   clear_chat_update_row_count=clear_chat_update_row_count+1;
                    // }
                  }

                  let query_case_data='case '+set_query_case_data+' end'
                  let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                  let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                  let update_clear_chat=await queries.update_clear_chat_with_single_query(query);

                  console.log('total affected row count ',clear_chat_update_row_count);

                  if(update_clear_chat.affectedRows>0){
                    io.sockets.in(user_id+'_clear_chat').emit('clear_individual_chat',{ status: true, statuscode: 200, message: "success"});
                    //emit individual chat list to user
                    let sender_chat_list_data=await functions.get_individual_chat_list_response(user_id,receiver_id,room)
                    io.sockets.in(room+'_'+user_id).emit('message',sender_chat_list_data);
                    let get_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                    io.sockets.in(user_id).emit('chat_list', get_chat_list_response);
                  }else{
                    io.sockets.in(user_id+'_clear_chat').emit('clear_individual_chat',{ status: false, statuscode: 400, message: "Not updated to db"});
                  }
                }
              }else{
                //no message to clear
                io.sockets.in(user_id+'_clear_chat').emit('clear_individual_chat',{ status: false, statuscode: 200, message: "No message to clear"});
              }
            }else{
              io.sockets.in(user_id+'_clear_chat').emit('clear_individual_chat',{ status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_clear_chat');
          }else{
            socket.join(data.user_id+'_clear_chat');
            io.sockets.in(data.user_id+'_clear_chat').emit('clear_individual_chat',{ status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_clear_chat');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    //clear_group_chat
    socket.on('clear_group_chat', async function(data){
      console.log('clear group chat');
      //{"accessToken":"7520ff1679b65593200acf473d159e5f","user_id":"50","group_id":"group_20221003075515"}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let delete_starred_message=data.delete_starred_message ? data.delete_starred_message :'0';
          if(user_id!='' && accessToken!='' && group_id!=''){
            //check user data is valid
            socket.join(user_id+'_clear_chat');
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check group is valid
              let check_group_data=await queries.check_group_data(group_id);
              if(check_group_data.length>0){
                let group_members=JSON.parse(check_group_data[0].members);
                //check user is member in this group
                let check_user_in_group_member=await functions.check_user_already_member_in_group(user_id, group_members);
                console.log('user in group',check_user_in_group_member);
                if(check_user_in_group_member){
                  //console.log('yes');
                  //get chat list data
                  let group_chat_list=await queries.group_chat_list(user_id,group_id);
                  console.log(group_chat_list)
                  if(group_chat_list.length>0){
                    if(delete_starred_message=='0'){
                      let set_query_case_data="";
                      let query_where_id="";
                      let clear_chat_update_row_count=0;
                      for(var i=0; i<group_chat_list.length; i++){
                        let message_id=group_chat_list[i].id
                        let group_status=JSON.parse(group_chat_list[i].group_status);
                        for(var j=0; j<group_status.length; j++){
                          let starred_status=group_status[j].starred_status ? group_status[j].starred_status : '0';
                          if(group_status[j].user_id==user_id && starred_status==0){
                            group_status[j].status=2;
                          }
                        }
                       // console.log('new data ',message_id,group_status);
                        //update update_clear_chat to db
                        // let update_clear_chat=await queries.update_clear_chat(message_id,JSON.stringify(group_status));
                        // if(update_clear_chat.affectedRows>0){
                        //   clear_chat_update_row_count=clear_chat_update_row_count+1;
                        // }
                        set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                        query_where_id=query_where_id+"'"+message_id+"'"+",";
                      }
                      let query_case_data='case '+set_query_case_data+' end'
                      let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                      let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                      //console.log('case data ',query)
                      let update_clear_chat=await queries.update_clear_chat_with_single_query(query);
                      //console.log('updated row',clear_chat_update_row_count);
                      if(update_clear_chat.affectedRows>0){
                        io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: true, statuscode: 200, message: "success"});
                        //emit to user chat list
                        let group_chat_list_response=await functions.get_group_chat_list_response(user_id,group_id);
                        io.sockets.in(group_id+'_'+user_id).emit('message', group_chat_list_response);
                        let get_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                        io.sockets.in(user_id).emit('chat_list', get_chat_list_response);
                      }else{
                        io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 400, message: "Not updated to db"});
                      }
                    }else{
                      let set_query_case_data="";
                      let query_where_id="";
                      let clear_chat_update_row_count=0;
                      for(var i=0; i<group_chat_list.length; i++){
                        let message_id=group_chat_list[i].id
                        let group_status=JSON.parse(group_chat_list[i].group_status);
                        for(var j=0; j<group_status.length; j++){
                          if(group_status[j].user_id==user_id){
                            group_status[j].status=2;
                          }
                        }
                        console.log('new data ',message_id,group_status);
                        //update update_clear_chat to db
                        // let update_clear_chat=await queries.update_clear_chat(message_id,JSON.stringify(group_status));
                        // if(update_clear_chat.affectedRows>0){
                        //   clear_chat_update_row_count=clear_chat_update_row_count+1;
                        // }
                        set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                        query_where_id=query_where_id+"'"+message_id+"'"+",";
                      }
                      let query_case_data='case '+set_query_case_data+' end'
                      let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                      let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                      //console.log('case data ',query)
                      let update_clear_chat=await queries.update_clear_chat_with_single_query(query);
                      //console.log('updated row',clear_chat_update_row_count);
                      if(update_clear_chat.affectedRows>0){
                        io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: true, statuscode: 200, message: "success"});
                        //emit to user chat list
                        let group_chat_list_response=await functions.get_group_chat_list_response(user_id,group_id);
                        io.sockets.in(group_id+'_'+user_id).emit('message', group_chat_list_response);
                        let get_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                        io.sockets.in(user_id).emit('chat_list', get_chat_list_response);
                      }else{
                        io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 400, message: "Not updated to db"});
                      }
                    }
                  }else{
                    io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 200, message: "No message found"});
                  }
                }else{
                  io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 200, message: "You are not in the group"});
                }
              }else{
                io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_clear_chat');
          }else{
            socket.join(data.user_id+'_clear_chat');
            io.sockets.in(data.user_id+'_clear_chat').emit('clear_group_chat',{status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_clear_chat');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    })

    //report_and_block_individual_chat
    socket.on('report_and_block_individual_chat',async function (data){
      try{
        //{"accessToken":"7520ff1679b65593200acf473d159e5f","user_id":"50","receiver_id":"6"}
        console.log('report_and_block_individual_chat')
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let receiver_id=data.receiver_id ? data.receiver_id : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && receiver_id!=''){
            socket.join(user_id+'_report_and_block_individual');
            //check user data
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //create room
              let room='';
              if(Number(user_id)>Number(receiver_id)){
                room=receiver_id+user_id;
              }else{
                room=user_id+receiver_id;
              }
              console.log('room data ',room)
              //add into report_chat table
              let save_report_chat_data=await queries.save_report_chat(user_id,datetime,receiver_id,room,'individual report and block');
              if(save_report_chat_data>0){
                console.log('data saved')
                let check_user_already_blocked=await queries.check_user_already_blocked(user_id,receiver_id);
                if(check_user_already_blocked.length>0){
                  //you already blocked this person
                  console.log('data already block')
                  //do clear chat
                  let room_chat_list=await queries.room_chat_list(room);
                  let clear_chat_update_row_count=0;
                  if(room_chat_list.length>0){
                    let set_query_case_data="";
                    let query_where_id="";
                    for(var i=0; i<room_chat_list.length; i++){
                      let group_status=JSON.parse(room_chat_list[i].group_status);
                      let message_id=room_chat_list[i].id;
                      for(var j=0; j<group_status.length; j++){
                        if(user_id==group_status[j].user_id){
                          group_status[j].status=2;
                        }
                      }
                      set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                      query_where_id=query_where_id+"'"+message_id+"'"+",";
                      //console.log('new data ', message_id, group_status)
                      //update to db
                      //let update_clear_chat_data=await queries.update_clear_chat(message_id,JSON.stringify(group_status));
                      //console.log('clear chat status',update_clear_chat_data);
                      // if(update_clear_chat_data.affectedRows>0){
                      //   clear_chat_update_row_count=clear_chat_update_row_count+1;
                      // }
                      
                    }

                    let query_case_data='case '+set_query_case_data+' end'
                    let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                    let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                    //console.log('case data ',query)
                    let update_clear_chat=await queries.update_clear_chat_with_single_query(query);
                    //console.log(update_clear_chat)
                    // if(update_clear_chat.affectedRows>0){
                    //   status=true;
                    // }
                    //console.log('total affected row count ',clear_chat_update_row_count);

                    //if(clear_chat_update_row_count>0){
                      io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: true, statuscode: 200, message: "success"});
                      //emit individual chat list to user
                      let sender_chat_list_data=await functions.get_individual_chat_list_response(user_id,receiver_id,room)
                      io.sockets.in(room+'_'+user_id).emit('message',sender_chat_list_data);
                      let recent_chat_list_data=await functions.get_recent_chat_list_response(user_id);
                      io.sockets.in(user_id).emit('chat_list',recent_chat_list_data);
                    // }else{
                    //   io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: false, statuscode: 400, message: "Not updated to db"});
                    // }

                  }else{
                    //no message to clear
                    io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: false, statuscode: 200, message: "No message to clear"});
                  }
                }else{
                  //block this user
                  //save block data to the block_chat table
                  let save_block_data=await queries.block_user_chat(user_id,receiver_id,room,datetime);
                  //if(save_block_data>0){
                    //save to chat list table
                    //do clear chat
                    let room_chat_list=await queries.room_chat_list(room);
                    let clear_chat_update_row_count=0;
                    //if(room_chat_list.length>0){
                      let set_query_case_data="";
                      let query_where_id="";
                      for(var i=0; i<room_chat_list.length; i++){
                        let group_status=JSON.parse(room_chat_list[i].group_status);
                        let message_id=room_chat_list[i].id;
                        for(var j=0; j<group_status.length; j++){
                          if(user_id==group_status[j].user_id){
                            group_status[j].status=2;
                          }
                        }
                        set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                        query_where_id=query_where_id+"'"+message_id+"'"+",";
                        //console.log('new data ', message_id, group_status)
                        //update to db
                        // let update_clear_chat_data=await queries.update_clear_chat(message_id,JSON.stringify(group_status));
                        // //console.log('clear chat status',update_clear_chat_data);
                        // if(update_clear_chat_data.affectedRows>0){
                        //   clear_chat_update_row_count=clear_chat_update_row_count+1;
                        // }
                      }
                      let query_case_data='case '+set_query_case_data+' end'
                      let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                      let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                      //console.log('case data ',query)
                      let update_clear_chat=await queries.update_clear_chat_with_single_query(query);

                      //console.log('total affected row count ',clear_chat_update_row_count);

                      //if(clear_chat_update_row_count>0){
                        // io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: true, statuscode: 200, message: "success"});
                        // //emit individual chat list to user
                        // let sender_chat_list_data=await functions.get_individual_chat_list_response(user_id,receiver_id,room)
                        // io.sockets.in(room+'_'+user_id).emit('message',sender_chat_list_data);
                        //save block message to chat_list
                        //set group status
                        let group_status=[];
                        group_status.push({
                          user_id: user_id,
                          username: await queries.get_username(data.user_id),
                          datetime: datetime,
                          message_status: 0,
                          message_read_status: datetime,
                          status: 1
                        })
                        group_status.push({
                          user_id: receiver_id,
                          username: await queries.get_username(data.receiver_id),
                          datetime: datetime,
                          message_status: 0,
                          message_read_status: datetime,
                          status: 1
                        })
                        //save block message in chat_list
                        let save_block_message=await queries.save_block_message(datetime,user_id,receiver_id,'block','notification',room,0,1,0,0,JSON.stringify(group_status));
                        if(save_block_message>0){
                          console.log('user blocked')
                          io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: true, statuscode: 200, message: "success"});
                          //emit message to room and chat_list  
                          let individual_chat_response=await functions.get_individual_chat_list_response(user_id,receiver_id,room);
                          //do here after
                          io.sockets.in(room+'_'+user_id).emit('message', individual_chat_response);
                          let recent_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                          io.sockets.in(user_id).emit('chat_list', recent_chat_list_response);
                        // }else{
                        //   io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: false, statuscode: 400, message: "Not saved to db"});
                        // }
                      // }else{
                      //   io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: false, statuscode: 400, message: "Not updated to db"});
                      // }

                    // }else{
                    //   //no message to clear
                    //   io.sockets.in(user_id+'_report_and_block_individual').emit('report_and_block_individual_chat',{ status: false, statuscode: 200, message: "No message to clear"});
                    // }
                  }else{
                    io.sockets.in(user_id+'_report_and_block_individual').emit('clear_group_chat',{status: false, statuscode: 400, message: "Not saved to db"});
                  }
                }
              }else{
                io.sockets.in(user_id+'_report_and_block_individual').emit('clear_group_chat',{status: false, statuscode: 400, message: "Not saved to db"});
              }
            }else{
              io.sockets.in(user_id+'_report_and_block_individual').emit('clear_group_chat',{status: false, statuscode: 200, message: "Not user data found"});
            }
            socket.leave(user_id+'_report_and_block_individual');
          }else{
            socket.join(data.user_id+'_report_and_block_individual');
            io.sockets.in(data.user_id+'_report_and_block_individual').emit('clear_group_chat',{status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_report_and_block_individual');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });


    //report_and_left_group_chat
    //input -- {"accessToken":"7520ff1679b65593200acf473d159e5f","user_id":"50","group_id":"group_20221003075515"}
    socket.on('report_and_left_group_chat', async function(data){
      console.log('report and left group')
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && group_id!=''){
            socket.join(user_id+'_report_and_left_group_chat');
            //check user data
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length){
              console.log('user ')
              //add into report_chat table
              let save_report_chat_data=await queries.save_report_chat(user_id,datetime,0,group_id,'group report and left');
              if(save_report_chat_data>0){
                console.log('data saved');
                //check user exist in group
                let check_group_data=await queries.check_group_data(group_id);
                if(check_group_data.length>0){
                  //console.log('yes')
                  let current_group_member=JSON.parse(check_group_data[0].current_members);
                  let check_user_exit_in_group=await functions.check_user_already_member_in_group(user_id,current_group_member);
                  console.log(check_user_exit_in_group)
                  if(check_user_exit_in_group){
                    //do clear chat
                    let status=false;
                    let group_chat_list=await queries.group_chat_list(user_id,group_id);
                    if(group_chat_list.length>0){
                      //let clear_chat_update_row_count=0;
                      //UPDATE chat_list SET status = (case when id = '1' then '622057' when id = '2' then '2913659' when id = '3' then '6160230' end) WHERE id in ('1', '2', '3');
                      let set_query_case_data="";
                      let query_where_id="";
                      for(var i=0; i<group_chat_list.length; i++){
                        let message_id=group_chat_list[i].id
                        let group_status=JSON.parse(group_chat_list[i].group_status);
                        for(var j=0; j<group_status.length; j++){
                          if(group_status[j].user_id==user_id){
                            group_status[j].status=2;
                          }
                        }
                        //console.log(typeof(message_id), 'type')
                        set_query_case_data=set_query_case_data+"when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                        query_where_id=query_where_id+"'"+message_id+"'"+",";
                        //query_where_id=query_where_id.concat('ssss,');
                        // console.log('new data ',message_id,group_status);
                        //update update_clear_chat to db
                        // let update_clear_chat=await queries.update_clear_chat(message_id,JSON.stringify(group_status));
                        // if(update_clear_chat.affectedRows>0){
                        //   //clear_chat_update_row_count=clear_chat_update_row_count+1;
                        //   status=true;
                        // }
                      }
                      let query_case_data='case '+set_query_case_data+' end'
                      //added_users.replace(/,(?=[^,]*$)/, '');
                      let removed_comma=query_where_id.replace(/,(?=[^,]*$)/, '');
                      console.log(query_where_id);
                      console.log(removed_comma)
                     // exit()
                     let query="UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")"
                      console.log('case data ',query)
                      
                       let update_clear_chat=await queries.update_clear_chat_with_single_query(query);
                        console.log(update_clear_chat)
                        if(update_clear_chat.affectedRows>0){
                          status=true;
                        }
                    }
                    //do left group
                    let admin_user_check=false;
                    let user_member_check=false;
                    let check_user_in_group=false;
                    let new_group_members=[];
                    if(current_group_member.length>0){
                      for(var k=0; k<current_group_member.length; k++){
                        if(current_group_member[k].user_id==user_id){
                          check_user_in_group=true;
                        }
                        if(current_group_member[k].user_id==user_id && current_group_member[k].type=='user'){
                          user_member_check=true;
                        }
                        if(current_group_member[k].user_id==user_id && current_group_member[k].type=='admin'){
                          admin_user_check=true;
                        }
                      }
                    }
                    if(check_user_in_group){
                      
                      if(user_member_check){
                        let left_members=check_group_data[0].left_members;
                        console.log('left members ',left_members)
                        if(left_members!=''){
                          left_members=JSON.parse(check_group_data[0].left_members);
                          left_members.push({
                            user_id: user_id,
                            datetime: datetime
                          });
                        }else{
                          left_members=[{
                            user_id: user_id,
                            datetime: datetime
                          }]
                        }
                        if(current_group_member.length>0){
                          //console.log('yes');
                          for(var l=0; l<current_group_member.length; l++){
                            if(current_group_member[l].user_id==user_id){

                            }else{
                              //push other user's new_group_members -- array
                              new_group_members.push({
                                user_id: current_group_member[l].user_id,
                                username: current_group_member[l].username,
                                type: current_group_member[l].type,
                                datetime: current_group_member[l].datetime ? current_group_member[l].datetime : '',
                                added_by: current_group_member[l].added_by
                              })
                            }
                          }
                          console.log('user left after members',new_group_members);
                          //update new current_member's and left_members to db
                          let update_group_user_left_data=await queries.update_group_user_left_data(JSON.stringify(left_members),JSON.stringify(new_group_members),group_id);
                          if(update_group_user_left_data.affectedRows>0){
                            console.log('updated to group list');
                            //save left message to chat list table
                            let group_status=[];
                            for(var m=0; m<current_group_member.length; m++){
                              let message_status=1;
                              let message_read_datetime='';
                              if(current_group_member[m].user_id==user_id){
                                message_status=0;
                                message_read_datetime=datetime;
                              }else{
                                message_status=1;
                                message_read_datetime='';
                              }
                              group_status.push({
                                user_id: current_group_member[m].user_id,
                                username: await queries.get_username(current_group_member[m].user_id),
                                datetime: datetime,
                                message_status: message_status,
                                message_read_status: message_read_datetime,
                                status: 1
                              });
                            }
                            //save left message to chat_list
                            let save_left_message=await queries.save_left_message(datetime,user_id,'left','notification',group_id,1,1,0,1,JSON.stringify(group_status));
                            console.log('save left message ', save_left_message);
                            if(save_left_message>0){
                              console.log('data saved');
                              console.log(group_id+'_'+user_id)
                              io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: true, statuscode: 200, message: "success"})
                              //emit to message and chat_list to user
                              let sender_group_message_response=await functions.get_group_chat_list_response(user_id,group_id);
                              io.sockets.in(group_id+'_'+user_id).emit('message',sender_group_message_response);
                              let sender_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                              io.sockets.in(user_id).emit('chat_list',sender_chat_list_response)
                              //emit to other in the group
                              for(var n=0; n<new_group_members.length; n++){
                                let receiver_group_message_response=await functions.get_group_chat_list_response(new_group_members[n].user_id,group_id);
                                io.sockets.in(group_id+'_'+new_group_members[n].user_id).emit('message',receiver_group_message_response);
                                let receiver_chat_list_response=await functions.get_recent_chat_list_response(new_group_members[n].user_id);
                                io.sockets.in(new_group_members[n].user_id).emit('chat_list',receiver_chat_list_response);
                              }
                            }
                          }
                        }
                      }
                      if(admin_user_check){
                        console.log('user is admin');
                        let left_members=check_group_data[0].left_members;
                        console.log('left members ',left_members)
                        if(left_members!=''){
                          left_members=JSON.parse(check_group_data[0].left_members);
                          left_members.push({
                            user_id: user_id,
                            datetime: datetime
                          });
                        }else{
                          left_members=[{
                            user_id: user_id,
                            datetime: datetime
                          }]
                        }
                        if(current_group_member.length>0){
                          for(var o=0; o<current_group_member.length; o++){
                            //new members
                            if(current_group_member[o].user_id==user_id){

                            }else{
                              new_group_members.push({
                                user_id: current_group_member[o].user_id,
                                username: current_group_member[o].username,
                                type: current_group_member[o].type,
                                datetime: current_group_member[o].datetime ? current_group_member[o].datetime : '',
                                added_by: current_group_member[o].added_by
                              });
                            }
                          }
                          console.log('new group member ', new_group_members)
                          let update_group_user_left_data=await queries.update_group_user_left_data(JSON.stringify(left_members),JSON.stringify(new_group_members),group_id);
                          if(update_group_user_left_data.affectedRows>0){
                            console.log('success')
                            //save left user message to the chat_list
                            let left_group_status=[];
                            for(var p=0; p<current_group_member.length; p++){
                              let message_status;
                              let read_message_datetime;
                              if(current_group_member[p].user_id==user_id){
                                message_status=0;
                                read_message_datetime=datetime;
                              }else{
                                message_status=1;
                                read_message_datetime='';
                              }
                              left_group_status.push({
                                user_id: current_group_member[p].user_id,
                                username: await queries.get_username(current_group_member[p].user_id),
                                datetime: datetime,
                                message_status: message_status,
                                read_message_datetime: read_message_datetime,
                                status: 1
                              });
                            }
                            let save_left_message=await queries.save_left_message(datetime,user_id,'left','notification',group_id,1,1,0,1,JSON.stringify(left_group_status));
                            if(save_left_message>0){
                              console.log('left message saved')
                              // io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: true, statuscode: 200, message: "success"});
                              // //emit to message to left user
                              // let get_senter_group_chat_response=await functions.get_group_chat_list_response(user_id,group_id);
                              // io.sockets.in(group_id+'_'+user_id).emit('message',get_senter_group_chat_response);
                              // let get_senter_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                              // io.sockets.in(user_id).emit('chat_list', get_senter_chat_list_response)
                              
                              //emit for other user if there is no other admin
                              //check group has any other admin
                              let group_admin_count=0;
                              let new_admin_user='';
                              let new_admin_user_member=[];
                              let overall_group_members=JSON.parse(check_group_data[0].members);
                              for(var q=0; q<new_group_members.length; q++){
                                if(new_group_members[q].type=='admin'){
                                  group_admin_count=group_admin_count+1;
                                }else if(new_group_members[q].type=='user'){
                                  new_admin_user=new_group_members[q].user_id;
                                  console.log(new_admin_user)
                                }
                              }
                              console.log('group_admin_count',group_admin_count,new_admin_user,'ssss')
                              if(group_admin_count==0){
                                //console.log(new_admin_user)
                                if(new_admin_user!=''){
                                  for(var r=0; r<new_group_members.length; r++){
                                    console.log('user id ',new_group_members[r].user_id,new_admin_user)
                                    if(new_admin_user==new_group_members[r].user_id){
                                      new_admin_user_member.push({
                                        user_id: new_group_members[r].user_id,
                                        username: new_group_members[r].username,
                                        type: 'admin',
                                        datetime: datetime,
                                        added_by: new_group_members[r].added_by
                                      })
                                      overall_group_members.push({
                                        user_id: new_group_members[r].user_id,
                                        username: new_group_members[r].username,
                                        type: 'admin',
                                        datetime: datetime,
                                        added_by: new_group_members[r].added_by
                                      })
                                    }else{
                                      new_admin_user_member.push({
                                        user_id: new_group_members[r].user_id,
                                        username: new_group_members[r].username,
                                        type: new_group_members[r].type,
                                        datetime: new_group_members[r].datetime,
                                        added_by: new_group_members[r].added_by
                                      });
                                    }
                                  }
                                  //save group admin data
                                  console.log(new_admin_user_member)
                                  //exit()
                                  let save_group_admin_data=await queries.save_group_admin_data(JSON.stringify(new_admin_user_member),JSON.stringify(overall_group_members),group_id)
                                  if(save_group_admin_data.affectedRows>0){
                                    console.log('make user as new admin')
                                    //save admin message to chat list
                                    let admin_group_status=[];
                                    for(var s=0; s<new_admin_user_member.length; s++){
                                      let admin_message_status;
                                      let admin_message_read_datetime;
                                      if(new_admin_user_member[s].user_id==new_admin_user){
                                        admin_message_status=0;
                                        admin_message_read_datetime=datetime;
                                      }else{
                                        admin_message_status=1;
                                        admin_message_read_datetime='';
                                      }
                                      admin_group_status.push({
                                        user_id: new_admin_user_member[s].user_id,
                                        username: await queries.get_username(current_group_member[s].user_id),
                                        datetime: datetime,
                                        message_status: admin_message_status,
                                        read_message_datetime: admin_message_read_datetime,
                                        status: 1
                                      })
                                    }
                                    let save_admin_message=await queries.save_admin_message(datetime,user_id,'admin','notification',group_id,1,1,0,1,JSON.stringify(admin_group_status));
                                    if(save_admin_message>0){
                                      console.log('admin message is saved to db');
                                      io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: true, statuscode: 200, message: "success"});
                                      //emit messages and chat list to all user in the group
                                      for(var u=0; u<new_admin_user_member.length; u++){
                                        let receiver_group_chat_response=await functions.get_group_chat_list_response(new_admin_user_member[u].user_id,group_id);
                                        io.sockets.in(group_id+'_'+new_admin_user_member[u].user_id).emit('message',receiver_group_chat_response);
                                        let receiver_chat_list_response=await functions.get_recent_chat_list_response(new_admin_user_member[u].user_id);
                                        io.sockets.in(new_admin_user_member[u].user_id).emit('chat_list',receiver_chat_list_response);
                                      }
                                    }else{
                                      console.log('admin message not saved to db')
                                      io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 400, message: "Admin message not saved"})
                                    }
                                  }else{
                                    console.log('not')
                                    io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 400, message: "Admin user not updated"})
                                  }
                                }
                              }else{
                                io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: true, statuscode: 200, message: "success"});
                                let senter_chat_response=await functions.get_group_chat_list_response(user_id, group_id);
                                io.sockets.in(group_id+'_'+user_id).emit('message', senter_chat_response)
                                let get_senter_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                                io.sockets.in(user_id).emit('chat_list', get_senter_chat_list_response)
                                for(var r=0; r<new_group_members.length; r++){
                                  if(new_group_members[r].user_id!=user_id){
                                    let receiver_chat_response=await functions.get_group_chat_list_response(new_group_members[r].user_id, group_id);
                                    io.sockets.in(group_id+'_'+new_group_members[r].user_id).emit('message', receiver_chat_response)
                                    let get_receiver_chat_list_response=await functions.get_recent_chat_list_response(new_group_members[r].user_id);
                                    io.sockets.in(new_group_members[r].user_id).emit('chat_list', get_receiver_chat_list_response)
                                  }
                                }
                              }
                            }else{
                              console.log('left message not saved')
                              io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 400, message: "Left message not saved"})
                            }
                          }else{
                            console.log('failed');
                            io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 400, message: "Left user not updated"})
                          }
                        }
                      }
                    }
                  }else{
                    io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 200, message: "Your not a member in this group"})
                  }
                }else{
                  io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 200, message: "No group data found"})
                }
              }else{
                //console.log('data not saved'); 
                io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 400, message: "Not saved to db"})
              }
            }else{
              io.sockets.in(user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 200, message: "No user data found"})
            }
            socket.leave(user_id+'_report_and_left_group_chat');
          }else{
            socket.join(data.user_id+'_report_and_left_group_chat');
            io.sockets.in(data.user_id+'_report_and_left_group_chat').emit('report_and_left_group_chat', {status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_report_and_left_group_chat');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    })

    //pin chat
    socket.on('pin_chat', async function(data){
      //console.log('pin_chat')
      //input -- {"user_id": "50", "accessToken": "50","receiver_id":"53","room":""}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let receiver_id=data.receiver_id ? data.receiver_id : '';
          let room=data.room ? data.room : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && receiver_id!='' && room!=''){
            //console.log('not empty')
            socket.join(user_id+'_pin_chat');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length!=0){
              //check total pin chat count
              let get_total_pin_chat_count=await queries.total_pin_chat_count(user_id);
              if(get_total_pin_chat_count.length<3){
                //check room user is pinned or not
                let check_room_is_pinned=await queries.check_room_is_pinned(user_id,room);
                //console.log(check_receiver_is_pinned)
                if(check_room_is_pinned.length>0){
                  io.sockets.in(user_id+'_pin_chat').emit('pin_chat', {status: false, statuscode: 200, message: "Already pinned"})
                }else{
                  //save to pin chat 
                  let save_pinchat=await queries.save_pin_chat(user_id,receiver_id,room,datetime);
                  if(save_pinchat>0){
                    io.sockets.in(user_id+'_pin_chat').emit('pin_chat', {status: true, statuscode: 200, message: "Pinned"})
                    //emit recent chat list
                    let recent_chat_list=await functions.get_recent_chat_list_response(user_id);
                    io.sockets.in(user_id).emit('chat_list',recent_chat_list)
                  }else{
                    io.sockets.in(user_id+'_pin_chat').emit('pin_chat', {status: false, statuscode: 400, message: "Not saved to db"})
                  }
                }
                
              }else{
                io.sockets.in(user_id+'_pin_chat').emit('pin_chat', {status: false, statuscode: 200, message: "Pin chat limit is three"})
              }
            }else{
              io.sockets.in(user_id+'_pin_chat').emit('pin_chat', {status: false, statuscode: 400, message: "No user data found"})
            }
            socket.leave(user_id+'_pin_chat');
          }else{
            //console.log('empty')
            socket.join(data.user_id+'_pin_chat');
            io.sockets.in(data.user_id+'_pin_chat').emit('pin_chat', {status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_pin_chat');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    //unpin_chat
    socket.on('unpin_chat', async function(data){
      //console.log('unpin_chat')
      //input -- {"user_id": "50", "accessToken": "50","receiver_id":"53","room":""}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let receiver_id=data.receiver_id ? data.receiver_id : '';
          let room=data.room ? data.room : '';
          let datetime=get_datetime();
          if(user_id!='' && accessToken!='' && receiver_id!='' && room!=''){
            //console.log('not empty')
            socket.join(user_id+'_unpin_chat');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length!=0){
              //check total pin chat count
              
                //check room user is pinned or not
                let check_room_is_pinned=await queries.check_room_is_pinned(user_id,room);
                if(check_room_is_pinned.length>0){
                  //delete pin_chat entry
                  let delete_pin_chat=await queries.unpin_chat(user_id,room);
                  //console.log(delete_pin_chat);
                  if(delete_pin_chat.affectedRows>0){
                    io.sockets.in(user_id+'_unpin_chat').emit('unpin_chat', {status: true, statuscode: 200, message: "Unpinned"})
                    //emit recent chat list
                    let recent_chat_list=await functions.get_recent_chat_list_response(user_id);
                    io.sockets.in(user_id).emit('chat_list',recent_chat_list)
                  }else{
                    io.sockets.in(user_id+'_unpin_chat').emit('unpin_chat', {status: false, statuscode: 200, message: "Not deleted from pin chat"})
                  }
                }else{
                  io.sockets.in(user_id+'_unpin_chat').emit('unpin_chat', {status: false, statuscode: 200, message: "Not pinned"})
                }
                
              
            }else{
              io.sockets.in(user_id+'_unpin_chat').emit('unpin_chat', {status: false, statuscode: 400, message: "No user data found"})
            }
            socket.leave(user_id+'_unpin_chat');
          }else{
            //console.log('empty')
            socket.join(data.user_id+'_unpin_chat');
            io.sockets.in(data.user_id+'_unpin_chat').emit('unpin_chat', {status: false, statuscode: 200, message: "No data found"});
            socket.leave(data.user_id+'_unpin_chat');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    socket.on('test', async function(data){
      socket.join(data.user_id);
      io.sockets.in(data.user_id).emit('test',{status: true, statuscode: 200, message:"Test success"})
    });
    //get_group_user_list
    //input {"user_id":"50","accessToken":"7520ff1679b65593200acf473d159e5f","group_id":"group_20220929161238"}
    socket.on('get_group_user_list', async function(data){
      //console.log('unpin_chat')
      //input -- {"user_id": "50", "accessToken": "50","receiver_id":"53","room":""}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          if(user_id!='' && accessToken!='' && group_id!=''){
            //console.log('not empty')
            socket.join(user_id+'_user_list');
            let get_group_info_response=await functions.get_group_info(user_id,accessToken,group_id);
            io.sockets.in(user_id+'_user_list').emit('get_group_user_list',{status: true, statuscode:200, message:'success'});
            io.sockets.in(user_id+'_user_list').emit('get_group_user_list', get_group_info_response);
            //socket.leave(user_id+'_user_list');
          }else{
            //console.log('empty')
            socket.join(data.user_id+'_user_list');
            io.sockets.in(data.user_id+'_user_list').emit('get_group_user_list', {status: false, statuscode: 200, message: "No data found", data:[]});
            socket.leave(data.user_id+'_user_list');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });

    socket.on('room_chat_list_details', async function(data){
      //console.log('room_chat_list_details')
      //input -- {"sid": "50", "rid": "50","room":""}
      try{
        if(typeof(data)=='object'){
          //console.log(data)
          let user_id=data.sid ? data.sid : '';
          //let accessToken=data.accessToken ? data.accessToken : '';
          let rid=data.rid ? data.rid : '';
          let room=data.room ? data.room : '';
          
          //console.log('not empty')
          if(room!=''){
            //console.log('group',room+'_'+user_id)
            
            let get_group_chat_list_response=await functions.get_group_chat_list_response(user_id,room);
            //console.log(get_individual_chat_list_response)
            io.sockets.in(room+'_'+user_id).emit('message', get_group_chat_list_response);
          }else{
            //console.log('private')
            if (Number(user_id) > Number(rid)) {
              //console.log('ssss')
              room = '' + rid+user_id;
              //console.log('room id in if' + room);
            } else {
              room = '' + user_id + rid;
              //console.log('room id in else', room);
            }
            let get_individual_chat_list_response=await functions.get_individual_chat_list_response(user_id,rid,room);
            //console.log(get_individual_chat_list_response)
            io.sockets.in(room+'_'+user_id).emit('message', get_individual_chat_list_response);
          }
          //socket.leave(user_id+'_user_list');
          
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e)
      }
    });
    socket.on('read', async function(data){
      try{
        if(typeof(data)=='object'){
          //console.log('read');
          let user_id=data.sid ? data.sid : '';
          //let accessToken=data.accessToken ? data.accessToken : '';
          let rid=data.rid ? data.rid : '';
          let room=data.room ? data.room : '';
          let current_datetime=get_datetime();
          //console.log('not empty')
          if(room!=''){
            console.log('group');
            let set_user_id='"'+user_id+'"';
            let unread_message_count=0;
            let unread_message=0;
            //update remove mark_as_unread status
            let update_mark_as_unread_status=await functions.update_mark_as_unread_status(user_id,room);
            let get_all_group_messages=await queries.group_chat_response(user_id,set_user_id,room)
            //console.log(get_all_group_messages)
            for(var i=0; i<get_all_group_messages.length; i++){
              //console.log(get_all_group_messages[i].id)
              if(get_all_group_messages[i].message_status==1){
                let id=get_all_group_messages[i].id;
                console.log('not readed');
                let group_status=get_all_group_messages[i].group_status;
                if(group_status!=''){
                  group_status=JSON.parse(get_all_group_messages[i].group_status);
                }else{
                  group_status=[];
                }
                //to get message unread count
                for(var get_unread_count=0; get_unread_count<group_status.length; get_unread_count++){
                  if(group_status[get_unread_count].message_status==1){
                    unread_message=unread_message+1;
                  }
                }
                for(var j=0; j<group_status.length; j++){
                  if(group_status[j].message_status==1 && group_status[j].user_id==user_id){
                    group_status[j].message_status=0;
                    group_status[j].message_read_datetime=current_datetime;
                    unread_message_count=unread_message_count+1;
                  }
                }
                console.log('unread_message_count ',unread_message_count,'unread_message ',unread_message)
                if(unread_message==unread_message_count){
                  console.log('all message')
                  let update_read_message_status=await queries.update_group_message_as_read(current_datetime,JSON.stringify(group_status),id);
                  console.log(update_read_message_status);
                  if(update_read_message_status.affectedRows>0){
                    console.log('success')
                  }else{
                    console.log('not updated to db')
                  }
                }else{
                  console.log('single user message')
                  let update_read_message_status=await queries.update_group_message_as_read_for_single_user(JSON.stringify(group_status),id);
                  console.log(update_read_message_status)
                  if(update_read_message_status.affectedRows>0){
                    console.log('success')
                  }else{
                    console.log('not updated to db')
                  }
                }
              }else{
                //console.log('message already readed ', get_all_group_messages[i].id)
              }
            }
          }else{
            
            //console.log('private')
            if (Number(user_id) > Number(rid)) {
              //console.log('ssss')
              room = '' + rid+user_id;
              //console.log('room id in if' + room);
            } else {
              room = '' + user_id + rid;
              //console.log('room id in else', room);
            }
            //update remove mark_as_unread status
            let update_mark_as_unread_status=await functions.update_mark_as_unread_status(user_id,room);
            //console.log('group')
            let update_individual_message_as_read=await queries.update_individual_message_as_read(current_datetime,rid,room)
            if(update_individual_message_as_read.affectedRows>0){
              console.log('updated')
            }else{
              console.log('not updated')
            }
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });
    //started message
    socket.on('starred_message',async function (data){
      console.log('started');
      //{"user_id":"50","accessToken":"50","receiver_id":"6","message_id":"511,512"}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let receiver_id=data.receiver_id ? data.receiver_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let message_id=data.message_id ? data.message_id : '';
          let current_datetime=get_datetime();
          let room;
          let private_group_status;
          //console.log('not empty')
          if(user_id!='' && accessToken!='' && message_id!=''){
            // if (Number(user_id) > Number(receiver_id)) {
            //   room = '' + receiver_id+user_id;
            // } else {
            //   room = '' + user_id + receiver_id;
            // }
            socket.join(user_id+'_starred');
            //check user data
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check message_id is valued
              //split message_id data
              let check_message_valid_status=false;
              let updated_starred_msg_count=0;
              let split_message_id=message_id.split(',');
              console.log('splited values',split_message_id);
              for(var i=0; i<split_message_id.length; i++){
                console.log(split_message_id[i])

                check_message_valid_status=true;
                let check_message_id=await queries.check_message_id(split_message_id[i]);
                if(check_message_id.length>0){
                  room=check_message_id[0].room;
                  private_group_status=check_message_id[0].private_group;
                  //console.log(check_message_id);
                  let group_status=JSON.parse(check_message_id[0].group_status);
                  console.log(group_status)
                  //add starred_status--1 and starred_datetime to the group_status
                  for(var j=0; j<group_status.length; j++){
                    //console.log(group_status[j].user_id)
                    if(group_status[j].user_id==user_id){
                      group_status[j].starred_status=1;
                      group_status[j].starred_datetime=current_datetime;
                    }
                  }
                  //console.log('star',split_message_id[i],group_status)
                  //update to db
                  let update_starred_message=await queries.update_chat_group_status(JSON.stringify(group_status),split_message_id[i]);
                  if(update_starred_message.affectedRows>0){
                    updated_starred_msg_count=updated_starred_msg_count+1;
                  }
                }
                
              }

              if(check_message_valid_status){
                //console.log('count',updated_starred_msg_count,room+'_'+user_id)
               // exit()
                if(updated_starred_msg_count>0){
                  io.sockets.in(data.user_id+'_starred').emit('starred_message', {status: true, statuscode: 200, message: "success"});
                  //emit to the user 
                  if(private_group_status==1){
                    //group
                    let chat_list_details=await functions.get_group_chat_list_response(user_id,room)
                    io.sockets.in(room+'_'+user_id).emit('message',chat_list_details)
                  }else{
                    //private
                    let chat_list_details=await functions.get_individual_chat_list_response(user_id,receiver_id,room);
                    io.sockets.in(room+'_'+user_id).emit('message',chat_list_details)
                    //console.log('success')
                  }
                  
                }else{
                  io.sockets.in(data.user_id+'_starred').emit('starred_message', {status: false, statuscode: 400, message: "Not updated to db"});
                }
              }else{
                io.sockets.in(data.user_id+'_starred').emit('starred_message', {status: false, statuscode: 200, message: "No message data found"});
              }
              
            }else{
              io.sockets.in(data.user_id+'_starred').emit('starred_message', {status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_starred');
          }else{
            socket.join(data.user_id+'_starred');
            io.sockets.in(data.user_id+'_starred').emit('starred_message', {status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id+'_starred');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });

    //unstarted message
    socket.on('unstarred_message',async function (data){
      console.log('unstarted');
      //{"user_id":"50","accessToken":"50","receiver_id":"6","message_id":"511,512"}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let receiver_id=data.receiver_id ? data.receiver_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let message_id=data.message_id ? data.message_id : '';
          let current_datetime=get_datetime();
          let room;
          let private_group_status;
          //console.log('not empty')
          if(user_id!='' && accessToken!='' && message_id!=''){
            socket.join(user_id+'_unstarred');
            //check user data
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check message_id is valued
              //split message_id data
              let check_message_valid_status=false;
              let updated_unstarred_msg_count=0;
              let split_message_id=message_id.split(',');
              //console.log('splited values',split_message_id);
              for(var i=0; i<split_message_id.length; i++){
                //console.log(split_message_id[i])

                check_message_valid_status=true;
                let check_message_id=await queries.check_message_id(split_message_id[i]);
                if(check_message_id.length>0){
                  room=check_message_id[0].room;
                  private_group_status=check_message_id[0].private_group;
                  //console.log(check_message_id);
                  let group_status=JSON.parse(check_message_id[0].group_status);
                  //console.log(group_status)
                  //add starred_status--1 and starred_datetime to the group_status
                  for(var j=0; j<group_status.length; j++){
                    //console.log(group_status[j].user_id)
                    if(group_status[j].user_id==user_id){
                      group_status[j].starred_status=0;
                      group_status[j].starred_datetime=current_datetime;
                    }
                  }
                  //console.log('star',split_message_id[i],group_status)
                  //update to db
                  let update_unstarred_message=await queries.update_chat_group_status(JSON.stringify(group_status),split_message_id[i]);
                  if(update_unstarred_message.affectedRows>0){
                    updated_unstarred_msg_count=updated_unstarred_msg_count+1;
                  }
                }
                
              }

              if(check_message_valid_status){
                //console.log('count',updated_starred_msg_count,room+'_'+user_id)
               // exit()
                if(updated_unstarred_msg_count>0){
                  io.sockets.in(data.user_id+'_unstarred').emit('unstarred_message', {status: true, statuscode: 200, message: "success"});
                  //emit to the user 
                  if(private_group_status==1){
                    //group
                    let chat_list_details=await functions.get_group_chat_list_response(user_id,room)
                    io.sockets.in(room+'_'+user_id).emit('message',chat_list_details)
                  }else{
                    //private
                    let chat_list_details=await functions.get_individual_chat_list_response(user_id,receiver_id,room);
                    io.sockets.in(room+'_'+user_id).emit('message',chat_list_details)
                    //console.log('success')
                  }
                  
                }else{
                  io.sockets.in(data.user_id+'_unstarred').emit('unstarred_message', {status: false, statuscode: 400, message: "Not updated to db"});
                }
              }else{
                io.sockets.in(data.user_id+'_unstarred').emit('unstarred_message', {status: false, statuscode: 200, message: "No message data found"});
              }
              
            }else{
              io.sockets.in(data.user_id+'_unstarred').emit('unstarred_message', {status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_unstarred');
          }else{
            socket.join(data.user_id+'_unstarred');
            io.sockets.in(data.user_id+'_unstarred').emit('unstarred_message', {status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id+'_unstarred');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });

    //archived_chat_list
    socket.on('archived_chat_list', async function (data){
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let room=data.room ? data.room : '';
          let current_datetime=get_datetime();
          if(user_id!='' && accessToken!='' && room!=''){
            socket.join(user_id+'_archived');
            //check user is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check user is already archived
              let check_user_archived=await queries.check_user_is_archived(user_id,room);
              if(check_user_archived.length>0){
                //data already exist
                io.sockets.in(user_id+'_archived').emit('archived_chat_list', {status: false, statuscode: 200, message: "Already you archived this chat"});
              }else{
                //insert to archived_chat_list 
                let save_archived_chat_list=await queries.save_archived_chat_list(user_id,current_datetime,room);
                if(save_archived_chat_list>0){
                  io.sockets.in(user_id+'_archived').emit('archived_chat_list', {status: true, statuscode: 200, message: "success"});
                  //emit to chat_list
                  let recent_chat_list_response=await functions.get_recent_chat_list_response(user_id);
                  io.sockets.in(user_id).emit('chat_list',recent_chat_list_response);
                }else{
                  io.sockets.in(user_id+'_archived').emit('archived_chat_list', {status: false, statuscode: 400, message: "Not saved to db"});
                }
              }
            }else{
              io.sockets.in(user_id+'_archived').emit('archived_chat_list', {status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_archived');
          }else{
            socket.join(data.user_id+'_archived');
            io.sockets.in(data.user_id+'_archived').emit('archived_chat_list', {status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id+'_archived');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });
    socket.on("testing",async function(data){
      socket.join(data.user_id+'testing');
      io.sockets.in(data.user_id+'testing').emit('testing',{status:true,statuscode:200,message:"testing successfull"})
    })
    //unarchived_chat_list
    socket.on('unarchived_chat_list', async function(data){
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let room=data.room ? data.room : '';
          let current_datetime=get_datetime();
          if(user_id!='' && accessToken!='' && room!=''){
            socket.join(user_id+'_unarchived');
            //check user is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //check user is already archived
              let check_user_archived=await queries.check_user_is_archived(user_id,room);
              if(check_user_archived.length>0){
                //data already exist
                //delete the entry to unarchived
                let id=check_user_archived[0].id;
                let unarchived_chat_list=await queries.delete_archived_chat_list(id);
                console.log(unarchived_chat_list);
                if(unarchived_chat_list.affectedRows>0){
                  io.sockets.in(user_id+'_unarchived').emit('unarchived_chat_list', {status: true, statuscode: 200, message: "success"});
                  //emit chat_list to user
                  let recent_chat_list=await functions.get_recent_chat_list_response(user_id);
                  io.sockets.in(user_id).emit('chat_list',recent_chat_list);
                }else{
                  io.sockets.in(user_id+'_unarchived').emit('unarchived_chat_list', {status: false, statuscode: 400, message: "Not removed from db"});
                }
              }else{
                //no data found
                io.sockets.in(user_id+'_unarchived').emit('unarchived_chat_list', {status: false, statuscode: 200, message: "Room is not archived"});
              }
            }else{
              io.sockets.in(user_id+'_unarchived').emit('unarchived_chat_list', {status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_unarchived');
          }else{
            socket.join(data.user_id+'_unarchived');
            io.sockets.in(data.user_id+'_unarchived').emit('unarchived_chat_list', {status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id+'_unarchived');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });
    //remove group admin
    socket.on('remove_group_admin', async function(data){
      //console.log('remove group admin')
      //input -- {"user_id":"50","accessToken":"50","group_id":"","remove_admin_id":""}
      try{
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let group_id=data.group_id ? data.group_id : '';
          let remove_admin_id=data.remove_admin_id ? data.remove_admin_id : '';
          if(user_id!='' && accessToken!='' && group_id!='' && remove_admin_id!=''){
            socket.join(user_id+'_remove_group_admin');
            //check user is valid
            let check_user_is_valid=await queries.check_user_valid(user_id,accessToken);
            //console.log(check_user_is_valid)
            if(check_user_is_valid.length>0){
              //check group is valid
              let check_group_data=await queries.check_group_data(group_id);
              //console.log(check_group_data);
              if(check_group_data.length>0){
                let created_by=check_group_data[0].created_by;
                //check user is admin in the group
                let current_members=JSON.parse(check_group_data[0].current_members);
                //console.log(current_members);
                let check_user_exist_in_group=await functions.check_group_user_is_admin(user_id,current_members);
                //console.log(check_user_exist_in_group)
                if(check_user_exist_in_group){
                  //check remove admin exist in group
                  let check_remove_admin_data=await functions.check_group_user_is_admin(remove_admin_id,current_members);
                  if(check_remove_admin_data){
                    //check removed user is created this group or not
                    if(remove_admin_id==created_by){
                      let username=await queries.get_username(remove_admin_id);
                      io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "You can't dismiss "+username+" as admin because they created this group"});
                    }else{
                      //remove this user from current members
                      for(var i=0; i<current_members.length; i++){
                        if(current_members[i].user_id==remove_admin_id){
                          current_members[i].type='user';
                        }
                      }
                      //console.log(current_members);
                      //update group data
                      let update_group_data=await queries.update_group_current_member(group_id,JSON.stringify(current_members));
                      //console.log(update_group_data)
                      if(update_group_data.affectedRows>0){
                        io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: true, statuscode: 200, message: "success"});
                        let get_group_info_response=await functions.get_group_info(user_id,accessToken,group_id);
                        io.sockets.in(user_id+'_user_list').emit('get_group_user_list',get_group_info_response);
                        //emit to receiver side
                        for(var j=0; j<current_members.length; j++){
                          console.log(current_members[j].user_id)
                          
                          if(current_members[j].user_id!=user_id){
                            let get_group_user_accessToken=await queries.get_access_token(current_members[j].user_id)
                            //console.log('access token',get_group_user_accessToken[0].accessToken)
                            let get_group_info_response_for_receiver=await functions.get_group_info(current_members[j].user_id,get_group_user_accessToken[0].accessToken,group_id);
                            io.sockets.in(current_members[j].user_id+'_user_list').emit('get_group_user_list',get_group_info_response);
                          }
                        }
                      }else{
                        io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "Not updated in db"});
                      }
                    }
                  }else{
                    io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "Remove user is not an admin"});
                  }
                }else{
                  io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "You're not an admin"});
                }
              }else{
                io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "No group data found"});
              }
            }else{
              io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_remove_group_admin');
          }else{
            socket.join(data.user_id+'_remove_group_admin');
            io.sockets.in(data.user_id+'_remove_group_admin').emit('remove_group_admin',{status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id+'_remove_group_admin');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });

    //socket io mark as read
    socket.on('mark_as_read',async function (data){
      try{
        //{"user_id":"50","accessToken":"50","room":"550,group_202303141437479924"}
        console.log('mark as read');
        if(typeof(data)=='object'){
          let user_id=data.user_id ? data.user_id : '';
          let accessToken=data.accessToken ? data.accessToken : '';
          let room=data.room ? data.room : '';
          let current_datetime=get_datetime();
          if(user_id!='' && accessToken!='' && room!=''){
            socket.join(user_id+'_mark_as_read');
            //check user data is valid
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              let split_room=room.split(',');
              //console.log(split_room)
              if(split_room.length>0){
                let rooms='';
                let other_users=[];
                for(var i=0; i<split_room.length; i++){
                  console.log('room',split_room[i])
                  rooms=rooms+"'"+split_room[i]+"',";
                }
                rooms=rooms.replace(/,(?=[^,]*$)/, '');
                console.log(rooms);
                //get room unread messages
                let group_status_case_query='';
                let read_datetime_case_query='';
                let where_query='';
                let message_status_case_query='';
                let unread_count=0;
                let room_unread_messages=await queries.room_unread_messages(rooms);
                if(room_unread_messages.length>0){
                  //console.log(room_unread_messages,room_unread_messages.length)
                  for(var j=0; j<room_unread_messages.length; j++){
                    //console.log('id ',room_unread_messages[j].id)
                      let group_status=JSON.parse(room_unread_messages[j].group_status);
                      //console.log('old',group_status);
                      let set_status=false;
                      if(room_unread_messages[j].private_group==0){
                          for(var k=0; k<group_status.length; k++){
                            //console.log('user id ',group_status[k].user_id)
                            if(user_id==group_status[k].user_id && group_status[k].message_status==1){
                              group_status[k].message_status=0;
                              group_status[k].message_read_datetime=current_datetime;
                              set_status=true;
                            }
                          }
                        //console.log('new ',group_status)
                        if(set_status){
                          //add opponent user to the array
                          let opponent_user_id='';
                          if(room_unread_messages[j].senter_id==user_id){
                            opponent_user_id=room_unread_messages[j].receiver_id;
                          }else{
                            opponent_user_id=room_unread_messages[j].senter_id;
                          }
                          //check user exist in ther other_user array
                          //in private message, there is no need to check
                          other_users.push({
                            user_id: opponent_user_id.toString(),
                            receiver_id: user_id,
                            room: room_unread_messages[j].room,
                            type: 'private'
                          });
                          unread_count=unread_count+1;
                          group_status_case_query=group_status_case_query+"when id='"+room_unread_messages[j].id+"' then '"+JSON.stringify(group_status)+"' ";
                          read_datetime_case_query=read_datetime_case_query+"when id='"+room_unread_messages[j].id+"' then '"+current_datetime+"' ";
                          message_status_case_query=message_status_case_query+"when id='"+room_unread_messages[j].id+"' then '0' ";
                          where_query=where_query+"'"+room_unread_messages[j].id+"',"
                          //message_status_query=
                          //console.log(true+' - '+room_unread_messages[j].id)
                        }
                      }else{
                        
                        //group
                        //console.log('group')
                        let total_unread_users=0;
                        let message_unread_count=0;
                        for(var total_unread_i=0; total_unread_i<group_status.length; total_unread_i++){
                          if(group_status[total_unread_i].message_status==1){
                            total_unread_users=total_unread_users+1;
                          }
                        }
                        for(var k=0; k<group_status.length; k++){
                          //console.log('user id ',group_status[k].user_id)
                          if(user_id==group_status[k].user_id && group_status[k].message_status==1){
                            group_status[k].message_status=0;
                            group_status[k].message_read_datetime=current_datetime;
                            set_status=true;
                            message_unread_count=message_unread_count+1;
                          }
                          if(set_status){
                            //add users and room to other_users arrays
                            if(user_id!=group_status[k].user_id){
                              other_users.push({
                                user_id: group_status[k].user_id,
                                receiver_id: '0',
                                room: room_unread_messages[j].room,
                                type: 'group'
                              })
                            }
                          }
                        }
                        console.log(room_unread_messages[j].id+' - '+total_unread_users+' - '+message_unread_count)
                        if(set_status){
                          
                          unread_count=unread_count+1;
                          if(total_unread_users==message_unread_count){
                            console.log('equal',current_datetime)
                            group_status_case_query=group_status_case_query+"when id='"+room_unread_messages[j].id+"' then '"+JSON.stringify(group_status)+"' ";
                            read_datetime_case_query=read_datetime_case_query+"when id='"+room_unread_messages[j].id+"' then '"+current_datetime+"' ";
                            message_status_case_query=message_status_case_query+"when id='"+room_unread_messages[j].id+"' then '0' ";
                            where_query=where_query+"'"+room_unread_messages[j].id+"',"
                          }else{
                            console.log('not equal',current_datetime)
                            group_status_case_query=group_status_case_query+"when id='"+room_unread_messages[j].id+"' then '"+JSON.stringify(group_status)+"' ";
                            read_datetime_case_query=read_datetime_case_query+"when id='"+room_unread_messages[j].id+"' then '' ";
                            message_status_case_query=message_status_case_query+"when id='"+room_unread_messages[j].id+"' then '1' ";
                            where_query=where_query+"'"+room_unread_messages[j].id+"',"
                          }
                          //message_status_query=
                          //console.log(true+' - '+room_unread_messages[j].id)
                        }
                      }
                  }
                  //set query
                  //UPDATE chat_list SET status = (case when id = '1' then '622057' when id = '2' then '2913659' when id = '3' then '6160230' end) WHERE id in ('1', '2', '3');
                  console.log(unread_count)
                  if(unread_count>0){
                    where_query=where_query.replace(/,(?=[^,]*$)/, '');
                    let query="update chat_list set message_status=(case "+message_status_case_query+" end),message_read_datetime=(case "+read_datetime_case_query+" end),group_status=(case "+group_status_case_query+" end) where id in ("+where_query+")";
                    //console.log(query);
                    //console.log(current_datetime)
                    //update query
                    let update_data=await queries.execute_update_query(query);
                    console.log(update_data)
                    if(update_data.affectedRows>0){
                      io.sockets.in(user_id+'_mark_as_read').emit('mark_as_read',{status: true, statuscode: 200, message: "success"});
                      //emit to chat list
                      let user_recent_chat_list=await functions.get_recent_chat_list_response(user_id);
                      io.sockets.in(user_id).emit('chat_list', user_recent_chat_list);
                      console.log(other_users)
                      if(other_users.length>0){
                        for(var m=0; m<other_users.length; m++){
                          //emit to users chat list
                          if(other_users[m].type=='private'){
                            let receiver_room_chat_list=await functions.get_individual_chat_list_response(other_users[m].user_id,other_users[m].receiver_id,other_users[m].room);
                            io.sockets.in(other_users[m].room+'_'+other_users[m].user_id).emit('message',receiver_room_chat_list);
                            //emit to recent chat_list
                            let receiver_recent_chat_list=await functions.get_recent_chat_list_response(other_users[m].user_id);
                            io.sockets.in(other_users[m].user_id).emit('chat_list',receiver_recent_chat_list);
                          }else if(other_users[m].type=='group'){
                            let receiver_room_chat_list=await functions.get_group_chat_list_response(other_users[m].user_id,other_users[m].room);
                            io.sockets.in(other_users[m].room+'_'+other_users[m].user_id).emit('message',receiver_room_chat_list);
                            //emit to recent chat_list
                            let receiver_recent_chat_list=await functions.get_recent_chat_list_response(other_users[m].user_id);
                            io.sockets.in(other_users[m].user_id).emit('chat_list',receiver_recent_chat_list);
                          }
                        }
                      }
                    }else{
                      io.sockets.in(user_id+'_mark_as_read').emit('mark_as_read',{status: false, statuscode: 400, message: "Not updated to db"});
                    }
                  }else{
                    io.sockets.in(user_id+'_mark_as_read').emit('mark_as_read',{status: false, statuscode: 200, message: "No message to update"});
                  }
                }else{
                  io.sockets.in(user_id+'_mark_as_read').emit('mark_as_read',{status: false, statuscode: 200, message: "No message to update"});
                }
              }else{
                io.sockets.in(user_id+'_mark_as_read').emit('mark_as_read',{status: false, statuscode: 200, message: "No room data found"});
              }
            }else{
              io.sockets.in(user_id+'_mark_as_read').emit('mark_as_read',{status: false, statuscode: 200, message: "No user data found"})
            }
            socket.leave(user_id+'_mark_as_read');
          }else{
            //console.log('else')
            socket.join(data.user_id+'_mark_as_read');
            //console.log(io.sockets.adapter.rooms)
            io.sockets.in(data.user_id+'_mark_as_read').emit('mark_as_read',{status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id+'_mark_as_read');
          }
        }else{
          console.error('Input type is string');
        }
      }catch(e){
        console.error(e);
      }
    });

    //mark as unread option
    socket.on('mark_as_unread',async function(data){
      try{
        //{"user_id":"50","accessToken":"50","room":"550,group_202303141437479924"}
        //console.log('mark as unread')
        if(typeof(data)=='object'){
          let user_id=data.user_id;
          let accessToken=data.accessToken;
          let room=data.room;
          if(user_id!='' && accessToken!='' && room!=''){
            socket.join(user_id+'_mark_as_unread');
            //check user data
            let check_user_data=await queries.check_user_valid(user_id,accessToken);
            if(check_user_data.length>0){
              //slipt rooms
              let split_rooms=room.split(',');
              if(split_rooms.length>0){
                let rooms='';
                for(var i=0; i<split_rooms.length; i++){
                  //console.log('room',split_rooms[i])
                  rooms=rooms+"'"+split_rooms[i]+"',";
                }
                rooms=rooms.replace(/,(?=[^,]*$)/, '');
                //console.log(rooms);
                //get last message of each room
                let get_last_room_messages=await queries.get_last_room_messages(rooms);
                //console.log('last room messages ',get_last_room_messages);
                let group_status_case_query='';
                let where_case_query='';
                let mark_as_unread_count=0;
                for(var i=0; i<get_last_room_messages.length; i++){
                  let message_id=get_last_room_messages[i].id;
                  let group_status=JSON.parse(get_last_room_messages[i].group_status);
                  //console.log(get_last_room_messages[i].id,group_status);
                  for(var j=0; j<group_status.length; j++){
                    if(group_status[j].user_id==user_id){
                      mark_as_unread_count=mark_as_unread_count+1;
                      //console.log('sssss');
                      if('mark_as_unread' in group_status[j]){
                        //console.log('yes mark_as_unread exist')
                        //add mark as unread key and set it as 1
                        group_status[j].mark_as_unread=1;
                      }else{
                        //console.log('mark_as_unread nnnn')
                        group_status[j].mark_as_unread=1;
                      }
                    }
                  }
                  group_status_case_query=group_status_case_query+" when id='"+message_id+"' then '"+JSON.stringify(group_status)+"'";
                  where_case_query=where_case_query+"'"+message_id+"', "
                  console.log(get_last_room_messages[i].id,group_status);
                }
                console.log(mark_as_unread_count);
                if(mark_as_unread_count>0){
                  //update to db
                  where_case_query=where_case_query.replace(/,(?=[^,]*$)/, '');
                  console.log(group_status_case_query);
                  let query="UPDATE chat_list SET group_status = (case "+group_status_case_query+" end) WHERE id in ("+where_case_query+")";
                  let update_data=await queries.mark_as_unread(query);
                  console.log(update_data);
                  if(update_data.affectedRows>0){
                    io.sockets.in(user_id+'_mark_as_unread').emit('mark_as_unread',{status: true, statuscode: 200, message: "success"});
                    //emit recent chat list to user
                    let user_recent_chat_list=await functions.get_recent_chat_list_response(user_id);
                    io.sockets.in(user_id).emit('chat_list',user_recent_chat_list);
                  }else{
                    io.sockets.in(user_id+'_mark_as_unread').emit('mark_as_unread',{status: false, statuscode: 400, message: "Not updated to db"});
                  }
                }else{
                  io.sockets.in(user_id+'_mark_as_unread').emit('mark_as_unread',{status: false, statuscode: 200, message: "No data to update"});
                }
              }else{
                io.sockets.in(user_id+'_mark_as_unread').emit('mark_as_unread',{status: false, statuscode: 200, message: "No room data found"});
              }
            }else{
              io.sockets.in(user_id+'_mark_as_unread').emit('mark_as_unread',{status: false, statuscode: 200, message: "No user data found"});
            }
            socket.leave(user_id+'_mark_as_unread');
          }else{
            socket.join(data.user_id+'_mark_as_unread');
            io.sockets.in(data.user_id+'_mark_as_unread').emit('mark_as_unread',{status: false, statuscode: 200, message: "Data is empty"});
            socket.leave(data.user_id);
          }
        }else{
          console.error('Input type is string');
        }
      }catch{
        console.error(e)
      }
    });
    socket.on('delete_chat_list',async function(data){

    });
  }catch(error){
      //console.log(error)
      console.error('error occurs ', error);
  }

});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});