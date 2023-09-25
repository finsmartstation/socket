const { query } = require('express');
const db = require('../models/index')

async function update_online_status(last_seen, s_id) {
    const results = await db.sequelize.query("update user set online_status='1',last_seen='" + last_seen + "' where id='" + s_id + "'");
    return results
}
async function select_online_status(rid) {
    const results = await db.sequelize.query("select online_status,DATE_FORMAT(last_seen,'%Y-%m-%d %H:%i:%s') as last_seen from user where id='" + rid + "'");
    //return results;
    return results[0];
}
async function get_group_details(date, room) {
    const results = await db.sequelize.query("SELECT t1.created_datetime as created_date, t2.count FROM `group_list` t1 JOIN (select COUNT(*) as count from `chat_list` WHERE date(date)='" + date + "' and room='" + room + "') t2 where t1.group_id='" + room + "'");
    return results;
}
async function get_current_date(date, room) {
    const results = await db.sequelize.query("SELECT t1.created_datetime as created_date, t2.count FROM `group_list` t1 JOIN (select COUNT(*) as count from `chat_list` WHERE date(date)='" + date + "' and room='" + room + "') t2 where t1.group_id='" + room + "'");
    return results;
}
async function get_group_users(room) {
    const results = await db.sequelize.query("SELECT * FROM `group_list` WHERE group_id='" + room + "'");
    //return results;
    return results[0];
}
async function post_text_message(datetime, s_id, message, room, member_json_data,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','text','"+optional_text+"','" + room + "','1','1','" + member_json_data + "')");
    return results;
}
async function post_image_message(datetime, s_id, message, room, member_json_data,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','image','"+optional_text+"','" + room + "','1','1','" + member_json_data + "')");
    return results;
}
async function post_voice_message(datetime, s_id, message, room, member_json_data, duration,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','voice','"+optional_text+"','" + room + "','1','1','" + member_json_data + "','" + duration + "')");
    return results;
}
async function post_doc_message(datetime, s_id, message, room, member_json_data,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','doc','"+optional_text+"','" + room + "','1','1','" + member_json_data + "')");
    return results;
}
async function post_video_message(datetime, s_id, message, room, member_json_data, duration, message_id,optional_text,thumbnail) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,optional_text,thumbnail,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','video','"+optional_text+"','"+thumbnail+"','" + room + "','1','1','" + member_json_data + "','" + duration + "')");
    return results;
}

async function group_location_msg(datetime, s_id, message, room, member_json_data, duration, message_id,optional_text,thumbnail){
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,optional_text,thumbnail,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','location','"+optional_text+"','"+thumbnail+"','" + room + "','1','1','" + member_json_data + "','" + duration + "')");
    return results[0];
}

async function get_group_u(room) {
    const results = await db.sequelize.query("SELECT * FROM `group_list` WHERE group_id='" + room + "'");
    //return results;
    return results[0];
}
async function date_inserting(datetime, s_id, room, member_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','','date','" + room + "','0','1','" + member_json_data + "')");
    return results;
}
async function get_group_created_username(group_created_by) {
    const results = await db.sequelize.query("SELECT name from user where id='" + group_created_by + "'");;
    return results;
}
async function individual_chat_date(date, room) {
    const results = await db.sequelize.query("SELECT * from chat_list WHERE date(date)='" + date + "' AND room='" + room + "'");
    return results;
}
async function individual_text_msg(datetime, sid, rid, message, room, group_status_json_data,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','text','"+optional_text+"','" + room + "','1','" + group_status_json_data + "')");
    return results;
}
async function individual_image_msg(datetime, sid, rid, message, room, group_status_json_data,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','image','"+optional_text+"','" + room + "','1','" + group_status_json_data + "')");
    return results;
}
async function individual_voice_msg(datetime, sid, rid, message, room, group_status_json_data, duration,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','voice','"+optional_text+"','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}
async function individual_doc_msg(datetime, sid, rid, message, room, group_status_json_data,duration,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','doc','"+optional_text+"','" + room + "','1','" + group_status_json_data + "')");
    return results;
}
async function individual_video_msg(datetime, sid, rid, message, room, group_status_json_data, duration,message_id,optional_text,thumbnail) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,thumbnail,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','video','"+optional_text+"','"+thumbnail+"','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}

async function individual_location_msg(datetime, sid, rid, message, room, group_status_json_data, duration, message_id, optional_text, thumbnail){
    const results=await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,thumbnail,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','location','"+optional_text+"','"+thumbnail+"','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
}

async function send_indv_message(rid, room){
    //const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.message,t1.message_type,t1.delivered_status,t1.message_status,t1.room,t1.duration, IF(t1.receiver_id='" + rid + "', 'sent', 'receive') as type FROM `chat_list` t1 JOIN `user` t2 on t2.id='" + rid + "' WHERE room='" + room + "' and t1.status='1'");
    const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where room='"+room+"' and message_type!='date' order by id asc");
    //get last message only
    //const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where room='"+room+"' and message_type!='date' order by id desc limit 1");
    return results;
}

async function individual_room_using_pagination(sid,rid, room,limit,message_id){
    //console.log(rid,room)
    let json_object_0='{"user_id":"'+sid+'","status":0}';
    let json_object_1='{"user_id":"'+sid+'","status":1}';
    //console.log(json_object_0,json_object_1);
    //SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='2', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='2' where room='12' and message_type!='date' and (JSON_CONTAINS(t1.group_status,'{"user_id":"1","status":0}') or JSON_CONTAINS(t1.group_status,'{"user_id":"1","status":1}')) order by id desc limit 5 OFFSET 0;
    var results;
    if(message_id!=0){
        //results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where t1.id<'"+message_id+"' and t1.room='"+room+"' and (JSON_CONTAINS(t1.group_status,'"+json_object_0+"') or JSON_CONTAINS(t1.group_status,'"+json_object_1+"')) order by id desc limit "+limit+" OFFSET "+page_number+"");
        results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where t1.id<'"+message_id+"' and t1.room='"+room+"' and t1.message_type!='date' and (JSON_CONTAINS(t1.group_status,'"+json_object_0+"') or JSON_CONTAINS(t1.group_status,'"+json_object_1+"')) order by id desc limit "+limit+" ");
    }else{
        //results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where t1.room='"+room+"' and (JSON_CONTAINS(t1.group_status,'"+json_object_0+"') or JSON_CONTAINS(t1.group_status,'"+json_object_1+"')) order by id desc limit "+limit+" OFFSET "+page_number+"");
        results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where t1.room='"+room+"' and t1.message_type!='date' and (JSON_CONTAINS(t1.group_status,'"+json_object_0+"') or JSON_CONTAINS(t1.group_status,'"+json_object_1+"')) order by id desc limit "+limit+" ");
    }
    
    return results;
}

async function get_send_private_message(sid,rid, room, message_limit){
    let json_object_0='{"user_id":"'+sid+'","status":0}';
    let json_object_1='{"user_id":"'+sid+'","status":1}';
    const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where t1.room='"+room+"' and (JSON_CONTAINS(t1.group_status,'"+json_object_0+"') or JSON_CONTAINS(t1.group_status,'"+json_object_1+"')) order by id desc limit "+message_limit+"");
    return results;
}

