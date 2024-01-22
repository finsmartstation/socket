const queries=require('../queries/queries');
const other_functions=require('./other_function');
//require('dotenv').config();
const FCM = require('fcm-node');
const serverKey = process.env.FIREBASE_TOKEN; //put your server key here
const fcm = new FCM(serverKey);
const BASE_URL=process.env.BASE_URL;


async function get_last_private_message(room_id,message_id,user_id,opponent_profile,opponent_phone){
    //console.log(room_id,message_id,user_id,opponent_profile,opponent_phone)
    let last_message_data=await queries.get_last_private_message(room_id,message_id);
    console.log('last message ',last_message_data)
    let last_message_array=[];
    let last_message_available=false;
    let unread_message_count=0;
    // let opponent_id;
    // let opponent_name;
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

            //console.log('profile data',message_id,opponent_id,opponent_name);

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
                        last_message_data[i].message_type='text';
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
                        //console.log('message is not deleted');
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
                            }else if(last_message_data[i].message=='Missed voice call'){
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: 'Missed voice call',
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
                            }else if(last_message_data[i].message=='Missed video call'){
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: 'Missed video call',
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
                        }else if(last_message_data[i].message_type=='contact'){
                            let contact_msg=last_message_data[i].message;
                            let check_contact_user_available=false;
                            console.log(contact_msg)
                            if(contact_msg!=''){
                                contact_msg=JSON.parse(last_message_data[i].message);
                                contact_msg=contact_msg.sort((a, b) => {
                                    if (a.user_id !== "" && b.user_id === "") {
                                      return -1;
                                    } else if (a.user_id === "" && b.user_id !== "") {
                                      return 1;
                                    } else if (a.contact_name === "" && b.contact_name === "") {
                                      return 0;
                                    } else if (a.contact_name === "") {
                                      return 1;
                                    } else if (b.contact_name === "") {
                                      return -1;
                                    } else {
                                      return a.contact_name.localeCompare(b.contact_name);
                                    }
                                  });
                            }else{
                                contact_msg=[];
                            }
                            for(var k=0; k<contact_msg.length; k++){
                                //console.log(contact_msg[k])
                                if(contact_msg[k].user_id!=''){
                                    check_contact_user_available=true;
                                }
                            }
                            //console.log(check_contact_user_available)
                            if(check_contact_user_available){
                                //console.log('available')
                                if(contact_msg.length>1){
                                    let remaining_user=contact_msg.length-1;
                                    let contact_text=' other contacts';
                                    if(remaining_user==1){
                                        contact_text=' other contact';
                                    }
                                    if(contact_msg[0].contact_name!=''){
                                        last_message_data[i].message=contact_msg[0].contact_name+' and '+remaining_user+contact_text;
                                    }else{
                                        last_message_data[i].message=contact_msg[0].number+' and '+remaining_user+contact_text;
                                    }
                                }else{
                                    if(contact_msg[0].contact_name!=''){
                                        last_message_data[i].message=contact_msg[0].contact_name;
                                    }else{
                                        last_message_data[i].message=contact_msg[0].number;
                                    }
                                }
                            }else{
                                //console.log('not available')
                                if(contact_msg.length>1){
                                    last_message_data[i].message=contact_msg.length+' contacts';
                                }else{
                                    if(contact_msg[0].contact_name!=''){
                                        last_message_data[i].message=contact_msg[0].contact_name;
                                    }else{
                                        last_message_data[i].message=contact_msg[0].number;
                                    }
                                }
                            }
                            // if(last_message_data[i].senter_id==user_id){
                            //     last_message_data[i].message='You: '
                            // }else{
                            //     last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': 👤'+last_message_data[i].message;
                            // }
                            last_message_data[i].message='👤'+last_message_data[i].message;
                            //console.log(last_message_data[i].message);
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
                                message_type: last_message_data[i].message_type,
                                chat_type: 'private',
                                mark_as_unread: mark_as_unread,
                                optional_text: last_message_data[i].optional_text
                            }];
                            last_message_available=true;
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
                        last_message_data[i].message_type='text';
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
                            }else if(last_message_data[i].message=='phone_number_changed'){
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
                            }else if(last_message_data[i].message=='group_call'){
                                //exit ()
                                let group_call_msg='';
                                if(last_message_data[i].senter_id==user_id){
                                    group_call_msg='You started a call';
                                }else{
                                    group_call_msg=await queries.get_username(last_message_data[i].senter_id)+' started a call';;
                                }
                                last_message_available=true;
                                //last_message_data[i].message=phone_number_changed_msg;
                                last_message_array=[{
                                    id: last_message_data[i].id.toString(),
                                    date: last_message_data[i].date,
                                    message: group_call_msg,
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
                                last_message_data[i].message='You: '+last_message_data[i].message;
                            }else{
                                last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': '+last_message_data[i].message;;
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
                        }else if(last_message_data[i].message_type=='contact'){
                            //console.log(last_message_data[i].id,last_message_data[i].message)
                            let contact_msg=last_message_data[i].message;
                            let contact_user_available=false;
                            //console.log(contact_msg)
                            if(contact_msg!=''){
                                contact_msg=JSON.parse(last_message_data[i].message);
                                contact_msg=contact_msg.sort((a, b) => {
                                    if (a.user_id !== "" && b.user_id === "") {
                                      return -1;
                                    } else if (a.user_id === "" && b.user_id !== "") {
                                      return 1;
                                    } else if (a.contact_name === "" && b.contact_name === "") {
                                      return 0;
                                    } else if (a.contact_name === "") {
                                      return 1;
                                    } else if (b.contact_name === "") {
                                      return -1;
                                    } else {
                                      return a.contact_name.localeCompare(b.contact_name);
                                    }
                                  });
                            }else{
                                contact_msg=[];
                            }
                            //console.log(contact_msg)
                            for(var k=0; k<contact_msg.length; k++){
                                //console.log(contact_msg[k]);
                                if(contact_msg[k].user_id!=''){
                                    contact_user_available=true;
                                }
                            }
                            if(contact_user_available){
                                //console.log('contact user available')
                                if(contact_msg.length>1){
                                    let remaining_user=contact_msg.length-1;
                                    let other_contact_text=' other contacts';
                                    if(remaining_user==1){
                                        other_contact_text=' other contact';
                                    }  
                                    if(contact_msg[0].contact_name!=''){
                                        last_message_data[i].message=contact_msg[0].contact_name+' and '+remaining_user+other_contact_text;
                                    }else{
                                        last_message_data[i].message=contact_msg[0].number+' and '+remaining_user+other_contact_text;
                                    }
                                }else{
                                    if(contact_msg[0].contact_name!=''){
                                        last_message_data[i].message=contact_msg[0].contact_name;
                                    }else{
                                        last_message_data[i].message=contact_msg[0].number;
                                    }
                                }
                            }else{
                                //console.log('no contact user found')
                                if(contact_msg.length>1){
                                    last_message_data[i].message=contact_msg.length+' contacts';
                                }else{
                                    if(contact_msg[0].contact_name!=''){
                                        last_message_data[i].message=contact_msg[0].contact_name;
                                    }else{
                                        last_message_data[i].message=contact_msg[0].number;
                                    }
                                }
                            }
                            //console.log(last_message_data[i].message,last_message_data[i].id,last_message_data[i].senter_id,user_id);
                            if(last_message_data[i].senter_id==user_id){
                                last_message_data[i].message='You: 👤'+last_message_data[i].message;
                            }else{
                                last_message_data[i].message=await queries.get_username(last_message_data[i].senter_id)+': 👤'+last_message_data[i].message;
                            }
                            //console.log(last_message_data[i].message)
                            last_message_array=[{
                                id: last_message_data[i].id.toString(),
                                date: last_message_data[i].date,
                                message: last_message_data[i].message,
                                room: last_message_data[i].room,
                                message_type: last_message_data[i].message_type,
                                chat_type: 'group',
                                mark_as_unread: mark_as_unread,
                                optional_text: last_message_data[i].optional_text
                            }];
                            //console.log(last_message_array);
                            //exit ();
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
            //console.log('old message',last_message_array,last_message_available)
            if(last_message_available==true){
                break;
            }
        }
    }else{
        last_message_array=false;
    }
    return last_message_array;
  }

  async function send_firebase_notification(user_id,device_token, title, body, type,profile_pic,message_type,sound,vibration,room){
    //console.log(device_token, title, body, type,profile_pic,message_type)
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
         message_format: message_type,
         sound: sound,
         vibration: vibration,
         room: room
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

  async function send_firebase_notification_group(group_id,device_token, title, body, type,group_profile_pic,message_type,sound,vibration,room){
    //console.log('group id',group_id,'device token',device_token, 'title',title, 'body',body, 'type',type,'g profile',group_profile_pic,'me typ',message_type)
    //console.log(sound,vibration)
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
         message_format: message_type,
         sound: sound,
         vibration: vibration,
         room: room
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
            // let get_user_chat_list_data=await queries.user_chat_list_details(user_id);
            // let check_user_exist_in_chat_list=check_user_data_exist_in_array(receiver_id,get_user_chat_list_data);
            // if(check_user_exist_in_chat_list){
            //     show_profile_pic_status=1;
            // }else{
            //     show_profile_pic_status=0;
            // }
            let excepted_users=check_privacy_profile_pic[0].options;
            //console.log(excepted_users)
            if(excepted_users!=''){
                excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
            }else{
                excepted_users=[];
            }
            
            if(excepted_users.includes(receiver_id)){
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

  function check_id_exist_in_message_array(id,message_array){
    return message_array.some(function(message){
        return message.id == id;
    })
  }

  async function get_private_message_read_receipt(group_status){
    var read_receipt=1;
    for(var j=0; j<group_status.length; j++){
      //check any one read receipt off
      if(read_receipt==1){
        read_receipt=group_status[j].read_receipt!=undefined ? group_status[j].read_receipt : 1;
      }
    }
    return read_receipt;
  }

  function get_private_message_read_receipt_history(group_status){
    var read_receipt=1;
    for(var j=0; j<group_status.length; j++){
      //check any one read receipt off
      if(read_receipt==1){
        read_receipt=group_status[j].read_receipt!=undefined ? group_status[j].read_receipt : 1;
      }
    }
    return read_receipt;
  }

  async function get_last_private_message_history(sid,rid,room,limit=10){
    var result=await queries.individual_room_using_pagination(sid,rid,room,limit,0);
    var get_current_datetime=get_datetime()
    result[0]=result[0].reverse();
    console.log(result[0],result[0].length)
    let read_receipt=1;
    let message_length=result[0].length
    let message_list_response=[];
    for (var i = 0; i < message_length; i++) {
        //console.log('replay id data ',result[0][i].replay_id)
        let split_date=result[0][i].date.split(" ");
        //console.log(split_date[0])
        //change message_status type to string
        result[0][i].senter_id=result[0][i].senter_id.toString();
        result[0][i].receiver_id=result[0][i].receiver_id.toString();
        result[0][i].message_status=result[0][i].message_status.toString();
        if (result[0][i].message_type == 'date') {
          result[0][i].type = 'date';
          // console.log('first ', result[i].type)
        }

        //result[i].data='12's
        //get reply message data
        if(result[0][i]['replay_id']!=0 && result[0][i]['replay_id']!=''){
          //console.log('msg has reply msg',result[0][i]['replay_id'])
          
          //write reply msg query to get reply msg details
          let reply_message_details=await queries.reply_message_details(result[0][i]['replay_id']);
          //console.log(reply_message_details[0]);
          //exit ()
          //console.log('reply msg', reply_message_details[0][0].message)
          result[0][i]['reply_message']=reply_message_details[0][0] ? reply_message_details[0][0].message : '';
          result[0][i]['reply_message_type']=reply_message_details[0][0] ? reply_message_details[0][0].message_type : '',
          //result[0][i]['reply_senter']=reply_message_details[0].senter_id;
          result[0][i]['reply_duration']=reply_message_details[0][0] ? reply_message_details[0][0].duration : '0';
          //console.log('id s',reply_message_details[0][0].id)
          result[0][i]['replay_id']=reply_message_details[0][0] ? reply_message_details[0][0].id.toString() : '0';
          //reply_message type -- video
          
          if(result[0][i]['reply_message_type']=='video'){
            //console.log('thumb data',reply_message_details[0][0]['thumbnail'])
            if(reply_message_details[0][0]['thumbnail']!=''){
              result[0][i]['reply_message']=BASE_URL+reply_message_details[0][0]['thumbnail'];
              //console.log(result[0][i]['thumbnail'])
              
            }
            // exit ();
            // console.log(result[0][i]['reply_message'])
            
          }
          //reply_message type -- image
          if(result[0][i]['reply_message_type']=='image'){
            if(result[0][i]['reply_message']!=''){
              result[0][i]['reply_message']=BASE_URL+result[0][i]['reply_message']
            }
          }
          //senter
          if(sid==result[0][i]['senter_id']){
            result[0][i]['reply_senter']='You';
          }else{
            //get sender name
            result[0][i]['reply_senter']=await queries.get_username(result[0][i]['senter_id']);
            //console.log(result[0][i]['reply_senter'])
          }
          // result[0][i]['replay_id']=result[0][i]['replay_id'].toString();
        }else{
          //console.log('msg has no reply msg')
          result[0][i]['replay_id']='0';
          result[0][i]['reply_message']='';
          result[0][i]['reply_message_type']='';
          result[0][i]['reply_senter']='';
          result[0][i]['reply_duration']='0';
        }

        //console.log('reply id  ', result[0][i]);
        //exit ();
        //get forward messages
        if(result[0][i]['forward_id']!=0 && result[0][i]['forward_id']!=''){
          //message has forward message
          let forward_message_details=await queries.get_forward_message_details(result[0][i]['forward_id']);
          let get_forward_message_count=await queries.get_forward_message_count(result[0][i]['forward_id'])
          //console.log(forward_message_details);
          result[0][i]['forward_id']=forward_message_details[0].forward_id;
          result[0][i]['forward_count']=get_forward_message_count;
          if(get_forward_message_count>=10){
            result[0][i]['forward_message_status']='Forwarded Many Times';
          }else{
            result[0][i]['forward_message_status']='Forwarded';
          }
        }else{
          //message not have forward message
          result[0][i]['forward_id']='0';
          result[0][i]['forward_count']=0;
          result[0][i]['forward_message_status']='';
          
        }

        //check message deleted or not
        let group_status_json
        //console.log('group data',result[0][i]['group_status'])
        //let group_status_json=JSON.parse(result[0][i]['group_status']) || [];
        if(result[0][i]['group_status']!=''){
          group_status_json=JSON.parse(result[0][i]['group_status']);
        }else{
          group_status_json=[];
        }
        
        if(group_status_json.length>0){
            // if(result[0][i]['id']==1331){
            //     console.log(group_status_json)
                
            //     console.log(read_receipt,'inner')
            //     exit ()
            // }
            //console.log(result[0][i]['id'])
            read_receipt=get_private_message_read_receipt_history(group_status_json);
            //console.log(read_receipt)
            for(j=0; j < group_status_json.length; j++){
            let starred_status=group_status_json[j].starred_status ? group_status_json[j].starred_status : '0';
            //console.log('starred ',starred_status)
            //console.log('group status data ',group_status_json[j])
            if(group_status_json[j].user_id==sid && group_status_json[j].status==0){
                //console.log('0')
                if('deleted_by' in group_status_json[j]){
                //console.log('ssss');
                if(group_status_json[j].deleted_by==sid){
                    //"You deleted this message";
                    result[0][i]['message']="You deleted this message";
                }else{
                    result[0][i]['message']="This message was deleted";
                }
                }else{
                //console.log('nnnn')
                result[0][i]['message']="This message was deleted";
                }
                result[0][i]['message_type']='text';
                if(result[0][i]['delivered_status']==0){
                result[0][i].message_status=result[0][i].message_status;
                }else{
                result[0][i].message_status="2";
                }
                
                if(result[0][i]['message_type']=='notification'){
                //check user
                if(result[0][i]['senter_id']==sid){
                    if(result[0][i]['message']=='block'){
                    //console.log(' msg is block')
                    let block_msg="You blocked this contact. Tap to unblock.";
                    //check date is exist in date_array
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        //message: block_msg,
                        message: result[0][i]['message'],
                        message_type:"notification",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "0",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ""
                    });
                    
                    }else if(result[0][i]['message']=='unblock'){
                    //console.log(' msg is unblock')
                    let unblock_msg="You unblocked this contact.";
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        //message: unblock_msg,
                        message: result[0][i]['message'],
                        message_type:"notification",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "0",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                    }
                }else{
                    if(result[0][i]['message']=='phone_number_changed'){
                    //console.log('phone number changed');

                    //let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";
                    //console.log(number_changed_msg)
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        //message: number_changed_msg,
                        message: result[0][i]['message'],
                        message_type:"phone_number_changed",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "1",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                    }
                }
                }else{
                console.log(result[0][i]['message_type'])
                //add block message data entry
                message_list_response.push({
                    id: result[0][i].id.toString(),
                    date: result[0][i].date,
                    senter_id: result[0][i].senter_id,
                    receiver_id: result[0][i].receiver_id,
                    message: result[0][i].message,
                    message_type:result[0][i].message_type,
                    duration: result[0][i].duration.toString(),
                    message_status:result[0][i].message_status,
                    room:result[0][i].room,
                    type:result[0][i].type,
                    status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                    replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                    replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                    replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                    replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                    //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                    replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                    forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                    forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                    forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                    delete_status : "0",
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: result[0][i].optional_text,
                    thumbnail: ''
                });
                    
                }
                //console.log('all the dates', date_array)
            }else if(group_status_json[j].user_id==sid && group_status_json[j].status==1){
                //console.log(result[0][i]['delivered_status'],'delivered_status' in group_status_json[j],group_status_json[j]);
                console.log(result[0][i]);
                
                if(result[0][i]['delivered_status']==0){
                result[0][i].message_status=result[0][i].message_status;
                }else{
                result[0][i].message_status="2";
                }
                
                
                //not deleted message
                if(result[0][i]['message_type']=='notification'){
                //console.log('yes notification ')
                //check user
                if(result[0][i]['senter_id']==sid){
                    if(result[0][i]['message']=='block'){
                    //console.log(' msg is block')
                    let block_msg="You blocked this contact. Tap to unblock.";
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: block_msg,
                        message_type:"notification",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "1",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                        
                    }else if(result[0][i]['message']=='unblock'){
                    //console.log(' msg is unblock')
                    let unblock_msg="You unblocked this contact.";
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: unblock_msg,
                        message_type:"notification",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "1",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                    }
                }else{
                    //console.log('sssss')
                    
                    //opponent user
                    //receiver side notification meesage
                    if(result[0][i]['message']=='phone_number_changed'){
                    console.log('phone number changed');
                    let split_phone_number=result[0][i].optional_text.split(',')
                    console.log(split_phone_number);
                    let new_phone_number=split_phone_number[1]!=undefined ? split_phone_number[1] : '';
                    //let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";
                    let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number to "+new_phone_number;

                    //console.log(number_changed_msg)
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: number_changed_msg,
                        message_type:"phone_number_changed",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "1",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                    }else if(result[0][i]['message']=='Missed voice call'){
                    //exit ()
                    let call_msg="Missed voice call";
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: call_msg,
                        message_type:"notification",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "1",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                    }else if(result[0][i]['message']=='Missed video call'){
                    let call_msg="Missed video call";
                    //add block message data entry
                    message_list_response.push({
                        id: result[0][i].id.toString(),
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: call_msg,
                        message_type:"notification",
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:"notification",
                        status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                        replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                        replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                        replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                        //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                        forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                        forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                        forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                        delete_status : "1",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                    });
                    }
                }
                }else if(result[0][i]['message_type']=='contact'){
                //console.log('contact')
                let contact_msg=result[0][i].message;
                //console.log(contact_msg);
                let set_contact_msg='';
                let contact_user_profile_pic='';
                let user_available_status='not available';
                let available_user_id='';
                if(contact_msg!=''){
                    contact_msg=JSON.parse(result[0][i].message);
                    //console.log(result[0][i].id,contact_msg);
                    //contact_msg=contact_msg.sort((a,b)=>(a.contact_name > b.contact_name ? 1 : -1));
                    contact_msg=contact_msg.sort((a, b) => {
                    if (a.user_id !== "" && b.user_id === "") {
                        return -1;
                    } else if (a.user_id === "" && b.user_id !== "") {
                        return 1;
                    } else if (a.contact_name === "" && b.contact_name === "") {
                        return 0;
                    } else if (a.contact_name === "") {
                        return 1;
                    } else if (b.contact_name === "") {
                        return -1;
                    } else {
                        return a.contact_name.localeCompare(b.contact_name);
                    }
                    });
                    //console.log(contact_msg);
                    //exit ()
                }else{
                    contact_msg=[];
                }
                for(var k=0; k<contact_msg.length; k++){
                    //console.log(contact_msg[k]);
                    if(contact_msg[k].user_id!=''){
                    user_available_status='available';
                    available_user_id=contact_msg[k].user_id;
                    // contact_user_profile_pic
                    //let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,sid);
                    let privacy_profile_pic=await other_functions.check_profile_pic_privacy(contact_msg[k].user_id,sid);
                    //console.log('privacy profile check ',sid,contact_msg[k].user_id,privacy_profile_pic);
                    if(privacy_profile_pic){
                        let get_user_profile=await queries.get_user_profile(contact_msg[k].user_id);
                        if(get_user_profile[0] && get_user_profile[0]['profile_pic']!=''){
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+get_user_profile[0]['profile_pic']+',';
                        }else{
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                        }
                    }else{
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                    }
                    }else{
                    contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                    }
                }
                contact_user_profile_pic=contact_user_profile_pic.replace(/,(?=[^,]*$)/, '');
                //console.log(contact_user_profile_pic)
                //exit ();
                if(contact_msg.length>1){
                    let remaining_user=contact_msg.length-1;
                    let other_contact_contact=' other contacts';
                    if(remaining_user==1){
                    other_contact_contact=' other contact';
                    }
                    if(remaining_user!=0){
                    if(contact_msg[0].contact_name!=''){
                        set_contact_msg=contact_msg[0].contact_name+' and '+remaining_user+other_contact_contact;
                    }else{
                        set_contact_msg=contact_msg[0].number+' and '+remaining_user+other_contact_contact;
                    }
                    }else{
                    if(contact_msg[0].contact_name!=''){
                        set_contact_msg=contact_msg[0].contact_name;
                    }else{
                        set_contact_msg=contact_msg[0].number;
                    }
                    }
                }else{
                    if(contact_msg[0].contact_name!=''){
                    set_contact_msg=contact_msg[0].contact_name;
                    }else{
                    set_contact_msg=contact_msg[0].number;
                    }
                }
                
                    message_list_response.push({
                    id: result[0][i].id.toString(),
                    date: result[0][i].date,
                    senter_id: result[0][i].senter_id,
                    receiver_id: result[0][i].receiver_id,
                    message: set_contact_msg,
                    message_type:result[0][i].message_type,
                    duration: result[0][i].duration.toString(),
                    message_status:result[0][i].message_status,
                    room:result[0][i].room,
                    type:result[0][i].type,
                    status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                    replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                    replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                    replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                    replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                    //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                    replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                    forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                    forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                    forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                    delete_status : "1",
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: available_user_id,
                    thumbnail: contact_user_profile_pic
                    });
                
                }else if(result[0][i]['message_type']=='image' || result[0][i]['message_type']=='video' || result[0][i]['message_type']=='voice' || result[0][i]['message_type']=='doc'){
                //console.log(result[0][i]['message_type']);
                if(result[0][i]['message']!=''){
                    let check_is_url=isUrl(result[0][i]['message']);
                    //console.log(check_is_url);
                    if(!check_is_url){
                    result[0][i]['message']=BASE_URL+result[0][i]['message'];
                    }
                    if(result[0][i]['thumbnail']!=''){
                    result[0][i]['thumbnail']=BASE_URL+result[0][i]['thumbnail'];
                    }
                    //console.log(result[0][i]['message'])
                    //exit ()
                    
                    //add block message data entry
                    //console.log(result[0][i].id,result[0][i],result[0][i].reply_duration)
                    message_list_response.push({
                    id: result[0][i].id.toString(),
                    date: result[0][i].date,
                    senter_id: result[0][i].senter_id,
                    receiver_id: result[0][i].receiver_id,
                    message: result[0][i].message,
                    message_type:result[0][i].message_type,
                    duration: result[0][i].duration.toString(),
                    message_status:result[0][i].message_status,
                    room:result[0][i].room,
                    type:result[0][i].type,
                    status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                    replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                    replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                    replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                    replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                    replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                    forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                    forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                    forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                    delete_status : "1",
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: result[0][i].optional_text,
                    thumbnail: result[0][i]['thumbnail']
                    });
                }
                }
                // else if(result[0][i]['message_type']=="date"){
                //   //exit ();
                //   message_list_response.push({
                //     id: result[0][i].id,
                //     date: result[0][i].date,
                //     senter_id: "",
                //     receiver_id: "",
                //     message: "",
                //     message_type:"date",
                //     duration: "",
                //     message_status:"0",
                //     room:"",
                //     type:"date",
                //     status:"",
                //     replay_id:"",
                //     replay_message:"",
                //     replay_message_type:"",
                //     replay_senter:"",
                //     replay_duration:"",
                //     forward_id : "",
                //     forward_count : "",
                //     forward_message_status : "",
                //     delete_status : "",
                //     starred_status: "",
                //     read_receipt: "",
                //     optional_text: "",
                //     thumbnail: ''
                //   });
                // }
                else{
                //console.log('no others')
                //push other msg to the array
                //check date is exist in date_array
                
                //date already exist
                //add block message data entry
                message_list_response.push({
                    id: result[0][i].id.toString(),
                    date: result[0][i].date,
                    senter_id: result[0][i].senter_id,
                    receiver_id: result[0][i].receiver_id,
                    message: result[0][i].message,
                    message_type:result[0][i].message_type,
                    duration: result[0][i].duration.toString(),
                    message_status:result[0][i].message_status,
                    room:result[0][i].room,
                    type:result[0][i].type,
                    status: group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
                    replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                    replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                    replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                    replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                    //replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                    replay_duration: result[0][i].reply_duration ? result[0][i].reply_duration.toString() : '0',
                    forward_id : result[0][i] && result[0][i].forward_id ? result[0][i].forward_id.toString() : '0',
                    forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                    forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                    delete_status : "1",
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: result[0][i].optional_text,
                    thumbnail: ''
                });
                }
                
            }else if(group_status_json[j].user_id==sid && group_status_json[j].status==2){
                //console.log('2')
                //clear chat list -- Don't need to show
            }
            }
      }

        result[0][i]['delete_status']='';
        delete result[0][i]['group_status'];
    }
    return message_list_response;
  }

  function isUrl(url) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(url);
  }

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

  async function get_last_group_message_history(user_id,group_id,limit=10){
    let group_messages=[];
    let set_user_id='"'+user_id+'"';
    let date_array=[];
    let get_current_datetime=get_datetime();
    //let read_receipt=1;
    let check_user_in_group=await queries.check_user_and_group_data(set_user_id,group_id);
    if(check_user_in_group.length>0){
        let group_created_date=check_user_in_group[0].created_datetime;
        let group_name=check_user_in_group[0].group_name;
        let group_id=check_user_in_group[0].group_id;
        let group_profile=check_user_in_group[0].group_profile;
        let created_by=check_user_in_group[0].created_by;
        let group_members;
        let group_current_members;
        let group_removed_members;
        let group_left_members;
        let profile_pic_history;
        let group_subject_history=[];
        if(check_user_in_group[0].members!=''){
        group_members=JSON.parse(check_user_in_group[0].members);
        }else{
        group_members=[];
        }
        if(check_user_in_group[0].current_members!=''){
        group_current_members=JSON.parse(check_user_in_group[0].current_members);
        }else{
        group_current_members=[];
        }
        let group_users='';
        //console.log(group_current_members,group_current_members.length)
        for(var group_member_i=0;group_member_i<group_current_members.length; group_member_i++){
        //console.log(group_current_members)
        group_users=group_users+group_current_members[group_member_i].user_id+','
        }
        //console.log('users ',group_users);
        //check read receipt for all group users
        group_users=group_users.replace(/(^,)|(,$)/g, "");
        let set_query="select *,DATE_FORMAT(updated_datetime,'%Y-%m-%d %H:%i:%s') as updated_datetime from `user_chat_privacy` where user_id in ("+group_users+") and type='read_receipts' and options='1'";
        //console.log(set_query)
        //let check_group_read_receipt=await queries.check_group_chat_read_receipts(set_query);
        //console.log(check_group_read_receipt)
        let default_read_receipt=0;
        let read_receipt_datetime='';
        let read_receipt=1;
        // if(check_group_read_receipt.length>0){
        
        //   for(var read_receipt_i=0; read_receipt_i<check_group_read_receipt.length; read_receipt_i++){
        //     //console.log(check_group_read_receipt[read_receipt_i].user_id);
        //     if(check_group_read_receipt[read_receipt_i].user_id==user_id){
        //       default_read_receipt=1;
        //       read_receipt_datetime=check_group_read_receipt[read_receipt_i].updated_datetime;
        //       //console.log('ss - ',read_receipt_datetime)
        //       //exit ()
        //     }
            
        //   }
        // } 
        
        //check removed_members is empty string 
        if(check_user_in_group[0].removed_members!=''){
        group_removed_members=JSON.parse(check_user_in_group[0].removed_members);
        }else{
        group_removed_members=[];
        }

        //console.log('removed member',group_removed_members, group_removed_members.length)
        if(check_user_in_group[0].left_members!=''){
        group_left_members=JSON.parse(check_user_in_group[0].left_members);
        }else{
        group_left_members=[];
        }

        if(check_user_in_group[0].profile_pic_history!=''){
        profile_pic_history=JSON.parse(check_user_in_group[0].profile_pic_history);
        }else{
        profile_pic_history=[];
        }
        //console.log('json data ',check_user_in_group[0].subject_history)
        if(check_user_in_group[0].subject_history!=''){
        group_subject_history=JSON.parse(check_user_in_group[0].subject_history);
        }else{
        group_subject_history=[];
        }
        
        if(group_profile!=''){
        group_profile=BASE_URL+group_profile;
        }else{
        //give default group profile image url
        group_profile='';
        }
        //check user left the group or not
        let current_group_members=JSON.parse(check_user_in_group[0].current_members) || [];
        //console.log('current user ',current_group_members,current_group_members.length)
        let user_left_status='1';
        if(current_group_members.length>0){ 
        for(var member_i=0; member_i<current_group_members.length; member_i++){
            //console.log('member',current_group_members[member_i].user_id)
            if(current_group_members[member_i].user_id==user_id){
            //console.log('ssss user exist')
            user_left_status='0';
            break;
            }
        }
        }

        
        //set group set up information
        let group_started_data={
        id:'',
        date:group_created_date,
        senter_id:'',
        message:'',
        message_type:'',
        duration: '',
        room:'',
        message_status:'',
        name:'',
        type:'date',
        status:'',
        replay_id:'',
        replay_message:'',
        replay_message_type:'',
        replay_senter:'',
        forward_id:'',
        forward_count:'',
        forward_message_status:'',
        delete_status:'',
        starred_status: '',
        read_receipt: '',
        optional_text: '',
        thumbnail: ''
        }
        //group_messages.push(group_started_data);
        //split group created_date
        let split_created_date=group_created_date.split(" ");
        //date_array.push(split_created_date[0]);
        let group_profile_history_index=0;
        //set group created by data
        //created message
        let created_message='';
        if(created_by==user_id){
        created_message=created_message+'You created group '+group_name;
        }else{
        let username=await queries.get_username(created_by);
        created_message=created_message+username+' created group '+group_name;
        }
        let group_created_by_data={
        id:'',
        date:group_created_date,
        senter_id:'',
        message:created_message,
        message_type:'notification',
        duration:'',
        room:'',
        message_status:'',
        name:'',
        type:'notification',
        status:'',
        replay_id:'',
        replay_message:'',
        replay_message_type:'',
        replay_senter:'',
        forward_id:'',
        forward_count:'',
        forward_message_status:'',
        delete_status:'',
        starred_status: '',
        read_receipt: '',
        optional_text: '',
        thumbnail: ''
        }
        //group_messages.push(group_created_by_data);
        // console.log(get_all_group_messages);
        // exit();
        //get group message from db
        let get_all_group_messages=await queries.group_room_using_pagination(user_id,set_user_id,group_id,limit,0);
        get_all_group_messages=get_all_group_messages.reverse();
        if(get_all_group_messages.length>0){
            //console.log(get_all_group_messages[0])
            let list_small_message_id=get_all_group_messages[0].small_id
            //console.log(list_small_message_id)
            //check small id value exist in message id list
            //let check_id_exist_in_message_array=await sub_function.check_id_exist_in_message_array(list_small_message_id,get_all_group_messages);
            let check_id_exist_in_message_array=await other_functions.check_id_exist_in_message_array(list_small_message_id,get_all_group_messages);
            console.log(check_id_exist_in_message_array);
            //exit ()
            if(check_id_exist_in_message_array){
                group_messages.push(group_started_data);
                group_messages.push(group_created_by_data);
                group_profile_history_index=2;
            }
        }else{
        //check message_id is last_id  
        let get_last_message_id=await queries.get_last_message_id(user_id,group_id);
        console.log('val ',get_last_message_id)
        if(get_last_message_id!=''){
            if(get_last_message_id==message_id){
            group_messages.push(group_started_data);
            group_messages.push(group_created_by_data);
            }
        }
        }
        if(get_all_group_messages.length>0){
        for(var i=0; i<get_all_group_messages.length;i++){
            //console.log('message data ',get_all_group_messages[i]);
            let replay_id;
            let replay_message;
            let replay_message_type;
            let replay_senter_id;
            let replay_senter;
            let forward_id;
            let forward_message_count;
            let forward_message_status;
            
            if(get_all_group_messages[i].replay_id!=0 && get_all_group_messages[i].replay_id!=''){
            //get replay message details
            let get_replay_message_details=await queries.reply_message_details(get_all_group_messages[i].replay_id);
            //console.log(get_replay_message_details[0][0]);
            // get_replay_message_details[0][0]=
            replay_id=get_replay_message_details[0][0].id;
            replay_message=get_replay_message_details[0][0].message;
            replay_message_type=get_replay_message_details[0][0].message_type;
            replay_senter_id=get_replay_message_details[0][0].senter_id;
            //reply_message type -- video
            if(replay_message_type=='video'){
            //console.log(get_replay_message_details[0][0].thumbnail)
            if(get_replay_message_details[0][0].thumbnail!=''){
                replay_message=BASE_URL+get_replay_message_details[0][0].thumbnail;
            }
            }
            if(replay_message_type=='image'){
            if(replay_message_type!=''){
                replay_message=BASE_URL+replay_message;
            }
            }
            if(replay_senter_id==user_id){
            replay_senter='You';
            }else{
            replay_senter=await queries.get_username(replay_senter_id);
            }
            }else{
            replay_id="0";
            replay_message="";
            replay_message_type="";
            replay_senter="";
            }

            //forward messages
            if(get_all_group_messages[i].forward_id!=0 && get_all_group_messages[i].forward_id!=''){
            let get_forward_message_details=await queries.get_forward_message_details(get_all_group_messages[i].forward_id);
            forward_message_count=await queries.get_forward_message_count(get_all_group_messages[i].forward_id);
            forward_id=get_forward_message_details[0][0].forward_id;
            
            if(forward_message_count>=10){
                forward_message_status='Forwarded Many Times';
            }else{
                forward_message_status='Forwarded';
            }
            }else{
            forward_message_count=0;
            forward_message_status='';
            forward_id='';
                    }
                //set notification message
                if(get_all_group_messages[i].message_type=='notification'){
                if(get_all_group_messages[i].message=='added'){
                    let added_user_msg='';
                    let added_by_msg='';
                    let added_users='';
                    // console.log('added message');
                    // console.log('group member count', group_members[0], group_members.length)
                    if(group_members.length>0){
                    for(var group_members_i=0; group_members_i<group_members.length; group_members_i++){
                        //not needed to first index data
                        if(group_members_i!=0){
                        // console.log('added datetime',group_members[group_members_i].datetime)
                        // console.log(',messagge datetime',get_all_group_messages[i].date)
                        // console.log('id',get_all_group_messages[i].id)
                        if(get_all_group_messages[i].date==group_members[group_members_i].datetime){
                            //check which user added
                            if(user_id==group_members[group_members_i].added_by){
                            added_by_msg='You added ';
                            }else{
                            added_by_msg=await queries.get_username(group_members[group_members_i].added_by)+' added ';
                            }
                            if(group_members[group_members_i].user_id==user_id){
                            added_user_msg='You';
                            }else{
                            //added_user_msg=group_members[group_members_i].username;
                            added_user_msg=await queries.get_username(group_members[group_members_i].user_id);
                            }
                            added_users=added_users+added_user_msg+', ';
                        }
                        }
                    }
                    
                    }
                    //let remove_comma=added_users.slice(0, -1);
                    let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                    let added_msg=added_by_msg+remove_comma;
                    //console.log('added msg ',added_msg)
                    get_all_group_messages[i].message=added_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='admin'){
                    //console.log('admin')
                    
                    let admin_notification_msg='';
                    let admin_notification_msg_status=false;
                    //console.log('admin message');
                    if(group_members.length>0){
                    //console.log('entered into loop',get_all_group_messages[i].date, group_members)
                    for(var group_members_admin=0; group_members_admin<group_members.length; group_members_admin++){
                        //console.log(get_all_group_messages[i].id,get_all_group_messages[i].date,'-',group_members[group_members_admin].datetime)
                        
                        if(get_all_group_messages[i].date==group_members[group_members_admin].datetime){
                        
                        //show message only to admin
                        //console.log('yes condition true')
                        //console.log(user_id,group_members[group_members_admin].user_id)
                        
                        if(user_id==group_members[group_members_admin].user_id){
                            admin_notification_msg="You're now an admin";
                            //console.log('ssss')
                            break;
                        }else{
                            
                            admin_notification_msg_status=true;
                            //console.log('nnnn')
                        }
                        }else{
                        admin_notification_msg_status=true;
                        // console.log('else')
                        }
                        //console.log('for loop ssss',group_members_admin)
                    }
                    //exit ();
                    }
                    console.log('admin notification data ',admin_notification_msg,admin_notification_msg_status)
                    
                    //exit 
                    if(admin_notification_msg!=''){
                    get_all_group_messages[i].message=admin_notification_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                    //console.log(get_all_group_messages[i].id)
                    }else{
                    if(admin_notification_msg_status){
                        //remove the array index from array
                        
                        //console.log('before removed ',get_all_group_messages.length,get_all_group_messages)
                        console.log('before removed index ', i)
                        get_all_group_messages.splice(i, 1);
                        i--;
                        console.log('after removed index ', i)
                        //console.log(get_all_group_messages[i].id)
                        
                        // console.log('balance ',get_all_group_messages.length,get_all_group_messages)
                        // console.log(get_all_group_messages[i],admin_notification_msg_status)
                        // if(get_all_group_messages[i].id==3157){
                        //   console.log(get_all_group_messages[i],admin_notification_msg_status)
                        //   exit ()
                        // }
                        //
                        //break;
                        continue;
                    }
                    }
                    
                }else if(get_all_group_messages[i].message=='left'){
                    let left_user_msg='';
                    if(group_left_members.length>0){
                    for(var left_user_i=0;left_user_i<group_left_members.length;left_user_i++){
                        if(get_all_group_messages[i].date==group_left_members[left_user_i].datetime){
                        //console.log('user id s',user_id,group_left_members[left_user_i])
                        if(user_id==group_left_members[left_user_i].user_id){
                            left_user_msg='You left';
                        }else{
                            left_user_msg=await queries.get_username(group_left_members[left_user_i].user_id)+' left';
                        }
                        }
                    }
                    }
                    
                    get_all_group_messages[i].message=left_user_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='removed'){
                    //console.log('removed message');
                    let removed_user_msg='';
                    let removed_by='';
                    let removed_user='';
                    if(group_removed_members.length>0){
                    for(var removed_user_i=0; removed_user_i<group_removed_members.length;removed_user_i++){
                        if(get_all_group_messages[i].date==group_removed_members[removed_user_i].datetime){
                        //check which user removed
                        if(get_all_group_messages[i].senter_id==user_id){
                            removed_by='You removed ';
                        }else{
                            removed_by=await queries.get_username(get_all_group_messages[i].senter_id)+' removed ';
                        }
                        //check which user has left
                        if(user_id==group_removed_members[removed_user_i].user_id){
                            removed_user='You';
                        }else{
                            removed_user=await queries.get_username(group_removed_members[removed_user_i].user_id);
                        }
                        }
                    }
                    }
                    removed_user_msg=removed_by+removed_user;
                    get_all_group_messages[i].message=removed_user_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='changed_group_icon'){
                    //console.log('changed_group_icon',get_all_group_messages[i].senter_id,get_all_group_messages[i].date,profile_pic_history)
                    let previous_profile_pic='';
                    let new_profile_pic='';
                    let icon_change_message='';
                    let content="changed this group's icon";
                    if(profile_pic_history.length>0){
                    for(var group_icon_i=0; group_icon_i<profile_pic_history.length; group_icon_i++){
                        //console.log('loop running index', group_icon_i)
                        if(get_all_group_messages[i].date==profile_pic_history[group_icon_i].datetime){
                        //check the index of the array
                        if(group_icon_i==0){
                            //console.log('yes first index')
                            if(user_id==profile_pic_history[group_icon_i].user_id){
                            //console.log('you');
                            icon_change_message='You '+content;
                            }else{
                            //console.log('others')
                            icon_change_message=await queries.get_username(profile_pic_history[group_icon_i].user_id)+' '+content;
                            }
                        }else{
                            //console.log('else index')
                            if(user_id==profile_pic_history[group_icon_i].user_id){
                            //console.log('you');
                            icon_change_message='You '+content;
                            }else{
                            //console.log('others')
                            icon_change_message=await queries.get_username(profile_pic_history[group_icon_i].user_id)+' '+content;
                            }
                            new_profile_pic=BASE_URL+profile_pic_history[group_icon_i].profile_pic;
                            let previous_index=group_icon_i-1;
                            previous_profile_pic=BASE_URL+profile_pic_history[previous_index].profile_pic;
                            //console.log('testing ',previous_profile_pic,new_profile_pic)
                            
                        }
                        
                        }
                    }
                    }
                    
                    //console.log(`new_profile_pic ${new_profile_pic} previous_profile_pic ${previous_profile_pic} icon change message ${icon_change_message}`);
                    
                    //console.log('data ',previous_profile_pic)
                    if(new_profile_pic!='' && previous_profile_pic!=''){
                    //console.log('loop executed')
                    get_all_group_messages[i].previous_profile_pic=previous_profile_pic;
                    get_all_group_messages[i].new_profile_pic=new_profile_pic;
                    }
                    get_all_group_messages[i].message=icon_change_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                    // if(get_all_group_messages[i].id==970){
                    //   console.log(get_all_group_messages[i])
                    //   exit () 
                    // }
                }else if(get_all_group_messages[i].message=='changed_group_description'){
                    //console.log(get_all_group_messages[i].senter_id)
                    let description_message='';
                    if(get_all_group_messages[i].senter_id==user_id){
                    description_message='You changed the group description. Tap to view.';
                    }else{
                    description_message=await queries.get_username(get_all_group_messages[i].senter_id)+' changed the group description. Tap to view.';
                    }
                    get_all_group_messages[i].message=description_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='changed_group_name'){
                    let subject_message='';
                    let subject_content='changed the subject from';
                    // if(get_all_group_messages[i].senter_id==user_id){
                    
                    // }else{

                    // }
                    for(var subject_i=0; subject_i<group_subject_history.length; subject_i++){
                    if(get_all_group_messages[i].date==group_subject_history[subject_i].datetime){
                        
                        if(group_subject_history[subject_i].user_id==user_id){
                        //you
                        
                        let subject_index=subject_i-1;
                        if(subject_index>=0){
                            let old_subject=group_subject_history[subject_index].subject ? group_subject_history[subject_index].subject : '';
                            let new_subject=group_subject_history[subject_i].subject;
                            subject_message='You '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        }else{
                        //get other user name
                        let subject_index=subject_i-1;
                        //console.log(group_subject_history[subject_i],subject_index)
                        if(subject_index>=0){
                            //console.log('date time loop',group_subject_history[subject_i].datetime,group_subject_history[subject_i].user_id,user_id)
                            let old_subject=group_subject_history[subject_index].subject ? group_subject_history[subject_index].subject : '';
                            let new_subject=group_subject_history[subject_i].subject;
                            subject_message=await queries.get_username(group_subject_history[subject_i].user_id)+' '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        
                        }
                    }
                    }
                    // console.log('yess',subject_message)
                    // if(get_all_group_messages[i].id==1053){
                    //   exit ()
                    // }
                    //console.log(subject_message);
                    get_all_group_messages[i].message=subject_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='phone_number_changed'){
                    
                    if(get_all_group_messages[i].senter_id==user_id){
                    //exit ()
                    //not need
                    get_all_group_messages.splice(i, 1);
                    i--;
                    continue;
                    }else{
                    let get_numbers=get_all_group_messages[i].optional_text.split(',');
                    let change_number_msg=get_numbers[0]+' changed to '+get_numbers[1];
                    get_all_group_messages[i].message=change_number_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                    }
                }else if(get_all_group_messages[i].message=='group_call'){
                    let group_call_message='';
                    if(get_all_group_messages[i].senter_id==user_id){
                    group_call_message='You started a call';
                    }else{
                    group_call_message=await queries.get_username(get_all_group_messages[i].senter_id)+' started a call';
                    }
                    get_all_group_messages[i].message=group_call_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }
                }else if(get_all_group_messages[i].message_type=='date'){
                //console.log('ssss',get_all_group_messages[i].senter_id);
                get_all_group_messages[i].senter_id='';
                get_all_group_messages[i].message='';
                //get_all_group_messages[i].message_type='';
                get_all_group_messages[i].duration='';
                get_all_group_messages[i].room='';
                get_all_group_messages[i].message_status='0';
                get_all_group_messages[i].name='';
                get_all_group_messages[i].type='date';
                //group_status_json[j].status='';
                replay_id='';
                replay_message='';
                replay_message_type='';
                replay_senter='';
                forward_id='';
                forward_message_count='';
                forward_message_status='',
                delete_status='';
                starred_status='';
                read_receipt='';
                get_all_group_messages[i].optional_text='';
                get_all_group_messages[i].thumbnail='';
                }else if(get_all_group_messages[i].message_type=='text'){
                //console.log('message')
                
                }else if(get_all_group_messages[i].message_type=='image' || get_all_group_messages[i].message_type=='doc' || get_all_group_messages[i].message_type=='video' || get_all_group_messages[i].message_type=='voice'){
                if(get_all_group_messages[i].message!=''){
                    let check_is_url=isUrl(get_all_group_messages[i].message);
                    if(!check_is_url){
                    get_all_group_messages[i].message=BASE_URL+get_all_group_messages[i]['message'];
                    }
                }
                if(get_all_group_messages[i].thumbnail!=''){
                    get_all_group_messages[i].thumbnail=BASE_URL+get_all_group_messages[i]['thumbnail'];
                }
                }else if(get_all_group_messages[i].message_type=='contact'){
                let contact_msg=get_all_group_messages[i]['message'];
                let set_contact_msg='';
                let contact_user_profile_pic='';
                let user_available_status='not available';
                let available_user_id='';
                if(contact_msg!=''){
                    //console.log(`id ${get_all_group_messages[i].id} ${get_all_group_messages[i]['message']}`);
                    contact_msg=JSON.parse(get_all_group_messages[i]['message']);
                    contact_msg=contact_msg.sort((a, b) => {
                    if (a.user_id !== "" && b.user_id === "") {
                        return -1;
                    } else if (a.user_id === "" && b.user_id !== "") {
                        return 1;
                    } else if (a.contact_name === "" && b.contact_name === "") {
                        return 0;
                    } else if (a.contact_name === "") {
                        return 1;
                    } else if (b.contact_name === "") {
                        return -1;
                    } else {
                        return a.contact_name.localeCompare(b.contact_name);
                    }
                    });
                    // console.log(`id ${get_all_group_messages[i].id}`);
                    // console.log(contact_msg)
                    //exit ()
                }else{
                    contact_msg=[];
                }

                for(var k=0; k<contact_msg.length; k++){
                    if(contact_msg[k].user_id!=''){
                    user_available_status='available';
                    available_user_id=contact_msg[k].user_id;
                    // contact_user_profile_pic
                    //let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,user_id);
                    let privacy_profile_pic=await other_functions.check_profile_pic_privacy(contact_msg[k].user_id,sid);
                    //console.log('privacy profile check ',sid,contact_msg[k].user_id,privacy_profile_pic);
                    if(privacy_profile_pic){
                        let get_user_profile=await queries.get_user_profile(contact_msg[k].user_id);
                        if(get_user_profile[0] && get_user_profile[0]['profile_pic']!=''){
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+get_user_profile[0]['profile_pic']+',';
                        }else{
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                        }
                    }else{
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                    }
                    }else{
                    contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                    }
                }
                //console.log('profile data '+contact_user_profile_pic);
                contact_user_profile_pic=contact_user_profile_pic.replace(/,(?=[^,]*$)/, '');
                if(contact_msg.length>0){
                    let remaining_user=contact_msg.length-1;
                    let other_contact_contact=' other contacts';
                    if(remaining_user==1){
                    other_contact_contact=' other contact';
                    }
                    if(remaining_user!=0){
                    if(contact_msg[0].contact_name!=''){
                        set_contact_msg=contact_msg[0].contact_name+' and '+remaining_user+other_contact_contact;
                    }else{
                        set_contact_msg=contact_msg[0].number+' and '+remaining_user+other_contact_contact;
                    }
                    }else{
                    if(contact_msg[0].contact_name!=''){
                        set_contact_msg=contact_msg[0].contact_name;
                    }else{
                        set_contact_msg=contact_msg[0].number;
                    }
                    }
                    
                }else{
                    if(contact_msg[0].contact_name!=''){
                    set_contact_msg=contact_msg[0].contact_name;
                    }else{
                    set_contact_msg=contact_msg[0].number;
                    }
                }
                get_all_group_messages[i]['message']=set_contact_msg;
                get_all_group_messages[i]['optional_text']=available_user_id;
                get_all_group_messages[i]['thumbnail']=contact_user_profile_pic;
                // console.log(contact_user_profile_pic);
                }
                // if(get_all_group_messages[i].id==3150){
                //   console.log('testing loop')
                //   console.log(get_all_group_messages[i].id)
                //   console.log(get_all_group_messages[i].message)
                //   //exit ()
                // }
            //get group_status
            //console.log('error testing ',get_all_group_messages[i])
            if(get_all_group_messages[i]!=undefined){
            let split_date=get_all_group_messages[i].date.split(" ");
            let group_status_json=JSON.parse(get_all_group_messages[i]['group_status']) || [];
            //console.log('groiup status ',group_status_json)
            //console.log('msg id',get_all_group_messages[i].id);
            if(group_status_json.length>0){
                for(var j=0; j<group_status_json.length; j++){
                let starred_status=group_status_json[j].starred_status ? group_status_json[j].starred_status : '0';
                //console.log(group_status_json[j].status)
                //console.log('msg id',get_all_group_messages[i].id);
                if(group_status_json[j].status==0 && group_status_json[j].user_id==user_id){
                    //console.log('deleted')
                    //check read receipt 
                    // if('read_receipt' in group_status_json[j]){
                    //   read_receipt=group_status_json[j].read_receipt
                    // }else{
                    //   read_receipt=0;
                    // }
                    // if(read_receipt==0){
                    //   if(read_receipt_datetime!=''){
                    //     if(read_receipt_datetime<get_all_group_messages[i].date){
                    //       //exit ();
                    //       read_receipt=default_read_receipt;
                    //     }else{
                    //       read_receipt=0;
                    //     }
                    //   }else{
                    //     read_receipt=0;
                    //   }
                    // }
                    if(group_status_json[j].deleted_by){
                    if(group_status_json[j].deleted_by==user_id){
                        get_all_group_messages[i].message='You deleted this message';
                    }else{
                        get_all_group_messages[i].message='This message was deleted';
                    }
                    }else{
                    get_all_group_messages[i].message='This message was deleted';
                    }
                    if(get_all_group_messages[i].delivered_status==0){
                    get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    }else{
                        get_all_group_messages[i].message_status="2";
                    }
                    // if('delivered_status' in group_status_json[j]){
                    //   if(get_all_group_messages[i].delivered_status==0){
                    //     get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //   }else{
                    //     //get_all_group_messages[i].message_status="2";
                    //     if(group_status_json[j].user_id==get_all_group_messages[i].senter_id){
                    //       get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //     }else{
                    //       get_all_group_messages[i].message_status="2";
                    //     }
                    //   }
                    // }
                    get_all_group_messages[i].message_type='text';
                    //add message data
                    group_messages.push({
                    id:get_all_group_messages[i].id.toString(),
                    date:get_all_group_messages[i].date,
                    senter_id:get_all_group_messages[i].senter_id.toString(),
                    message:get_all_group_messages[i].message,
                    message_type:get_all_group_messages[i].message_type,
                    duration: get_all_group_messages[i].duration.toString(),
                    room:get_all_group_messages[i].room,
                    message_status:get_all_group_messages[i].message_status.toString(),
                    name:get_all_group_messages[i].name,
                    type:get_all_group_messages[i].type,
                    status:group_status_json[j].status.toString(),
                    replay_id:replay_id.toString(),
                    replay_message:replay_message,
                    replay_message_type:replay_message_type,
                    replay_senter:replay_senter,
                    forward_id:forward_id.toString(),
                    forward_count:forward_message_count.toString(),
                    forward_message_status:forward_message_status.toString(),
                    delete_status:'0',
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: get_all_group_messages[i].optional_text,
                    thumbnail: get_all_group_messages[i].thumbnail
                    });
                    
                    
                }else if(group_status_json[j].status==1 && group_status_json[j].user_id==user_id){
                    //console.log('not deleted')
                    //check read receipt 
                    console.log(get_all_group_messages[i].message_type)
                    if(get_all_group_messages[i].message_type=='date'){
                        console.log(get_all_group_messages[i].message_type)
                        get_all_group_messages[i].message_type='';
                        read_receipt='';
                        }else{
                            // if('read_receipt' in group_status_json[j]){
                            //     read_receipt=group_status_json[j].read_receipt
                            // }else{
                            //     read_receipt=0;
                            // }
                            // if(read_receipt==0){
                            //     if(read_receipt_datetime!=''){
                            //     if(read_receipt_datetime<get_all_group_messages[i].date){
                            //         //exit ();
                            //         read_receipt=default_read_receipt;
                            //     }else{
                            //         read_receipt=0;
                            //     }
                            //     }else{
                            //     read_receipt=0;
                            //     }
                            // }
                        }
                    //console.log(get_all_group_messages[i].delivered_status)
                    //exit ()
                    if(get_all_group_messages[i].delivered_status==0){
                    get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    }else{
                        get_all_group_messages[i].message_status="2";
                    }
                    // if('delivered_status' in group_status_json[j]){
                    //   if(get_all_group_messages[i].delivered_status==0){
                    //     get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //   }else{
                    //     //get_all_group_messages[i].message_status="2";
                    //     if(group_status_json[j].user_id==get_all_group_messages[i].senter_id){
                    //       get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //     }else{
                    //       get_all_group_messages[i].message_status="2";
                    //     }
                    //   }
                    // }
                    
                    group_messages.push({
                    id:get_all_group_messages[i].id.toString(),
                    date:get_all_group_messages[i].date,
                    senter_id:get_all_group_messages[i].senter_id.toString(),
                    message:get_all_group_messages[i].message,
                    message_type:get_all_group_messages[i].message_type,
                    duration: get_all_group_messages[i].duration.toString(),
                    room:get_all_group_messages[i].room,
                    message_status:get_all_group_messages[i].message_status.toString(),
                    name:get_all_group_messages[i].name,
                    type:get_all_group_messages[i].type,
                    status:group_status_json[j].status.toString(),
                    replay_id:replay_id.toString(),
                    replay_message:replay_message,
                    replay_message_type:replay_message_type,
                    replay_senter:replay_senter,
                    forward_id:forward_id.toString(),
                    forward_count:forward_message_count.toString(),
                    forward_message_status:forward_message_status.toString(),
                    delete_status:'1',
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: get_all_group_messages[i].optional_text,
                    thumbnail: get_all_group_messages[i].thumbnail
                    });
                    

                    //console.log(get_all_group_messages[i].new_profile_pic,get_all_group_messages[i].previous_profile_pic)
                    if(get_all_group_messages[i].new_profile_pic!='' && get_all_group_messages[i].new_profile_pic!=undefined && get_all_group_messages[i].previous_profile_pic!='' && get_all_group_messages[i].previous_profile_pic!=undefined){
                        //let last_index=group_messages.length;
                        // console.log(i)
                        // console.log(get_all_group_messages[i].id)
                        // console.log(group_messages,i)
                        //  console.log(group_messages[i])
                        // exit ()
                        //add two index for group_created_date and group_name
                        console.log(get_all_group_messages[i].id,i,group_profile_history_index)
                        let index_i=i+group_profile_history_index;
                        console.log(group_messages,get_all_group_messages.length)
                        group_messages[index_i].new_profile_pic=get_all_group_messages[i].new_profile_pic;
                        group_messages[index_i].previous_profile_pic=get_all_group_messages[i].previous_profile_pic;
                    }

                    //console.log('previous pic',get_all_group_messages[i].previous_profile_pic)
                    // if(get_all_group_messages[i].id==970){
                    //   let index_i=i+2;
                    //   console.log(get_all_group_messages[i],group_messages[index_i])
                    //   exit () 
                    // }
                }else if(group_status_json[j].status==2 && group_status_json[j].user_id==user_id){
                    //console.log('cleared')
                    //clear chat message -- Don't need to show
                }
                }
            }
        }
            
        }

        //console.log('all data',get_all_group_messages)
        }else{
            group_messages.push(group_started_data);
            group_messages.push(group_created_by_data);
        }


        //console.log(date_array); 
        
        
        //console.log('yes')
        //if(current_group_members.length>0){}
        
        
    }
    return group_messages;
  }

  async function get_last_group_message_history1(user_id,group_id,limit=10){
    let group_messages=[];
    let set_user_id='"'+user_id+'"';
    let date_array=[];
    let get_current_datetime=get_datetime();
    //let read_receipt=1;
    let check_user_in_group=await queries.check_user_and_group_data(set_user_id,group_id);
    if(check_user_in_group.length>0){
        let group_created_date=check_user_in_group[0].created_datetime;
        let group_name=check_user_in_group[0].group_name;
        let group_id=check_user_in_group[0].group_id;
        let group_profile=check_user_in_group[0].group_profile;
        let created_by=check_user_in_group[0].created_by;
        let group_members;
        let group_current_members;
        let group_removed_members;
        let group_left_members;
        let profile_pic_history;
        let group_subject_history=[];
        if(check_user_in_group[0].members!=''){
        group_members=JSON.parse(check_user_in_group[0].members);
        }else{
        group_members=[];
        }
        if(check_user_in_group[0].current_members!=''){
        group_current_members=JSON.parse(check_user_in_group[0].current_members);
        }else{
        group_current_members=[];
        }
        let group_users='';
        //console.log(group_current_members,group_current_members.length)
        for(var group_member_i=0;group_member_i<group_current_members.length; group_member_i++){
        //console.log(group_current_members)
        group_users=group_users+group_current_members[group_member_i].user_id+','
        }
        //console.log('users ',group_users);
        //check read receipt for all group users
        group_users=group_users.replace(/(^,)|(,$)/g, "");
        let set_query="select *,DATE_FORMAT(updated_datetime,'%Y-%m-%d %H:%i:%s') as updated_datetime from `user_chat_privacy` where user_id in ("+group_users+") and type='read_receipts' and options='1'";
        //console.log(set_query)
        //let check_group_read_receipt=await queries.check_group_chat_read_receipts(set_query);
        //console.log(check_group_read_receipt)
        let default_read_receipt=0;
        let read_receipt_datetime='';
        let read_receipt=1;
        // if(check_group_read_receipt.length>0){
        
        //   for(var read_receipt_i=0; read_receipt_i<check_group_read_receipt.length; read_receipt_i++){
        //     //console.log(check_group_read_receipt[read_receipt_i].user_id);
        //     if(check_group_read_receipt[read_receipt_i].user_id==user_id){
        //       default_read_receipt=1;
        //       read_receipt_datetime=check_group_read_receipt[read_receipt_i].updated_datetime;
        //       //console.log('ss - ',read_receipt_datetime)
        //       //exit ()
        //     }
            
        //   }
        // } 
        
        //check removed_members is empty string 
        if(check_user_in_group[0].removed_members!=''){
        group_removed_members=JSON.parse(check_user_in_group[0].removed_members);
        }else{
        group_removed_members=[];
        }

        //console.log('removed member',group_removed_members, group_removed_members.length)
        if(check_user_in_group[0].left_members!=''){
        group_left_members=JSON.parse(check_user_in_group[0].left_members);
        }else{
        group_left_members=[];
        }

        if(check_user_in_group[0].profile_pic_history!=''){
        profile_pic_history=JSON.parse(check_user_in_group[0].profile_pic_history);
        }else{
        profile_pic_history=[];
        }
        //console.log('json data ',check_user_in_group[0].subject_history)
        if(check_user_in_group[0].subject_history!=''){
        group_subject_history=JSON.parse(check_user_in_group[0].subject_history);
        }else{
        group_subject_history=[];
        }
        
        if(group_profile!=''){
        group_profile=BASE_URL+group_profile;
        }else{
        //give default group profile image url
        group_profile='';
        }
        //check user left the group or not
        let current_group_members=JSON.parse(check_user_in_group[0].current_members) || [];
        //console.log('current user ',current_group_members,current_group_members.length)
        let user_left_status='1';
        if(current_group_members.length>0){ 
            for(var member_i=0; member_i<current_group_members.length; member_i++){
                //console.log('member',current_group_members[member_i].user_id)
                if(current_group_members[member_i].user_id==user_id){
                    //console.log('ssss user exist')
                    user_left_status='0';
                    break;
                }
            }
        }

        
        //set group set up information
        let group_started_data={
        id:'',
        date:group_created_date,
        senter_id:'',
        message:'',
        message_type:'',
        duration: '',
        room:'',
        message_status:'',
        name:'',
        type:'date',
        status:'',
        replay_id:'',
        replay_message:'',
        replay_message_type:'',
        replay_senter:'',
        forward_id:'',
        forward_count:'',
        forward_message_status:'',
        delete_status:'',
        starred_status: '',
        read_receipt: '',
        optional_text: '',
        thumbnail: '',
        new_profile_pic: '',
        previous_profile_pic: ''
        }
        //group_messages.push(group_started_data);
        //split group created_date
        let split_created_date=group_created_date.split(" ");
        //date_array.push(split_created_date[0]);
        let group_profile_history_index=0;
        //set group created by data
        //created message
        let created_message='';
        if(created_by==user_id){
        created_message=created_message+'You created group '+group_name;
        }else{
        let username=await queries.get_username(created_by);
        created_message=created_message+username+' created group '+group_name;
        }
        let group_created_by_data={
        id:'',
        date:group_created_date,
        senter_id:'',
        message:created_message,
        message_type:'notification',
        duration:'',
        room:'',
        message_status:'',
        name:'',
        type:'notification',
        status:'',
        replay_id:'',
        replay_message:'',
        replay_message_type:'',
        replay_senter:'',
        forward_id:'',
        forward_count:'',
        forward_message_status:'',
        delete_status:'',
        starred_status: '',
        read_receipt: '',
        optional_text: '',
        thumbnail: '',
        new_profile_pic: '',
        previous_profile_pic: ''
        }
        //group_messages.push(group_created_by_data);
        // console.log(get_all_group_messages);
        // exit();
        //get group message from db
        let get_all_group_messages=await queries.group_room_using_pagination(user_id,set_user_id,group_id,limit,0);
        get_all_group_messages=get_all_group_messages.reverse();
        if(get_all_group_messages.length>0){
        //console.log(get_all_group_messages[0])
        let list_small_message_id=get_all_group_messages[0].small_id
        //console.log(list_small_message_id)
        //check small id value exist in message id list
        //let check_id_exist_in_message_array=await sub_function.check_id_exist_in_message_array(list_small_message_id,get_all_group_messages);
        let check_id_exist_in_message_array=await other_functions.check_id_exist_in_message_array(list_small_message_id,get_all_group_messages);
        console.log(check_id_exist_in_message_array);
        //exit ()
        if(check_id_exist_in_message_array){
            group_messages.push(group_started_data);
            group_messages.push(group_created_by_data);
        }
        }else{
        //check message_id is last_id  
        let get_last_message_id=await queries.get_last_message_id(user_id,group_id);
        console.log('val ',get_last_message_id)
        if(get_last_message_id!=''){
            if(get_last_message_id==message_id){
                group_messages.push(group_started_data);
                group_messages.push(group_created_by_data);
                group_profile_history_index=2;
            }
        }
        }
        if(get_all_group_messages.length>0){
        for(var i=0; i<get_all_group_messages.length;i++){
            //console.log('message data ',get_all_group_messages[i]);
            let replay_id;
            let replay_message;
            let replay_message_type;
            let replay_senter_id;
            let replay_senter;
            let forward_id;
            let forward_message_count;
            let forward_message_status;
            
            if(get_all_group_messages[i].replay_id!=0 && get_all_group_messages[i].replay_id!=''){
            //get replay message details
            let get_replay_message_details=await queries.reply_message_details(get_all_group_messages[i].replay_id);
            //console.log(get_replay_message_details[0][0]);
            // get_replay_message_details[0][0]=
            replay_id=get_replay_message_details[0][0].id;
            replay_message=get_replay_message_details[0][0].message;
            replay_message_type=get_replay_message_details[0][0].message_type;
            replay_senter_id=get_replay_message_details[0][0].senter_id;
            //reply_message type -- video
            if(replay_message_type=='video'){
            //console.log(get_replay_message_details[0][0].thumbnail)
            if(get_replay_message_details[0][0].thumbnail!=''){
                replay_message=BASE_URL+get_replay_message_details[0][0].thumbnail;
            }
            }
            if(replay_message_type=='image'){
            if(replay_message_type!=''){
                replay_message=BASE_URL+replay_message;
            }
            }
            if(replay_senter_id==user_id){
            replay_senter='You';
            }else{
            replay_senter=await queries.get_username(replay_senter_id);
            }
            }else{
            replay_id="0";
            replay_message="";
            replay_message_type="";
            replay_senter="";
            }

            //forward messages
            if(get_all_group_messages[i].forward_id!=0 && get_all_group_messages[i].forward_id!=''){
            let get_forward_message_details=await queries.get_forward_message_details(get_all_group_messages[i].forward_id);
            forward_message_count=await queries.get_forward_message_count(get_all_group_messages[i].forward_id);
            forward_id=get_forward_message_details[0][0].forward_id;
            
            if(forward_message_count>=10){
                forward_message_status='Forwarded Many Times';
            }else{
                forward_message_status='Forwarded';
            }
            }else{
            forward_message_count=0;
            forward_message_status='';
            forward_id='';
                    }
                //set notification message
                if(get_all_group_messages[i].message_type=='notification'){
                if(get_all_group_messages[i].message=='added'){
                    let added_user_msg='';
                    let added_by_msg='';
                    let added_users='';
                    // console.log('added message');
                    // console.log('group member count', group_members[0], group_members.length)
                    if(group_members.length>0){
                    for(var group_members_i=0; group_members_i<group_members.length; group_members_i++){
                        //not needed to first index data
                        if(group_members_i!=0){
                        // console.log('added datetime',group_members[group_members_i].datetime)
                        // console.log(',messagge datetime',get_all_group_messages[i].date)
                        // console.log('id',get_all_group_messages[i].id)
                        if(get_all_group_messages[i].date==group_members[group_members_i].datetime){
                            //check which user added
                            if(user_id==group_members[group_members_i].added_by){
                            added_by_msg='You added ';
                            }else{
                            added_by_msg=await queries.get_username(group_members[group_members_i].added_by)+' added ';
                            }
                            if(group_members[group_members_i].user_id==user_id){
                            added_user_msg='You';
                            }else{
                            //added_user_msg=group_members[group_members_i].username;
                            added_user_msg=await queries.get_username(group_members[group_members_i].user_id);
                            }
                            added_users=added_users+added_user_msg+', ';
                        }
                        }
                    }
                    
                    }
                    //let remove_comma=added_users.slice(0, -1);
                    let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                    let added_msg=added_by_msg+remove_comma;
                    //console.log('added msg ',added_msg)
                    get_all_group_messages[i].message=added_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='admin'){
                    //console.log('admin')
                    
                    let admin_notification_msg='';
                    let admin_notification_msg_status=false;
                    //console.log('admin message');
                    if(group_members.length>0){
                    //console.log('entered into loop',get_all_group_messages[i].date, group_members)
                    for(var group_members_admin=0; group_members_admin<group_members.length; group_members_admin++){
                        //console.log(get_all_group_messages[i].id,get_all_group_messages[i].date,'-',group_members[group_members_admin].datetime)
                        
                        if(get_all_group_messages[i].date==group_members[group_members_admin].datetime){
                        
                        //show message only to admin
                        //console.log('yes condition true')
                        //console.log(user_id,group_members[group_members_admin].user_id)
                        
                        if(user_id==group_members[group_members_admin].user_id){
                            admin_notification_msg="You're now an admin";
                            //console.log('ssss')
                            break;
                        }else{
                            
                            admin_notification_msg_status=true;
                            //console.log('nnnn')
                        }
                        }else{
                        admin_notification_msg_status=true;
                        // console.log('else')
                        }
                        //console.log('for loop ssss',group_members_admin)
                    }
                    //exit ();
                    }
                    console.log('admin notification data ',admin_notification_msg,admin_notification_msg_status)
                    
                    //exit 
                    if(admin_notification_msg!=''){
                    get_all_group_messages[i].message=admin_notification_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                    //console.log(get_all_group_messages[i].id)
                    }else{
                    if(admin_notification_msg_status){
                        //remove the array index from array
                        
                        //console.log('before removed ',get_all_group_messages.length,get_all_group_messages)
                        console.log('before removed index ', i)
                        get_all_group_messages.splice(i, 1);
                        i--;
                        console.log('after removed index ', i)
                        //console.log(get_all_group_messages[i].id)
                        
                        // console.log('balance ',get_all_group_messages.length,get_all_group_messages)
                        // console.log(get_all_group_messages[i],admin_notification_msg_status)
                        // if(get_all_group_messages[i].id==3157){
                        //   console.log(get_all_group_messages[i],admin_notification_msg_status)
                        //   exit ()
                        // }
                        //
                        //break;
                        continue;
                    }
                    }
                    
                }else if(get_all_group_messages[i].message=='left'){
                    let left_user_msg='';
                    if(group_left_members.length>0){
                    for(var left_user_i=0;left_user_i<group_left_members.length;left_user_i++){
                        if(get_all_group_messages[i].date==group_left_members[left_user_i].datetime){
                        //console.log('user id s',user_id,group_left_members[left_user_i])
                        if(user_id==group_left_members[left_user_i].user_id){
                            left_user_msg='You left';
                        }else{
                            left_user_msg=await queries.get_username(group_left_members[left_user_i].user_id)+' left';
                        }
                        }
                    }
                    }
                    
                    get_all_group_messages[i].message=left_user_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='removed'){
                    //console.log('removed message');
                    let removed_user_msg='';
                    let removed_by='';
                    let removed_user='';
                    if(group_removed_members.length>0){
                    for(var removed_user_i=0; removed_user_i<group_removed_members.length;removed_user_i++){
                        if(get_all_group_messages[i].date==group_removed_members[removed_user_i].datetime){
                        //check which user removed
                        if(get_all_group_messages[i].senter_id==user_id){
                            removed_by='You removed ';
                        }else{
                            removed_by=await queries.get_username(get_all_group_messages[i].senter_id)+' removed ';
                        }
                        //check which user has left
                        if(user_id==group_removed_members[removed_user_i].user_id){
                            removed_user='You';
                        }else{
                            removed_user=await queries.get_username(group_removed_members[removed_user_i].user_id);
                        }
                        }
                    }
                    }
                    removed_user_msg=removed_by+removed_user;
                    get_all_group_messages[i].message=removed_user_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='changed_group_icon'){
                    //console.log('changed_group_icon',get_all_group_messages[i].senter_id,get_all_group_messages[i].date,profile_pic_history)
                    let previous_profile_pic='';
                    let new_profile_pic='';
                    let icon_change_message='';
                    let content="changed this group's icon";
                    if(profile_pic_history.length>0){
                    for(var group_icon_i=0; group_icon_i<profile_pic_history.length; group_icon_i++){
                        //console.log('loop running index', group_icon_i)
                        if(get_all_group_messages[i].date==profile_pic_history[group_icon_i].datetime){
                        //check the index of the array
                        if(group_icon_i==0){
                            //console.log('yes first index')
                            if(user_id==profile_pic_history[group_icon_i].user_id){
                            //console.log('you');
                            icon_change_message='You '+content;
                            }else{
                            //console.log('others')
                            icon_change_message=await queries.get_username(profile_pic_history[group_icon_i].user_id)+' '+content;
                            }
                        }else{
                            //console.log('else index')
                            if(user_id==profile_pic_history[group_icon_i].user_id){
                            //console.log('you');
                            icon_change_message='You '+content;
                            }else{
                            //console.log('others')
                            icon_change_message=await queries.get_username(profile_pic_history[group_icon_i].user_id)+' '+content;
                            }
                            new_profile_pic=BASE_URL+profile_pic_history[group_icon_i].profile_pic;
                            let previous_index=group_icon_i-1;
                            previous_profile_pic=BASE_URL+profile_pic_history[previous_index].profile_pic;
                            //console.log('testing ',previous_profile_pic,new_profile_pic)
                            
                        }
                        
                        }
                    }
                    }
                    
                    //console.log(`new_profile_pic ${new_profile_pic} previous_profile_pic ${previous_profile_pic} icon change message ${icon_change_message}`);
                    
                    //console.log('data ',previous_profile_pic)
                    if(new_profile_pic!='' && previous_profile_pic!=''){
                    //console.log('loop executed')
                    get_all_group_messages[i].previous_profile_pic=previous_profile_pic;
                    get_all_group_messages[i].new_profile_pic=new_profile_pic;
                    }
                    get_all_group_messages[i].message=icon_change_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                    // if(get_all_group_messages[i].id==970){
                    //   console.log(get_all_group_messages[i])
                    //   exit () 
                    // }
                }else if(get_all_group_messages[i].message=='changed_group_description'){
                    //console.log(get_all_group_messages[i].senter_id)
                    let description_message='';
                    if(get_all_group_messages[i].senter_id==user_id){
                    description_message='You changed the group description. Tap to view.';
                    }else{
                    description_message=await queries.get_username(get_all_group_messages[i].senter_id)+' changed the group description. Tap to view.';
                    }
                    get_all_group_messages[i].message=description_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='changed_group_name'){
                    let subject_message='';
                    let subject_content='changed the subject from';
                    // if(get_all_group_messages[i].senter_id==user_id){
                    
                    // }else{

                    // }
                    for(var subject_i=0; subject_i<group_subject_history.length; subject_i++){
                    if(get_all_group_messages[i].date==group_subject_history[subject_i].datetime){
                        
                        if(group_subject_history[subject_i].user_id==user_id){
                        //you
                        
                        let subject_index=subject_i-1;
                        if(subject_index>=0){
                            let old_subject=group_subject_history[subject_index].subject ? group_subject_history[subject_index].subject : '';
                            let new_subject=group_subject_history[subject_i].subject;
                            subject_message='You '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        }else{
                        //get other user name
                        let subject_index=subject_i-1;
                        //console.log(group_subject_history[subject_i],subject_index)
                        if(subject_index>=0){
                            //console.log('date time loop',group_subject_history[subject_i].datetime,group_subject_history[subject_i].user_id,user_id)
                            let old_subject=group_subject_history[subject_index].subject ? group_subject_history[subject_index].subject : '';
                            let new_subject=group_subject_history[subject_i].subject;
                            subject_message=await queries.get_username(group_subject_history[subject_i].user_id)+' '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        
                        }
                    }
                    }
                    // console.log('yess',subject_message)
                    // if(get_all_group_messages[i].id==1053){
                    //   exit ()
                    // }
                    //console.log(subject_message);
                    get_all_group_messages[i].message=subject_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }else if(get_all_group_messages[i].message=='phone_number_changed'){
                    
                    if(get_all_group_messages[i].senter_id==user_id){
                    //exit ()
                    //not need
                    get_all_group_messages.splice(i, 1);
                    i--;
                    continue;
                    }else{
                    let get_numbers=get_all_group_messages[i].optional_text.split(',');
                    let change_number_msg=get_numbers[0]+' changed to '+get_numbers[1];
                    get_all_group_messages[i].message=change_number_msg;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                    }
                }else if(get_all_group_messages[i].message=='group_call'){
                    let group_call_message='';
                    if(get_all_group_messages[i].senter_id==user_id){
                    group_call_message='You started a call';
                    }else{
                    group_call_message=await queries.get_username(get_all_group_messages[i].senter_id)+' started a call';
                    }
                    get_all_group_messages[i].message=group_call_message;
                    get_all_group_messages[i].message_type='';
                    get_all_group_messages[i].type='notification';
                }
                }else if(get_all_group_messages[i].message_type=='date'){
                //console.log('ssss',get_all_group_messages[i].senter_id);
                get_all_group_messages[i].senter_id='';
                get_all_group_messages[i].message='';
                //get_all_group_messages[i].message_type='';
                get_all_group_messages[i].duration='';
                get_all_group_messages[i].room='';
                get_all_group_messages[i].message_status='0';
                get_all_group_messages[i].name='';
                get_all_group_messages[i].type='date';
                //group_status_json[j].status='';
                replay_id='';
                replay_message='';
                replay_message_type='';
                replay_senter='';
                forward_id='';
                forward_message_count='';
                forward_message_status='',
                delete_status='';
                starred_status='';
                read_receipt='';
                get_all_group_messages[i].optional_text='';
                get_all_group_messages[i].thumbnail='';
                }else if(get_all_group_messages[i].message_type=='text'){
                //console.log('message')
                
                }else if(get_all_group_messages[i].message_type=='image' || get_all_group_messages[i].message_type=='doc' || get_all_group_messages[i].message_type=='video' || get_all_group_messages[i].message_type=='voice'){
                if(get_all_group_messages[i].message!=''){
                    let check_is_url=isUrl(get_all_group_messages[i].message);
                    if(!check_is_url){
                    get_all_group_messages[i].message=BASE_URL+get_all_group_messages[i]['message'];
                    }
                }
                if(get_all_group_messages[i].thumbnail!=''){
                    get_all_group_messages[i].thumbnail=BASE_URL+get_all_group_messages[i]['thumbnail'];
                }
                }else if(get_all_group_messages[i].message_type=='contact'){
                let contact_msg=get_all_group_messages[i]['message'];
                let set_contact_msg='';
                let contact_user_profile_pic='';
                let user_available_status='not available';
                let available_user_id='';
                if(contact_msg!=''){
                    //console.log(`id ${get_all_group_messages[i].id} ${get_all_group_messages[i]['message']}`);
                    contact_msg=JSON.parse(get_all_group_messages[i]['message']);
                    contact_msg=contact_msg.sort((a, b) => {
                    if (a.user_id !== "" && b.user_id === "") {
                        return -1;
                    } else if (a.user_id === "" && b.user_id !== "") {
                        return 1;
                    } else if (a.contact_name === "" && b.contact_name === "") {
                        return 0;
                    } else if (a.contact_name === "") {
                        return 1;
                    } else if (b.contact_name === "") {
                        return -1;
                    } else {
                        return a.contact_name.localeCompare(b.contact_name);
                    }
                    });
                    // console.log(`id ${get_all_group_messages[i].id}`);
                    // console.log(contact_msg)
                    //exit ()
                }else{
                    contact_msg=[];
                }

                for(var k=0; k<contact_msg.length; k++){
                    if(contact_msg[k].user_id!=''){
                    user_available_status='available';
                    available_user_id=contact_msg[k].user_id;
                    // contact_user_profile_pic
                    //let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,user_id);
                    let privacy_profile_pic=await other_functions.check_profile_pic_privacy(contact_msg[k].user_id,sid);
                    //console.log('privacy profile check ',sid,contact_msg[k].user_id,privacy_profile_pic);
                    if(privacy_profile_pic){
                        let get_user_profile=await queries.get_user_profile(contact_msg[k].user_id);
                        if(get_user_profile[0] && get_user_profile[0]['profile_pic']!=''){
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+get_user_profile[0]['profile_pic']+',';
                        }else{
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                        }
                    }else{
                        contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                    }
                    }else{
                    contact_user_profile_pic=contact_user_profile_pic+BASE_URL+'uploads/default/profile.png,';
                    }
                }
                //console.log('profile data '+contact_user_profile_pic);
                contact_user_profile_pic=contact_user_profile_pic.replace(/,(?=[^,]*$)/, '');
                if(contact_msg.length>0){
                    let remaining_user=contact_msg.length-1;
                    let other_contact_contact=' other contacts';
                    if(remaining_user==1){
                    other_contact_contact=' other contact';
                    }
                    if(remaining_user!=0){
                    if(contact_msg[0].contact_name!=''){
                        set_contact_msg=contact_msg[0].contact_name+' and '+remaining_user+other_contact_contact;
                    }else{
                        set_contact_msg=contact_msg[0].number+' and '+remaining_user+other_contact_contact;
                    }
                    }else{
                    if(contact_msg[0].contact_name!=''){
                        set_contact_msg=contact_msg[0].contact_name;
                    }else{
                        set_contact_msg=contact_msg[0].number;
                    }
                    }
                    
                }else{
                    if(contact_msg[0].contact_name!=''){
                    set_contact_msg=contact_msg[0].contact_name;
                    }else{
                    set_contact_msg=contact_msg[0].number;
                    }
                }
                get_all_group_messages[i]['message']=set_contact_msg;
                get_all_group_messages[i]['optional_text']=available_user_id;
                get_all_group_messages[i]['thumbnail']=contact_user_profile_pic;
                // console.log(contact_user_profile_pic);
                }
                // if(get_all_group_messages[i].id==3150){
                //   console.log('testing loop')
                //   console.log(get_all_group_messages[i].id)
                //   console.log(get_all_group_messages[i].message)
                //   //exit ()
                // }
            //get group_status
            //console.log('error testing ',get_all_group_messages[i])
            if(get_all_group_messages[i]!=undefined){
            let split_date=get_all_group_messages[i].date.split(" ");
            let group_status_json=JSON.parse(get_all_group_messages[i]['group_status']) || [];
            //console.log('groiup status ',group_status_json)
            //console.log('msg id',get_all_group_messages[i].id);
            if(group_status_json.length>0){
                for(var j=0; j<group_status_json.length; j++){
                let starred_status=group_status_json[j].starred_status ? group_status_json[j].starred_status : '0';
                //console.log(group_status_json[j].status)
                //console.log('msg id',get_all_group_messages[i].id);
                if(group_status_json[j].status==0 && group_status_json[j].user_id==user_id){
                    //console.log('deleted')
                    //check read receipt 
                    // if('read_receipt' in group_status_json[j]){
                    //   read_receipt=group_status_json[j].read_receipt
                    // }else{
                    //   read_receipt=0;
                    // }
                    // if(read_receipt==0){
                    //   if(read_receipt_datetime!=''){
                    //     if(read_receipt_datetime<get_all_group_messages[i].date){
                    //       //exit ();
                    //       read_receipt=default_read_receipt;
                    //     }else{
                    //       read_receipt=0;
                    //     }
                    //   }else{
                    //     read_receipt=0;
                    //   }
                    // }
                    if(group_status_json[j].deleted_by){
                    if(group_status_json[j].deleted_by==user_id){
                        get_all_group_messages[i].message='You deleted this message';
                    }else{
                        get_all_group_messages[i].message='This message was deleted';
                    }
                    }else{
                    get_all_group_messages[i].message='This message was deleted';
                    }
                    if(get_all_group_messages[i].delivered_status==0){
                    get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    }else{
                        get_all_group_messages[i].message_status="2";
                    }
                    // if('delivered_status' in group_status_json[j]){
                    //   if(get_all_group_messages[i].delivered_status==0){
                    //     get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //   }else{
                    //     //get_all_group_messages[i].message_status="2";
                    //     if(group_status_json[j].user_id==get_all_group_messages[i].senter_id){
                    //       get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //     }else{
                    //       get_all_group_messages[i].message_status="2";
                    //     }
                    //   }
                    // }
                    get_all_group_messages[i].message_type='text';
                    //add message data
                    group_messages.push({
                    id:get_all_group_messages[i].id.toString(),
                    date:get_all_group_messages[i].date,
                    senter_id:get_all_group_messages[i].senter_id.toString(),
                    message:get_all_group_messages[i].message,
                    message_type:get_all_group_messages[i].message_type,
                    duration: get_all_group_messages[i].duration.toString(),
                    room:get_all_group_messages[i].room,
                    message_status:get_all_group_messages[i].message_status.toString(),
                    name:get_all_group_messages[i].name,
                    type:get_all_group_messages[i].type,
                    status:group_status_json[j].status.toString(),
                    replay_id:replay_id.toString(),
                    replay_message:replay_message,
                    replay_message_type:replay_message_type,
                    replay_senter:replay_senter,
                    forward_id:forward_id.toString(),
                    forward_count:forward_message_count.toString(),
                    forward_message_status:forward_message_status.toString(),
                    delete_status:'0',
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: get_all_group_messages[i].optional_text,
                    thumbnail: get_all_group_messages[i].thumbnail,
                    new_profile_pic: '',
                    previous_profile_pic: ''
                    });
                    
                    
                }else if(group_status_json[j].status==1 && group_status_json[j].user_id==user_id){
                    //console.log('not deleted')
                    //check read receipt 
                    console.log(get_all_group_messages[i].message_type)
                    if(get_all_group_messages[i].message_type=='date'){
                        console.log(get_all_group_messages[i].message_type)
                        get_all_group_messages[i].message_type='';
                        read_receipt='';
                        }else{
                            // if('read_receipt' in group_status_json[j]){
                            //     read_receipt=group_status_json[j].read_receipt
                            // }else{
                            //     read_receipt=0;
                            // }
                            // if(read_receipt==0){
                            //     if(read_receipt_datetime!=''){
                            //     if(read_receipt_datetime<get_all_group_messages[i].date){
                            //         //exit ();
                            //         read_receipt=default_read_receipt;
                            //     }else{
                            //         read_receipt=0;
                            //     }
                            //     }else{
                            //     read_receipt=0;
                            //     }
                            // }
                        }
                    //console.log(get_all_group_messages[i].delivered_status)
                    //exit ()
                    if(get_all_group_messages[i].delivered_status==0){
                    get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    }else{
                        get_all_group_messages[i].message_status="2";
                    }
                    // if('delivered_status' in group_status_json[j]){
                    //   if(get_all_group_messages[i].delivered_status==0){
                    //     get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //   }else{
                    //     //get_all_group_messages[i].message_status="2";
                    //     if(group_status_json[j].user_id==get_all_group_messages[i].senter_id){
                    //       get_all_group_messages[i].message_status=get_all_group_messages[i].message_status;
                    //     }else{
                    //       get_all_group_messages[i].message_status="2";
                    //     }
                    //   }
                    // }
                    
                    group_messages.push({
                    id:get_all_group_messages[i].id.toString(),
                    date:get_all_group_messages[i].date,
                    senter_id:get_all_group_messages[i].senter_id.toString(),
                    message:get_all_group_messages[i].message,
                    message_type:get_all_group_messages[i].message_type,
                    duration: get_all_group_messages[i].duration.toString(),
                    room:get_all_group_messages[i].room,
                    message_status:get_all_group_messages[i].message_status.toString(),
                    name:get_all_group_messages[i].name,
                    type:get_all_group_messages[i].type,
                    status:group_status_json[j].status.toString(),
                    replay_id:replay_id.toString(),
                    replay_message:replay_message,
                    replay_message_type:replay_message_type,
                    replay_senter:replay_senter,
                    forward_id:forward_id.toString(),
                    forward_count:forward_message_count.toString(),
                    forward_message_status:forward_message_status.toString(),
                    delete_status:'1',
                    starred_status: starred_status.toString(),
                    read_receipt: read_receipt.toString(),
                    optional_text: get_all_group_messages[i].optional_text,
                    thumbnail: get_all_group_messages[i].thumbnail,
                    new_profile_pic: '',
                    previous_profile_pic: ''
                    });
                    

                    //console.log(get_all_group_messages[i].new_profile_pic,get_all_group_messages[i].previous_profile_pic)
                    if(get_all_group_messages[i].new_profile_pic!='' && get_all_group_messages[i].new_profile_pic!=undefined && get_all_group_messages[i].previous_profile_pic!='' && get_all_group_messages[i].previous_profile_pic!=undefined){
                        let index_i=i+group_profile_history_index;
                        group_messages[index_i].new_profile_pic=get_all_group_messages[i].new_profile_pic;
                        group_messages[index_i].previous_profile_pic=get_all_group_messages[i].previous_profile_pic;
                    }

                }else if(group_status_json[j].status==2 && group_status_json[j].user_id==user_id){
                    //console.log('cleared')
                    //clear chat message -- Don't need to show
                }
                }
            }
        }
            
        }
        }else{
            group_messages.push(group_started_data);
            group_messages.push(group_created_by_data);
        }
        
        
    }
    return group_messages;
  }

  

  module.exports={
    get_last_private_message,
    get_last_group_message,
    send_firebase_notification,
    check_value_exist_in_archived_chat_list,
    check_value_exist_in_deleted_chat_list,
    check_profile_pic_privacy,
    check_user_data_exist_in_array,
    send_firebase_notification_group,
    check_id_exist_in_message_array,
    get_private_message_read_receipt,
    get_last_private_message_history,
    get_last_group_message_history,
    get_last_group_message_history1
  }