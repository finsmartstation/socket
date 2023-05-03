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

                        let mark_as_unread=0;
                        if('mark_as_unread' in check_message_status[j]){
                            mark_as_unread=check_message_status[j].mark_as_unread;
                        }else{
                            mark_as_unread=0;
                        }

                          last_message_array=[{
                            id: last_message_data[i].id.toString(),
                            date: last_message_data[i].date,
                            message: last_message_data[i].message,
                            unread_message: unread_message_count,
                            user_id: opponent_id,
                            name: opponent_name,
                            profile: opponent_profile,
                            phone: opponent_phone,
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'private',
                            mark_as_unread: mark_as_unread,
                            optional_text: last_message_data[i].optional_text
                          }];
                          last_message_available=true;
                    }else if(check_message_status[j].user_id==user_id && check_message_status[j].status==1){
                        console.log('message is not deleted');
                        let mark_as_unread=0;
                        if('mark_as_unread' in check_message_status[j]){
                            mark_as_unread=check_message_status[j].mark_as_unread;
                        }else{
                            mark_as_unread=0;
                        }
                        if(last_message_data[i].message_type=='notification'){
                            if(last_message_data[i].message=='block'){
                                if(user_id==last_message_data[i].senter_id){
                                    last_message_data[i].message='You blocked this contact.';
                                    last_message_array=[{
                                        id: last_message_data[i].id.toString(),
                                        date: last_message_data[i].date,
                                        message: last_message_data[i].message,
                                        unread_message: unread_message_count,
                                        user_id: opponent_id,
                                        name: opponent_name,
                                        profile: opponent_profile,
                                        phone: opponent_phone,
                                        room: last_message_data[i].room,
                                        message_type:last_message_data[i].message_type,
                                        chat_type: 'private',
                                        mark_as_unread: mark_as_unread,
                                        optional_text: last_message_data[i].optional_text
                                      }];
                                      last_message_available=true;
                                }else{
                                //get last private message
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: '',
                                    unread_message: unread_message_count,
                                    user_id: opponent_id,
                                    name: opponent_name,
                                    profile: opponent_profile,
                                    phone: opponent_phone,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'private',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=false;
                                
                                }
                            }else if(last_message_data[i].message=='unblock'){
                                if(user_id==last_message_data[i].senter_id){
                                    last_message_data[i].message='You unblocked this contact.';
                                    last_message_array=[{
                                        id: last_message_data[i].id.toString(),
                                        date: last_message_data[i].date,
                                        message: last_message_data[i].message,
                                        unread_message: unread_message_count,
                                        user_id: opponent_id,
                                        name: opponent_name,
                                        profile: opponent_profile,
                                        phone: opponent_phone,
                                        room: last_message_data[i].room,
                                        message_type:last_message_data[i].message_type,
                                        chat_type: 'private',
                                        mark_as_unread: mark_as_unread,
                                        optional_text: last_message_data[i].optional_text
                                      }];
                                      last_message_available=true;
                                }else{
                                //get last private message
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: '',
                                    unread_message: unread_message_count,
                                    user_id: opponent_id,
                                    name: opponent_name,
                                    profile: opponent_profile,
                                    phone: opponent_phone,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'private',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=false;
                                }
                            }else if(last_message_data[i].message=='phone_number_changed'){
                                console.log('phone number changed');
                                //exit ();
                                if(last_message_data[i].senter_id==user_id){
                                    //not needed to show
                                    last_message_array=[{
                                        id: last_message_data[i].id.toString(),
                                        date: last_message_data[i].date,
                                        message: '',
                                        unread_message: unread_message_count,
                                        user_id: opponent_id,
                                        name: opponent_name,
                                        profile: opponent_profile,
                                        phone: opponent_phone,
                                        room: last_message_data[i].room,
                                        message_type:last_message_data[i].message_type,
                                        chat_type: 'private',
                                        mark_as_unread: mark_as_unread,
                                        optional_text: last_message_data[i].optional_text
                                      }];
                                    last_message_available=false;
                                }else{
                                    //needed to show
                                    let phone_number_changed_msg=await queries.get_username(last_message_data[i].senter_id)+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";
                                    last_message_array=[{
                                        id: last_message_data[i].id.toString(),
                                        date: last_message_data[i].date,
                                        message: phone_number_changed_msg,
                                        unread_message: unread_message_count,
                                        user_id: opponent_id,
                                        name: opponent_name,
                                        profile: opponent_profile,
                                        phone: opponent_phone,
                                        room: last_message_data[i].room,
                                        message_type:last_message_data[i].message_type,
                                        chat_type: 'private',
                                        mark_as_unread: mark_as_unread,
                                        optional_text: last_message_data[i].optional_text
                                      }];
                                      last_message_available=true;
                                }
                            }
                        }else{
                            last_message_array=[{
                                id: last_message_data[i].id.toString(),
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                unread_message: unread_message_count,
                                user_id: opponent_id,
                                name: opponent_name,
                                profile: opponent_profile,
                                phone: opponent_phone,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'private',
                                mark_as_unread: mark_as_unread,
                                optional_text: last_message_data[i].optional_text
                              }];
                              last_message_available=true;
                        }
                    }else if(check_message_status[j].user_id==user_id && check_message_status[j].status==2){
                        let mark_as_unread=0;
                        if('mark_as_unread' in check_message_status[j]){
                            mark_as_unread=check_message_status[j].mark_as_unread;
                        }else{
                            mark_as_unread=0;
                        }
                        //console.log('message is cleared')
                        last_message_array=[{
                            id: last_message_data[i].id.toString(),
                            date: last_message_data[i].date,
                            message: '',
                            unread_message: unread_message_count,
                            user_id: opponent_id,
                            name: opponent_name,
                            profile: opponent_profile,
                            phone: opponent_phone,
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'private',
                            mark_as_unread: mark_as_unread,
                            optional_text: last_message_data[i].optional_text
                          }];
                        last_message_available=false;
                    }
                    
                }
            }
            //console.log('loop execution result ',last_message_available,last_message_data[i].id)
            if(last_message_available){
                //console.log('yes data exist', last_message_available)
                break;
            }
        }
        //console.log('last message data ',last_message_array,last_message_available)
    }else{
        last_message_array=false;
    }
    return last_message_array;
  }

  async function get_last_group_message(room_id,message_id,user_id,group_members,group_current_members,group_left_members,group_removed_members,subject_history){
    //console.log('parameter ',room_id,message_id,user_id,group_members,group_current_members,group_left_members,group_removed_members)
    let set_user_id='"'+user_id+'"';
    let last_message_array=[];
    let last_message_available=false;
    
    let last_message_data=await queries.get_last_group_message(set_user_id,room_id,message_id)
    //console.log('last group message ',last_message_data)
    
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

                        let mark_as_unread=0;
                        if('mark_as_unread' in check_message_status[j]){
                            mark_as_unread=check_message_status[j].mark_as_unread;
                        }else{
                            mark_as_unread=0;
                        }

                          last_message_array=[{
                            id: last_message_data[i].id.toString(),
                            date: last_message_data[i].date,
                            message: last_message_data[i].message,
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'group',
                            mark_as_unread: mark_as_unread,
                            optional_text: last_message_data[i].optional_text
                          }];
                          last_message_available=true;
                    }else if(user_id==check_message_status[j].user_id && check_message_status[j].status==1){
                        let mark_as_unread=0;
                        if('mark_as_unread' in check_message_status[j]){
                            mark_as_unread=check_message_status[j].mark_as_unread;
                        }else{
                            mark_as_unread=0;
                        }
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
                                                added_by_msg='You added ';
                                            }else{
                                                added_by_msg=await queries.get_username(group_members[k].added_by)+' added ';
                                            }
                                            if(group_members[k].user_id==user_id){
                                                added_user_msg='You';
                                            }else{
                                                added_user_msg=group_members[k].username;
                                            }
                                            added_users=added_users+added_user_msg+', ';
                                        }
                                    }
                                    
                                }

                                let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                                let added_msg=added_by_msg+remove_comma;
                                //console.log('added msg ',added_msg)
                                last_message_data[i].message=added_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                  last_message_available=true;
                            }else if(last_message_data[i].message=='admin'){
                                //console.log('admin message loop')
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
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
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
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=true;
                            }else if(last_message_data[i].message=='removed'){
                                //console.log('removed message')
                                let removed_user_msg='';
                                let removed_by='';
                                let removed_user='';
                                if(group_removed_members.length>0){
                                    for(var n=0; n<group_removed_members.length;n++){
                                        //console.log(last_message_data[i])
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
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=true;
                            }else if(last_message_data[i].message=='changed_group_icon'){
                                let icon_change_message='';
                                let content="changed this group's icon";
                                // console.log('sss',last_message_data[i].id)
                                // exit ()
                                if(last_message_data[i].senter_id==user_id){
                                    icon_change_message='You '+content;
                                }else{
                                    icon_change_message=await queries.get_username(last_message_data[i].senter_id)+' '+content;
                                }
                                console.log(last_message_data[i].message)
                                last_message_data[i].message=icon_change_message;
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=true;
                            }else if(last_message_data[i].message=='changed_group_description'){
                                let description_message='';
                                if(last_message_data[i].senter_id==user_id){
                                    description_message='You changed the group description. Tap to view.';
                                }else{
                                    description_message=await queries.get_username(last_message_data[i].senter_id)+' changed the group description. Tap to view.';
                                }
                                last_message_data[i].message=description_message;
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=true;
                            }else if(last_message_data[i].message=='changed_group_name'){
                                let subject_message='';
                                let subject_content='changed the subject from';
                                
                                for(var subject_i=0; subject_i<subject_history.length; subject_i++){
                                    if(last_message_data[i].date==subject_history[subject_i].datetime){
                                        if(subject_history[subject_i].user_id==user_id){
                                            let subject_index=subject_i-1;
                                            if(subject_index>=0){
                                                let old_subject=subject_history[subject_i].subject ? subject_history[subject_i].subject : ''
                                                let new_subject=subject_history[subject_i].subject;
                                                subject_message='You '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                                            }
                                        }else{
                                            let subject_index=subject_i-1;
                                            if(subject_index>=0){
                                                let old_subject=subject_history[subject_i].subject ? subject_history[subject_i].subject : ''
                                                let new_subject=subject_history[subject_i].subject;
                                                subject_message=await queries.get_username(subject_history[subject_i].user_id)+' '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                                            }
                                            
                                        }
                                    }
                                }

                                last_message_data[i].message=subject_message;
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: last_message_data[i].message,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                                last_message_available=true;
                            }else if(last_message_data[i].message='phone_number_changed'){
                                let phone_number_changed_msg='';
                                if(last_message_data[i].senter_id==user_id){
                                    //not show this message
                                    phone_number_changed_msg='';
                                    last_message_available=false;
                                }else{
                                    last_message_available=true;
                                    let get_numbers=last_message_data[i].optional_text.split(',');
                                    let change_number_msg=get_numbers[0]+' changed to '+get_numbers[1];
                                    phone_number_changed_msg=change_number_msg;
                                }

                                //last_message_data[i].message=phone_number_changed_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: phone_number_changed_msg,
                                    room: last_message_data[i].room,
                                    message_type:last_message_data[i].message_type,
                                    chat_type: 'group',
                                    mark_as_unread: mark_as_unread,
                                    optional_text: last_message_data[i].optional_text
                                  }];
                            }
                        }else if(last_message_data[i].message_type=='text'){
                            console.log('text message');
                            if(last_message_data[i].senter_id==user_id){
                                last_message_data[i].message='You: '+last_message_data[i].message;
                              }else{
                                last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': '+last_message_data[i].message;
                              }
                            last_message_array=[{
                                id: last_message_data[i].id.toString(),
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'group',
                                mark_as_unread: mark_as_unread,
                                optional_text: last_message_data[i].optional_text
                              }];
                            last_message_available=true;
                        }else if(last_message_data[i].message_type=='video' || last_message_data[i].message_type=='voice' || last_message_data[i].message_type=='doc' || last_message_data[i].message_type=='image'){
                            //console.log('other message');
                            if(last_message_data[i].senter_id==user_id){
                                last_message_data[i].message='You: ';
                            }else{
                                last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': ';
                            }

                            last_message_array=[{
                                id: last_message_data[i].id.toString(),
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'group',
                                mark_as_unread: mark_as_unread,
                                optional_text: last_message_data[i].optional_text
                              }];
                            last_message_available=true;
                        }else if(last_message_data[i].message_type=='location'){
                            //console.log('other message');
                            last_message_array=[{
                                id: last_message_data[i].id.toString(),
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                room: last_message_data[i].room,
                                message_type:last_message_data[i].message_type,
                                chat_type: 'group',
                                mark_as_unread: mark_as_unread,
                                optional_text: last_message_data[i].optional_text
                              }];
                            last_message_available=true;
                        }
                    }else if(user_id==check_message_status[j].user_id && check_message_status[j].status==2){
                        let mark_as_unread=0;
                        if('mark_as_unread' in check_message_status[j]){
                            mark_as_unread=check_message_status[j].mark_as_unread;
                        }else{
                            mark_as_unread=0;
                        }
                        last_message_array=[{
                            id: last_message_data[i].id.toString(),
                            date: last_message_data[i].date,
                            message: '',
                            room: last_message_data[i].room,
                            message_type:last_message_data[i].message_type,
                            chat_type: 'group',
                            mark_as_unread: mark_as_unread
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

  async function send_firebase_notification(user_id,device_token, title, body, type,profile_pic,message_type){
    //console.log(device_token, title, body, type,profile_pic,message_type)
    //exit ()
    const message={
      to: device_token,
      //registration_ids: device_token,
      collapse_key: 'Testing',
      notification: {
        title: title,
        body: body,
      },
      data: {  //you can send only notification or only data(or include both)
        // my_key: 'my value',
        // my_another_key: 'my another value',
         user_id: user_id,
         title: title,
         type: type,
         message: body,
         profile_pic: profile_pic,
         message_format: message_type
    }
    }
    //console.log(message)
    try{
        fcm.send(message,function(err, response){
            console.log(err)
          if (err) {
              console.log("Something has gone wrong!");
          } else {
              console.log("Successfully sent with response: ", response);
          }
        })
    }catch(fc){
        console.log(fc)
    }
    
  }

  async function send_firebase_notification_group(group_id,device_token, title, body, type,group_profile_pic,message_type){
    //console.log(device_token, title, body, type,group_profile_pic,message_type)
    //exit ()
    const message={
      to: device_token,
      //registration_ids: device_token,
      collapse_key: 'Testing',
      notification: {
        title: title,
        body: body,
      },
      data: {  //you can send only notification or only data(or include both)
        // my_key: 'my value',
        // my_another_key: 'my another value',
         user_id: group_id,
         title: title,
         type: type,
         message: body,
         profile_pic: group_profile_pic,
         message_format: message_type
    }
    }
    
        fcm.send(message,function(err, response){
            //console.log(err)
          if (err) {
              console.log("Something has gone wrong!");
          } else {
              console.log("Successfully sent with response: ", response);
          }
        })
  }

//   function check_value_exist_in_archived_chat_list(room,archived_chat_list){
//     return archived_chat_list.some(function(archived){
//       return archived.room==room;
//     });
//   }

  function check_value_exist_in_archived_chat_list(room,archived_chat_list,type){
    return archived_chat_list.some(function(archived){
      return archived.room==room && archived.type=='archived';
    });
  }

  function check_value_exist_in_deleted_chat_list(room,deleted_chat_list,type){
    return deleted_chat_list.some(function(deleted){
        return deleted.room==room && deleted.type=='deleted';
    })
  }

  async function check_profile_pic_privacy(user_id,receiver_id){
    //let profile_pic=BASE_URL+'uploads/default/profile.png';
    let show_profile_pic_status=0;
    //0 -- not show profile pic to user && 1 -- show profile pic to user
    if(user_id!='' && receiver_id!=''){
      //check who can see your profile pic
      
      let check_privacy_profile_pic=await queries.check_user_privacy(user_id,'profile_pic');
      //console.log(check_privacy_profile_pic)
      
      if(check_privacy_profile_pic.length>0){
        let profile_options=check_privacy_profile_pic[0].options;
        //var_dump(profile_options)
        if(profile_options==0){
            show_profile_pic_status=1;
        }else if(profile_options==1){
            //check user is member of users chat_list
            let get_user_chat_list_data=await queries.user_chat_list_details(user_id);
            let check_user_exist_in_chat_list=check_user_data_exist_in_array(receiver_id,get_user_chat_list_data);
            if(check_user_exist_in_chat_list){
                show_profile_pic_status=1;
            }else{
                show_profile_pic_status=0;
            }
        }else if(profile_options==2){
            let excepted_users=check_privacy_profile_pic[0].options;
            //console.log(excepted_users)
            if(excepted_users!=''){
                excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
            }else{
                excepted_users=[];
            }
            
            if(excepted_users.includes(receiver_id)){
                show_profile_pic_status=0;
            }else{
                show_profile_pic_status=1;
            }
        }else if(profile_options==3){
            show_profile_pic_status=0;
        }
      }else{
        show_profile_pic_status=1;
      }
    }
    //console.log(show_profile_pic_status);
    //exit ()
    return show_profile_pic_status;
  }

  function check_user_data_exist_in_array(user_id, user_array){
    return user_array.some(function(user){
      return user.user_id == user_id
    })
  }

  

  module.exports={
    get_last_private_message,
    get_last_group_message,
    send_firebase_notification,
    check_value_exist_in_archived_chat_list,
    check_value_exist_in_deleted_chat_list,
    check_profile_pic_privacy,
    check_user_data_exist_in_array,
    send_firebase_notification_group
  }