async function get_last_private_date_message(sid,rid, room){
    let json_object_1='{"user_id":"'+sid+'","status":1}';
    const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.delivered_status,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where t1.message_type='date' and t1.room='"+room+"' and JSON_CONTAINS(t1.group_status,'"+json_object_1+"') order by id desc limit 1");
    return results[0];
}

async function get_recent_chat_accessToken(rid){
    const results=await db.sequelize.query("select `accessToken`,`deviceType` from `user` where id='" + rid + "'");
    return results;
}
async function get_user(rid,accessToken){
    const results=await db.sequelize.query("select * from `user` where id='"+rid+"' and accessToken='"+accessToken+"'");
    return results[0];
}
async function get_recent_chat(user_id){
    let set_user_id='"'+user_id+'"';
    //const results=await db.sequelize.query("select t1.id ,t1.date,t1.message,t1.message_type,if(ISNULL(t6.unread_message),0,t6.unread_message) as unread_message,case t1.senter_id when '"+rid+"' then t4.id else t3.id end as userid,case t1.senter_id when '"+rid+"' then t4.name else t3.name end as name,case t1.senter_id when '"+rid+"' then t4.profile_pic else t3.profile_pic end as profile from chat_list t1 join (SELECT room, MAX(id) max_id FROM chat_list GROUP BY room)t2 on t1.id = t2.max_id and t1.room = t2.room join `user` t3 on t3.id=t1.senter_id join `user` t4 on t1.receiver_id=t4.id left join (select sum(t5.message_status) as unread_message, t5.room from `chat_list` t5 where t5.senter_id!='"+rid+"' GROUP BY t5.room )t6 on t6.room=t1.room where t1.senter_id='"+rid+"' or t1.receiver_id='"+rid+"' ORDER BY id DESC");
    //const results=await db.sequelize.query("select t1.id ,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.message,t1.message_type,if(ISNULL(t6.unread_message),0,t6.unread_message) as unread_message,case t1.senter_id when '"+rid+"' then t4.id else t3.id end as userid,case t1.senter_id when '"+rid+"' then t4.name else t3.name end as name,case t1.senter_id when '"+rid+"' then t4.profile_pic else t3.profile_pic end as profile from chat_list t1 join (SELECT room, MAX(id) max_id FROM chat_list GROUP BY room)t2 on t1.id = t2.max_id and t1.room = t2.room join `user` t3 on t3.id=t1.senter_id join `user` t4 on t1.receiver_id=t4.id left join (select sum(t5.message_status) as unread_message, t5.room from `chat_list` t5 where t5.senter_id!='"+rid+"' GROUP BY t5.room )t6 on t6.room=t1.room where t1.senter_id='"+rid+"' or t1.receiver_id='"+rid+"' ORDER BY id DESC");
    //const results=await db.sequelize.query("SELECT *, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by id desc")
    //const results=await db.sequelize.query("SELECT *, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by t4.pin_id DESC,t1.id DESC");
    //SELECT *, if(t1.senter_id=50,t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='50') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id=50,t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 where (t1.senter_id='50' or t1.receiver_id='50') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"50"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //const results=await db.sequelize.query("SELECT *, if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by t4.pin_id DESC,t1.id DESC");
    //SELECT t1.*,t4.*,t6.*, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone, if(t1.senter_id=50,t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='50') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id=50,t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id=50,t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room where (t1.senter_id='50' or t1.receiver_id='50') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"50"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone, if(t1.senter_id=50,t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='50') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id=50,t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id=50,t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room where (t1.senter_id='50' or t1.receiver_id='50') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"50"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //const results=await db.sequelize.query("SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone, if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by t4.pin_id DESC,t1.id DESC;")
    //SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,case when t1.private_group=0 then t12.id else t14.id end as mute_id,case when t1.private_group=0 then t12.type else t14.type end as mute_type,case when t1.private_group=0 then DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') else DATE_FORMAT(t14.end_datetime,'%Y-%m-%d %H:%i:%s') end as mute_end_datetime, if(t1.senter_id=50,t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='50') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id=50,t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id=50,t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='50' and t12.receiver_id=if(t1.senter_id=50,t1.receiver_id,t1.senter_id) left join (select * from `mute_chat_notification` t13)t14 on t14.user_id='50' and t14.room=t1.room where (t1.senter_id='50' or t1.receiver_id='50') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"50"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,case when t1.private_group=0 then t12.id else t14.id end as mute_id,case when t1.private_group=0 then t12.type else t14.type end as mute_type,case when t1.private_group=0 then DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') else DATE_FORMAT(t14.end_datetime,'%Y-%m-%d %H:%i:%s') end as mute_end_datetime, if(t1.senter_id='"5"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"5"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"5"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='5',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='5',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='5' and t12.receiver_id=if(t1.senter_id='5',t1.receiver_id,t1.senter_id) left join (select * from `mute_chat_notification` t13)t14 on t14.user_id='5' and t14.room=t1.room where (t1.senter_id='5' or t1.receiver_id='5') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"5"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,t12.id as mute_id,t12.type as mute_type, DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') as mute_end_datetime, if(t1.senter_id='50',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='50') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='50',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='50',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='50' and t12.room=t1.room where (t1.senter_id='50' or t1.receiver_id='50') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"50"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //const results=await db.sequelize.query("SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,case when t1.private_group=0 then t12.id else t14.id end as mute_id,case when t1.private_group=0 then t12.type else t14.type end as mute_type,case when t1.private_group=0 then DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') else DATE_FORMAT(t14.end_datetime,'%Y-%m-%d %H:%i:%s') end as mute_end_datetime, if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='"+user_id+"' and t12.receiver_id=if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) left join (select t13.* from `mute_chat_notification` t13)t14 on t14.user_id='"+user_id+"' and t14.room=t1.room where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by t4.pin_id DESC,t1.id DESC");
    //SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.about else t10.group_description end as opponent_about,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,case when t1.private_group=0 then t8.online_status else '0' end as user_online_status,t12.id as mute_id,t12.type as mute_type, DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') as mute_end_datetime, if(t1.senter_id='1',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"1"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='1') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='1',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='1',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='1' and t12.room=t1.room where (t1.senter_id='1' or t1.receiver_id='1') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"1"', '$')) order by t4.pin_id DESC,t1.id DESC;
    //const results=await db.sequelize.query("SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.about else t10.group_description end as opponent_about,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,case when t1.private_group=0 then t8.online_status else '0' end as user_online_status,t12.id as mute_id,t12.type as mute_type, DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') as mute_end_datetime, if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='"+user_id+"' and t12.room=t1.room where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by t4.pin_id DESC,t1.id DESC");
    const results=await db.sequelize.query("SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then '' else t10.created_datetime end as group_created_datetime,case when t1.private_group=0 then t8.about else t10.group_description end as opponent_about,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,case when t1.private_group=0 then t8.online_status else '0' end as user_online_status,t12.id as mute_id,t12.type as mute_type, DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') as mute_end_datetime, if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='"+user_id+"' and t12.room=t1.room where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by t4.pin_id DESC,t1.id DESC");
    return results[0];
}

