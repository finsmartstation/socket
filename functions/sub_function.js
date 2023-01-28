const queries=require('../queries/queries');
//require('dotenv').config();
const FCM = require('fcm-node');
const serverKey = process.env.FIREBASE_TOKEN; //put your server key here
const fcm = new FCM(serverKey);
const BASE_URL=process.env.BASE_URL;


async function get_last_private_message(room_id,message_id,user_id,opponent_profile,opponent_phone){
    //console.log(room_id,message_id,user_id,opponent_profile,opponent_phone)
    let last_message_data=await queries.get_last_private_message(room_id,message_id);
    //console.log('last message ',last_message_data)
    let last_message_array=[];
    let last_message_available=false;
    let unread_message_count=0;
    let opponent_id;
    let opponent_name;
    if(last_message_data.length>0){
        for(var i=0; i<last_message_data.length; i++){
            unread_message_count=await queries.get_unread_message_count(user_id,room_id);
            if(unread_message_count==null){
                unread_message_count=0;
            }
            let senter_id=last_message_data[i].senter_id;
            let receiver_id=last_message_data[i].receiver_id;
            let opponent_data;
            let opponent_id;
            let opponent_name;
            if(user_id==senter_id){
                console.log('yes')
                //get opponent profile details
                opponent_data=await queries.get_user_profile(receiver_id);
                console.log(opponent_data)
                if(opponent_data.length>0){
                    opponent_id=receiver_id;
                    opponent_name=opponent_data[0].name;
                }else{
                    opponent_id='';
                    opponent_name='';
                }
            }else{
                console.log('no')
                opponent_data=await queries.get_user_profile(senter_id);
                console.log(opponent_data)
                if(opponent_data.length>0){
                    opponent_id=senter_id;
                    opponent_name=opponent_data[0].name;
                }else{
                    opponent_id='';
                    opponent_name='';
                }
            }

            console.log('profile data',message_id,opponent_id,opponent_name);

            //if message is not deleted then set to true
            //check message delete status
            let check_message_status=JSON.parse(last_message_data[i].group_status);
            if(check_message_status.length>0){
                for(var j=0; j<check_message_status.length; j++){
                    if(check_message_status[j].user_id==user_id && check_message_status[j].status==0){
                        //message is deleted
                        console.log('message is deleted')
                        if('deleted_by' in check_message_status[j]){
                            if(check_message_status[j].user_id==user_id){
                                last_message_data[i].message='You deleted this message';
                            }else{
                                last_message_data[i].message='This message was deleted';
                            }
                          }else{
                            last_message_data[i].message='This message was deleted';
                          }
                          last_message_array=[{
                            id: last_message_data[i].id,
                            date: last_message_data[i].date,
                            message: last_message_data[i].message,
                            unread_message: unread_message_count,
                            user_id: opponent_id,
                            name: opponent_name,
                            profile: opponent_profile,
                            phone: opponent_phone,
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'private'
                          }];
                          last_message_available=true;
                    }else if(check_message_status[j].user_id==user_id && check_message_status[j].status==1){
                        console.log('message is not deleted');
                        if(last_message_data[i].message_type=='notification'){
                            if(last_message_data[i].message=='block'){
                                if(user_id==last_message_data[i].senter_id){
                                    last_message_data[i].message='You blocked this contact.';
                                    last_message_array=[{
                                        id: last_message_data[i].id,
                                        date: last_message_data[i].date,
                                        message: last_message_data[i].message,
                                        unread_message: unread_message_count,
                                        user_id: opponent_id,
                                        name: opponent_name,
                                        profile: opponent_profile,
                                        phone: opponent_phone,
                                        room: last_message_data[i].room,
                                        message_type:last_message_data[i].message_type,
                                        chat_type: 'private'
                                      }];
                                      last_message_available=true;
                                }else{
                                //get last private message
                                last_message_array=[{
                                    id: last_message_data[i].id,
                                    date: last_message_data[i].date,
                                    message: '',
                                    unread_message: unread_message_count,
                                    user_id: opponent_id,
                                    name: opponent_name,
                                    profile: opponent_profile,
                                    phone: opponent_phone,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'private'
                                  }];
                                last_message_available=false;
                                
                                }
                            }else if(last_message_data[i].message=='unblock'){
                                if(user_id==last_message_data[i].senter_id){
                                    last_message_data[i].message='You unblocked this contact.';
                                    last_message_array=[{
                                        id: last_message_data[i].id,
                                        date: last_message_data[i].date,
                                        message: last_message_data[i].message,
                                        unread_message: unread_message_count,
                                        user_id: opponent_id,
                                        name: opponent_name,
                                        profile: opponent_profile,
                                        phone: opponent_phone,
                                        room: last_message_data[i].room,
                                        message_type:last_message_data[i].message_type,
                                        chat_type: 'private'
                                      }];
                                      last_message_available=true;
                                }else{
                                //get last private message
                                last_message_array=[{
                                    id: last_message_data[i].id,
                                    date: last_message_data[i].date,
                                    message: '',
                                    unread_message: unread_message_count,
                                    user_id: opponent_id,
                                    name: opponent_name,
                                    profile: opponent_profile,
                                    phone: opponent_phone,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'private'
                                  }];
                                last_message_available=false;
                                }
                            }
                        }else{
                            last_message_array=[{
                                id: last_message_data[i].id,
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                unread_message: unread_message_count,
                                user_id: opponent_id,
                                name: opponent_name,
                                profile: opponent_profile,
                                phone: opponent_phone,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'private'
                              }];
                              last_message_available=true;
                        }
                    }else if(check_message_status[j].user_id==user_id && check_message_status[j].status==2){
                        console.log('message is cleared')
                        last_message_array=[{
                            id: last_message_data[i].id,
                            date: last_message_data[i].date,
                            message: '',
                            unread_message: unread_message_count,
                            user_id: opponent_id,
                            name: opponent_name,
                            profile: opponent_profile,
                            phone: opponent_phone,
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'private'
                          }];
                        last_message_available=false;
                    }
                    
                }
            }
            console.log('loop execution result ',last_message_available,last_message_data[i].id)
            if(last_message_available){
                //console.log('yes data exist', last_message_available)
                break;
            }
        }
        console.log('last message data ',last_message_array,last_message_available)
    }else{
        last_message_array=false;
    }
    return last_message_array;
  }

  async function get_last_group_message(room_id,message_id,user_id,group_members,group_current_members,group_left_members,group_removed_members){
    console.log('parameter ',room_id,message_id,user_id,group_members,group_current_members,group_left_members,group_removed_members)
    let set_user_id='"'+user_id+'"';
    let last_message_array=[];
    let last_message_available=false;
    
    let last_message_data=await queries.get_last_group_message(set_user_id,room_id,message_id)
    console.log('last group message ',last_message_data)
    
    //console.log('group basic data',group_details)
    if(last_message_data.length>0){
        for(var i=0; i<last_message_data.length; i++){
            let check_message_status=JSON.parse(last_message_data[i].group_status);
            if(check_message_status.length>0){
                for(var j=0; j<check_message_status.length;j++){
                    if(user_id==check_message_status[j].user_id && check_message_status[j].status==0){
                        if('deleted_by' in check_message_status[j]){
                            if(check_message_status[j].user_id==user_id){
                                last_message_data[i].message='You deleted this message';
                            }else{
                                last_message_data[i].message='This message was deleted';
                            }
                          }else{
                            last_message_data[i].message='This message was deleted';
                          }

                          last_message_array=[{
                            id: last_message_data[i].id,
                            date: last_message_data[i].date,
                            message: last_message_data[i].message,
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'group'
                          }];
                          last_message_available=true;
                    }else if(user_id==check_message_status[j].user_id && check_message_status[j].status==1){
                        if(last_message_data[i].message_type=='notification'){
                            if(last_message_data[i].message=='added'){
                                console.log('group_members added')
                                let added_by_msg='';
                                let added_user_msg='';
                                let added_users='';
                                for(var k=0; k<group_members.length;k++){
                                    //not need to check first index of the array
                                    if(k!=0){
                                        if(last_message_data[i].date==group_members[k].datetime){
                                            //check which user added
                                            if(user_id==group_members[k].added_by){
                                                added_by_msg=added_by_msg+'You added ';
                                            }else{
                                                added_by_msg=added_by_msg+await queries.get_username(group_members[k].added_by)+' added ';
                                            }
                                            if(group_members[k].user_id==user_id){
                                                added_user_msg=added_user_msg+'You';
                                            }else{
                                                added_user_msg=added_user_msg+group_members[k].username;
                                            }
                                            added_users=added_users+added_user_msg+', ';
                                        }
                                    }
                                    
                                }

                                let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                                let added_msg=added_by_msg+remove_comma;
                                console.log('added msg ',added_msg)
                                last_message_data[i].message=added_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id,
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group'
                                  }];
                                  last_message_available=true;
                            }else if(last_message_data[i].message=='admin'){
                                console.log('admin message loop')
                                let admin_notification_msg='';
                                if(group_members.length>0){
                                    for(var l=0; l<group_members.length; l++){
                                        if(last_message_data[i].date==group_members[l].datetime){
                                            if(user_id==group_members[l].user_id){
                                                admin_notification_msg="You're now an admin";
                                                last_message_available=true;
                                            }else{
                                                //get the last message
                                                last_message_available=false;
                                            }
                                        }else{
                                            last_message_available=false;
                                        }
                                    }
                                }
                                last_message_data[i].message=admin_notification_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id,
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group'
                                  }];
                            }else if(last_message_data[i].message=='left'){
                                let left_msg='';
                                console.log('left user data',group_left_members)
                                if(group_left_members.length>0){
                                    for(var m=0; m<group_left_members.length; m++){
                                        if(last_message_data[i].date==group_left_members[m].datetime){
                                            if(user_id==group_left_members[m].user_id){
                                                left_msg='You left';
                                            }else{
                                                left_msg=await queries.get_username(group_left_members[m].user_id)+' left';
                                            }
                                        }
                                    }
                                }
                                last_message_data[i].message=left_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id,
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group'
                                  }];
                                last_message_available=true;
                            }else if(last_message_data[i].message=='removed'){
                                console.log('removed message')
                                let removed_user_msg='';
                                let removed_by='';
                                let removed_user='';
                                if(group_removed_members.length>0){
                                    for(var n=0; n<group_removed_members.length;n++){
                                        console.log(last_message_data[i])
                                        if(last_message_data[i].date==group_removed_members[n].datetime){
                                            //check which user removed
                                            if(last_message_data[i].senter_id==user_id){
                                                removed_by='You removed ';
                                            }else{
                                                removed_by=await queries.get_username(last_message_data[i].senter_id)+' removed ';
                                            }
                                            //check which user has left
                                            if(user_id==group_removed_members[n].user_id){
                                                removed_user='You';
                                            }else{
                                                removed_user=await queries.get_username(group_removed_members[n].user_id);
                                            }
                                        }
                                    }
                                }
                                removed_user_msg=removed_by+removed_user;
                                last_message_data[i].message=removed_user_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id,
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group'
                                  }];
                                last_message_available=true;
                            }
                        }else if(last_message_data[i].message_type=='text'){
                            console.log('text message');
                            if(last_message_data[i].senter_id==user_id){
                                last_message_data[i].message='You: '+last_message_data[i].message;
                              }else{
                                last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': '+last_message_data[i].message;
                              }
                            last_message_array=[{
                                id: last_message_data[i].id,
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'group'
                              }];
                            last_message_available=true;
                        }else if(last_message_data[i].message_type=='video' || last_message_data[i].message_type=='voice' || last_message_data[i].message_type=='doc' || last_message_data[i].message_type=='image'){
                            console.log('other message');
                            if(last_message_data[i].senter_id==user_id){
                                last_message_data[i].message='You: ';
                            }else{
                                last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': ';
                            }

                            last_message_array=[{
                                id: last_message_data[i].id,
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'group'
                              }];
                            last_message_available=true;
                        }
                    }else if(user_id==check_message_status[j].user_id && check_message_status[j].status==2){
                        last_message_array=[{
                            id: last_message_data[i].id,
                            date: last_message_data[i].date,
                            message: '',
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'group'
                          }];
                        last_message_available=false;
                    }
                }
            }
            console.log('old message',last_message_array,last_message_available)
            if(last_message_available==true){
                break;
            }
        }
    }else{
        last_message_array=false;
    }
    return last_message_array;
  }

  async function send_firebase_notification(device_token, title, body){
    const message={
      to: device_token,
      collapse_key: 'Testing',
      notification: {
        title: title,
        body: body,
      },
      data: {  //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value'
    }
    }
    fcm.send(message,function(err, response){
      if (err) {
          console.log("Something has gone wrong!");
      } else {
          console.log("Successfully sent with response: ", response);
      }
    })
  }

  module.exports={
    get_last_private_message,
    get_last_group_message,
    send_firebase_notification
  }