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
    return online_user_room_data.some(function(online_user_array){
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
            if (soc[room_data.rid] != undefined) {
              console.log('user is online')
              //const results = db.sequelize.query("UPDATE user SET online_status = '1', last_seen='" + last_seen + "' WHERE id = '" + room_data.sid + "'");
              // old query var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + room_data.sid + "'";
              //get online status to emit
              var online_s=await queries.select_online_status(room_data.rid);
              console.log('140 in app.js',online_s)
            // try{
                console.log('online user', newRoom)
                let data_array=[{
                  online_status:1,
                  last_seen: online_s[0].last_seen
                }]
              //io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": online_s[0][0].online_status, "last_seen": online_s[0][0].last_seen });
              //io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": online_s });
              io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": "1", "last_seen": online_s[0].last_seen});
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
                io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": "0", "last_seen": online_s[0].last_seen});
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
      try{

      var s_id = data.sid;
      var r_id = data.rid;
      var message = data.message;
      var type = data.type;
      var duration=data.duration;
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
      //  console.log('x is here',x[0][0]['created_date']); 
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
          for(var group_user=0; group_user<group_current_members.length; group_user++){
            group_status_array.push({ user_id: group_current_members[group_user].user_id, username: group_current_members[group_user].username, datetime: group_current_members[group_user].datetime, message_status: 1, message_read_datetime: "", status: 1 })
          }
          
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
          await queries.post_text_message(datetime,s_id,message,data.room,member_json_data,message_id)
          }else if(type=='image'){
          await queries.post_image_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='voice'){
            await queries.post_voice_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
          }else if(type=='doc'){
            await queries.post_doc_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='video'){
            await queries.post_video_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
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
            await queries.post_text_message(datetime,s_id,message,data.room,member_json_data,message_id)
          }else if(type=='image'){
            await queries.post_image_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='voice'){
            await queries.post_voice_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
          }else if(type=='doc'){
            await queries.post_doc_message(datetime,s_id,message,data.room,member_json_data,message_id) 
          }else if(type=='video'){
            await queries.post_video_message(datetime,s_id,message,data.room,member_json_data,duration,message_id) 
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
        
        //emit chat_list to the senter
        let get_recent_chat_response_senter=await functions.get_recent_chat_list_response(data.sid);
        io.sockets.in(data.sid).emit('chat_list',get_recent_chat_response_senter);
        console.log(io.sockets.adapter.rooms)
        //send push notification
        //console.log('group_current_members', group_current_members)
        let group_chat_push_notification= await functions.group_chat_push_notification(data.sid,data.room,group_current_members,data.message,data.type);
      } else {
        //individual chat
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

        //check message_id exist for replay_id
        let message_id=0;
        if(data.message_id){
          message_id=data.message_id;
        }
        console.log('testing room line 327', room)
          //replay message
          if(data.message_id){
            var group_status_data = [{
              "user_id": data.sid,
              "username": "",
              "datetime": datetime,
              "message_status": 0,
              "message_read_datetime": datetime,
              "status": 1
            }, {
              "user_id": data.rid,
              "username": "",
              "datetime": datetime,
              "message_status": 0,
              "message_read_datetime": "",
              
              "status": 1
            }]
            var group_status_json_data = JSON.stringify(group_status_data);
            var get_receiver_details=await queries.get_receiver_details(data.rid)
              console.log("get_receiver_details",get_receiver_details[0][0].name)
              var recever_name=get_receiver_details[0][0].name;
              var receiver_priofile=get_receiver_details[0][0].profile_pic;
              console.log(get_receiver_details[0][0].profile_pic,get_receiver_details[0][0].name)
              var get_messages=await queries.get_indv_messages(data.rid,room)
              console.log("get_messages",get_messages)
              if(get_messages!=''){
                var R_datetime=get_datetime()
                var update=await queries.reply_update(R_datetime,room,data.rid)
                get_messages.forEach(elements=>{
                  //console.log("sid",elements[0].senter_id)
                  var replay_id='0';
                  var message='';          
                  var message_type='';
                  var forward_id='0';
                  var forward_message_count='0';
                  var forward_message_status="";
                  var get_date=get_datetime();

                })
              }
              
              ///

            // var R_datetime=get_datetime()
            // var replay_qur="INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status,replay_id) VALUES ('" + R_datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','text','" + room + "','1','" + group_status_json_data + "','"+data.message_id+"')";
            // con.query(replay_qur,function(err,result){
            // })
          }
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
        console.log('individual date length',individual_Date.length)
        
          var group_status_data = [{
            "user_id": data.sid,
            "username": "",
            "datetime": datetime,
            "message_status": 0,
            "message_read_datetime": datetime,
            "status": 1
          }, {
            "user_id": data.rid,
            "username": "",
            "datetime": datetime,
            "message_status": 0,
            "message_read_datetime": "",
            "status": 1
          }]
          var group_status_json_data = JSON.stringify(group_status_data);
          if (individual_Date.length > 0) {
            if (type == 'text') {
              var result=await queries.individual_text_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,message_id)
            }
            else if (type == 'image') {
              var result=await queries.individual_image_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,message_id) 
            }
            else if (type == "voice") {
              var result=await queries.individual_voice_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,duration,message_id)
            }
            else if (type == "doc") {
              var result=await queries.individual_doc_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,duration,message_id) 
            }
            else if (type == "video") {
              var result=await queries.individual_video_msg(datetime,data.sid,data.rid,message,room,group_status_json_data,duration,message_id)
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
              await queries.individual_text_msg(datetime, datasid, datarid, message, room, group_status_json_data,message_id)
            }
            else if (type == 'image') {
              await queries.individual_image_msg(datetime, data.sid, data.rid, message, room, group_status_json_data,message_id)
            }
            else if (type == "voice") {
              await queries.individual_voice_msg(datetime, data.sid, data.rid, message, room, group_status_json_data, duration,message_id)
            }
            else if (type == "doc") {
              await queries.individual_doc_msg(datetime, data.sid, data.rid, message, room, group_status_json_data,message_id)
            }
            else if (type == "video") {
              await queries.individual_video_msg(datetime, data.sid, data.rid, message, room, group_status_json_data, duration,message_id)
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
          let individual_chat_list_response_receiver=await functions.get_individual_chat_list_response(data.rid,data.sid,room);
          //console.log(sockets,socket.id)
          //io.sockets.sockets[0].emit('message',sender_function_test_data)
          //socket.to(room).emit('message',sender_function_test_data);

          //io.sockets.in(room).emit('message',individual_chat_list_response);
          //io.sockets.connected[socketid]
          //io.sockets.socket.id.emit('message','hello')
          //let receiver_function_test_data=await functions.get_individual_chat_list_response(data.rid,data.sid,room)
          //io.sockets.in(room).emit('message', individual_chat_list_response);
          io.sockets.in(room+'_'+data.sid).emit('message',individual_chat_list_response_sender);
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
          //get recent chat response
          let get_recent_chat_response_receiver=await functions.get_recent_chat_list_response(data.rid);
          //io.sockets.in(room+'_'+data.rid).emit('chat_list', get_recent_chat_response_receiver)
          io.sockets.in(data.rid).emit('chat_list', get_recent_chat_response_receiver)
          let get_recent_chat_response_senter=await functions.get_recent_chat_list_response(data.sid);
          //io.sockets.in(room+'_'+data.sid).emit('chat_list', get_recent_chat_response_senter);
          io.sockets.in(data.sid).emit('chat_list', get_recent_chat_response_senter);
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

        //emit to other user's in the room when he/she disconnect

        if(online_user_room_data.length>0){
          console.log('user in the room', online_user_room_data)
          for(var i=0; i<online_user_room_data.length; i++){
            console.log('initial loop',i)
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
                io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "online_status": "0", "last_seen": last_seen})
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
        console.log(input)
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
            
            
            //emit online_users -- to show user is online
            console.log(`online user's room `,online_user_room_data)
            if(online_user_room_data.length>0){
              //console.log('sssss')
              for(var i=0; i<online_user_room_data.length; i++){
                if(input.user_id==online_user_room_data[i].sid || input.user_id==online_user_room_data[i].rid){
                  //console.log('yes')
                  if(input.user_id!=online_user_room_data[i].sid){
                    //console.log('emit online user ',online_user_room_data[i].room+'_'+online_user_room_data[i].sid)
                    io.sockets.in(online_user_room_data[i].room+'_'+online_user_room_data[i].sid).emit('online_users',{"status": "true", "statuscode": "200", "message": "success", "online_status": "1", "last_seen": datetime})
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
      //try{
        console.log('exit group member', data);
        if(typeof(data)=='object'){
          socket.join(data.group_id+'_'+data.user_id+'_left');
          //check user_id and accessToken are valided
          if(data.user_id!='' && data.accessToken!='' && data.receiver_id!=''){
            let check_user_data=await queries.check_user_valid(data.user_id,data.accessToken);
            if(check_user_data.length>0){
              //check group is valid
              let check_group_data=await queries.check_group_data(data.group_id);
              //console.log(check_group_data)
              if(check_group_data.length>0){
                let date_time=get_datetime();
                let new_group_members=[];
                let group_current_members=JSON.parse(check_group_data[0].current_members);
                let admin_user_check=false;
                let user_member_check=false;
                let check_user_in_group=false;
                let left_admin_update_status=false;
                if(group_current_members.length>0){
                  for(var i=0; i<group_current_members.length; i++){
                    console.log(group_current_members[i].user_id)
                    if(group_current_members[i].user_id==data.user_id){
                      check_user_in_group=true;
                    }
                    if(group_current_members[i].user_id==data.user_id && group_current_members[i].type=='user'){
                      user_member_check=true;
                    }
                    if(group_current_members[i].user_id==data.user_id && group_current_members[i].type=='admin'){
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
                        user_id: data.user_id,
                        datetime: date_time
                      })
                    }else{
                      console.log('left user is empty')
                      left_members=[{
                        user_id: data.user_id,
                        datetime: date_time
                      }]
                    }
                    if(group_current_members.length>0){
                      for(var j=0; j<group_current_members.length; j++){
                        //new_group_members
                        //console.log(group_current_members[j])
                        if(data.user_id==group_current_members[j].user_id){
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
                    let update_group_user_left_data=await queries.update_group_user_left_data(left_members_json_data,new_group_members_json_data,data.group_id);
                    console.log(update_group_user_left_data);
                    if(update_group_user_left_data.affectedRows>0){
                      console.log('updated to db')
                      //save new entry to chat_list table
                      let senter_id=data.user_id;
                      let message='left';
                      let message_type='notification';
                      let room=data.group_id;
                      let message_status=1;
                      let status=1;
                      let online_status=0;
                      let private_status=1;
                      let group_status=[];
                      for(var k=0; k<group_current_members.length; k++){
                        let message_status;
                        let message_read_datetime;
                        if(data.user_id==group_current_members[k].user_id){
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
                        left_admin_update_status=true;
                        io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                      }else{
                        io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not saved to db"});
                      }
                    }else{
                      io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not updated in db"});
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
                        user_id: data.user_id,
                        datetime: date_time
                      })
                    }else{
                      console.log('left user is empty')
                      left_members=[{
                        user_id: data.user_id,
                        datetime: date_time
                      }]
                    }

                    if(group_current_members.length>0){
                      for(var j=0; j<group_current_members.length; j++){
                        //new_group_members
                        if(data.user_id==group_current_members[j].user_id){
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
                    let update_group_user_left_data=await queries.update_group_user_left_data(left_members_json_data,new_group_members_json_data,data.group_id);
                    console.log(update_group_user_left_data);
                    if(update_group_user_left_data.affectedRows>0){
                      console.log('updated to db')
                      //save new entry to chat_list table
                      let senter_id=data.user_id;
                      let message='left';
                      let message_type='notification';
                      let room=data.group_id;
                      let message_status=1;
                      let status=1;
                      let online_status=0;
                      let private_status=1;
                      let group_status=[];
                      for(var k=0; k<group_current_members.length; k++){
                        let message_status;
                        let message_read_datetime;
                        if(data.user_id==group_current_members[k].user_id){
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
                          console.log('group admin ', group_admin_count,'new admin user ', new_admin_user);
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
                                    datetime: new_group_members[n].datetime,
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
                              console.log(new_admin_user_member, overall_group_members)
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
                                let senter_id=data.user_id;
                                let message='admin';
                                let message_type='notification';
                                let room=data.group_id;
                                let message_status=1;
                                let status=1;
                                let online_status=0;
                                let private_status=1;
                                let save_admin_message=await queries.save_admin_message(date_time,senter_id,message,message_type,room,message_status,status,online_status,private_status,JSON.stringify(group_status));
                                if(save_admin_message>0){
                                  console.log('admin message saved')
                                  left_admin_update_status=true;
                                  io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: true, statuscode: 200, message: "success"});
                                }else{
                                  io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Admin message not saved to db"});
                                }
                              }else{
                                io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Group admin not saved to db"});
                              }
                            }
                          }
                        }
                      }else{
                        io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not saved to db"});
                      }
                    }else{
                      io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 400, message: "Not updated in db"});
                    }
                  }
                  console.log('left admin update status ', left_admin_update_status)
                  if(left_admin_update_status){
                    //emit message to the user
                    let sender_group_chat_response=await functions.get_group_chat_list_response(data.user_id,data.group_id);
                    io.sockets.in(data.group_id+'_'+data.user_id).emit('message',sender_group_chat_response);
                  }else{

                  }
                }else{
                  io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "You are not in this group"})
                }
              }else{
                io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "No group data found"})
              }
            }else{
              io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "No user data found"})
            }
          }else{
            io.sockets.in(data.group_id+'_'+data.user_id+'_left').emit('exit_group_member',{ status: false, statuscode: 200, message: "No data found"})
          }
          socket.leave(data.group_id+'_'+data.user_id+'_left');
        }else{
          console.error('Input type is string');
        }
      // }catch(e){
      //   console.error(e)
      // }
    });
  }catch(error){
      console.log(error)
      console.error('error occurs ', error);
  }

});





http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});