async function search_chat_list_data(user_id,search){
    //SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,t12.id as mute_id,t12.type as mute_type, DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') as mute_end_datetime, if(t1.senter_id='1',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"1"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='1') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='1',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='1',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='1' and t12.room=t1.room where ((LOWER(t8.name) LIKE LOWER('%vibin%')) OR (LOWER(t10.group_name) LIKE LOWER('%test%'))) and ((t1.senter_id='1' or t1.receiver_id='1') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"1"', '$'))) order by t4.pin_id DESC,t1.id DESC;
    let set_user_id='"'+user_id+'"';
    const results=await db.sequelize.query("SELECT t1.*,t4.*,t6.*,t10.group_id,t10.members,t10.left_members,t10.removed_members,t10.current_members,t10.subject_history, case when t1.private_group=0 then t8.profile_pic else t10.group_profile end as opponent_profile_pic,case when t1.private_group=0 then t8.name else t10.group_name end as opponent_name,case when t1.private_group=0 then t8.about else t10.group_description end as opponent_about,case when t1.private_group=0 then t8.id else t10.group_id end as opponent_id,case when t1.private_group=0 then t8.phone else '' end as opponent_phone,case when t1.private_group=0 then t8.deviceToken else '' end as device_token,t12.id as mute_id,t12.type as mute_type, DATE_FORMAT(t12.end_datetime,'%Y-%m-%d %H:%i:%s') as mute_end_datetime, if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) as userid, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, if(ISNULL(t4.pin_id), 0, 1) as pin_status FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id left JOIN (select t3.room as pin_room, t3.id as pin_id from pin_chat t3 where t3.user_id='"+user_id+"') t4 on t1.room=t4.pin_room left JOIN (SELECT t5.user_id,t5.options,t5.except_users FROM `user_chat_privacy` t5 where t5.type='profile_pic') t6 on if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id)=t6.user_id and t1.private_group=0 left JOIN (select t7.* from `user` t7 ) t8 on t8.id=if(t1.senter_id='"+user_id+"',t1.receiver_id,t1.senter_id) and t1.private_group='0' left JOIN (select t9.* from `group_list`t9) t10 on t10.group_id=t1.room left join (select t11.* from `mute_chat_notification` t11) t12 on t12.user_id='"+user_id+"' and t12.room=t1.room where ((LOWER(t8.name) LIKE LOWER('%"+search+"%')) OR (LOWER(t10.group_name) LIKE LOWER('%"+search+"%'))) and ((t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$'))) order by t4.pin_id DESC,t1.id DESC");
    return results[0];
}

async function search_text_messages(user_id,search){
    //SELECT t1.*,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, CASE WHEN t1.private_group=0 THEN if(t1.senter_id=2,t3.id,t2.id) ELSE t4.group_id END as opponent_id,CASE WHEN t1.private_group=0 THEN if(t1.senter_id=2,t3.name,t2.name) ELSE t4.group_name END as opponent_name,if(t1.senter_id=2,'You',t2.name) as sender FROM `chat_list` t1 LEFT JOIN `user` t2 on t2.id=t1.senter_id LEFT JOIN `user` t3 on t3.id=t1.receiver_id LEFT JOIN `group_list` t4 on t4.group_id=t1.room where (LOWER(t1.message) LIKE LOWER('%vi%')) and t1.message_type='text' and JSON_CONTAINS(t1.group_status, '{"user_id": "2", "status": 1}') ORDER BY t1.id DESC;
    let set_user_id='"'+user_id+'"';
    let json_options='{"user_id": '+set_user_id+', "status": 1}';
    //console.log(json_options)
    const results=await db.sequelize.query("SELECT t1.*,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date, CASE WHEN t1.private_group=0 THEN if(t1.senter_id='"+user_id+"',t3.id,t2.id) ELSE t4.group_id END as opponent_id,CASE WHEN t1.private_group=0 THEN if(t1.senter_id='"+user_id+"',t3.name,t2.name) ELSE t4.group_name END as opponent_name,if(t1.senter_id='"+user_id+"','You',t2.name) as sender FROM `chat_list` t1 LEFT JOIN `user` t2 on t2.id=t1.senter_id LEFT JOIN `user` t3 on t3.id=t1.receiver_id LEFT JOIN `group_list` t4 on t4.group_id=t1.room where (LOWER(t1.message) LIKE LOWER('%"+search+"%')) and t1.message_type='text' and JSON_CONTAINS(t1.group_status, '"+json_options+"') ORDER BY t1.id DESC");
    return results[0];
}
async function individual_date_insert(datetime,sid,rid,room,group_status_json_data,message_id){
    const results=await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','','date','" + room + "','0','" + group_status_json_data + "')")
    return results[0];
}
async function group_chat_response(sid,user_id_quotes,room){
    //const results=await db.sequelize.query("SELECT t1.id,t1.date,t1.senter_id,t1.message,t1.message_type,t1.room,t1.message_status,t1.replay_id,t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.status='1' and t1.private_group='1' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+user_id_quotes+"', '$') order by id asc");
    const results=await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.private_group='1'  and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+user_id_quotes+"', '$') and t1.message_type!='date' order by id asc");
    return results[0];
}

async function group_unread_messages(user_id,room){
    let json_object='{"user_id":"'+user_id+'","message_status":1}';
    const results=await db.sequelize.query("select * from `chat_list` where JSON_CONTAINS(group_status, '"+json_object+"') and room='"+room+"' and message_status='1'");
    return results[0];
}

async function group_room_using_pagination(sid,user_id_quotes,room,limit,message_id){
    let json_object_0='{"user_id":"'+sid+'","status":0}';
    let json_object_1='{"user_id":"'+sid+'","status":1}';
    var results;
    //SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='2','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.id<2348 and t1.room='group_20230605142742' and t1.private_group='1' and (JSON_CONTAINS(t1.group_status, '{"user_id":"2","status":0}') or JSON_CONTAINS(t1.group_status, '{"user_id":"2","status":1}')) order by id DESC limit 5;
    //SELECT (select min(id) from chat_list where room='group_20230605142742' and ((JSON_CONTAINS(group_status, '{"user_id":"2","status":0}') or JSON_CONTAINS(group_status, '{"user_id":"2","status":1}')))) as small_id,t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='2','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.id<2348 and t1.room='group_20230605142742' and t1.private_group='1'  and (JSON_CONTAINS(t1.group_status, '{"user_id":"2","status":0}') or JSON_CONTAINS(t1.group_status, '{"user_id":"2","status":1}')) order by id DESC limit 5;
    if(message_id!=0){
        results=await db.sequelize.query("SELECT (select min(id) from chat_list where room='"+room+"' and ((JSON_CONTAINS(group_status, '"+json_object_0+"') or JSON_CONTAINS(group_status, '"+json_object_1+"')))) as small_id,t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.id<'"+message_id+"' and t1.room='"+room+"' and t1.private_group='1' and (JSON_CONTAINS(t1.group_status, '"+json_object_0+"') or JSON_CONTAINS(t1.group_status, '"+json_object_1+"')) and t1.message_type!='date' order by id DESC limit "+limit+"");
    }else{
        results=await db.sequelize.query("SELECT (select min(id) from chat_list where room='"+room+"' and ((JSON_CONTAINS(group_status, '"+json_object_0+"') or JSON_CONTAINS(group_status, '"+json_object_1+"')))) as small_id,t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.private_group='1' and (JSON_CONTAINS(t1.group_status, '"+json_object_0+"') or JSON_CONTAINS(t1.group_status, '"+json_object_1+"')) and t1.message_type!='date' order by id DESC limit "+limit+"");
    }
    
    return results[0];
}

