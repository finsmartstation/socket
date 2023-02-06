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
async function post_text_message(datetime, s_id, message, room, member_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','text','" + room + "','1','1','" + member_json_data + "')");
    return results;
}
async function post_image_message(datetime, s_id, message, room, member_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','image','" + room + "','1','1','" + member_json_data + "')");
    return results;
}
async function post_voice_message(datetime, s_id, message, room, member_json_data, duration,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','voice','" + room + "','1','1','" + member_json_data + "','" + duration + "')");
    return results;
}
async function post_doc_message(datetime, s_id, message, room, member_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,private_group,group_status) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','doc','" + room + "','1','1','" + member_json_data + "')");
    return results;
}
async function post_video_message(datetime, s_id, message, room, member_json_data, duration, message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list(date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + s_id + "','0','"+message_id+"','" + message + "','video','" + room + "','1','1','" + member_json_data + "','" + duration + "')");
    return results;
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
async function individual_text_msg(datetime, sid, rid, message, room, group_status_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','text','" + room + "','1','" + group_status_json_data + "')");
    return results;
}
async function individual_image_msg(datetime, sid, rid, message, room, group_status_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','image','" + room + "','1','" + group_status_json_data + "')");
    return results;
}
async function individual_voice_msg(datetime, sid, rid, message, room, group_status_json_data, duration,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','voice','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}
async function individual_doc_msg(datetime, sid, rid, message, room, group_status_json_data,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','doc','" + room + "','1','" + group_status_json_data + "')");
    return results;
}
async function individual_video_msg(datetime, sid, rid, message, room, group_status_json_data, duration,message_id) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','" + message + "','video','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}
async function send_indv_message(rid, room){
    //const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.message,t1.message_type,t1.message_status,t1.room,t1.duration, IF(t1.receiver_id='" + rid + "', 'sent', 'receive') as type FROM `chat_list` t1 JOIN `user` t2 on t2.id='" + rid + "' WHERE room='" + room + "' and t1.status='1'");
    const results = await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.receiver_id,t1.replay_id,t1.forward_id,t1.message,t1.message_type,t1.duration,t1.message_status,t1.room, IF(t1.receiver_id='"+rid+"', 'sent', 'receive') as type,t1.group_status  FROM `chat_list` t1 JOIN `user` t2 on t2.id='"+rid+"' where room='"+room+"' and message_type!='date';");
    return results;
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
    const results=await db.sequelize.query("SELECT *, DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date FROM `chat_list` t1 JOIN (SELECT MAX(id) as max_id FROM `chat_list` where message_type!='date' and JSON_CONTAINS(JSON_EXTRACT(group_status, '$[*].user_id'), '"+set_user_id+"', '$') GROUP by room) t2 on t1.id=t2.max_id where (t1.senter_id='"+user_id+"' or t1.receiver_id='"+user_id+"') or (t1.receiver_id='0' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+set_user_id+"', '$')) order by id desc")
    return results[0];
}
async function individual_date_insert(datetime,sid,rid,room,group_status_json_data,message_id){
    const results=await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,message,message_type,room,message_status,group_status) VALUES ('" + datetime + "','" + sid + "','" + rid + "','"+message_id+"','','date','" + room + "','0','" + group_status_json_data + "')")
    return results;
}
async function group_chat_response(sid,user_id_quotes,room){
    //const results=await db.sequelize.query("SELECT t1.id,t1.date,t1.senter_id,t1.message,t1.message_type,t1.room,t1.message_status,t1.replay_id,t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.status='1' and t1.private_group='1' and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+user_id_quotes+"', '$') order by id asc");
    const results=await db.sequelize.query("SELECT t1.id,DATE_FORMAT(t1.date,'%Y-%m-%d %H:%i:%s') as date,t1.senter_id,t1.message,t1.replay_id,t1.forward_id,t1.message_type,t1.duration,t1.room,t1.message_status, t2.name,if(t1.senter_id='"+sid+"','sent','receive') as type,t1.group_status FROM `chat_list` t1 join `user` t2 on t1.Senter_id=t2.id where t1.room='"+room+"' and t1.private_group='1'  and JSON_CONTAINS(JSON_EXTRACT(t1.group_status, '$[*].user_id'), '"+user_id_quotes+"', '$') and t1.message_type!='date' order by id asc");
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
    const results=await db.sequelize.query("select message_status,group_status from chat_list where private_group='1' and senter_id!='"+user_id+"' and room='"+room+"' and message_type!='date'");
    return results[0];
}

async function get_mute_notification(user_id,receiver_id){
    const results=await db.sequelize.query("select *, DATE_FORMAT(datetime,'%Y-%m-%d %H:%i:%s') as datetime, DATE_FORMAT(start_datetime,'%Y-%m-%d %H:%i:%s') as start_datetime, DATE_FORMAT(end_datetime,'%Y-%m-%d %H:%i:%s') as end_datetime from mute_chat_notification where user_id='"+user_id+"' and receiver_id='"+receiver_id+"'");
    return results[0];
}

async function get_user_profile(user_id){
    const results=await db.sequelize.query("select name,profile_pic,phone from user where id='"+user_id+"'");
    return results[0];
}

async function get_forward_message_data(message_id){
    const results=await db.sequelize.query("select message,message_type,duration from chat_list where id='"+message_id+"'");
    return results[0];
}

async function save_individual_forward_message(forward_id,datetime, sid, rid, message, message_type, room, duration, group_status_json_data) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,forward_id,message,message_type,room,message_status,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','0','"+forward_id+"','" + message + "','"+message_type+"','" + room + "','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}

async function get_group_current_users(group_id){
    const results= await db.sequelize.query("select current_members from group_list where group_id='"+group_id+"'");
    return results[0];
}

async function save_group_forward_message(forward_id,datetime, sid, rid, message, message_type, room, duration, group_status_json_data) {
    const results = await db.sequelize.query("INSERT INTO chat_list( date,senter_id,receiver_id,replay_id,forward_id,message,message_type,room,message_status,private_group,group_status,duration) VALUES ('" + datetime + "','" + sid + "','" + rid + "','0','"+forward_id+"','" + message + "','"+message_type+"','" + room + "','1','1','" + group_status_json_data + "','" + duration + "')");
    return results;
}

async function check_group_mute_notification(user_id, room){
    const results=await db.sequelize.query("select *, DATE_FORMAT(datetime,'%Y-%m-%d %H:%i:%s') as datetime, DATE_FORMAT(start_datetime,'%Y-%m-%d %H:%i:%s') as start_datetime, DATE_FORMAT(end_datetime,'%Y-%m-%d %H:%i:%s') as end_datetime from mute_chat_notification where user_id='"+user_id+"' and receiver_id='0' and room='"+room+"'");
    return results[0];
}

async function get_group_basic_details(group_id){
    const results=await db.sequelize.query("select group_name,group_profile,members,left_members,removed_members,current_members from group_list where group_id='"+group_id+"'");
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

async function save_and_create_group(created_by,created_datetime,group_id,group_name,group_profile,members,current_members){
    const results=await db.sequelize.query("INSERT INTO `group_list`(`created_by`, `created_datetime`, `group_id`, `group_name`, `group_profile`, `members`, `current_members`, `status`) VALUES ('"+created_by+"','"+created_datetime+"','"+group_id+"','"+group_name+"','"+group_profile+"','"+members+"','"+current_members+"','1')");
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

async function update_group_profile_pic(profile_pic,group_id){
    const results=await db.sequelize.query("update group_list set group_profile='"+profile_pic+"' where group_id='"+group_id+"'");
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
    update_group_profile_details
}