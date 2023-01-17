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
  //res.sendFile(__dirname + '/index.html');
  res.send('hello world')
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
const botName = 'Smart_Station_Bot';
const port = process.env.PORT || 3001;
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
  function  get_datetime() {
  var current_date = new Date();
  var date = current_date.toISOString().slice(0, 10);
  console.log(date);
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

io.sockets.on('connection', function (socket) {
  console.log("socket::");
  // chat room
  socket.on('room', async function (room_data) {
    console.log('test socket client',io.engine.clientsCount)
    try{
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
        io.emit('w_message', formatMessage(botName, 'Welcome to SmartStation Group Chat'));
        // Broadcast when a user connects
        socket.broadcast
          .to(user.room)
          .emit(
            'broadcast_message',
            formatMessage(botName, `${user.s_id} has joined the chat`)
          );
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
          io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": data_array });
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
            io.sockets.in(newRoom+'_'+room_data.sid).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": data_array });
        }
      }
    }catch(e){
      //dashLogger.error(`Error : ${e}`);
    }
  });
  socket.on('set_online_users', async function (data) {
    var s_id = data.sid;
    soc[s_id] = socket.id;
    var last_seen = get_datetime();
    console.log('get date time',last_seen);
    var update_query = await queries.update_online_status(last_seen,s_id);
    //console.log(update_query);
  })
  //not converted
  socket.on('check_online_users', function (data) {
    console.log('sockets',soc);
    if (soc[data.rid] != undefined) {
      //console.log('user is online')
      var last_seen = get_datetime();
      var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + data.sid + "'";
      //con.query(update_query, function (err, result) {
        var select = "select online_status,last_seen from user where id='" + data.sid + "'";
        //con.query(select, function (err, result) {
          io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
      //   })
      // })
    } else {
      // console.log('user is offline');
      var select = "select online_status,DATE_FORMAT(last_seen,'%Y-%m-%d %H:%i:%s') as last_seen from user where id='" + data.sid + "'";
      //con.query(select, function (err, result) {
        io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
      //})
    }
  })
  
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
    console.log(e)
  }
  });

  socket.on('chat_list1', function (input) {
    user_id = input.user_id;
    var accessToken = input.accessToken;
    if (user_id != '' && accessToken != '') {
      soc[user_id] = socket.id;
      if (soc[user_id] != undefined) {
        var last_seen = get_datetime();
        var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + user_id + "'";
        con.query(update_query, function (err, result) {
          console.log(result)
        })
      }
      var check_user = "SELECT * FROM user WHERE id='" + user_id + "' AND accessToken='" + accessToken + "'";
      con.query(check_user, function (err, result) {
        //if user exist
        if (result != '') {
          //get messages
          var get_messages = "select t1.id ,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.message,t1.message_type,if(ISNULL(t6.unread_message),0,t6.unread_message) as unread_message,case t1.senter_id when '" + user_id + "' then t4.id else t3.id end as userid,case t1.senter_id when '" + user_id + "' then t4.name else t3.name end as name,case t1.senter_id when '" + user_id + "' then t4.profile_pic else t3.profile_pic end as profile from chat_list t1 join (SELECT room, MAX(id) max_id FROM chat_list GROUP BY room)t2 on t1.id = t2.max_id and t1.room = t2.room join `user` t3 on t3.id=t1.senter_id join `user` t4 on t1.receiver_id=t4.id left join (select sum(t5.message_status) as unread_message, t5.room from `chat_list` t5 where t5.senter_id!='" + user_id + "' GROUP BY t5.room )t6 on t6.room=t1.room where t1.senter_id='" + user_id + "' or t1.receiver_id='" + user_id + "' ORDER BY id DESC"
          console.log('get messages', get_messages)
          con.query(get_messages, function (err, result) {
            console.log(result)
            var array = [];
            console.log("getmessages ")
            for (var i = 0; i < result.length; i++) {
              if (result[i].message_type == 'date') {
                result[i].type = 'date';
                console.log('first ', result[i].type)
              }
              var a = {
                "id": result[i].id, "date": result[i].date, "message": result[i].message, "userid": result[i].userid,
                "name": result[i].name, "message_type": result[i].message_type, "profile": base_url + result[i].profile, "unread_message": result[i].unread_message.toString(),
                "type": result[i].type
              }
              array.push(a);
            }
            console.log(array);
            socket.join(user_id);
            //sending response to the user
            io.sockets.in(user_id).emit('chat_list1', { "status": "true", "statuscode": "200", "message": "success", "data": array });
          })
        }
      })
    }
  })

  socket.on('typing_individual', function (data) {
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
  })

  socket.on('dis', async function (input) {
    console.log('inside disconnect')
    var s_id = input.s_id;
    console.log('[socket]', 'leave room :');
    var last_seen = get_datetime();
    console.log(s_id)
    // var update_query = "update user set online_status='0',last_seen='" + last_seen + "' where id='" + s_id + "'";
    // con.query(update_query, function (err, result) {
    //   console.log(result);
    //   var select = "select online_status,last_seen from user where id='" + s_id + "'";
    //   con.query(select, function (err, result) {
    //     io.sockets.in(s_id).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
    //   })
    // })

    //update offline status to db
    let update_offline_status=await queries.update_online_offline_status(input.s_id,last_seen,0)

    //emit to other user's room
    
    soc.splice(input.s_id, 1);
    console.log(soc)
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
      // let user_data = {
      //   user_id: input.user_id,
      //   accessToken: input.accessToken
      // }
      // console.log(user_data)
      socket.join(input.user_id)
      // axios({
      //   method: 'post',
      //   url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/getrecent_chat',
      //   data: user_data,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   }
      // }).then(res => {
      //   console.log(res)
      //   var out = res.data
      //   console.log('responsedata', out);
      //   socket.join(input.user_id)
      //   io.in(input.user_id).emit('chat_list', out);
      // }).catch((err) => {
      //   console.log(err)
      // })
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
    }catch(e){
      //dashLogger.error(`Error : ${e}`);
      let set_response={
        status: true,
        statuscode: 200,
        message: 'Error found',
        data: []
      }
      io.sockets.in(input.user_id).emit('chat_list', set_response);
    }
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
    }catch(e){
      console.log(e)
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
              }else{
                //group message
                //send emit message to sender -- who deleted the message
                let message_response_for_sender_group=await functions.get_group_chat_list_response(data.user_id,sender_room);
                io.sockets.in(data.user_id+'_delete_message').emit('message', message_response_for_sender_group); 
                //emit chat list
              }
              //send emit message to receiver
              for(var emit_user_i=0; emit_user_i<emit_user.length;emit_user_i++){
                console.log(emit_user[emit_user_i])
                if(emit_user[emit_user_i].type==0){
                  //private
                  let message_response_for_receiver=await functions.get_individual_chat_list_response(emit_user[emit_user_i].rid,data.user_id,sender_room);
                  //emit to normal room
                  io.sockets.in(data.user_id,sender_room).emit('message', message_response_for_receiver); 
                  //emit chat list
                }else{
                  //group
                  let message_response_for_receiver=await functions.get_group_chat_list_response(emit_user[emit_user_i].rid,sender_room);
                  //emit to normal room
                  io.sockets.in(data.user_id,sender_room).emit('message', message_response_for_receiver); 
                  //emit chat list
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
      
      
  }catch(e){
    console.log(e)
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
  function get_chat_list_for_opponent(user_id, accessToken) {
    socket.on('chat_list', function (input) {
      console.log(input)
      let user_data = {
        user_id: user_id,
        accessToken: accessToken
      }
      console.log(user_data)
      axios({
        method: 'post',
        url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/getrecent_chat',
        data: user_data,
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(res => {
        console.log(res)
        var out = res.data
        console.log('responsedata', out);
        socket.join(input.user_id)

        io.in(input.user_id).emit('chat_list', out);

      }).catch((err) => {
        console.log(err)
      })
    })
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    var sid = msg.sid;
    var room = msg.room;
    var type = msg.type;
    var message = msg.message;
    var current_date = new Date();
    var date = current_date.toISOString().slice(0, 10);
    var datetime = get_datetime();
    var qur = "SELECT * FROM `chat_list` t1 JOIN group_list t2 on date(t1.date)=date(t2.created_datetime) where t1.room='" + room + "' and t2.group_id='" + room + "' and date(t1.date)='" + date + "'";
    //var qur="SELECT * FROM `chat_list` t1 JOIN group_list t2 on date(t1.date)!=date(t2.created_datetime) where t1.room='"+room+"' and t2.group_id='"+room+"' and date(t1.date)='"+date+"'";
    console.log(qur);
    con.query(qur, function (err, result) {
      console.log('messages with length', result);
      if (result.length > 0) {
        var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + room + "'";
        con.query(get_group_users, function (err, result) {
          var group_status_array = []
          console.log('group users', result)
          result.forEach(element => {
            console.log('members', element.members)
            var group_members = JSON.parse(element.members);
            //group_status_array=group_members;
            group_members.forEach(members => {
              console.log('member name', members.username)
              group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })

            })
          });

          console.log('testing ', group_status_array)
          var member_json_data = JSON.stringify(group_status_array);
          if (type == 'text') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','text','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {
            })
          } else if (type == 'image') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','image','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {
            })
          } else if (type == 'voice') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','voice','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {

            })
          } else if (type == 'video') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','video','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {

            })
          } else {
            type = '';
          }
        })
      } else {
        var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + room + "'";
        con.query(get_group_users, function (err, result) {
          var group_status_array = []
          console.log('group users', result)
          result.forEach(element => {
            console.log('members', element.members)

            var group_members = JSON.parse(element.members);
            //group_status_array=group_members;
            group_members.forEach(members => {
              console.log('member name', members.username)
              group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })

            })
          });

          console.log('testing ', group_status_array)
          var member_json_data = JSON.stringify(group_status_array);
          var a = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','date','','" + room + "','0','1','" + member_json_data + "')"
          con.query(a, function (err, result) {

          });

          if (type == 'text') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','text','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {
 
            })
          } else if (type == 'image') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','image','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {

            })
          } else if (type == 'voice') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','voice','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {

            })

          } else if (type == 'video') {
            var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','" + message + "','video','" + room + "','1','1','" + member_json_data + "')"
            con.query(quer, function (err, result) {

            })

          } else {
            type = '';
          }
        })
      }
    })
    io.in(user.room).emit('chatMessage', formatMessage(user.sid, message));
  });
/////////////////////////////////////////////////////////////////////////////////////////////////
  // Runs when client disconnects
  socket.on('disconnect_grp', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.userid} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
  socket.on('type_group', async function (data) {
    console.log('type_group')
    try{
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
    }catch(e){
      //dashLogger.error(`Error : ${e}`);
    }
      
   
  })
  //group chat
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});