async function get_group_room_message(sid,room,message_limit){
    let json_object_0='{"user_id":"'+sid+'","status":0}';
    let json_object_1='{"user_id":"'+sid+'","status":1}';
    const results=await db.sequelize.query("SELECT (select min(id) from chat_list where room='"+room+"' and ((JSON_CONTAINS(group_status, '"+json_object_0+"') or JSON_CONTAINS(group_status, '"+json_object_1+"')))) as small_id,t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.private_group='1' and (JSON_CONTAINS(t1.group_status, '"+json_object_0+"') or JSON_CONTAINS(t1.group_status, '"+json_object_1+"')) order by id DESC limit "+message_limit+"");
    return results[0];
}

async function get_last_group_date_message(sid,room){
    let json_object_1='{"user_id":"'+sid+'","status":1}';
    const results=await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.optional_text,t1.thumbnail,t1.duration,t1.room,t1.delivered_status,t1.message_status, t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.message_type='date' and t1.room='"+room+"' and t1.private_group='1' and JSON_CONTAINS(t1.group_status, '"+json_object_1+"') order by id DESC limit 1");
    return results[0];
}

async function get_receiver_details(rid){
    const results=await db.sequelize.query("select * from user where id='"+rid+"'")
    return results;
}
async function get_indv_messages(rid,room){
    const results=await db.sequelize.query("SELECT t1.id,t1.date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.duration,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where room='"+room+"' and message_type!='date'")
    return results;
}
async function reply_update(date_time,room,rid){
    const results=await db.sequelize.query("update  chat_list set message_status='0',message_read_datetime='"+date_time+"' where room='"+room+"' and senter_id='"+rid+"'")
    return results;
}

async function reply_message_details(reply_id){
    const results=await db.sequelize.query("select * from `chat_list` where id='"+reply_id+"'");
    return results;
}

async function get_username(user_id){
    const results=await db.sequelize.query("select * from `user` where id='"+user_id+"'");
    if(results[0].length>0){
        return results[0][0].name;
    }else{
        return '';
    }
}

async function get_forward_message_details(forward_message_id){
    const results=await db.sequelize.query("select * from `chat_list` where id='"+forward_message_id+"'");
    return results;
}

async function get_forward_message_count(forward_message_id){
    const results=await db.sequelize.query("select count(*) as count from `chat_list` where forward_id='"+forward_message_id+"'");
    return results[0][0].count;
}

async function get_user_details(user_id){
    const results=await db.sequelize.query("select * from `user` where id='"+user_id+"'");
    return results[0];
}

async function check_user_block_status(senter_id,receive_id){
    const results=await db.sequelize.query("select * from `block_chat` where user_id='"+senter_id+"' and receiver_id='"+receive_id+"'");
    let array_count =results[0].length;
    if(array_count>0){
        return 1;
    }else{
        return 0;
    }
}

async function check_user_and_group_data(user_id,group_id){
    //SELECT * FROM `group_list`  where JSON_CONTAINS(JSON_EXTRACT(members, '$[*].user_id'),'"578"','$') and group_id='group_20221110045738';
    const results=await db.sequelize.query("SELECT *, DATE_FORMAT(created_datetime,'%Y-%m-%d %H:%i:%s') as created_datetime FROM `group_list`  where JSON_CONTAINS(JSON_EXTRACT(members, '$[*].user_id'),'"+user_id+"','$') and group_id='"+group_id+"'");
    return results[0];
}

// async function get_username(user_id){
//     const results=await db.sequelize.query("select * from `user` where id='"+user_id+"'");
//     return results[0][0].name;
// }

async function get_unread_message_count(user_id,room){
    const results=await db.sequelize.query("select sum(message_status) as unread_count from `chat_list` where private_group='0' and senter_id!='"+user_id+"' and room='"+room+"'");
    return results[0][0].unread_count;
}

async function get_unread_message_count_for_group(user_id,room){
    //select count(*) as unread from chat_list where private_group='1' and senter_id!='1' and room='group_20230713154430' and message_type!='date' and JSON_CONTAINS(group_status, '{"user_id":"1","message_status":1}');
    //const results=await db.sequelize.query("select message_status,group_status from chat_list where private_group='1' and senter_id!='"+user_id+"' and room='"+room+"' and message_type!='date'");
    let json_obj='{"user_id":"'+user_id+'","message_status":1}';
    const results=await db.sequelize.query("select count(*) as unread from chat_list where private_group='1' and senter_id!='"+user_id+"' and room='"+room+"' and message_type!='date' and JSON_CONTAINS(group_status, '"+json_obj+"')");
    //console.log(results[0][0].unread)
    return results[0][0].unread;
}

async function get_mute_notification(user_id,receiver_id){
    const results=await db.sequelize.query("select *, DATE_FORMAT(datetime,'%Y-%m-%d %H:%i:%s') as datetime, DATE_FORMAT(start_datetime,'%Y-%m-%d %H:%i:%s') as start_datetime, DATE_FORMAT(end_datetime,'%Y-%m-%d %H:%i:%s') as end_datetime from mute_chat_notification where user_id='"+user_id+"' and receiver_id='"+receiver_id+"'");
    return results[0];
}

async function get_user_profile(user_id){
    const results=await db.sequelize.query("select name,profile_pic,about,phone,deviceToken,online_status from user where id='"+user_id+"'");
    return results[0];
}

async function get_forward_message_data(message_id){
    const results=await db.sequelize.query("select message,message_type,duration,optional_text,thumbnail from chat_list where id='"+message_id+"'");
    return results[0];
}

