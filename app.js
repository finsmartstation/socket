const { Console, count } = require('console');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const { getVideoDurationInSeconds } = require('get-video-duration')
const { response } = require('express');
require('events').EventEmitter.defaultMaxListeners = Infinity;
const { futimesSync } = require('fs');
const superagent = require('superagent');
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
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

const con = require('./db_connection');
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
const botName = 'Smart_Station_Bot';
const port = process.env.PORT || 3000;
// var user_id='';
var s_id = '';
var r_id = '';
var sid = '';
var rid = '';
var room = '';
var newRoom = '';
var user
var date_status = 0;
var base_url = "http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/";
// var base_url="http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api";
var soc = [];
var val;
// function getDuration(message) {
//   getVideoDurationInSeconds(
//     message
//   ).then((duration) => {
//     console.log('video duration', duration)
    
//   })
// }
// var x= getDuration('http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/uploads/9895555183/FILE_20221017_104010.mp4');
// console.log('duration out',x)


function get_datetime() {
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

// getAudioDurationInSeconds('http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/uploads/9995781411/FILE_20221020_095011.m4a')

async function get_username_by_id(id) {
  var a = [];
  con.query("select name from `user` where id='" + id + "'", async (err, result) => {
    if (err) {
      throw err
    } else {
      console.log(result);
      //a=result;
      a.push(result)
    }
    console.log('insider', a)
    await a;
  })
  console.log('outer', a)
  return await a;
}

io.sockets.on('connection', function (socket) {
  console.log("socket::");
  //individual chat
  socket.on('room', function (room_data) {
    s_id = room_data.sid;
    r_id = room_data.rid;
    var room = room_data.room;
    if (room_data.room) {
      const user = userJoin(socket.id, room_data.sid, room);
      socket.join(user.room);
      last_seen = get_datetime();
      var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + s_id + "'";
      con.query(update_query, function (err, result) {
      })
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
      //addon
      console.log('sender & receiver', typeof s_id, typeof r_id)
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
      //addon
      console.log("room::", room)
      socket.join(room);
      console.log('joined room', room);
      socket.room = room;
      newRoom = socket.room;
      console.info(socket.id + ' joined room ', room, socket.room);
      io.sockets.in(socket.room).emit('room_notification', `'joined room-' ${room}`);
      var s_id = room_data.sid;
      soc[room_data.rid] = socket.id;
      console.log('sockets', soc);
      var last_seen = get_datetime();
      var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + room_data.sid + "'";
      con.query(update_query, function (err, result) {
      })
      if (soc[room_data.rid] != undefined) {
        console.log('user is online')
        var last_seen = get_datetime();

        var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + room_data.sid + "'";
        console.log(update_query)
        con.query(update_query, function (err, result) {
          console.log('test ', room_data.sid)
          var select = "select online_status,DATE_FORMAT(last_seen,'%Y-%m-%d %H:%i:%s') as last_seen from user where id='" + room_data.rid + "'";
          con.query(select, function (err, result) {
            console.log('if result', select)
            io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "online_status": result[0].online_status.toString(), "last_seen": result[0].last_seen });
          })

        })
      } else {
        console.log('user is offline now');
        var select = "select online_status,DATE_FORMAT(last_seen,'%Y-%m-%d %H:%i:%s') as last_seen from user where id='" + room_data.rid + "'";
        con.query(select, function (err, result) {

          io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
        })
      }
    }
  });
  socket.on('set_online_users', function (data) {
    var s_id = data.sid;
    soc[s_id] = socket.id;
    var last_seen = get_datetime();
    var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + s_id + "'";
    con.query(update_query, function (err, result) {
    })
  })

  socket.on('check_online_users', function (data) {
    //console.log('sockets',soc);
    if (soc[data.rid] != undefined) {
      //console.log('user is online')
      var last_seen = get_datetime();
      var update_query = "update user set online_status='1',last_seen='" + last_seen + "' where id='" + data.sid + "'";
      con.query(update_query, function (err, result) {
        var select = "select online_status,last_seen from user where id='" + data.sid + "'";
        con.query(select, function (err, result) {
          io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
        })
      })
    } else {
      // console.log('user is offline');
      var select = "select online_status,DATE_FORMAT(last_seen,'%Y-%m-%d %H:%i:%s') as last_seen from user where id='" + data.sid + "'";
      con.query(select, function (err, result) {
        io.sockets.in(newRoom).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
      })
    }
  })
  socket.on('message', function (data) {
    var s_id = data.sid;
    var r_id = data.rid;
    var message = data.message;
    var type = data.type;
    var duration=data.duration;
    var message_id=data.message_id;
    // var room=data.room;
    if (data.room) {
      //group chat
      var current_date = new Date();
      var date = current_date.toISOString().slice(0, 10);
      var datetime = get_datetime();
      var qur = "SELECT t1.created_datetime as created_date, t2.count FROM `group_list` t1 JOIN (select COUNT(*) as count from `chat_list` WHERE date(date)='" + date + "' and room='" + data.room + "') t2 where t1.group_id='" + data.room + "'"
      // var qur="SELECT t1.*,t2.* FROM `chat_list` t1 join `group_list` t2 on t1.room='"+data.room+"' and date(t1.date)='"+date+"' and t1.room=t2.group_id and date(t2.created_datetime)='"+date+"'";
      // var qur="SELECT date(t1.created_datetime) as created_date, t2.count FROM `group_list` t1 JOIN (select COUNT(*) as count from `chat_list` WHERE date(date)='"+date+"' and room='"+data.room+"') t2 where t1.group_id='"+data.room+"'";
      //SELECT date(t1.created_datetime) as created_date, t2.count FROM `group_list` t1 JOIN (select COUNT(*) as count from `chat_list` WHERE date(date)='2022-09-14' and room='group_20220819095422') t2 where t1.group_id='group_20220819095422'
      console.log(qur)
      con.query(qur, function (err, result) {
        console.log(result)
        var group_created_date_time = result[0].created_date
        var group_created_date = group_created_date_time.toISOString().slice(0, 10)
        var today_message_count = result[0].count;
        console.log('test ', date, group_created_date, today_message_count)
        if (date == group_created_date && today_message_count == 0) {
          console.log('testing succed')
        } else {
          console.log('failed')
        }
         /////replay message
         var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + data.room + "'";
          con.query(get_group_users, function (err, result) {
            var group_status_array = []
            result.forEach(element => {
              var group_members = JSON.parse(element.members);
              group_members.forEach(members => {
                group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })
              })
            });
            var member_json_data = JSON.stringify(group_status_array);

         if(data.message_id){
          console.log('inrep')
          var R_datetime=get_datetime()
          var replay_qur="INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status,replay_id) VALUES ('" + R_datetime + "','" + data.sid + "','0','" + data.message + "','text','" + data.room + "','1','" + member_json_data + "','"+data.message_id+"')";
         con.query(replay_qur,function(err,result){
          })
        //  var replay_message={"message_id":message_id,"message":data.message,"senter_id":data.sid,"receiver_id":data.rid,"type":data.type}
        //  io.sockets.in(data.room).emit('replay_message',replay_message);
         }
        })
        ///////////////// replay_message end
        
        if ((date == group_created_date && today_message_count >= 0) || (date != group_created_date && today_message_count > 0)) {
          var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + data.room + "'";
          con.query(get_group_users, function (err, result) {
            var group_status_array = []
            result.forEach(element => {
              var group_members = JSON.parse(element.members);
              group_members.forEach(members => {
                group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })
              })
            });
            var member_json_data = JSON.stringify(group_status_array);
           
            if (type == 'text') {
              var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','text','" + data.room + "','1','1','" + member_json_data + "')"
              con.query(quer, function (err, result) {

              })
            } else if (type == 'image') {
              var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','image','" + data.room + "','1','1','" + member_json_data + "')"
              con.query(quer, function (err, result) {

              })
            } else if (type == 'voice') {
              // getAudioDurationInSeconds(message).then((duration) => {
                // console.log(duration);
                var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','voice','" + data.room + "','1','1','" + member_json_data + "','"+duration+"')"
                con.query(quer, function (err, result) {
                })
              //  }) 
            } else if (type == 'doc') {
              var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','doc','" + data.room + "','1','1','" + member_json_data + "')"
              con.query(quer, function (err, result) {

              })
            } else if (type == 'video') {
              
                var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,duration) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','video','" + room + "','1','1','" + member_json_data + "','"+duration+"')"
                con.query(quer, function (err, result) {
                })
              //  })
            } else {
              type = '';
            }
          })
        } else {
          var get_group_users = "SELECT * FROM `group_list` WHERE group_id='" + data.room + "'";
          con.query(get_group_users, function (err, result) {
            var flag = 0;
            var group_status_array = []
            //  console.log('group users',result)
            result.forEach(element => {
              //  console.log('members',element.members);
              var group_members = JSON.parse(element.members);
              //group_status_array=group_members;
              group_members.forEach(members => {
                //  console.log('member name',members.username)
                group_status_array.push({ "user_id": members.user_id, "username": members.username, "datetime": members.datetime, "message_status": 1, "message_read_datetime": "", "status": 1 })

              })
            });
            console.log('testing ', group_status_array)
            var member_json_data = JSON.stringify(group_status_array);
            var a = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','','date','" + data.room + "','0','1','" + member_json_data + "')"
            con.query(a, function (err, result) {

            });

            if (type == 'text') {
              var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','text','" + data.room + "','1','1','" + member_json_data + "')"
              con.query(quer, function (err, result) {

              })
            } else if (type == 'image') {
              var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','image','" + data.room + "','1','1','" + member_json_data + "')"
              con.query(quer, function (err, result) {

              })
              flag = flag + 1;
            } else if (type == 'voice') {
                // getAudioDurationInSeconds(message).then((duration) => {
                // console.log(duration)
                var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','voice','" + data.room + "','1','1','" + member_json_data + "','"+data.duration+"')"
                con.query(quer, function (err, result) {
                })
              //  })
              flag = flag + 1;
            } else if (type == 'doc') {
              var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','" + message + "','doc','" + data.room + "','1','1','" + member_json_data + "')"
              con.query(quer, function (err, result) {

              })
              flag = flag + 1;

            } else if (type == 'video') {
                var quer = "INSERT INTO chat_list(date,senter_id,receiver_id,message,message_type,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" +s_id+ "','0','" + message + "','video','" + data.room + "','1','1','" + member_json_data + "','"+duration+"')"
                con.query(quer, function (err, result) {
                })
              flag = flag + 1;
            } else {
              type = '';
            }
          })
        }
        //  io.in(user.room).emit('message', formatMessage(user.s_id, message));
      })
      //call firebase push notification
      let group_push_notification_data =
        // {user_id:"50",accessToken:"00000",group_id:"group_20220929045605",message:"hai"}
        { user_id: data.sid, accessToken: data.accessToken, group_id: data.room, message: message, message_type: data.type }
        ;
      axios({
        method: 'post',
        //  url: 'http://3.13.92.3/api/get_group_chat_details',
        url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/group_chat_push_notification',

        data: group_push_notification_data
      }).then(res => {
        // console.log('firebase group',res)
      }).catch(e => {
        console.log(e)
      })
      //api call
      setTimeout(() => {
        console.log('set timeout')
        let user_data = {
          user_id: data.sid,
          accessToken: data.accessToken,
          group_id: data.room
        }
        //  console.log(user_data)
        var result_array = []
        axios({
          method: 'post',
          //  url: 'http://3.13.92.3/api/get_group_chat_details',
          url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/get_group_chat_details',

          data: user_data
        }).then(res => {
          //  console.log(res.data);
          result_array = res.data;
          //  socket.join(user_id)
          if(data.message_id){
          io.in(data.room).emit('message', {"replay_message":true,"message_id":data.message_id,result_array});
          }else{
          io.in(data.room).emit('message', {"replay_message":false,"message_id":"",result_array});  
          }

        }).catch((err) => {
          console.log(err)
        })
      }, 500)
     
      //group chat_list
      
      

    } else {

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
        console.log('inrep')
        var R_datetime=get_datetime()
        var replay_qur="INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status,replay_id) VALUES ('" + R_datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','text','" + room + "','1','" + group_status_json_data + "','"+data.message_id+"')";
        con.query(replay_qur,function(err,result){
        })
        // var replay_message={"message_id":message_id,"message":message,"senter_id":data.sid,"receiver_id":data.rid,"type":data.type}
        // io.sockets.in(room).emit('replay_message',replay_message);
      }else{
      //replay message end
      console.log('testing room line 327', room)
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
      var sq = "SELECT * from chat_list WHERE date(date)='" + date + "' AND room='" + room + "'";
      con.query(sq, function (err, result) {
        if (err)
          throw err
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
        console.log(group_status_data)
        console.log(group_status_json_data)
        if (result.length > 0) {

          if (type == 'text') {
            var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','text','" + room + "','1','" + group_status_json_data + "')"
            console.log(ab)
            con.query(ab, function (err, result) {

            })
          }
          else if (type == 'image') {
            var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','image','" + room + "','1','" + group_status_json_data + "')"
            console.log(ab)
            con.query(ab, function (err, result) {

            })
          }
          else if (type == "voice") {
            // getAudioDurationInSeconds(message).then((duration) => {
            // console.log(duration)
              var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','voice','" + room + "','1','" + group_status_json_data + "','"+duration+"')"
              console.log(ab)
              con.query(ab, function (err, result) {
              })
            //  }) 
            
          }
          else if (type == "doc") {
            var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','doc','" + room + "','1','" + group_status_json_data + "')"
            console.log(ab)
            con.query(ab, function (err, result) {

            })
          }
          else if (type == "video") {
            // getVideoDurationInSeconds(
            //   message
            //  ).then((duration) => {
            //    console.log('video duration', duration)
              var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','video','" + room + "','1','" + group_status_json_data + "','"+duration+"')"
              con.query(ab, function (err, result) {
              })
            // })
          } else {
            type = '';
          }

          var qur = "SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.message,t1.message_type,t1.message_status,t1.room,t1.duration, IF(t1.receiver_id='" + data.rid + "', 'sent', 'receive') as type FROM `chat_list` t1 JOIN `user` t2 on t2.id='" + data.rid + "' where room='" + room + "' and t1.status='1'";
          console.log(qur)
          con.query(qur, function (err, result) {
            for (var i = 0; i < result.length; i++) {
              if (result[i].message_type == 'date') {
                result[i].type = 'date';
                console.log('first ', result[i].type)
              }
            }
            let setresponse = {
              "status": true, "statuscode": 200, "message": "success", "data": {
                "name": "",
                "profile": "",
                "id": data.rid,
                "list": result
              }
            }
            if(data.message_id){
              io.sockets.in(room).emit('message',{"replay_message":true,"message_id":data.message_id, setresponse});
            }else{
              io.sockets.in(room).emit('message', {"replay_message":true,"message_id":data.message_id,setresponse});
            }
          })

          var get_access_token = "select `accessToken`,`deviceType` from `user` where id='" + data.rid + "'";
          con.query(get_access_token, function (err, result) {
            console.log('result', result[0].accessToken);
            let user_data = {
              user_id: data.rid,
              accessToken: result[0].accessToken
            }
            //console.log(user_data);


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
              // socket.join(data.rid)
              console.log(room)
              if (result[0].deviceType == 'android') {
                socket.to(room).emit('chat_list', out);
              } else {
                io.sockets.in(data.rid).emit('chat_list', out);
              }
              //socket.to(room).emit('chat_list',out);
            }).catch((err) => {
              console.log(err)
            })
          })

        } else {
          var a = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','','date','" + room + "','0','" + group_status_json_data + "')"
          con.query(a, function (err, result) {

          });
          if (type == 'text') {
            var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','text','" + room + "','1','" + group_status_json_data + "')"
            console.log(ab)
            con.query(ab, function (err, result) {


            })
          }
          else if (type == 'image') {
            var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','image','" + room + "','1')"
            console.log(ab)
            con.query(ab, function (err, result) {
            })
          }
          else if (type == "voice") {
            // getAudioDurationInSeconds(message).then((duration) => {
            // console.log(duration)
              var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,duration) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','voice','" + room + "','1','"+duration+"')"
              console.log(ab)
              con.query(ab, function (err, result) {
              })
            //  })
            
          }
          else if (type == "doc") {
            var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','doc','" + room + "','1')"
            console.log(ab)
            con.query(ab, function (err, result) {
            // console.log(result)
            })
          }
          else if (type == "video") {
            // getVideoDurationInSeconds(
            //   message
            // ).then((duration) => {
            //console.log('video duration', duration)
              var ab = "INSERT INTO chat_list( date,senter_id,receiver_id,message,message_type,room,message_status,duration) VALUES ('" + datetime + "','" + data.sid + "','" + data.rid + "','" + message + "','video','" + room + "','1','"+duration+"')"
              con.query(ab, function (err, result) {
              })
            // })
          }
          else {
            type = '';
          }
          var qur = "SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.message,t1.message_type,t1.message_status,t1.room,t1.duration, IF(t1.receiver_id='" + data.rid + "', 'sent', 'receive') as type FROM `chat_list` t1 JOIN `user` t2 on t2.id='" + data.rid + "' where room='" + room + "' and t1.status='1'";
          con.query(qur, function (err, result) {
            console.log('final', JSON.stringify(result));
            for (var i = 0; i < result.length; i++) {
              if (result[i].message_type == 'date') {
                result[i].type = 'date';
                // console.log('first ', result[i].type)
              }
            }
            let setresponse = {
              "status": true, "statuscode": 200, "message": "success", "data": {
                "name": "",
                "profile": "",
                "id": data.rid,
                "list": result
              }
            }
            console.log(room, socket)
            io.sockets.in(room).emit('message', setresponse);
            
          
          })
         
          
          
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
          var get_access_token = "select `deviceType`, `accessToken` from `user` where id='" + data.rid + "'";
          con.query(get_access_token, function (err, result) {
            console.log('result', result[0].accessToken);
            let user_data = {
              user_id: data.rid,
              accessToken: result[0].accessToken
            }

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
              // socket.join(data.rid)
              console.log(room)
              if (result[0].deviceType == 'android') {
                socket.to(room).emit('chat_list', out);
              } else {
                io.sockets.in(data.rid).emit('chat_list', out);
              }

            }).catch((err) => {
              console.log(err)
            })
          })
        }
      })

      let individual_push_notification_data = { user_id: data.sid, accessToken: data.accessToken, receiver_id: data.rid, message: message, message_type: data.type }
      axios({
        method: 'post',

        url: 'http://ec2-3-143-158-60.us-east-2.compute.amazonaws.com/api/individual_chat_push_notification',

        data: individual_push_notification_data
      }).then(res => {

      }).catch(e => {
        console.log(e)
      })
    }
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
      io.sockets.in(data.rid).emit('typing_individual_chatlist', { "status": "true", "statuscode": "200", "message": "success", "typing": "1", "user_id": data.sid });
      io.sockets.in(newRoom).emit('typing_individual_room', { "status": "true", "statuscode": "200", "message": "success", "typing": "1", "user_id": data.sid });
    } else {
      io.sockets.in(data.rid).emit('typing_individual_chatlist', { "status": "true", "statuscode": "200", "message": "success", "typing": "0", "user_id": data.sid });
      io.sockets.in(newRoom).emit('typing_individual_room', { "status": "true", "statuscode": "200", "message": "success", "typing": "0", "user_id": data.sid });
    }
  })

  socket.on('dis', function (input) {
    console.log('inside disconnect')
    var s_id = input.s_id;
    console.log('[socket]', 'leave room :');
    var last_seen = get_datetime();
    console.log(s_id)
    var update_query = "update user set online_status='0',last_seen='" + last_seen + "' where id='" + s_id + "'";
    con.query(update_query, function (err, result) {
      console.log(result);
      var select = "select online_status,last_seen from user where id='" + s_id + "'";
      con.query(select, function (err, result) {
        io.sockets.in(s_id).emit('online_users', { "status": "true", "statuscode": "200", "message": "success", "data": result });
      })
    })
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
  // sending api result of recent chat 

  socket.on('chat_list', function (input) {
    console.log(input)
    let user_data = {
      user_id: input.user_id,
      accessToken: input.accessToken
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
  socket.on('type_group', function (data) {
    var room = data.room;
    var status = data.status;
    var sid = data.sid;
    var qur = "SELECT * FROM `user` WHERE id='" + data.sid + "'";
    console.log(qur);
    con.query(qur, function (err, result) {
      console.log(result)
      if (status == 1) {
        io.sockets.in(data.room).emit('type_group', { "status": "true", "statuscode": "200", "message": "success", "status": "1", "user_id": data.sid, "name": result[0].name, "profile_pic": result[0].profile_pic });
      } else {
        io.sockets.in(data.room).emit('type_group', { "status": "true", "statuscode": "200", "message": "success", "status": "0", "user_id": data.sid, "name": result[0].name, "profile_pic": result[0].profile_pic });
      }
    })
  })
  //group chat
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});