async function save_individual_forward_message(forward_id, datetime, sid, rid, message, message_type, room, duration, group_status_json_data, optional_text, thumbnail) {
    const results = await db.sequelize.query("INSERT INTO chat_list (date,senter_id,receiver_id,replay_id,forward_id,message,message_type,optional_text,thumbnail,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','0','"+forward_id+"','" + message + "','"+message_type+"','"+optional_text+"','"+thumbnail+"','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}

async function get_group_current_users(group_id){
    const results= await db.sequelize.query("select current_members from group_list where group_id='"+group_id+"'");
    return results[0];
}

async function save_group_forward_message(forward_id,datetime, sid, rid, message, message_type, room, duration, group_status_json_data,optional_text,thumbnail) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,forward_id,message,message_type,optional_text,thumbnail,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','0','"+forward_id+"','" + message + "','"+message_type+"','"+optional_text+"','"+thumbnail+"','" + room + "','1','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}

async function check_group_mute_notification(user_id, room){
    const results=await db.sequelize.query("select *, DATE_FORMAT(datetime,'%Y-%m-%d %H:%i:%s') as datetime, DATE_FORMAT(start_datetime,'%Y-%m-%d %H:%i:%s') as start_datetime, DATE_FORMAT(end_datetime,'%Y-%m-%d %H:%i:%s') as end_datetime from mute_chat_notification where user_id='"+user_id+"' and receiver_id='0' and room='"+room+"'");
    return results[0];
}

async function get_group_basic_details(group_id){
    const results=await db.sequelize.query("select group_name,group_profile,members,left_members,removed_members,current_members,subject_history from group_list where group_id='"+group_id+"'");
    return results[0];
}

async function check_user_valid(user_id,access_token){
    const results=await db.sequelize.query("select * from user where id='"+user_id+"' and accessToken='"+access_token+"'");
    return results[0];
}

async function check_message_id(id){
    const results=await db.sequelize.query("select * from chat_list where id='"+id+"'");
    return results[0];
}

async function update_delete_message_for_one(group_status,message_id){
    const results=await db.sequelize.query("update chat_list set group_status='"+group_status+"' where id='"+message_id+"'");
    return results[0];
}

async function update_delete_message_for_everyone(status,group_status,message_id){
    const results=await db.sequelize.query("update chat_list set status='"+status+"',group_status='"+group_status+"' where id='"+message_id+"'");
    return results[0];
}

async function get_last_private_message(room_id,message_id){
    const results=await db.sequelize.query("select *, DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as date from chat_list where id!='"+message_id+"' and room='"+room_id+"' and message_type!='date' order by id desc");
    return results[0];
}

async function get_last_group_message(set_user_id,room_id,message_id){
    const results=await db.sequelize.query("select *, DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as date from chat_list where JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') and room='"+room_id+"' and id!='"+message_id+"' and message_type!='date' order by id desc");
    return results[0];
}

async function update_user_online_offline_status(user_id,datetime,status){
  const results=await db.sequelize.query("update user set online_status='"+status+"',last_seen='"+datetime+"' where id='"+user_id+"'");
  return results[0];
}

async function get_access_token(user_id){
    const results=await db.sequelize.query("select accessToken from user where id='"+user_id+"'");
    return results[0];
}

async function get_device_token(user_id){
    const results=await db.sequelize.query("select deviceToken from user where id='"+user_id+"'");
    return results[0][0].deviceToken;
}

async function receiver_mute_status(user_id){
    const results=await db.sequelize.query("select * from user where id='"+user_id+"' and notification_status='1'");
    return results[0];
}

async function check_individual_mute_notification(user_id,room){
    const results=await db.sequelize.query("select *, DATE_FORMAT(end_datetime,'%Y-%m-%d %H:%i:%s') as end_datetime from mute_chat_notification where user_id='"+user_id+"' and room='"+room+"'");
    return results[0];
}

async function check_user_already_blocked(user_id,receiver_id){
    const results=await db.sequelize.query("select * from block_chat where user_id='"+user_id+"' and receiver_id='"+receiver_id+"'");
    return results[0];
}

async function block_user_chat(user_id,receive_id,room,datetime){
    const results=await db.sequelize.query("INSERT INTO `block_chat`(`user_id`, `datetime`, `room`, `receiver_id`) VALUES ('"+user_id+"','"+datetime+"','"+room+"','"+receive_id+"')");
    return results[1];
}

async function save_block_message(datetime,user_id,receiver_id,message,message_type,room,message_status,status,online_status,private_group,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','"+receiver_id+"','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','"+private_group+"','"+group_status+"')");
    return results[1];
}


// async function get_temporary_socket_data(){
//     const results=await db.sequelize.query("select * from temporary_socket_data");
//     return results[0];
// }

async function delete_block_entry(id){
    const results=await db.sequelize.query("DELETE FROM `block_chat` WHERE id='"+id+"'");
    return results[0];
}

async function check_group_data(group_id){
    const results=await db.sequelize.query("select *, DATE_FORMAT(created_datetime, '%Y-%m-%d %H:%i:%s') as created_datetime,DATE_FORMAT(description_updated_datetime,'%Y-%m-%d %H:%i:%s') as description_updated_datetime from group_list where group_id='"+group_id+"'");
    return results[0];
}

async function update_group_user_left_data(left_members,new_members,group_id){
    const results=await db.sequelize.query("update group_list set left_members='"+left_members+"',current_members='"+new_members+"' where group_id='"+group_id+"'");
    return results[0];
}

async function save_left_message(datetime,user_id,message,message_type,room,message_status,status,online_status,private_group,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','0','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','"+private_group+"','"+group_status+"')");
    return results[1];
}

async function save_private_missed_call_message(datetime,user_id,receiver_id,message,message_type,room,message_status,status,online_status,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','"+receiver_id+"','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','0','"+group_status+"')");
    return results[1];
}

async function save_group_call_message(datetime,user_id,message,message_type,room,message_status,status,online_status,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','0','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','1','"+group_status+"')");
    return results[1];
}

async function save_group_user_add_message(datetime,user_id,message,message_type,room,message_status,status,online_status,private_group,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','0','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','"+private_group+"','"+group_status+"')");
    return results[1];
}

async function save_group_admin_data(current_member,overall_member,group_id){
    const results=await db.sequelize.query("update group_list set members='"+overall_member+"',current_members='"+current_member+"' where group_id='"+group_id+"'");
    return results[0];
}

async function save_admin_message(datetime,user_id,message,message_type,room,message_status,status,online_status,private_group,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','0','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','"+private_group+"','"+group_status+"')");
    return results[1];
}

async function save_and_create_group(created_by,created_datetime,group_id,group_name,group_profile,members,current_members,profile_pic_history,subject_history){
    const results=await db.sequelize.query("INSERT INTO `group_list`(`created_by`, `created_datetime`, `group_id`, `group_name`, `group_profile`, `members`, `current_members`, `profile_pic_history`, `subject_history`,`status`) VALUES ('"+created_by+"','"+created_datetime+"','"+group_id+"','"+group_name+"','"+group_profile+"','"+members+"','"+current_members+"','"+profile_pic_history+"','"+subject_history+"','1')");
    //console.log(results);
    if(results[1]>0){
        //console.log('group creted ', results[1])
        //const 
        let inserted_id=results[0];
        const get_created_group_data=await db.sequelize.query("select group_id from group_list where id='"+inserted_id+"'");
        //console.log('new group data ',get_created_group_data[0][0].group_id);
        return get_created_group_data[0][0].group_id;
    }else{
        //console.log('group not created')
        return '';
    }
}

async function update_removed_group_member_data(current_group_members,removed_group_members,group_id){
    const results=await db.sequelize.query("update group_list set removed_members='"+removed_group_members+"',current_members='"+current_group_members+"' where group_id='"+group_id+"'");
    return results[0];
}

async function save_removed_message(datetime,user_id,message,message_type,room,message_status,status,online_status,private_group,group_status){
    const results=await db.sequelize.query("INSERT INTO `chat_list`(`date`, `senter_id`, `receiver_id`, `message`, `message_type`, `room`, `message_status`, `status`, `online_status`, `private_group`, `group_status`) VALUES ('"+datetime+"','"+user_id+"','0','"+message+"','"+message_type+"','"+room+"','"+message_status+"','"+status+"','"+online_status+"','"+private_group+"','"+group_status+"')");
    return results[1];
}

async function update_group_profile_pic(profile_pic,profile_pic_history,group_id){
    const results=await db.sequelize.query("update group_list set group_profile='"+profile_pic+"',profile_pic_history='"+profile_pic_history+"' where group_id='"+group_id+"'");
    return results[0];
}

async function update_group_profile_details(group_name,profile_pic,group_id){
    if(group_name!='' && profile_pic!=''){
        const results=await db.sequelize.query("update group_list set group_name='"+group_name+"',group_profile='"+profile_pic+"' where group_id='"+group_id+"'");
        return results[0];
    }else{
        if(group_name!=''){
            const results=await db.sequelize.query("update group_list set group_name='"+group_name+"' where group_id='"+group_id+"'");
            return results[0];
        }

        if(profile_pic!=''){
            const results=await db.sequelize.query("update group_list set group_profile='"+profile_pic+"' where group_id='"+group_id+"'");
            return results[0];
        }
    }
    
}

async function room_chat_list(room){
    const results=await db.sequelize.query("select * from chat_list where room='"+room+"'");
    return results[0];
}

async function update_clear_chat(id,group_status){
    const results=await db.sequelize.query("update chat_list set group_status='"+group_status+"' where id='"+id+"'");
    return results[0];
}

async function group_chat_list(user_id,room){
    let set_user_id='"'+user_id+'"';
    //SELECT t1.id,t1.date,t1.senter_id,t1.message,t1.message_type,t1.room,t1.message_status, t2.name,if(t1.senter_id='50','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='group_20221003075515' and t1.status='1' and t1.private_group='1' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"50"', '$') order by id asc;
    const results=await db.sequelize.query("SELECT t1.id,t1.date,t1.senter_id,t1.message,t1.message_type,t1.room,t1.message_status, t2.name,if(t1.senter_id='"+user_id+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.status='1' and t1.private_group='1' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$') order by id asc");
    return results[0];
}

async function save_report_chat(user_id,datetime,receiver_id,room,type){
    const results=await db.sequelize.query("INSERT INTO `report_chat`(`user_id`, `datetime`, `receiver_id`, `room`, `type`) VALUES ('"+user_id+"','"+datetime+"','"+receiver_id+"','"+room+"','"+type+"')");
    return results[1];
}

async function update_clear_chat_with_single_query(query){
    //UPDATE chat_list SET status = (case when id = '1' then '622057' when id = '2' then '2913659' when id = '3' then '6160230' end) WHERE id in ('1', '2', '3');
    //UPDATE chat_list SET group_status= ("+query_case_data+") where id in ("+removed_comma+")
    // let set_query="UPDATE chat_list SET group_status= ('"+group_status_data+"') where id in ('"+id_data+"')";
    // console.log(set_query);
    const results=await db.sequelize.query(query);
    //const results=await db.sequelize.query("UPDATE chat_list SET status = (case when id = '1' then '622057' when id = '2' then '2913659' when id = '3' then '6160230' end) WHERE id in ('1', '2', '3')");
    return results[0];
}

// async function multiple_entry(){
//     const results=await db.sequelize.query("INSERT INTO `report_chat` (`user_id`, `receiver_id`, `room`, `type`) VALUES ('1','0','0',''); INSERT INTO `report_chat`(`user_id`, `receiver_id`, `room`, `type`) VALUES ('1','0','0','')")
// }

async function save_group_description(group_id,description,updated_datetime,description_history){
    const results=await db.sequelize.query("update group_list set group_description='"+description+"',description_updated_datetime='"+updated_datetime+"',description_history='"+description_history+"' where group_id='"+group_id+"'");
    return results[0];
}

async function save_group_name(group_id,name,subject_history_array){
    const results=await db.sequelize.query("update group_list set group_name='"+name+"',subject_history='"+subject_history_array+"' where group_id='"+group_id+"'");
    return results[0];
}

async function total_pin_chat_count(user_id){
    const results=await db.sequelize.query("select * from pin_chat where user_id='"+user_id+"'");
    return results[0];
}

async function save_pin_chat(user_id,receiver_id,room,datetime){
    const results=await db.sequelize.query("INSERT INTO `pin_chat`(`user_id`, `receiver_id`, `room`, `pin_date`) VALUES ('"+user_id+"','"+receiver_id+"','"+room+"','"+datetime+"')");
    return results[1];
}

async function check_room_is_pinned(user_id,room){
    const results=await db.sequelize.query("select * from `pin_chat` where user_id='"+user_id+"' and room='"+room+"'");
    return results[0];
}

async function get_pinned_chat_list(user_id,rooms){
    const results=await db.sequelize.query("select * from `pin_chat` where user_id='"+user_id+"' and room in ("+rooms+")");
    return results[0];
}

async function remove_user_pinned_rooms(user_id, rooms){
    const results=await db.sequelize.query("delete from `pin_chat` where user_id='"+user_id+"' and room in ("+rooms+")");
    return results[0];
}

async function unpin_chat(user_id,room){
    const results=await db.sequelize.query("delete from `pin_chat` where user_id='"+user_id+"' and room='"+room+"'");
    return results[0];
}

async function get_group_chat_list_for_media_count(group_id,set_user_id){
    const results=await db.sequelize.query("SELECT * FROM `chat_list` where status='1' and room='"+group_id+"' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$')");
    return results[0];
}

async function update_individual_message_as_read(datetime,receiver_id,room){
    const results=await db.sequelize.query("update `chat_list` set message_status='0', message_read_datetime='"+datetime+"' where room='"+room+"' and senter_id='"+receiver_id+"' and message_status='1' ");
    return results[0];
}

async function get_room_last_message(user_id,room){
    let set_user_id='"'+user_id+'"'
    //SELECT * FROM `chat_list` where room='550' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$') and message_type!='date' order by id desc limit 1;
    const results=await db.sequelize.query("SELECT * FROM `chat_list` where room='"+room+"' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') and message_type!='date' order by id desc limit 1");
    return results[0];
}

async function update_group_message_as_read(current_datetime,group_status,id){
    const results=await db.sequelize.query("update `chat_list` set message_status='0',message_read_datetime='"+current_datetime+"',group_status='"+group_status+"' where id='"+id+"'");
    return results[0];
}

async function update_group_message_as_read_for_single_user(group_status,id){
    const results=await db.sequelize.query("update `chat_list` set group_status='"+group_status+"' where id='"+id+"'");
    return results[0];
}

async function update_chat_group_status(group_status, message_id){
    const results=await db.sequelize.query("update `chat_list` set group_status='"+group_status+"' where id='"+message_id+"'");
    return results[0];
}

async function check_user_is_archived(user_id,room){
    const results=await db.sequelize.query("select * from `archived_chat_list` where user_id='"+user_id+"' and room='"+room+"'");
    return results[0];
}

async function save_archived_chat_list(user_id,current_datetime,room){
    const results=await db.sequelize.query("INSERT INTO `archived_chat_list`(`user_id`, `datetime`, `room`) VALUES ('"+user_id+"','"+current_datetime+"','"+room+"')");
    return results[1];
}

async function delete_archived_chat_list(id){
    const results=await db.sequelize.query("delete from `archived_chat_list` where id='"+id+"'");
    return results[0];
}

async function archived_chat_list_details(user_id){
    const results=await db.sequelize.query("select * from `archived_chat_list` where user_id='"+user_id+"'");
    return results[0];
}

async function user_chat_list_details(user_id){
    const results=await db.sequelize.query("SELECT  case  senter_id when '"+user_id+"' then t1.receiver_id else t1.senter_id end as user_id FROM `chat_list` t1 JOIN `user` t2 on t2.id=t1.senter_id JOIN `user` t3 on t3.id=t1.receiver_id where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') and t1.private_group='0' GROUP by t1.room");
    return results[0];
}

async function check_user_privacy(user_id,privacy_type){
    const results=await db.sequelize.query("select * from `user_chat_privacy` where user_id='"+user_id+"' and type='"+privacy_type+"'");
    return results[0];
}

async function check_user_privacy_for_last_seen_and_online(user_id){
    const results=await db.sequelize.query("SELECT * FROM `user_chat_privacy` where (type='last_seen' or type='online') and user_id='"+user_id+"'");
    return results[0];
}

async function check_private_chat_read_receipts(user_id,receiver_id){
    //const results=await db.sequelize.query("SELECT *, DATE_FORMAT(updated_datetime,'%Y-%m-%d %H:%i:%s') as updated_datetime FROM `user_chat_privacy` where user_id in ('"+user_id+"','"+receiver_id+"') and type='read_receipts' and options='1'");
    const results=await db.sequelize.query("SELECT *, DATE_FORMAT(updated_datetime,'%Y-%m-%d %H:%i:%s') as updated_datetime FROM `user_chat_privacy` where user_id in ('"+user_id+"','"+receiver_id+"') and type='read_receipts'");
    return results[0];
}

async function check_group_chat_read_receipts(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function check_user_read_receipts(user_id){
    const results=await db.sequelize.query("select * from `user_chat_privacy` where user_id='"+user_id+"' and options='1'");
    return results[0];
}

async function update_group_current_member(group_id,current_member){
    const results=await db.sequelize.query("update `group_list` set current_members='"+current_member+"' where group_id='"+group_id+"'");
    return results[0];
}

async function room_unread_messages(rooms){
    const results=await db.sequelize.query("select * from `chat_list` where room in ("+rooms+") and message_status='1'");
    return results[0];
}

async function execute_update_query(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function get_last_room_messages(rooms){
    //SELECT * FROM `chat_list` WHERE `room` IN ('group_202303141437479924', '550') AND `id` IN (SELECT MAX(`id`) FROM `chat_list` WHERE `room` IN ('group_202303141437479924', '550') and message_type!='date' GROUP BY `room`) ORDER BY `date` DESC;
    const results=await db.sequelize.query("SELECT * FROM `chat_list` WHERE `room` IN ("+rooms+") AND `id` IN (SELECT MAX(`id`) FROM `chat_list` WHERE `room` IN ("+rooms+") and message_type!='date' GROUP BY `room`) ORDER BY `date` DESC");
    return results[0];
}

async function mark_as_unread(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function remove_mark_as_unread(message_id,group_status){
    const results=await db.sequelize.query("update `chat_list` set group_status='"+group_status+"' where id='"+message_id+"'");
    return results[0];
}

async function save_deleted_chat_list(user_id,room,datetime){
    const results=await db.sequelize.query("INSERT INTO `deleted_chat_list`(`user_id`, `deleted_datetime`, `room`) VALUES ('"+user_id+"','"+datetime+"','"+room+"')");
    return results[0];
}

async function archived_and_deleted_chat_list(user_id){
    const results=await db.sequelize.query("SELECT *, 'archived' as type FROM `archived_chat_list` where user_id='"+user_id+"' UNION SELECT *, 'deleted' as type FROM `deleted_chat_list` where user_id='"+user_id+"'");
    return results[0];
}

async function get_user_deleted_chat_list(user_id){
    const results=await db.sequelize.query("select * from deleted_chat_list where user_id='"+user_id+"'");
    return results[0];
}

async function delete_room_from_deleted_chat_list(room){
    //const results=await db.sequelize.query("delete from `deleted_chat_list` where user_id='"+user_id+"' and room='"+room+"'");
    const results=await db.sequelize.query("delete from `deleted_chat_list` where room='"+room+"'");
    return results[0];
}

async function room_user_messages(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function update_clear_chat_query(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function mute_user_chat_list(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function update_mute_user_chat_list(user_id,receive_id,room,start_datetime,end_datetime,show_notification,type){
    const results=await db.sequelize.query("update `mute_chat_notification` set start_datetime='"+start_datetime+"',end_datetime='"+end_datetime+"',show_notification='"+show_notification+"',type='"+type+"' where user_id='"+user_id+"' and receiver_id='"+receive_id+"'and room='"+room+"'");
    return results[0];
}

async function save_mute_user_chat_list(user_id,receive_id,room,start_datetime,end_datetime,show_notification,type){
    const results=await db.sequelize.query("INSERT INTO `mute_chat_notification`(`datetime`, `user_id`, `receiver_id`, `start_datetime`, `end_datetime`, `type`, `show_notification`, `room`) VALUES ('"+start_datetime+"','"+user_id+"','"+receive_id+"','"+start_datetime+"','"+end_datetime+"','"+type+"','"+show_notification+"','"+room+"')");
    return results[0];
}

async function unmute_user_chat_list(user_id,receive_id,room){
    const results=await db.sequelize.query("delete from `mute_chat_notification` where user_id='"+user_id+"' and receiver_id='"+receive_id+"' and room='"+room+"'");
    return results[0];
}

async function remove_mute_user_chat_list(user_id,room){
    const results=await db.sequelize.query("delete from `mute_chat_notification` where user_id='"+user_id+"' and room='"+room+"'");
    return results[0];
}

async function check_receiver_blocked_me(user_id,receiver_id,room){
    const results=await db.sequelize.query("select * from `block_chat` where user_id='"+receiver_id+"' and receiver_id='"+user_id+"' and room='"+room+"'");
    return results[0];
}

async function get_undelivered_messages(user_id,room){
    //SELECT * FROM `chat_list` where room='550' and delivered_status='1' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"50"', '$');
    const set_user_id='"'+user_id+'"';
    const results=await db.sequelize.query("SELECT * FROM `chat_list` where room='"+room+"' and delivered_status='1' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$')");
    return results[0];
}

async function get_user_undelivered_messages(user_id){
    const set_user_id='"'+user_id+'"';
    const results=await db.sequelize.query("SELECT * FROM `chat_list` where delivered_status='1' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$')");
    return results[0];
}

async function update_private_delivered_message(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function update_private_message_delivered_status(id,group_status){
    const result=await db.sequelize.query("update `chat_list` set delivered_status='0',group_status='"+group_status+"' where id='"+id+"'");
    return result[0];
}

async function update_group_message_delivered_status(id,group_status,update_status){
    var result;
    if(update_status){
        result=await db.sequelize.query("update `chat_list` set delivered_status='0',group_status='"+group_status+"' where id='"+id+"'");
    }else{
        result=await db.sequelize.query("update `chat_list` set group_status='"+group_status+"' where id='"+id+"'");
    }
    return result[0];
}

async function update_group_delivered_message(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function exports_private_chat_list(user_id,room){
    const results=await db.sequelize.query("SELECT t1.*,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t2.name FROM `chat_list` t1 join `user` t2 on t1.senter_id=t2.id where room='"+room+"' and message_type='text' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+user_id+"', '$')");
    return results[0];
}

async function check_message_id_is_valid_in_room(user_id,set_user_id,message_id, room){
    const results=await db.sequelize.query("select *,DATE_FORMAT(date,'%Y-%m-%d %H:%i:%s') as date from `chat_list` where id='"+message_id+"' and senter_id='"+user_id+"' and room='"+room+"' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$')");
    return results[0];
}

async function get_users_profile_data(user_ids){
    const results=await db.sequelize.query("select id, name, phone,profile_pic from `user` where id in ("+user_ids+")");
    return results[0];
}

async function get_unread_message(user_id,rid,room){
    const results=await db.sequelize.query("select * from `chat_list` where senter_id='"+rid+"' and receiver_id='"+user_id+"' and room='"+room+"' and message_status='1'");
    return results[0];
}

async function update_individual_message_as_read_in_query(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

async function my_groups(user_id){
    const results=await db.sequelize.query("SELECT * FROM `group_list` where JSON_CONTAINS(JSON_EXTRACT(current_members, '$[*].user_id'), '"+user_id+"', '$')");
    return results[0];
}

async function save_private_missed_call(senter_id,receiver_id,room,datetime,type,call_type,duration,json_data,added_by){
    const results=await db.sequelize.query("INSERT INTO `call_list`(`senter_id`, `receiver_id`, `room_id`, `datetime`, `type`, `call_type`, `private_group`, `call_duration`, `status`, `json_data`, `added_by`) VALUES ('"+senter_id+"','"+receiver_id+"','"+room+"','"+datetime+"','"+type+"','"+call_type+"','0','"+duration+"','1','"+json_data+"','"+added_by+"')");
    return results[0];
}

async function save_group_call(user_id,room,datetime,type,call_type,duration,json_data,added_by){
    const results=await db.sequelize.query("INSERT INTO `call_list`(`senter_id`, `receiver_id`, `room_id`, `datetime`, `type`, `call_type`, `private_group`, `call_duration`, `status`, `json_data`, `added_by`) VALUES ('"+user_id+"','0','"+room+"','"+datetime+"','"+type+"','"+call_type+"','1','"+duration+"','1','"+json_data+"','"+added_by+"')");
    return results[0];
}

async function check_user_id_based_mobile_number(mobile_number){
    const results=await db.sequelize.query("select id FROM `user` where concat(country,phone) LIKE '%"+mobile_number+"%'");
    return results[0];
}

async function get_last_message_id(user_id,group_id){
    let json_object_0='{"user_id":"'+user_id+'","status":0}';
    let json_object_1='{"user_id":"'+user_id+'","status":1}';
    const results=await db.sequelize.query("select id from chat_list where room='"+group_id+"' and ((JSON_CONTAINS(group_status, '"+json_object_0+"') or JSON_CONTAINS(group_status, '"+json_object_1+"'))) order by id asc limit 1");
    let data=results[0];
    console.log(data)
    if(data.length>0){
        return results[0][0].id;
    }else{
        return '';
    }
    
}

async function check_date_message_is_cleared(user_id,room,date){
    let json_object_2='{"user_id":"'+user_id+'","status":2}';
    const results=await db.sequelize.query("select id,group_status from chat_list where date(date)='"+date+"' and room='"+room+"' and message_type='date' and (JSON_CONTAINS(group_status, '"+json_object_2+"')) ");
    return results[0];
}

async function update_user_date_msg_status(id,group_status){
    const results=await db.sequelize.query("update `chat_list` set `group_status`='"+group_status+"' where id='"+id+"'");
    return results[0];
}

async function individual_contact_msg(datetime, sid, rid, message, room, group_status_json_data,message_id,optional_text) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','contact','"+optional_text+"','" + room + "','1','" + group_status_json_data + "')");
    return results[0];
}

async function group_contact_msg(datetime, sid, message, room, group_status_json_data,message_id,optional_text){
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,optional_text,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + sid + "','0','"+message_id+"','" + message + "','contact','"+optional_text+"','" + room + "','1','1','" + group_status_json_data + "')");
    return results[0];
}

async function execute_raw_update_query(query){
    const results=await db.sequelize.query(query);
    return results[0];
}

module.exports = {
    update_online_status,
    select_online_status,
    get_group_details,
    get_current_date,
    get_group_users,
    post_text_message,
    post_image_message,
    post_voice_message,
    post_doc_message,
    post_video_message,
    get_group_u,
    date_inserting,
    get_group_created_username,
    individual_chat_date,
    individual_text_msg,
    individual_image_msg,
    individual_voice_msg,
    individual_doc_msg,
    individual_video_msg,
    send_indv_message,
    get_recent_chat_accessToken,
    get_user,
    get_recent_chat,
    individual_date_insert,
    group_chat_response,
    get_receiver_details,
    get_indv_messages,
    reply_update,
    reply_message_details,
    get_username,
    get_forward_message_details,
    get_forward_message_count,
    get_user_details,
    check_user_block_status,
    check_user_and_group_data,
    get_unread_message_count,
    get_mute_notification,
    get_user_profile,
    get_unread_message_count_for_group,
    get_forward_message_data,
    save_individual_forward_message,
    get_group_current_users,
    save_group_forward_message,
    check_group_mute_notification,
    get_group_basic_details,
    check_user_valid,
    check_message_id,
    update_delete_message_for_one,
    update_delete_message_for_everyone,
    get_last_private_message,
    get_last_group_message,
    update_user_online_offline_status,
    get_access_token,
    get_device_token,
    receiver_mute_status,
    check_individual_mute_notification,
    check_user_already_blocked,
    block_user_chat,
    save_block_message,
    delete_block_entry,
    check_group_data,
    update_group_user_left_data,
    save_left_message,
    save_group_admin_data,
    save_admin_message,
    save_and_create_group,
    save_group_user_add_message,
    update_removed_group_member_data,
    save_removed_message,
    update_group_profile_pic,
    update_group_profile_details,
    room_chat_list,
    update_clear_chat,
    group_chat_list,
    save_report_chat,
    update_clear_chat_with_single_query,
    save_group_description,
    save_group_name,
    total_pin_chat_count,
    save_pin_chat,
    check_room_is_pinned,
    unpin_chat,
    get_group_chat_list_for_media_count,
    update_individual_message_as_read,
    update_group_message_as_read,
    update_group_message_as_read_for_single_user,
    update_chat_group_status,
    check_user_is_archived,
    save_archived_chat_list,
    delete_archived_chat_list,
    archived_chat_list_details,
    user_chat_list_details,
    check_user_privacy,
    check_private_chat_read_receipts,
    check_group_chat_read_receipts,
    check_user_read_receipts,
    update_group_current_member,
    room_unread_messages,
    execute_update_query,
    get_last_room_messages,
    mark_as_unread,
    get_room_last_message,
    remove_mark_as_unread,
    check_user_privacy_for_last_seen_and_online,
    save_deleted_chat_list,
    archived_and_deleted_chat_list,
    get_user_deleted_chat_list,
    delete_room_from_deleted_chat_list,
    room_user_messages,
    update_clear_chat_query,
    individual_location_msg,
    group_location_msg,
    mute_user_chat_list,
    update_mute_user_chat_list,
    save_mute_user_chat_list,
    unmute_user_chat_list,
    check_receiver_blocked_me,
    get_undelivered_messages,
    update_private_delivered_message,
    update_group_delivered_message,
    exports_private_chat_list,
    check_message_id_is_valid_in_room,
    get_users_profile_data,
    get_unread_message,
    update_individual_message_as_read_in_query,
    my_groups,
    search_chat_list_data,
    remove_user_pinned_rooms,
    save_private_missed_call,
    save_private_missed_call_message,
    save_group_call,
    save_group_call_message,
    search_text_messages,
    check_user_id_based_mobile_number,
    individual_room_using_pagination,
    group_room_using_pagination,
    get_last_message_id,
    check_date_message_is_cleared,
    update_user_date_msg_status,
    get_send_private_message,
    get_last_private_date_message,
    get_group_room_message,
    get_last_group_date_message,
    get_user_undelivered_messages,
    update_private_message_delivered_status,
    update_group_message_delivered_status,
    remove_mute_user_chat_list,
    individual_contact_msg,
    group_contact_msg,
    execute_raw_update_query,
    group_unread_messages,
    get_pinned_chat_list
}