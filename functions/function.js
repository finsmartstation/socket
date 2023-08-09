const { get } = require('superagent');
const queries=require('../queries/queries');
const sub_function=require('./sub_function');
//require('dotenv').config();
const BASE_URL=process.env.BASE_URL;
async function get_individual_chat_list_response(sid,rid,room){
  //let current_datetime=get_datetime()
    var result= await queries.send_indv_message(rid,room);
    var get_current_datetime=get_datetime()
    //console.log(result)
    //exit ()
    let mute_status="0";
    let check_private_chat_read_receipts=await queries.check_private_chat_read_receipts(sid,rid);
    let check_mute_chat_list=await queries.get_mute_notification(sid,rid);
    //console.log(check_mute_chat_list);
    if(check_mute_chat_list.length>0){
      //console.log(check_mute_chat_list[0].type,check_mute_chat_list[0].end_datetime)
      if(check_mute_chat_list[0].type!='always' && check_mute_chat_list[0].end_datetime!='0000-00-00 00:00:00'){
        console.log(get_current_datetime,'-',check_mute_chat_list[0].end_datetime);
        if(get_current_datetime<=check_mute_chat_list[0].end_datetime){
          mute_status="1";
        }else{
          mute_status="0";
        }
      }else{
        mute_status="0";
      }
    }else{
      mute_status="0";
    }
    // console.log(mute_status,get_current_datetime)
    let default_read_receipt=0;
    //console.log(check_private_chat_read_receipts,check_private_chat_read_receipts.length)
    let read_receipt_datetime='';
    if(check_private_chat_read_receipts.length>0){
      for(var rr=0;rr<check_private_chat_read_receipts.length;rr++){
        if(check_private_chat_read_receipts[rr].user_id==sid){
          default_read_receipt=1;
          read_receipt_datetime=check_private_chat_read_receipts[rr].updated_datetime;
        }
      }
    }
    let read_receipt=0;
    //console.log(default_read_receipt)
    //exit ()
            //console.log('testing response', result[0],check_private_chat_read_receipts)
            //exit ()
            let message_length=result[0].length
            let message_list_response=[];
            let date_array=[];
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
                console.log('reply msg', reply_message_details[0][0])
                result[0][i]['reply_message']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].message : '';
                result[0][i]['reply_message_type']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].message_type : '',
                //result[0][i]['reply_senter']=reply_message_details[0].senter_id;
                result[0][i]['reply_duration']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].duration : '0';
                //console.log('id s',reply_message_details[0][0].id)
                result[0][i]['replay_id']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].id.toString() : '0';
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
              //console.log(group_status_json)
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
                  // if('delivered_status' in group_status_json[j]){
                  //   //console.log(result[0][i].delivered_status)
                  //   if(result[0][i].delivered_status==0){
                  //     result[0][i].message_status=result[0][i].message_status;
                  //   }else{
                  //     //result[0][i].message_status="2";
                  //     if(group_status_json[j].user_id==result[0][i].senter_id){
                  //       result[0][i].message_status=result[0][i].message_status;
                  //     }else{
                  //       result[0][i].message_status="2";
                  //     }
                  //   }
                  // }
                  if('read_receipt' in group_status_json[j]){
                    read_receipt=group_status_json[j].read_receipt;
                  }else{
                    read_receipt=0;
                  }
                  if(read_receipt==0){
                    if(read_receipt_datetime!=''){
                      if(read_receipt_datetime<result[0][i].date){
                        read_receipt=default_read_receipt;
                      }else{
                        read_receipt=0;
                      }
                    }else{
                      read_receipt=0;
                    }
                  }
                  //console.log(result[0][i]['message_type'])
                  if(result[0][i]['message_type']=='notification'){
                    //check user
                    if(result[0][i]['senter_id']==sid){
                      if(result[0][i]['message']=='block'){
                        //console.log(' msg is block')
                        let block_msg="You blocked this contact. Tap to unblock.";
                        //check date is exist in date_array
                        if(date_array.includes(split_date[0])){
                          //date already exist
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
                            thumbnail: ''
                          })
                        }else{

                          //date already not exist
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt:"",
                            optional_text:"",
                            thumbnail: ""
                          })
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
                          })
                          //console.log('inside data array data', date_array)
                        }
                      }else if(result[0][i]['message']=='unblock'){
                        //console.log(' msg is unblock')
                        let unblock_msg="You unblocked this contact.";
                        //check date is exist in date_array
                        if(date_array.includes(split_date[0])){
                          //date already exist
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
                            thumbnail: ""
                          })
                        }else{
                          //date already not exist
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
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
                            forward_id : result[0][i] && result[0][i].forward_id.toString() ? result[0][i].forward_id.toString() : '0',
                            forward_count : result[0][i] && result[0][i].forward_count ? result[0][i].forward_count.toString() : '0',
                            forward_message_status : result[0][i] && result[0][i].forward_message_status ? result[0][i].forward_message_status : '',
                            delete_status : "0",
                            starred_status: starred_status.toString(),
                            read_receipt: read_receipt.toString(),
                            optional_text: result[0][i].optional_text,
                            thumbnail: ''
                          })
                         // console.log('inside data array data', date_array)
                        }
                      }
                    }else{
                      if(result[0][i]['message']=='phone_number_changed'){
                        //console.log('phone number changed');

                        //let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";
                        //console.log(number_changed_msg)
                        
                        if(date_array.includes(split_date[0])){
                          // console.log('yes date exist')
                          message_list_response.push({
                            id: result[0][i].id.toString(),
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            //message: number_changed_msg,
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
                            delete_status : "1",
                            starred_status: starred_status.toString(),
                            read_receipt: read_receipt.toString(),
                            optional_text: result[0][i].optional_text,
                            thumbnail: ''
                          })
                        }else{
                          //console.log('not exist')
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
                          //add block message data entry
                          message_list_response.push({
                            id: result[0][i].id.toString(),
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            //message: number_changed_msg,
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
                            delete_status : "1",
                            starred_status: starred_status.toString(),
                            read_receipt: read_receipt.toString(),
                            optional_text: result[0][i].optional_text,
                            thumbnail: ''
                          })
                        }
                        //exit ()
                      }
                    }
                  }else{
                   // console.log('no others')
                    //push other msg to the array
                    //check date is exist in date_array
                    if(date_array.includes(split_date[0])){
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
                        delete_status : "0",
                        starred_status: starred_status.toString(),
                        read_receipt: read_receipt.toString(),
                        optional_text: result[0][i].optional_text,
                        thumbnail: ''
                      })
                    }else{
                      //date already not exist
                      date_array.push(split_date[0]);
                      message_list_response.push({
                        id: "",
                        date: result[0][i].date,
                        senter_id: "",
                        receiver_id: "",
                        message: "",
                        message_type:"date",
                        duration: "",
                        message_status:"0",
                        room:"",
                        type:"date",
                        status:"",
                        replay_id:"",
                        replay_message:"",
                        replay_message_type:"",
                        replay_senter:"",
                        replay_duration:"",
                        forward_id : "",
                        forward_count : "",
                        forward_message_status : "",
                        delete_status : "",
                        starred_status: "",
                        read_receipt: "",
                        optional_text: "",
                        thumbnail: ''
                      })
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
                      })
                      //console.log('inside data array data', date_array)
                    }
                  }
                  //console.log('all the dates', date_array)
                }else if(group_status_json[j].user_id==sid && group_status_json[j].status==1){
                  //console.log(result[0][i]['delivered_status'],'delivered_status' in group_status_json[j],group_status_json[j]);
                  
                  if(result[0][i]['delivered_status']==0){
                    result[0][i].message_status=result[0][i].message_status;
                  }else{
                    result[0][i].message_status="2";
                  }
                  
                  // if('delivered_status' in group_status_json[j]){
                  //   //console.log(result[0][i].delivered_status)
                  //   if(result[0][i].delivered_status==0){
                  //     result[0][i].message_status=result[0][i].message_status;
                  //   }else{
                  //     //result[0][i].message_status="2";
                      
                  //     if(group_status_json[j].user_id==result[0][i].senter_id){
                  //       result[0][i].message_status=result[0][i].message_status;
                  //     }else{
                  //       result[0][i].message_status="2";
                  //     }
                  //     // console.log(group_status_json[j],group_status_json[j].user_id, result[0][i].senter_id,result[0][i].id,result[0][i].message_status)
                  //     // exit ()
                  //   }
                  // }
                  //console.log(group_status_json[j])
                  if('read_receipt' in group_status_json[j]){
                    read_receipt=group_status_json[j].read_receipt;
                  }else{
                    read_receipt=0;
                  }
                  // if(read_receipt==0){
                  //   read_receipt=default_read_receipt;
                  // }
                  if(read_receipt==0){
                    if(read_receipt_datetime!=''){
                      if(read_receipt_datetime<result[0][i].date){
                        read_receipt=default_read_receipt;
                      }else{
                        read_receipt=0;
                      }
                    }else{
                      read_receipt=0;
                    }
                  }
                  
                  //not deleted message
                  if(result[0][i]['message_type']=='notification'){
                    //console.log('yes notification ')
                    //check user
                    if(result[0][i]['senter_id']==sid){
                      if(result[0][i]['message']=='block'){
                        //console.log(' msg is block')
                        let block_msg="You blocked this contact. Tap to unblock.";
                        //check date is exist in date_array
                        if(date_array.includes(split_date[0])){
                          //date already exist
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
                          })
                        }else{
                          //date already not exist
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
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
                          })
                          //console.log('inside data array data', date_array)
                        }
                      }else if(result[0][i]['message']=='unblock'){
                        //console.log(' msg is unblock')
                        let unblock_msg="You unblocked this contact.";
                        //check date is exist in date_array
                        if(date_array.includes(split_date[0])){
                          //date already exist
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
                          })
                        }else{
                          //date already not exist
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
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
                          })
                          //console.log('inside data array data', date_array)
                          
                        }
                      }
                    }else{
                      //console.log('sssss')
                      
                      //opponent user
                      //receiver side notification meesage
                      if(result[0][i]['message']=='phone_number_changed'){
                        //console.log(group_status_json[j].status)
                        console.log('phone number changed');
                        console.log(result[0][i].optional_text)
                        let split_phone_number=result[0][i].optional_text.split(',')
                        console.log(split_phone_number);
                        
                        let new_phone_number=split_phone_number[1]!=undefined ? split_phone_number[1] : '';
                        
                        //let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";
                        let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number to "+new_phone_number+".";
                        console.log(number_changed_msg)
                        
                        if(date_array.includes(split_date[0])){
                          // console.log('yes date exist')
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
                          })
                        }else{
                          //console.log('not exist')
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
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
                          })
                        }
                        //console.log(message_list_response)
                      }else if(result[0][i]['message']=='Missed voice call'){
                        //exit ()
                        let call_msg="Missed voice call";
                        //check date is exist in date_array
                        if(date_array.includes(split_date[0])){
                          console.log('date loop');
                          //exit ();
                          //date already exist
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
                          })
                        }else{
                          //console.log('else date loop');
                          //exit ();
                          //date already not exist
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
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
                            status:group_status_json[j] && group_status_json[j].status ? group_status_json[j].status.toString() : '',
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
                          })
                          //console.log('inside data array data', date_array)
                          
                        }
                        // console.log(result[0][i],result[0][i]['id'])
                        // exit ()
                      }else if(result[0][i]['message']=='Missed video call'){
                        let call_msg="Missed video call";
                        //check date is exist in date_array
                        //exit ();
                        if(date_array.includes(split_date[0])){
                          console.log('date loop');
                          //exit ();
                          //date already exist
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
                          })
                        }else{
                          console.log('else date loop');
                          //exit ();
                          //date already not exist
                          date_array.push(split_date[0]);
                          message_list_response.push({
                            id: "",
                            date: result[0][i].date,
                            senter_id: "",
                            receiver_id: "",
                            message: "",
                            message_type:"date",
                            duration: "",
                            message_status:"0",
                            room:"",
                            type:"date",
                            status:"",
                            replay_id:"",
                            replay_message:"",
                            replay_message_type:"",
                            replay_senter:"",
                            replay_duration:"",
                            forward_id : "",
                            forward_count : "",
                            forward_message_status : "",
                            delete_status : "",
                            starred_status: "",
                            read_receipt: "",
                            optional_text: "",
                            thumbnail: ""
                          })
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
                          })
                          //console.log('inside data array data', date_array)
                          
                        }
                      }
                    }
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
                      if(date_array.includes(split_date[0])){
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
                          thumbnail: result[0][i]['thumbnail']
                        })
                      }else{
                        //date already not exist
                        date_array.push(split_date[0]);
                        message_list_response.push({
                          id: "",
                          date: result[0][i].date,
                          senter_id: "",
                          receiver_id: "",
                          message: "",
                          message_type:"date",
                          duration: "",
                          message_status:"0",
                          room:"",
                          type:"date",
                          status:"",
                          replay_id:"",
                          replay_message:"",
                          replay_message_type:"",
                          replay_senter:"",
                          replay_duration:"",
                          forward_id : "",
                          forward_count : "",
                          forward_message_status : "",
                          delete_status : "",
                          starred_status: "",
                          read_receipt: "",
                          optional_text: "",
                          thumbnail: ''
                        })
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
                        })
                        //console.log('inside data array data', date_array)
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
                    //console.log(contact_msg)
                    for(var k=0; k<contact_msg.length; k++){
                      //console.log(contact_msg[k]);
                      if(contact_msg[k].user_id!=''){
                        user_available_status='available';
                        //console.log(typeof contact_msg[k].user_id)
                        //exit ()
                        available_user_id=contact_msg[k].user_id;
                        // contact_user_profile_pic
                        let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,sid);
                        //console.log('privacy profile check ',sid,contact_msg[k].user_id,privacy_profile_pic);
                        if(privacy_profile_pic){
                          let get_user_profile=await queries.get_user_profile(contact_msg[k].user_id);
                          console.log(get_user_profile)
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
                    //console.log(set_contact_msg)
                    //exit ()
                    if(date_array.includes(split_date[0])){
                      
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
                      
                    }else{
                      date_array.push(split_date[0]);
                      message_list_response.push({
                        id: "",
                        date: result[0][i].date,
                        senter_id: "",
                        receiver_id: "",
                        message: "",
                        message_type:"date",
                        duration: "",
                        message_status:"0",
                        room:"",
                        type:"date",
                        status:"",
                        replay_id:"",
                        replay_message:"",
                        replay_message_type:"",
                        replay_senter:"",
                        replay_duration:"",
                        forward_id : "",
                        forward_count : "",
                        forward_message_status : "",
                        delete_status : "",
                        starred_status: "",
                        read_receipt: "",
                        optional_text: "",
                        thumbnail: ""
                      });
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
                    }
                  }else{
                    //console.log('no others')
                    //push other msg to the array
                    //check date is exist in date_array
                    if(date_array.includes(split_date[0])){
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
                      })
                    }else{
                      //date already not exist
                      date_array.push(split_date[0]);
                      message_list_response.push({
                        id: "",
                        date: result[0][i].date,
                        senter_id: "",
                        receiver_id: "",
                        message: "",
                        message_type:"date",
                        duration: "",
                        message_status:"0",
                        room:"",
                        type:"date",
                        status:"",
                        replay_id:"",
                        replay_message:"",
                        replay_message_type:"",
                        replay_senter:"",
                        replay_duration:"",
                        forward_id : "",
                        forward_count : "",
                        forward_message_status : "",
                        delete_status : "",
                        starred_status: "",
                        read_receipt: "",
                        optional_text: "",
                        thumbnail: ""
                      })
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
                        thumbnail: ''
                      })
                      //console.log('inside data array data', date_array)
                    }
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
            //console.log('all dates', date_array)
            //console.log('result with new value ',message_list_response)
            let user_details=await queries.get_user_details(rid)
            let block_status=await queries.check_user_block_status(sid,rid)
            let user_profile_pic=BASE_URL+'uploads/default/profile.png';
            let user_phone='';
            let user_name='';
            let device_token='';
            let online_status='';
            if(user_details.length>0){
              //check privacy who can see my profile pic
             let check_privacy_profile_pic=await queries.check_user_privacy(rid,'profile_pic');
             if(check_privacy_profile_pic.length>0){
               let profile_options=check_privacy_profile_pic[0].options;
               if(profile_options==0){
                  user_details[0].profile_pic=user_details[0].profile_pic;
               }else if(profile_options==1){
                  //check user is member of users chat_list
                  // let get_user_chat_list_data=await queries.user_chat_list_details(rid);
                  // let check_user_exist_in_chat_list=check_user_data_exist_in_array(sid,get_user_chat_list_data);
                  // if(check_user_exist_in_chat_list){
                  //   user_details[0].profile_pic=user_details[0].profile_pic;
                  // }else{
                  //   user_details[0].profile_pic='uploads/default/profile.png';
                  // }

                  let excepted_users=check_privacy_profile_pic[0].options;
                  //console.log(excepted_users)
                  if(excepted_users!=''){
                    excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
                  }else{
                    excepted_users=[];
                  }
                  
                  if(excepted_users.includes(sid)){
                    user_details[0].profile_pic=user_details[0].profile_pic;
                  }else{
                    user_details[0].profile_pic='uploads/default/profile.png';
                  }
               }else if(profile_options==2){
                  let excepted_users=check_privacy_profile_pic[0].options;
                  //console.log(excepted_users)
                  if(excepted_users!=''){
                    excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
                  }else{
                    excepted_users=[];
                  }
                  
                  if(excepted_users.includes(sid)){
                    user_details[0].profile_pic='uploads/default/profile.png';
                  }else{
                    user_details[0].profile_pic=user_details[0].profile_pic;
                  }
               }else if(profile_options==3){
                 user_details[0].profile_pic='uploads/default/profile.png';
               }
             }else{
              // if(user_details[0].profile_pic){
              //   user_details[0].profile_pic=user_details[0].profile_pic;
              // }else{
              //   user_details[0].profile_pic='';
              // }
              //console.log(rid)
              user_details[0].profile_pic=user_details[0].profile_pic;
             }
              //set base url in profile pic
              if(user_details[0].profile_pic!=''){
                //user_details[0].profile_pic=BASE_URL+user_details[0].profile_pic;
                user_profile_pic=BASE_URL+user_details[0].profile_pic;
              }else{
                //give default profile url
                //user_details[0].profile_pic=BASE_URL+'uploads/default/profile.png';
                user_profile_pic=BASE_URL+'uploads/default/profile.png';
              }
              user_name=user_details[0].name;
              user_phone=user_details[0].phone;
              device_token=user_details[0].deviceToken;
              online_status=user_details[0].online_status;
            }
            //console.log(user_details)
             
            
            let setresponse = {
              "status": true, "statuscode": 200, "message": "success", "data": {
                //"name": user_details[0].name,
                "name": user_name,
                //"profile": user_details[0].profile_pic,
                "profile": user_profile_pic,
                "id": rid,
                "user_block_status":block_status,
                //"phone_number": user_details[0].phone,
                "phone_number": user_phone,
                "mute_status": mute_status,
                "device_token":device_token,
                "online_status": online_status.toString(),
                "list":message_list_response
              }
            }
        return setresponse;
}

async function send_individual_message(sid,rid,room,date_status){
  //var result=await queries.individual_room_using_pagination(sid,rid,room,limit,message_id);
  var result=await queries.get_send_private_message(sid,rid,room);
  //console.log(result);
  let message_list_response=[];
  let date_array=[];
  var get_current_datetime=get_datetime()
  console.log(result[0],result[0].length)
  let mute_status="0";
  let check_private_chat_read_receipts=await queries.check_private_chat_read_receipts(sid,rid);
  let check_mute_chat_list=await queries.get_mute_notification(sid,rid);
  console.log(check_mute_chat_list);
  
  if(check_mute_chat_list.length>0){
    //console.log(check_mute_chat_list[0].type,check_mute_chat_list[0].end_datetime)
    if(check_mute_chat_list[0].type!='always' && check_mute_chat_list[0].end_datetime!='0000-00-00 00:00:00'){
      console.log(get_current_datetime,'-',check_mute_chat_list[0].end_datetime);
      if(get_current_datetime<=check_mute_chat_list[0].end_datetime){
        mute_status="1";
      }else{
        mute_status="0";
      }
    }else{
      mute_status="0";
    }
  }else{
    mute_status="0";
  }

  if(date_status){
    //find room last message date type
    let get_last_private_date_message=await queries.get_last_private_date_message(sid,rid,room)
    // console.log(get_last_private_date_message)
    // console.log(sid,rid,room,date_status)
    
    message_list_response.push({
      id: get_last_private_date_message[0].id,
      date: get_last_private_date_message[0].date,
      senter_id: "",
      receiver_id: "",
      message: "",
      message_type:"date",
      duration: "",
      message_status:"0",
      room:"",
      type:"date",
      status:"",
      replay_id:"",
      replay_message:"",
      replay_message_type:"",
      replay_senter:"",
      replay_duration:"",
      forward_id : "",
      forward_count : "",
      forward_message_status : "",
      delete_status : "",
      starred_status: "",
      read_receipt: "",
      optional_text: "",
      thumbnail: ''
    });
  }
  // console.log(mute_status,get_current_datetime)
  let default_read_receipt=0;
  //console.log(check_private_chat_read_receipts,check_private_chat_read_receipts.length)
  let read_receipt_datetime='';
  if(check_private_chat_read_receipts.length>0){
    for(var rr=0;rr<check_private_chat_read_receipts.length;rr++){
      if(check_private_chat_read_receipts[rr].user_id==sid){
        default_read_receipt=1;
        read_receipt_datetime=check_private_chat_read_receipts[rr].updated_datetime;
      }
    }
  }
  let read_receipt=0;
  //console.log(default_read_receipt)
  //exit ()
          //console.log('testing response', result[0],check_private_chat_read_receipts)
          //exit ()
          let message_length=result[0].length
          
          
          for (var i = 0; i < message_length; i++) {
            // console.log(sid,rid,room,date_status)
            //   exit ()
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
              result[0][i]['reply_message']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].message : '';
              result[0][i]['reply_message_type']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].message_type : '',
              //result[0][i]['reply_senter']=reply_message_details[0].senter_id;
              result[0][i]['reply_duration']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].duration : '0';
              //console.log('id s',reply_message_details[0][0].id)
              result[0][i]['replay_id']=reply_message_details[0][0]!=undefined ? reply_message_details[0][0].id.toString() : '0';
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
            //console.log(group_status_json)
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
                // if('delivered_status' in group_status_json[j]){
                //   //console.log(result[0][i].delivered_status)
                //   if(result[0][i].delivered_status==0){
                //     result[0][i].message_status=result[0][i].message_status;
                //   }else{
                //     //result[0][i].message_status="2";
                //     if(group_status_json[j].user_id==result[0][i].senter_id){
                //       result[0][i].message_status=result[0][i].message_status;
                //     }else{
                //       result[0][i].message_status="2";
                //     }
                //   }
                // }
                if('read_receipt' in group_status_json[j]){
                  read_receipt=group_status_json[j].read_receipt;
                }else{
                  read_receipt=0;
                }
                if(read_receipt==0){
                  if(read_receipt_datetime!=''){
                    if(read_receipt_datetime<result[0][i].date){
                      read_receipt=default_read_receipt;
                    }else{
                      read_receipt=0;
                    }
                  }else{
                    read_receipt=0;
                  }
                }
                //console.log(result[0][i]['message_type'])
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
                      let split_phone_number=result[0][i].optional_text.split(',')
                      console.log(split_phone_number);
                      let new_phone_number=split_phone_number[1]!=undefined ? split_phone_number[1] : '';
                      //let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";
                      let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number to "+new_phone_number+".";
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
                
                // if('delivered_status' in group_status_json[j]){
                //   //console.log(result[0][i].delivered_status)
                //   if(result[0][i].delivered_status==0){
                //     result[0][i].message_status=result[0][i].message_status;
                //   }else{
                //     //result[0][i].message_status="2";
                    
                //     if(group_status_json[j].user_id==result[0][i].senter_id){
                //       result[0][i].message_status=result[0][i].message_status;
                //     }else{
                //       result[0][i].message_status="2";
                //     }
                //     // console.log(group_status_json[j],group_status_json[j].user_id, result[0][i].senter_id,result[0][i].id,result[0][i].message_status)
                //     // exit ()
                //   }
                // }
                //console.log(group_status_json[j])
                if('read_receipt' in group_status_json[j]){
                  read_receipt=group_status_json[j].read_receipt;
                }else{
                  read_receipt=0;
                }
                // if(read_receipt==0){
                //   read_receipt=default_read_receipt;
                // }
                if(read_receipt==0){
                  if(read_receipt_datetime!=''){
                    if(read_receipt_datetime<result[0][i].date){
                      read_receipt=default_read_receipt;
                    }else{
                      read_receipt=0;
                    }
                  }else{
                    read_receipt=0;
                  }
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
                      let number_changed_msg=await queries.get_username(result[0][i]['senter_id'])+" changed their phone number to "+new_phone_number+".";
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
                      let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,sid);
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
                }else if(result[0][i]['message_type']=="date"){
                  //exit ();
                  message_list_response.push({
                    id: result[0][i].id,
                    date: result[0][i].date,
                    senter_id: "",
                    receiver_id: "",
                    message: "",
                    message_type:"date",
                    duration: "",
                    message_status:"0",
                    room:"",
                    type:"date",
                    status:"",
                    replay_id:"",
                    replay_message:"",
                    replay_message_type:"",
                    replay_senter:"",
                    replay_duration:"",
                    forward_id : "",
                    forward_count : "",
                    forward_message_status : "",
                    delete_status : "",
                    starred_status: "",
                    read_receipt: "",
                    optional_text: "",
                    thumbnail: ''
                  });
                }else{
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
          //console.log('all dates', date_array)
          //console.log('result with new value ',message_list_response)
          let user_phone='';
          let user_name='';
          let user_profile_pic=BASE_URL+'uploads/default/profile.png';
          let user_details=await queries.get_user_details(rid)
          let block_status=await queries.check_user_block_status(sid,rid)
          if(user_details.length>0){
            //check privacy who can see my profile pic
              let check_privacy_profile_pic=await queries.check_user_privacy(rid,'profile_pic');
              if(check_privacy_profile_pic.length>0){
                let profile_options=check_privacy_profile_pic[0].options;
                if(profile_options==0){
                  user_details[0].profile_pic=user_details[0].profile_pic;
                }else if(profile_options==1){
                  let excepted_users=check_privacy_profile_pic[0].options;
                  //console.log(excepted_users)
                  if(excepted_users!=''){
                    excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
                  }else{
                    excepted_users=[];
                  }
                  
                  if(excepted_users.includes(sid)){
                    user_details[0].profile_pic=user_details[0].profile_pic;
                  }else{
                    user_details[0].profile_pic='uploads/default/profile.png';
                  }
                }else if(profile_options==2){
                  let excepted_users=check_privacy_profile_pic[0].options;
                  //console.log(excepted_users)
                  if(excepted_users!=''){
                    excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
                  }else{
                    excepted_users=[];
                  }
                  
                  if(excepted_users.includes(sid)){
                    user_details[0].profile_pic='uploads/default/profile.png';
                  }else{
                    user_details[0].profile_pic=user_details[0].profile_pic;
                  }
                }else if(profile_options==3){
                  user_details[0].profile_pic='uploads/default/profile.png';
                }
              }else{
              // if(user_details[0].profile_pic){
              //   user_details[0].profile_pic=user_details[0].profile_pic;
              // }else{
              //   user_details[0].profile_pic='';
              // }
              console.log(rid)
                user_details[0].profile_pic=user_details[0].profile_pic;
              }
            //set base url in profile pic
            if(user_details[0].profile_pic!=''){
              user_profile_pic=BASE_URL+user_details[0].profile_pic;
            }else{
              //give default profile url
              user_profile_pic=BASE_URL+'uploads/default/profile.png';
            }
            user_name=user_details[0].name;
            user_phone=user_details[0].phone;
          }
          let setresponse = {
            "status": true, "statuscode": 200, "message": "success", "data": {
              "name": user_name,
              "profile": user_profile_pic,
              "id": rid,
              "user_block_status":block_status,
              "phone_number": user_phone,
              "mute_status": mute_status,
              "list":message_list_response
            }
          }
//console.log('looped msg', message_list_response)
      return setresponse;
}
async function individual_message_using_pagination(sid,rid,room,limit,message_id){
  //let current_datetime=get_datetime()
    //var result= await queries.send_indv_message(rid,room);
    var result=await queries.individual_room_using_pagination(sid,rid,room,limit,message_id);
    var get_current_datetime=get_datetime()
    console.log(result[0],result[0].length)
    result[0]=result[0].reverse();
    //exit ()
    let mute_status="0";
    let check_private_chat_read_receipts=await queries.check_private_chat_read_receipts(sid,rid);
    let check_mute_chat_list=await queries.get_mute_notification(sid,rid);
    console.log(check_mute_chat_list);
    
    if(check_mute_chat_list.length>0){
      //console.log(check_mute_chat_list[0].type,check_mute_chat_list[0].end_datetime)
      if(check_mute_chat_list[0].type!='always' && check_mute_chat_list[0].end_datetime!='0000-00-00 00:00:00'){
        console.log(get_current_datetime,'-',check_mute_chat_list[0].end_datetime);
        if(get_current_datetime<=check_mute_chat_list[0].end_datetime){
          mute_status="1";
        }else{
          mute_status="0";
        }
      }else{
        mute_status="0";
      }
    }else{
      mute_status="0";
    }
    // console.log(mute_status,get_current_datetime)
    let default_read_receipt=0;
    //console.log(check_private_chat_read_receipts,check_private_chat_read_receipts.length)
    let read_receipt_datetime='';
    if(check_private_chat_read_receipts.length>0){
      for(var rr=0;rr<check_private_chat_read_receipts.length;rr++){
        if(check_private_chat_read_receipts[rr].user_id==sid){
          default_read_receipt=1;
          read_receipt_datetime=check_private_chat_read_receipts[rr].updated_datetime;
        }
      }
    }
    let read_receipt=0;
    //console.log(default_read_receipt)
    //exit ()
            //console.log('testing response', result[0],check_private_chat_read_receipts)
            //exit ()
            let message_length=result[0].length
            let message_list_response=[];
            let date_array=[];
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
              //console.log(group_status_json)
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
                  // if('delivered_status' in group_status_json[j]){
                  //   //console.log(result[0][i].delivered_status)
                  //   if(result[0][i].delivered_status==0){
                  //     result[0][i].message_status=result[0][i].message_status;
                  //   }else{
                  //     //result[0][i].message_status="2";
                  //     if(group_status_json[j].user_id==result[0][i].senter_id){
                  //       result[0][i].message_status=result[0][i].message_status;
                  //     }else{
                  //       result[0][i].message_status="2";
                  //     }
                  //   }
                  // }
                  if('read_receipt' in group_status_json[j]){
                    read_receipt=group_status_json[j].read_receipt;
                  }else{
                    read_receipt=0;
                  }
                  if(read_receipt==0){
                    if(read_receipt_datetime!=''){
                      if(read_receipt_datetime<result[0][i].date){
                        read_receipt=default_read_receipt;
                      }else{
                        read_receipt=0;
                      }
                    }else{
                      read_receipt=0;
                    }
                  }
                  //console.log(result[0][i]['message_type'])
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
                  
                  // if('delivered_status' in group_status_json[j]){
                  //   //console.log(result[0][i].delivered_status)
                  //   if(result[0][i].delivered_status==0){
                  //     result[0][i].message_status=result[0][i].message_status;
                  //   }else{
                  //     //result[0][i].message_status="2";
                      
                  //     if(group_status_json[j].user_id==result[0][i].senter_id){
                  //       result[0][i].message_status=result[0][i].message_status;
                  //     }else{
                  //       result[0][i].message_status="2";
                  //     }
                  //     // console.log(group_status_json[j],group_status_json[j].user_id, result[0][i].senter_id,result[0][i].id,result[0][i].message_status)
                  //     // exit ()
                  //   }
                  // }
                  //console.log(group_status_json[j])
                  if('read_receipt' in group_status_json[j]){
                    read_receipt=group_status_json[j].read_receipt;
                  }else{
                    read_receipt=0;
                  }
                  // if(read_receipt==0){
                  //   read_receipt=default_read_receipt;
                  // }
                  if(read_receipt==0){
                    if(read_receipt_datetime!=''){
                      if(read_receipt_datetime<result[0][i].date){
                        read_receipt=default_read_receipt;
                      }else{
                        read_receipt=0;
                      }
                    }else{
                      read_receipt=0;
                    }
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
                        let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,sid);
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
                  }else if(result[0][i]['message_type']=="date"){
                    //exit ();
                    message_list_response.push({
                      id: result[0][i].id,
                      date: result[0][i].date,
                      senter_id: "",
                      receiver_id: "",
                      message: "",
                      message_type:"date",
                      duration: "",
                      message_status:"0",
                      room:"",
                      type:"date",
                      status:"",
                      replay_id:"",
                      replay_message:"",
                      replay_message_type:"",
                      replay_senter:"",
                      replay_duration:"",
                      forward_id : "",
                      forward_count : "",
                      forward_message_status : "",
                      delete_status : "",
                      starred_status: "",
                      read_receipt: "",
                      optional_text: "",
                      thumbnail: ''
                    });
                  }else{
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
            //console.log('all dates', date_array)
            //console.log('result with new value ',message_list_response)
            let user_phone='';
            let user_name='';
            let user_profile_pic=BASE_URL+'uploads/default/profile.png';
            let user_details=await queries.get_user_details(rid)
            let block_status=await queries.check_user_block_status(sid,rid);
            if(user_details.length>0){
              //check privacy who can see my profile pic
              let check_privacy_profile_pic=await queries.check_user_privacy(rid,'profile_pic');
              if(check_privacy_profile_pic.length>0){
                let profile_options=check_privacy_profile_pic[0].options;
                if(profile_options==0){
                    user_details[0].profile_pic=user_details[0].profile_pic;
                }else if(profile_options==1){
                    //check user is member of users chat_list
                    // let get_user_chat_list_data=await queries.user_chat_list_details(rid);
                    // let check_user_exist_in_chat_list=check_user_data_exist_in_array(sid,get_user_chat_list_data);
                    // if(check_user_exist_in_chat_list){
                    //   user_details[0].profile_pic=user_details[0].profile_pic;
                    // }else{
                    //   user_details[0].profile_pic='uploads/default/profile.png';
                    // }

                    let excepted_users=check_privacy_profile_pic[0].options;
                    //console.log(excepted_users)
                    if(excepted_users!=''){
                      excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
                    }else{
                      excepted_users=[];
                    }
                    
                    if(excepted_users.includes(sid)){
                      user_details[0].profile_pic=user_details[0].profile_pic;
                    }else{
                      user_details[0].profile_pic='uploads/default/profile.png';
                    }
                }else if(profile_options==2){
                    let excepted_users=check_privacy_profile_pic[0].options;
                    //console.log(excepted_users)
                    if(excepted_users!=''){
                      excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
                    }else{
                      excepted_users=[];
                    }
                    
                    if(excepted_users.includes(sid)){
                      user_details[0].profile_pic='uploads/default/profile.png';
                    }else{
                      user_details[0].profile_pic=user_details[0].profile_pic;
                    }
                }else if(profile_options==3){
                  user_details[0].profile_pic='uploads/default/profile.png';
                }
              }else{
                // if(user_details[0].profile_pic){
                //   user_details[0].profile_pic=user_details[0].profile_pic;
                // }else{
                //   user_details[0].profile_pic='';
                // }
                //console.log(rid)
                user_details[0].profile_pic=user_details[0].profile_pic;
              }
              //set base url in profile pic
              if(user_details[0].profile_pic!=''){
                user_profile_pic=BASE_URL+user_details[0].profile_pic;
              }else{
                //give default profile url
                user_profile_pic=BASE_URL+'uploads/default/profile.png';
              }
              user_name=user_details[0].name;
              user_phone=user_details[0].phone;
            }
            //console.log(user_details)
             
            let setresponse = {
              "status": true, "statuscode": 200, "message": "success", "data": {
                "name": user_name,
                "profile": user_profile_pic,
                "id": rid,
                "user_block_status":block_status,
                "phone_number": user_phone,
                "mute_status": mute_status,
                "list":message_list_response
              }
            }
//console.log('looped msg', message_list_response)
        return setresponse;
  
}

async function get_group_chat_list_response(user_id,group_id){
  //console.log(`group details ${user_id} ${group_id}`)
  let group_messages=[];
  let set_user_id='"'+user_id+'"';
  let date_array=[];
  let get_current_datetime=get_datetime();
  let mute_status="0";
  //check user is member of the group
  let check_user_in_group=await queries.check_user_and_group_data(set_user_id,group_id);
  let check_mute_chat_list=await queries.check_group_mute_notification(user_id,group_id);
  if(check_mute_chat_list.length>0){
    if(check_mute_chat_list[0].type!='always' && check_mute_chat_list[0].end_datetime!='0000-00-00 00:00:00'){
      console.log(get_current_datetime,'-',check_mute_chat_list[0].end_datetime);
      if(get_current_datetime<=check_mute_chat_list[0].end_datetime){
        //console.log('yes')
        mute_status="1";
      }else{
        mute_status="0";
      }
    }else{
      mute_status="0";
    }
  }else{
    mute_status="0";
  }
  //console.log(mute_status);
  //console.log('data ',check_user_in_group);
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
    let check_group_read_receipt=await queries.check_group_chat_read_receipts(set_query);
    //console.log(check_group_read_receipt)
    let default_read_receipt=0;
    let read_receipt_datetime='';
    let read_receipt=0;
    if(check_group_read_receipt.length>0){
      
      for(var read_receipt_i=0; read_receipt_i<check_group_read_receipt.length; read_receipt_i++){
        //console.log(check_group_read_receipt[read_receipt_i].user_id);
        if(check_group_read_receipt[read_receipt_i].user_id==user_id){
          default_read_receipt=1;
          read_receipt_datetime=check_group_read_receipt[read_receipt_i].updated_datetime;
          //console.log('ss - ',read_receipt_datetime)
          //exit ()
        }
        
      }
    } 
    
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
    group_messages.push(group_started_data);
    //split group created_date
    let split_created_date=group_created_date.split(" ");
    date_array.push(split_created_date[0]);
    let group_profile_history_index=2;
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
    group_messages.push(group_created_by_data);
    //get group message from db

    let get_all_group_messages=await queries.group_chat_response(user_id,set_user_id,group_id) || [];

    //console.log(get_all_group_messages);
    //exit();
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
                    console.log(get_all_group_messages[i].id)
                    
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
                  let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,user_id);
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
                if('read_receipt' in group_status_json[j]){
                  read_receipt=group_status_json[j].read_receipt
                }else{
                  read_receipt=0;
                }
                if(read_receipt==0){
                  if(read_receipt_datetime!=''){
                    if(read_receipt_datetime<get_all_group_messages[i].date){
                      //exit ();
                      read_receipt=default_read_receipt;
                    }else{
                      read_receipt=0;
                    }
                  }else{
                    read_receipt=0;
                  }
                }
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
                //check date already exist in array
                if(date_array.includes(split_date[0])){
                  //console.log('date is already exist')
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
                }else{
                  group_profile_history_index=group_profile_history_index+1;
                  date_array.push(split_date[0]);
                  //add date array date
                  group_messages.push({
                    id:'',
                    date:get_all_group_messages[i].date,
                    senter_id:'',
                    message:'',
                    message_type:'',
                    duration: '',
                    room:'',
                    message_status:'0',
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
                  });
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
                  //console.log('date is not exist')
                }
                
              }else if(group_status_json[j].status==1 && group_status_json[j].user_id==user_id){
                //console.log('not deleted')
                //check read receipt 
                console.log('not deleted id ',get_all_group_messages[i].id)
                if('read_receipt' in group_status_json[j]){
                  read_receipt=group_status_json[j].read_receipt
                }else{
                  read_receipt=0;
                }
                if(read_receipt==0){
                  if(read_receipt_datetime!=''){
                    if(read_receipt_datetime<get_all_group_messages[i].date){
                      //exit ();
                      read_receipt=default_read_receipt;
                    }else{
                      read_receipt=0;
                    }
                  }else{
                    read_receipt=0;
                  }
                }
                console.log(get_all_group_messages[i].delivered_status)
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
                if(date_array.includes(split_date[0])){
                  //console.log('date is already exist')
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
                }else{
                  group_profile_history_index=group_profile_history_index+1;
                  date_array.push(split_date[0]);
                  //add date array date
                  group_messages.push({
                    id:'',
                    date:get_all_group_messages[i].date,
                    senter_id:'',
                    message:'',
                    message_type:'',
                    duration: '',
                    room:'',
                    message_status:'0',
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
                  });
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
                    status:'1',
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
                  //console.log('date is not exist')
                }

                //console.log(get_all_group_messages[i].new_profile_pic,get_all_group_messages[i].previous_profile_pic)
                if(get_all_group_messages[i].new_profile_pic!='' && get_all_group_messages[i].new_profile_pic!=undefined && get_all_group_messages[i].previous_profile_pic!='' && get_all_group_messages[i].previous_profile_pic!=undefined){
                  //let last_index=group_messages.length;
                  // console.log(i)
                  // console.log(get_all_group_messages[i].id)
                  // console.log(group_messages,i)
                  //  console.log(group_messages[i])
                  // exit ()
                  //add two index for group_created_date and group_name
                  let index_i=i+group_profile_history_index;
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
    }


    //console.log(date_array); 
    
    
    
    //if(current_group_members.length>0){}
    let setresponse={
      "status": true,
      "statuscode": 200,
      "message": "success", 
      "data":{
        "group_name":group_name,
        "id":group_id,
        "group_profile":group_profile,
        "created_datetime":group_created_date,
        "user_left_status":user_left_status,
        "mute_status":mute_status,
        "list":group_messages
      }
    }
    //console.log(setresponse)
    return setresponse;
  }else{
    let setresponse={
      "status": false,
      "statuscode": 200,
      "message": "User is not member of this group", 
      "data":[]
    }
    return setresponse;
  }
}

async function group_message_using_pagination(user_id,group_id,limit,message_id){
  let group_messages=[];
  let set_user_id='"'+user_id+'"';
  let date_array=[];
  let get_current_datetime=get_datetime();
  let mute_status="0";
  //check user is member of the group
  let check_user_in_group=await queries.check_user_and_group_data(set_user_id,group_id);
  let check_mute_chat_list=await queries.check_group_mute_notification(user_id,group_id);
  if(check_mute_chat_list.length>0){
    if(check_mute_chat_list[0].type!='always' && check_mute_chat_list[0].end_datetime!='0000-00-00 00:00:00'){
      console.log(get_current_datetime,'-',check_mute_chat_list[0].end_datetime);
      if(get_current_datetime<=check_mute_chat_list[0].end_datetime){
        //console.log('yes')
        mute_status="1";
      }else{
        mute_status="0";
      }
    }else{
      mute_status="0";
    }
  }else{
    mute_status="0";
  }
  //console.log(mute_status);
  //console.log('data ',check_user_in_group);
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
    let check_group_read_receipt=await queries.check_group_chat_read_receipts(set_query);
    //console.log(check_group_read_receipt)
    let default_read_receipt=0;
    let read_receipt_datetime='';
    let read_receipt=0;
    if(check_group_read_receipt.length>0){
      
      for(var read_receipt_i=0; read_receipt_i<check_group_read_receipt.length; read_receipt_i++){
        //console.log(check_group_read_receipt[read_receipt_i].user_id);
        if(check_group_read_receipt[read_receipt_i].user_id==user_id){
          default_read_receipt=1;
          read_receipt_datetime=check_group_read_receipt[read_receipt_i].updated_datetime;
          //console.log('ss - ',read_receipt_datetime)
          //exit ()
        }
        
      }
    } 
    
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
    let group_profile_history_index=2;
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
    let get_all_group_messages=await queries.group_room_using_pagination(user_id,set_user_id,group_id,limit,message_id);
    get_all_group_messages=get_all_group_messages.reverse();
    if(get_all_group_messages.length>0){
      //console.log(get_all_group_messages[0])
      let list_small_message_id=get_all_group_messages[0].small_id
      //console.log(list_small_message_id)
      //check small id value exist in message id list
      let check_id_exist_in_message_array=await sub_function.check_id_exist_in_message_array(list_small_message_id,get_all_group_messages);
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
                    console.log(get_all_group_messages[i].id)
                    
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
                  let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,user_id);
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
                if('read_receipt' in group_status_json[j]){
                  read_receipt=group_status_json[j].read_receipt
                }else{
                  read_receipt=0;
                }
                if(read_receipt==0){
                  if(read_receipt_datetime!=''){
                    if(read_receipt_datetime<get_all_group_messages[i].date){
                      //exit ();
                      read_receipt=default_read_receipt;
                    }else{
                      read_receipt=0;
                    }
                  }else{
                    read_receipt=0;
                  }
                }
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
                  if('read_receipt' in group_status_json[j]){
                    read_receipt=group_status_json[j].read_receipt
                  }else{
                    read_receipt=0;
                  }
                  if(read_receipt==0){
                    if(read_receipt_datetime!=''){
                      if(read_receipt_datetime<get_all_group_messages[i].date){
                        //exit ();
                        read_receipt=default_read_receipt;
                      }else{
                        read_receipt=0;
                      }
                    }else{
                      read_receipt=0;
                    }
                  }
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
                  let index_i=i+group_profile_history_index;
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
    let setresponse={
      "status": true,
      "statuscode": 200,
      "message": "success", 
      "data":{
        "group_name":group_name,
        "id":group_id,
        "group_profile":group_profile,
        "created_datetime":group_created_date,
        "user_left_status":user_left_status,
        "mute_status":mute_status,
        "list":group_messages
      }
    }
    //console.log(setresponse)
    return setresponse;
  }else{
    let setresponse={
      "status": false,
      "statuscode": 200,
      "message": "User is not member of this group", 
      "data":[]
    }
    return setresponse;
  }
}

async function send_group_message(user_id,group_id,date_status){
  let group_messages=[];
  let set_user_id='"'+user_id+'"';
  let date_array=[];
  let get_current_datetime=get_datetime();
  let mute_status="0";
  //check user is member of the group
  let check_user_in_group=await queries.check_user_and_group_data(set_user_id,group_id);
  let check_mute_chat_list=await queries.check_group_mute_notification(user_id,group_id);
  if(check_mute_chat_list.length>0){
    if(check_mute_chat_list[0].type!='always' && check_mute_chat_list[0].end_datetime!='0000-00-00 00:00:00'){
      console.log(get_current_datetime,'-',check_mute_chat_list[0].end_datetime);
      if(get_current_datetime<=check_mute_chat_list[0].end_datetime){
        //console.log('yes')
        mute_status="1";
      }else{
        mute_status="0";
      }
    }else{
      mute_status="0";
    }
  }else{
    mute_status="0";
  }
  //console.log(mute_status);
  //console.log('data ',check_user_in_group);
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
    let check_group_read_receipt=await queries.check_group_chat_read_receipts(set_query);
    //console.log(check_group_read_receipt)
    let default_read_receipt=0;
    let read_receipt_datetime='';
    let read_receipt=0;
    if(check_group_read_receipt.length>0){
      
      for(var read_receipt_i=0; read_receipt_i<check_group_read_receipt.length; read_receipt_i++){
        //console.log(check_group_read_receipt[read_receipt_i].user_id);
        if(check_group_read_receipt[read_receipt_i].user_id==user_id){
          default_read_receipt=1;
          read_receipt_datetime=check_group_read_receipt[read_receipt_i].updated_datetime;
          //console.log('ss - ',read_receipt_datetime)
          //exit ()
        }
        
      }
    } 
    
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
    let group_profile_history_index=2;
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
    //let get_all_group_messages=await queries.group_room_using_pagination(user_id,set_user_id,group_id,limit,message_id);
    let get_all_group_messages=await queries.get_group_room_message(user_id,group_id);
    //get_all_group_messages=get_all_group_messages.reverse();
    // if(get_all_group_messages.length>0){
    //   //console.log(get_all_group_messages[0])
    //   let list_small_message_id=get_all_group_messages[0].small_id
    //   //console.log(list_small_message_id)
    //   //check small id value exist in message id list
    //   let check_id_exist_in_message_array=await sub_function.check_id_exist_in_message_array(list_small_message_id,get_all_group_messages);
    //   console.log(check_id_exist_in_message_array);
    //   //exit ()
    //   if(check_id_exist_in_message_array){
    //     group_messages.push(group_started_data);
    //     group_messages.push(group_created_by_data);
    //   }
    // }else{
    //   //check message_id is last_id  
    //   let get_last_message_id=await queries.get_last_message_id(user_id,group_id);
    //   console.log('val ',get_last_message_id)
    //   if(get_last_message_id!=''){
    //     if(get_last_message_id==message_id){
    //       group_messages.push(group_started_data);
    //       group_messages.push(group_created_by_data);
    //     }
    //   }
    // }
    if(date_status){
      let get_last_group_date_message=await queries.get_last_group_date_message(user_id,group_id);
      
      group_messages.push({
        id:get_last_group_date_message[0].id,
        date:get_last_group_date_message[0].date,
        senter_id:'',
        message:'',
        message_type:'',
        duration: '',
        room:'',
        message_status:'0',
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
      });
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
                    console.log(get_all_group_messages[i].id)
                    
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
                  let privacy_profile_pic=await sub_function.check_profile_pic_privacy(contact_msg[k].user_id,user_id);
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
                if('read_receipt' in group_status_json[j]){
                  read_receipt=group_status_json[j].read_receipt
                }else{
                  read_receipt=0;
                }
                if(read_receipt==0){
                  if(read_receipt_datetime!=''){
                    if(read_receipt_datetime<get_all_group_messages[i].date){
                      //exit ();
                      read_receipt=default_read_receipt;
                    }else{
                      read_receipt=0;
                    }
                  }else{
                    read_receipt=0;
                  }
                }
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
                  if('read_receipt' in group_status_json[j]){
                    read_receipt=group_status_json[j].read_receipt
                  }else{
                    read_receipt=0;
                  }
                  if(read_receipt==0){
                    if(read_receipt_datetime!=''){
                      if(read_receipt_datetime<get_all_group_messages[i].date){
                        //exit ();
                        read_receipt=default_read_receipt;
                      }else{
                        read_receipt=0;
                      }
                    }else{
                      read_receipt=0;
                    }
                  }
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
                  let index_i=i+group_profile_history_index;
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
    let setresponse={
      "status": true,
      "statuscode": 200,
      "message": "success", 
      "data":{
        "group_name":group_name,
        "id":group_id,
        "group_profile":group_profile,
        "created_datetime":group_created_date,
        "user_left_status":user_left_status,
        "mute_status":mute_status,
        "list":group_messages
      }
    }
    //console.log(setresponse)
    return setresponse;
  }else{
    let setresponse={
      "status": false,
      "statuscode": 200,
      "message": "User is not member of this group", 
      "data":[]
    }
    return setresponse;
  }
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

// function get_last_private_message(){
//   //var_dump(room_id,message_id,user_id,opponent_profile,opponent_phone);
//   //let get_last_message=queries.get_last_private_message(room_id,message_id);
//   //console.log(room_id,message_id,user_id,opponent_profile,opponent_phone)
//   return {
//     id: '',
//     date: '',
//     message: '',
//     unread_message: '',
//     user_id: '',
//     name: '',
//     profile: '',
//     phone: '',
//     mute_status: '',
//     mute_message: '',
//     room: '',
//     message_type:'',
//     chat_type: 'private'
//   }
// }

async function get_recent_chat_list_response_old(user_id){
  let get_recent_chat=await queries.get_recent_chat(user_id);

   //console.log('recent chat ',get_recent_chat);
    
  
  let chat_list_data=[];
  //get current datetime
  let archived_chat_list=await queries.archived_chat_list_details(user_id);
  let current_datetime=get_datetime();
  if(get_recent_chat.length>0){
    for(var i=0; i<get_recent_chat.length; i++){
      let group_status=JSON.parse(get_recent_chat[i].group_status);
      let mute_status=0;
      let mute_message='unmute';
      //console.log('group status',group_status)
      
     
      if(get_recent_chat[i].private_group==0){
        //private chat message
        let get_unread_message_count=await queries.get_unread_message_count(user_id,get_recent_chat[i].room)
        //console.log(user_id,get_recent_chat[i].room,'get unread msg count',get_unread_message_count)
        let unread_count=0;
        if(get_unread_message_count==null){
          unread_count=0;
        }else{
          unread_count=get_unread_message_count;
        }
        //console.log('unread count',unread_count)
        //get mute notification data
        //console.log(user_id,get_recent_chat[i].receiver_id)
        let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
        //console.log('mute data', get_mute_notification);
        if(get_mute_notification.length>0){
          //console.log('ss')
          if(get_mute_notification[0].type!='always' && get_mute_notification[0].end_datetime!='0000-00-00 00:00:00'){
            
            //console.log('sss inner loop',current_datetime,get_mute_notification[0].end_datetime)
            if(current_datetime<=get_mute_notification[0].end_datetime){
              //console.log('mute');
              mute_status=1;
              mute_message='mute';
            }else{
              //console.log('unmute');
              mute_status=0;
              mute_message='unmute';
            }
          }else{
            //always muted
            mute_status=1;
            mute_message='mute';
          }
        }else{
          mute_status=0;
          mute_message='unmute';
        }
        let opponent_data;
        let opponent_id;
        let opponent_name;
        let opponent_profile;
        let opponent_phone;
        //get opponent data
        if(user_id==get_recent_chat[i].senter_id){
          opponent_data=await queries.get_user_profile(get_recent_chat[i].receiver_id);
          //console.log('current user ',opponent_data);
          if(opponent_data.length>0){
            opponent_id=get_recent_chat[i].receiver_id;
            opponent_name=opponent_data[0].name;
            //check who can see user profile pic
            //console.log(get_recent_chat[i].receiver_id)
           
            //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].receiver_id);
            //console.log(get_recent_chat[i].userid,get_recent_chat[i].options);
            if(get_recent_chat[i].options==null){
              //console.log('null data');
              //show profile pic to all user
              opponent_profile=opponent_data[0].profile_pic;
            }else{
              //console.log('not null')
              if(get_recent_chat[i].options==0){
                opponent_profile=opponent_data[0].profile_pic;
              }else if(get_recent_chat[i].options==1){
                //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].userid);
                let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].receiver_id);
                let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].receiver_id,get_user_chat_list_data);
                //console.log(get_recent_chat[i].userid,get_user_chat_list_data,check_user_exist_in_chat_list)
                if(check_user_exist_in_chat_list){
                  opponent_profile=opponent_data[0].profile_pic;
                }else{
                  opponent_profile='uploads/default/profile.png';
                }
              }else if(get_recent_chat[i].options==2){
                
                //check 
                let excepted_users=get_recent_chat[i].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(get_recent_chat[i].except_users)
                }else{
                  excepted_users=[];
                }
                //console.log(user_id,get_recent_chat[i].except_users)
                if(excepted_users.includes(user_id)){
                  opponent_profile='uploads/default/profile.png';
                }else{
                  opponent_profile=opponent_data[0].profile_pic;
                }
                // console.log(opponent_profile)
                // exit 
              }else if(get_recent_chat[i].options==3){
                opponent_profile='uploads/default/profile.png';
              }
            }
            
            // let check_user_profile_privacy=await queries.check_user_privacy(get_recent_chat[i].receiver_id,'profile_pic');
            // console.log(check_user_profile_privacy,get_recent_chat[i].receiver_id)
            
            // if(check_user_profile_privacy.length>0){
              
            //   let profile_options=check_user_profile_privacy[0].options;
            //   if(profile_options==0){
            //     if(opponent_data[0].profile_pic!=''){
            //       opponent_profile=opponent_data[0].profile_pic;
            //     }else{
            //       opponent_profile='uploads/default/profile.png';
            //     }
            //   }else if(profile_options==1){
                
            //     //show only to chat_list users
            //     //console.log(get_user_chat_list_data); 
            //     let check_user_exist_in_chat_list=check_user_data_exist_in_array(user_id,get_user_chat_list_data);
            //     //console.log(check_user_exist_in_chat_list);
            //     if(check_user_exist_in_chat_list){
            //         opponent_profile=opponent_data[0].profile_pic;
            //     }else{
            //       opponent_profile='uploads/default/profile.png';
            //     }
            //     //console.log('profile',opponent_profile)
            //   }else if(profile_options==2){
            //     let excepted_users=check_user_profile_privacy[0].except_users;
            //     console.log(excepted_users)
            //     if(excepted_users!=''){
            //       excepted_users=JSON.parse(check_user_profile_privacy[0].except_users)
            //     }else{
            //       excepted_users=[];
            //     }
            //     // console.log(excepted_users,user_id)
            //     // console.log(excepted_users.includes(user_id))
            //     if(excepted_users.includes(user_id)){
            //       //console.log('current user exist ')
            //       opponent_profile='uploads/default/profile.png';
            //     }else{
            //       //console.log('not exist')
            //       opponent_profile=opponent_data[0].profile_pic;
            //     }
            //     //console.log(profile_pic)
            //   }else if(profile_options==3){
            //     opponent_profile='uploads/default/profile.png';
            //   }
            // }else{
            //     opponent_profile=opponent_data[0].profile_pic;
            // }
            // if(get_recent_chat[i].receiver_id==69){
            //   console.log(opponent_profile)
            //   exit 
            // }
            
            // exit 
            //opponent_profile=opponent_data[0].profile_pic;
            opponent_phone=opponent_data[0].phone;
          }else{
            opponent_id='';
            opponent_name='';
            opponent_profile='';
            opponent_phone='';
          }
        }else{
          opponent_data=await queries.get_user_profile(get_recent_chat[i].senter_id);
          //console.log('other user',opponent_data);
          if(opponent_data.length>0){
            opponent_id=get_recent_chat[i].senter_id;
            opponent_name=opponent_data[0].name;
            if(get_recent_chat[i].options==null){
              //console.log('null data');
              //show profile pic to all user
              opponent_profile=opponent_data[0].profile_pic;
            }else{
              //console.log('not null')
              if(get_recent_chat[i].options==0){
                opponent_profile=opponent_data[0].profile_pic;
              }else if(get_recent_chat[i].options==1){
                //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].userid);
                let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].senter_id);
                let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].senter_id,get_user_chat_list_data);
                //console.log(get_recent_chat[i].userid,get_user_chat_list_data,check_user_exist_in_chat_list)
                if(check_user_exist_in_chat_list){
                  opponent_profile=opponent_data[0].profile_pic;
                }else{
                  opponent_profile='uploads/default/profile.png';
                }
              }else if(get_recent_chat[i].options==2){
                
                //check 
                let excepted_users=get_recent_chat[i].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(get_recent_chat[i].except_users)
                }else{
                  excepted_users=[];
                }
                //console.log(user_id,get_recent_chat[i].except_users)
                if(excepted_users.includes(user_id)){
                  opponent_profile='uploads/default/profile.png';
                }else{
                  opponent_profile=opponent_data[0].profile_pic;
                }
                // console.log(opponent_profile)
                // exit 
              }else if(get_recent_chat[i].options==3){
                opponent_profile='uploads/default/profile.png';
              }
            }
            //check who can see user profile pic
            //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].senter_id);
            // let check_user_profile_privacy=await queries.check_user_privacy(get_recent_chat[i].senter_id,'profile_pic');
            // // console.log(get_user_chat_list_data);
            // // console.log(check_user_profile_privacy)
            // if(check_user_profile_privacy.length>0){
            //   let profile_options=check_user_profile_privacy[0].options;
            //   if(profile_options==0){
            //     //console.log('option 1')
            //     opponent_profile=opponent_data[0].profile_pic;
            //   }else if(profile_options==1){
            //     // console.log('option 1')
            //     // console.log(get_user_chat_list_data)
            //     let check_user_exist_in_chat_list=check_user_data_exist_in_array(user_id,get_user_chat_list_data); 
            //     //console.log(check_user_exist_in_chat_list)
            //     if(check_user_exist_in_chat_list){
            //       //user exist in chat list
            //       opponent_profile=opponent_data[0].profile_pic;
            //     }else{
            //       opponent_profile='uploads/default/profile.png';
            //     }
            //   }else if(profile_options==2){
            //     let excepted_users=check_user_profile_privacy[0].except_users;
            //     if(excepted_users!=''){
            //       excepted_users=JSON.parse(check_user_profile_privacy[0].except_users);
            //     }else{
            //       excepted_users=[];
            //     }
            //     //console.log(excepted_users,excepted_users.includes(user_id))
            //     if(excepted_users.includes(user_id)){
            //       opponent_profile='uploads/default/profile.png';
            //     }else{
            //       opponent_profile=opponent_data[0].profile_pic;
            //     }
            //   }else if(profile_options==3){
            //     //console.log('option 3')
            //     opponent_profile='uploads/default/profile.png';
            //   }
            // }else{
            //   opponent_profile=opponent_data[0].profile_pic;
            // }
            // console.log(get_recent_chat[i].senter_id,opponent_profile)
            // exit 
            opponent_profile=opponent_data[0].profile_pic;
            opponent_phone=opponent_data[0].phone;
          }else{
            opponent_id='';
            opponent_name='';
            opponent_profile='';
            opponent_phone='';
          }
        }
        //set base url to profile pic
        if(opponent_profile!=''){
          opponent_profile=BASE_URL+opponent_profile;
        }else{
          opponent_profile=BASE_URL+'uploads/default/profile.png';
        }
        
        //console.log('test data ',mute_status,mute_message,opponent_id,opponent_name,opponent_profile,opponent_phone);
        
        for(var j=0; j<group_status.length; j++){
          //console.log(group_status[j]);
          //check message is deleted or not
          if(group_status[j].user_id==user_id && group_status[j].status==0){
            //console.log('message is deleted')
            if('deleted_by' in group_status[j]){
              if(group_status[j].user_id==user_id){
                get_recent_chat[i].message='You deleted this message';
              }else{
                get_recent_chat[i].message='This message was deleted';
              }
            }else{
              get_recent_chat[i].message='This message was deleted';
            }
            chat_list_data.push({
              id: get_recent_chat[i].id.toString(),
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count.toString(),
              userid: opponent_id.toString(),
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status.toString(),
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private',
              pin_status: get_recent_chat[i].pin_status.toString()
            })
          }else if(group_status[j].user_id==user_id && group_status[j].status==1){
            //console.log('message is not deleted')
            //check message type
            if(get_recent_chat[i].message_type=='notification'){
              if(get_recent_chat[i].message=='block'){
                if(user_id==get_recent_chat[i].senter_id){
                  get_recent_chat[i].message='You blocked this contact.';
                  //console.log('yes blocked',user_id,get_recent_chat[i].senter_id)
                }else{
                  //get last private message
                  //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //let get_last_private_message=get_last_private_message();
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    get_recent_chat[i].message='';
                    // chat_list_data.push({
                    //   id: get_recent_chat[i].id,
                    //   date: get_recent_chat[i].date,
                    //   message: '',
                    //   unread_message: unread_count,
                    //   user_id: opponent_id,
                    //   name: opponent_name,
                    //   profile: opponent_profile,
                    //   phone: opponent_phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_recent_chat[i].room,
                    //   message_type:get_recent_chat[i].message_type,
                    //   chat_type: 'private'
                    // })
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type
                    // chat_list_data.push({
                    //   id: get_last_private_message[0].id,
                    //   date: get_last_private_message[0].date,
                    //   message: get_last_private_message[0].message,
                    //   unread_message: get_last_private_message[0].unread_message,
                    //   user_id: get_last_private_message[0].user_id,
                    //   name: get_last_private_message[0].name,
                    //   profile: get_last_private_message[0].profile,
                    //   phone: get_last_private_message[0].phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_last_private_message[0].room,
                    //   message_type:get_last_private_message[0].message_type,
                    //   chat_type: 'private'
                    // })
                  }
                }
              }else if(get_recent_chat[i].message=='unblock'){
                if(user_id==get_recent_chat[i].senter_id){
                  get_recent_chat[i].message='You unblocked this contact.';
                }else{
                  //get last private message
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    get_recent_chat[i].message='';
                    // chat_list_data.push({
                    //   id: get_recent_chat[i].id,
                    //   date: get_recent_chat[i].date,
                    //   message: '',
                    //   unread_message: unread_count,
                    //   user_id: opponent_id,
                    //   name: opponent_name,
                    //   profile: opponent_profile,
                    //   phone: opponent_phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_recent_chat[i].room,
                    //   message_type:get_recent_chat[i].message_type,
                    //   chat_type: 'private'
                    // })
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type
                    // chat_list_data.push({
                    //   id: get_last_private_message[0].id,
                    //   date: get_last_private_message[0].date,
                    //   message: get_last_private_message[0].message,
                    //   unread_message: get_last_private_message[0].unread_message,
                    //   user_id: get_last_private_message[0].user_id,
                    //   name: get_last_private_message[0].name,
                    //   profile: get_last_private_message[0].profile,
                    //   phone: get_last_private_message[0].phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_last_private_message[0].room,
                    //   message_type:get_last_private_message[0].message_type,
                    //   chat_type: 'private'
                    // })
                  }
                }
              }
            }
            //push object to array chat list 
            chat_list_data.push({
              id: get_recent_chat[i].id.toString(),
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count.toString(),
              userid: opponent_id.toString(),
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status.toString(),
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private',
              pin_status: get_recent_chat[i].pin_status.toString()
            })
          }else if(group_status[j].user_id==user_id && group_status[j].status==2){
            //console.log('message is cleared')
            //get last private message
            //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,opponent_id,opponent_profile,opponent_phone);
            let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
            //console.log(get_last_private_message)
            if(get_last_private_message==false){
              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: '',
                unread_message: unread_count.toString(),
                userid: opponent_id.toString(),
                name: opponent_name,
                profile: opponent_profile,
                phone: opponent_phone,
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'private',
                pin_status: get_recent_chat[i].pin_status.toString()
              })
            }else{
              chat_list_data.push({
                id: get_last_private_message[0].id.toString(),
                date: get_last_private_message[0].date,
                message: get_last_private_message[0].message,
                unread_message: get_last_private_message[0].unread_message.toString(),
                userid: get_last_private_message[0].user_id.toString(),
                name: get_last_private_message[0].name,
                profile: get_last_private_message[0].profile,
                phone: get_last_private_message[0].phone,
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_last_private_message[0].room,
                message_type:get_last_private_message[0].message_type,
                chat_type: 'private',
                pin_status: get_recent_chat[i].pin_status.toString()
              })
            }
          }
        }
      }else{
        //group chat message
        let unread_count=0;
        let get_unread_message_count_for_group=await queries.get_unread_message_count_for_group(user_id,get_recent_chat[i].room);
        //console.log('group unread count ',get_unread_message_count_for_group);
        if(get_unread_message_count_for_group.length>0){
          
          let group_unread_message_status=JSON.parse(get_unread_message_count_for_group[0].group_status);
          if(get_unread_message_count_for_group[0].message_status==1){
            for(var k=0; k<group_unread_message_status; k++){
              //console.log(group_unread_message_status[k]);
              if(user_id==group_unread_message_status[k].user_id && group_unread_message_status[k].message_status==1){
                unread_count=unread_count+1;
              }else{
                unread_count=unread_count+0;
              }
            }
          }else{
            unread_count=0;
          }
          
          
        }else{
          unread_count=0;
        }
        
        //console.log('unread group count',unread_count)
        //check group is muted by this user
        let check_group_mute_notification=await queries.check_group_mute_notification(user_id,get_recent_chat[i].room);
        //console.log('group mute data ',check_group_mute_notification)
        if(check_group_mute_notification.length>0){
          if(check_group_mute_notification[0].type!='always' && check_group_mute_notification[0].end_datetime!='0000-00-00 00:00:00'){
            //let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
            //console.log('sss inner loop',current_datetime,check_group_mute_notification[0].end_datetime)
            if(current_datetime<=check_group_mute_notification[0].end_datetime){
              mute_status=1;
              mute_message='mute';
            }else{
              mute_status=0;
              mute_message='unmute';
            }
          }else{
            mute_status=1;
            mute_message='mute';
          }
        }else{
          mute_status=0;
          mute_message='unmute';
        }
        //get group data
        let group_details=await queries.get_group_basic_details(get_recent_chat[i].room);
        //console.log('group basic details ', group_details, get_recent_chat[i].room)
        let group_name='';
        let group_profile='';
        let group_members;
        let group_current_members;
        let group_left_members;
        let group_removed_members;
        if(group_details.length>0){
          group_name=group_details[0].group_name;
          group_profile=group_details[0].group_profile
          if(group_profile!=''){
            group_profile=BASE_URL+group_profile;
          }else{
            group_profile=BASE_URL+'uploads/default/group_profile.png';
          }
          if(group_details[0].members!=''){
            group_members=JSON.parse(group_details[0].members);
          }else{
            group_members=[];
          }
          if(group_details[0].current_members!=''){
            //console.log('current member ', group_details[0].current_members)
            group_current_members=JSON.parse(group_details[0].current_members);
          }else{
            group_current_members=[];
          }
          if(group_details[0].left_members!=''){
            group_left_members=JSON.parse(group_details[0].left_members);
          }else{
            group_left_members=[];
          }
          if(group_details[0].removed_members!=''){
            group_removed_members=JSON.parse(group_details[0].removed_members);
          }else{
            group_removed_members=[];
          }
          if(group_details[0].subject_history!=''){
            //console.log(get_recent_chat[i].id,group_details[0].subject_history)
            subject_history=JSON.parse(group_details[0].subject_history);
          }else{
            subject_history=[];
          }
        }else{
          group_name='';
          group_profile=BASE_URL+'uploads/default/group_profile.png';
          group_members=[];
          group_current_members=[];
          group_left_members=[];
          group_removed_members=[];
          subject_history=[];
        }
        
        //check message is deleted or not
        if(group_status.length>0){
          for(var j=0; j<group_status.length; j++){
            //console.log('group_status json data',group_status[j].user_id)
            if(group_status[j].user_id==user_id && group_status[j].status==0){
              //check deleted_by key exist in array
              if('deleted_by' in group_status[j]){
                if(group_status[j].deleted_by==user_id){
                  get_recent_chat[i].message='You deleted this message';
                }else{
                  get_recent_chat[i].message='This message was deleted';
                }
              }else{
                get_recent_chat[i].message='This message was deleted';
              }

              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count.toString(),
                userid: get_recent_chat[i].room.toString(),
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group',
                pin_status: get_recent_chat[i].pin_status.toString()
              });
            }else if(group_status[j].user_id==user_id && group_status[j].status==1){
              //set message based on message_type
              if(get_recent_chat[i].message_type=='notification'){
                if(get_recent_chat[i].message=='added'){
                  //console.log('group_members',group_members)
                  let added_by_msg='';
                  let added_user_msg='';
                  let added_users='';
                  for(var k=0; k<group_members.length;k++){
                    //not need to check first index of the array
                    //console.log(group_members[k].user_id,'length ',group_members.length)
                    if(k!=0){
                      //console.log(k)
                      //console.log(group_members[k].user_id,'length ',group_members.length)
                      if(get_recent_chat[i].date==group_members[k].datetime){
                        //check which user added
                        //console.log('sss');
                        
                        //console.log(k,user_id, group_members[k].added_by)
                        
                        if(user_id==group_members[k].added_by){
                          added_by_msg='You added ';
                        }else{
                          added_by_msg=await queries.get_username(group_members[k].added_by)+' added ';
                        }
                        // console.log(added_by_msg)
                        // console.log(k,user_id, group_members[k].user_id)
                        if(group_members[k].user_id==user_id){
                          added_user_msg='You';
                        }else{
                          //console.log('entered in loop')
                          //added_user_msg=group_members[k].username;
                          added_user_msg=await queries.get_username(group_members[k].user_id);
                        }
                        
                        added_users=added_users+added_user_msg+', ';
                        //console.log('added user',added_users)
                      }
                    }
                    
                  }

                  //console.log(added_user_msg)
                       

                  let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                  let added_msg=added_by_msg+remove_comma;
                  //console.log('added msg ',added_msg)
                  get_recent_chat[i].message=added_msg;
                  // get_all_group_messages[i].message_type='';
                  // get_all_group_messages[i].type='notification';

                }else if(get_recent_chat[i].message=='admin'){
                  let admin_notification_msg='';
                  let admin_notification_msg_status=false;
                  if(group_members.length>0){
                    for(var l=0; l<group_members.length; l++){
                      if(get_recent_chat[i].date==group_members[l].datetime){
                        if(user_id==group_members[l].user_id){
                          admin_notification_msg_status=true;
                          admin_notification_msg="You're now an admin";
                        }else{
                          //get the last message
                          let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members);
                          console.log(get_last_group_message);
                          if(get_last_group_message==false){
                            
                            
                            get_recent_chat[0].message= '';
                          
                            
                          }else{
                            get_recent_chat[0].id= get_last_group_message[0].id;
                            get_recent_chat[0].date= get_last_group_message[0].date;
                            get_recent_chat[0].message= get_last_group_message[0].message;
                            get_recent_chat[0].message_type= get_last_group_message[0].message_type;
                          }
                        }
                      }
                    }
                  }
                  if(admin_notification_msg_status){
                    get_recent_chat[i].message=admin_notification_msg;
                  }
                  
                }else if(get_recent_chat[i].message=='left'){
                  let left_msg='';
                  if(group_left_members.length>0){
                    for(var m=0; m<group_left_members.length; m++){
                      if(get_recent_chat[i].date==group_left_members[m].datetime){
                        if(user_id==group_left_members[m].user_id){
                          left_msg='You left';
                        }else{
                          left_msg=await queries.get_username(group_left_members[m].user_id)+' left';
                        }
                      }
                    }
                  }
                  get_recent_chat[i].message=left_msg;
                }else if(get_recent_chat[i].message=='removed'){
                  let removed_user_msg='';
                  let removed_by='';
                  let removed_user='';
                  if(group_removed_members.length>0){
                    for(var n=0; n<group_removed_members.length;n++){
                      //console.log(get_recent_chat[i].date)
                      if(get_recent_chat[i].date==group_removed_members[n].datetime){
                        //check which user removed
                        if(get_recent_chat[i].senter_id==user_id){
                          removed_by='You removed ';
                        }else{
                          removed_by=await queries.get_username(get_recent_chat[i].senter_id)+' removed ';
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
                  get_recent_chat[i].message=removed_user_msg;
                }else if(get_recent_chat[i].message=='changed_group_icon'){
                  let icon_change_message='';
                  let content="changed this group's icon";
                  //console.log('senter id ',get_recent_chat[i].senter_id)
                  if(get_recent_chat[i].senter_id==user_id){
                    icon_change_message='You '+content;
                  }else{
                    icon_change_message=await queries.get_username(get_recent_chat[i].senter_id)+' '+content;
                  }
                  get_recent_chat[i].message=icon_change_message;
                  //exit ();
                }else if(get_recent_chat[i].message=='changed_group_description'){
                  let description_message='';
                  if(get_recent_chat[i].senter_id==user_id){
                    description_message='You changed the group description. Tap to view.';
                  }else{
                    description_message=await queries.get_username(get_recent_chat[i].senter_id)+' changed the group description. Tap to view.';
                  }
                  get_recent_chat[i].message=description_message;
                }else if(get_recent_chat[i].message=='changed_group_name'){
                  let subject_message='';
                  let subject_content='changed the subject from';
                
                  for(var subject_i=0; subject_i<subject_history.length; subject_i++){
                    if(get_recent_chat[i].date==subject_history[subject_i].datetime){
                      
                      if(subject_history[subject_i].user_id==user_id){
                        //you
                        let subject_index=subject_i-1;
                        if(subject_index>=0){
                          let old_subject=subject_history[subject_index].subject ? subject_history[subject_index].subject : '';
                          let new_subject=subject_history[subject_i].subject;
                          subject_message='You '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                      }else{
                        //get other user name
                        let subject_index=subject_i-1;
                        //console.log(group_subject_history[subject_i],subject_index)
                        if(subject_index>=0){
                          //console.log('date time loop',group_subject_history[subject_i].datetime,group_subject_history[subject_i].user_id,user_id)
                          let old_subject=subject_history[subject_index].subject ? subject_history[subject_index].subject : '';
                          let new_subject=subject_history[subject_i].subject;
                          subject_message=await queries.get_username(subject_history[subject_i].user_id)+' '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        
                      }
                    }
                  }
                  get_recent_chat[i].message=subject_message;
                }
              }else if(get_recent_chat[i].message_type=='text'){
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: '+get_recent_chat[i].message;
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': '+get_recent_chat[i].message;
                }
              }else if(get_recent_chat[i].message_type=='image' || get_recent_chat[i].message_type=='voice' || get_recent_chat[i].message_type=='video' || get_recent_chat[i].message_type=='doc'){
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: ';
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': ';
                }
              }

              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count.toString(),
                userid: get_recent_chat[i].room.toString(),
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group',
                pin_status: get_recent_chat[i].pin_status.toString()
              });
            }else if(group_status[j].user_id==user_id && group_status[j].status==2){
              //needed to find last message of the group
              let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members,subject_history);
              //console.log(get_last_group_message);
              if(get_last_group_message==false){
                chat_list_data.push({
                  id: get_recent_chat[0].id.toString(),
                  date: get_recent_chat[0].date,
                  message: get_recent_chat[0].message,
                  unread_message: unread_count.toString(),
                  userid: get_recent_chat[0].room.toString(),
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status.toString(),
                  mute_message: mute_message,
                  room: get_recent_chat[0].room,
                  message_type:get_recent_chat[0].message_type,
                  chat_type: 'group',
                  pin_status: get_recent_chat[i].pin_status.toString()
                });
              }else{
                chat_list_data.push({
                  id: get_last_group_message[0].id.toString(),
                  date: get_last_group_message[0].date,
                  message: get_last_group_message[0].message,
                  unread_message: unread_count.toString(),
                  userid: get_last_group_message[0].room.toString(),
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status.toString(),
                  mute_message: mute_message,
                  room: get_last_group_message[0].room,
                  message_type:get_last_group_message[0].message_type,
                  chat_type: 'group',
                  pin_status: get_recent_chat[i].pin_status.toString()
                });
              }
              
            }
          }
        }
      }
    }
    //set response based on archived_chat_list
    archived_list=[];
    //console.log('before',chat_list_data.length,chat_list_data)
    if(archived_chat_list.length>0){
      for(var k=0; k<chat_list_data.length; k++){
        let check_value_exist_in_archived_chat_list=await sub_function.check_value_exist_in_archived_chat_list(chat_list_data[k].room,archived_chat_list);
        //console.log(check_value_exist_in_archived_chat_list)
        if(check_value_exist_in_archived_chat_list){
          //remove from the array
          archived_list.push(chat_list_data[k]);
          chat_list_data.splice(k, 1);
          k--;
        }
      }
    }
    
    //console.log('after',chat_list_data.length,chat_list_data)
    let setresponse={
      status: true,
      statuscode: 200,
      message: "success", 
      socket: true,
      archived_chat_list:archived_list,
      data:chat_list_data
    }
    return setresponse;
  }else{
    let setresponse={
      status: true,
      statuscode: 200,
      message: "No chat found", 
      socket: true,
      archived_chat_list:[],
      data:[]
    }
    return setresponse;
  }
  
  
} 

async function get_recent_chat_list_response(user_id){
  let get_recent_chat=await queries.get_recent_chat(user_id);
  //console.log('recent chat ',get_recent_chat[0]);
  //console.log(get_recent_chat[1])
  
  //console.log('testing')
  let chat_list_data=[];
  //get current datetime
  //let archived_chat_list=await queries.archived_chat_list_details(user_id);
  let get_archived_and_deleted_chat_list=await queries.archived_and_deleted_chat_list(user_id);
  let current_datetime=get_datetime();
  //if(get_recent_chat.length>0){
    for(var i=0; i<get_recent_chat.length; i++){
      let group_status=JSON.parse(get_recent_chat[i].group_status);
      let mute_status=0;
      let mute_message='unmute';
      //console.log('group status',group_status)
      if(get_recent_chat[i].private_group==0){
        //console.log(get_recent_chat[i].id)
        //private chat message
        let get_unread_message_count=await queries.get_unread_message_count(user_id,get_recent_chat[i].room)
        //console.log(user_id,get_recent_chat[i].room,'get unread msg count',get_unread_message_count)
        let unread_count=0;
        if(get_unread_message_count==null){
          unread_count=0;
        }else{
          unread_count=get_unread_message_count;
        }
        //console.log('unread count',unread_count)
        //get mute notification data
        //console.log(user_id,get_recent_chat[i].receiver_id)
        
        //let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
        //console.log('mute data', get_mute_notification);
        //if(get_mute_notification.length>0){
        if(get_recent_chat[i].mute_id!=null){
          //console.log('ss',get_recent_chat[i])
          
          if(get_recent_chat[i].mute_type!='always' && get_recent_chat[i].mute_end_datetime!='0000-00-00 00:00:00'){
            //console.log('sss inner loop',current_datetime,get_mute_notification[0].end_datetime)
            if(current_datetime<=get_recent_chat[i].mute_end_datetime){
              //console.log('mute');
              mute_status=1;
              mute_message='mute';
            }else{
              //console.log('unmute');
              mute_status=0;
              mute_message='unmute';
            }
          }else{
            // console.log('ss',get_recent_chat[i].id)
            // exit 
            //always muted
            mute_status=1;
            mute_message='mute';
          }
        }else{
          mute_status=0;
          mute_message='unmute';
        }
        let opponent_data;
        let opponent_id='';
        let opponent_name='';
        let opponent_profile='';
        let opponent_phone='';
        //get opponent data
        //if(user_id==get_recent_chat[i].senter_id){
          //opponent_data=await queries.get_user_profile(get_recent_chat[i].receiver_id);
          //console.log('current user ',opponent_data);
          //if(opponent_data.length>0){
            opponent_id=get_recent_chat[i].opponent_id;
            opponent_name=get_recent_chat[i].opponent_name;
            //check who can see user profile pic
            //console.log(get_recent_chat[i].receiver_id)
           
            //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].receiver_id);
            //console.log(get_recent_chat[i].userid,get_recent_chat[i].options);
            if(get_recent_chat[i].options==null){
              //console.log('null data');
              //show profile pic to all user
              //opponent_profile=opponent_data[0].profile_pic;
              opponent_profile=get_recent_chat[i].opponent_profile_pic;
            }else{
              //console.log('not null')
              if(get_recent_chat[i].options==0){
                //opponent_profile=opponent_data[0].profile_pic;
                opponent_profile=get_recent_chat[i].opponent_profile_pic;
              }else if(get_recent_chat[i].options==1){
                //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].userid);
                // let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].receiver_id);
                // let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].receiver_id,get_user_chat_list_data);
                // console.log('opponent id ',get_recent_chat[i].opponent_id);
                // let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].opponent_id);
                // console.log('chat list ',get_user_chat_list_data)
                // //let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].opponent_id,get_user_chat_list_data);
                // let check_user_exist_in_chat_list=check_user_data_exist_in_array(user_id,get_user_chat_list_data);
                // console.log(get_recent_chat[i].userid,get_user_chat_list_data,check_user_exist_in_chat_list)
                // if(check_user_exist_in_chat_list){
                //   //opponent_profile=opponent_data[0].profile_pic;
                //   opponent_profile=get_recent_chat[i].opponent_profile_pic;
                // }else{
                //   opponent_profile='uploads/default/profile.png';
                // }

                let excepted_users=get_recent_chat[i].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(get_recent_chat[i].except_users)
                }else{
                  excepted_users=[];
                }
                //console.log(user_id,get_recent_chat[i].except_users)
                if(excepted_users.includes(user_id)){
                  //opponent_profile=opponent_data[0].profile_pic;
                  opponent_profile=get_recent_chat[i].opponent_profile_pic;
                }else{
                  opponent_profile='uploads/default/profile.png';
                }                
              }else if(get_recent_chat[i].options==2){
                //check 
                let excepted_users=get_recent_chat[i].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(get_recent_chat[i].except_users)
                }else{
                  excepted_users=[];
                }
                //console.log(user_id,get_recent_chat[i].except_users)
                if(excepted_users.includes(user_id)){
                  opponent_profile='uploads/default/profile.png';
                }else{
                  //opponent_profile=opponent_data[0].profile_pic;
                  opponent_profile=get_recent_chat[i].opponent_profile_pic;
                }
                // console.log(opponent_profile)
                // exit 
              }else if(get_recent_chat[i].options==3){
                opponent_profile='uploads/default/profile.png';
              }
            }
            
            
            //opponent_profile=opponent_data[0].profile_pic;
            //opponent_phone=opponent_data[0].phone;
            opponent_phone=get_recent_chat[i].opponent_phone;
          //}else{
            // opponent_id='';
            // opponent_name='';
            // opponent_profile='';
            // opponent_phone='';
          //}
        // }else{
        //   opponent_data=await queries.get_user_profile(get_recent_chat[i].senter_id);
        //   //console.log('other user',opponent_data);
        //   if(opponent_data.length>0){
        //     opponent_id=get_recent_chat[i].senter_id;
        //     opponent_name=opponent_data[0].name;
        //     if(get_recent_chat[i].options==null){
        //       //console.log('null data');
        //       //show profile pic to all user
        //       opponent_profile=opponent_data[0].profile_pic;
        //     }else{
        //       //console.log('not null')
        //       if(get_recent_chat[i].options==0){
        //         opponent_profile=opponent_data[0].profile_pic;
        //       }else if(get_recent_chat[i].options==1){
        //         //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].userid);
        //         let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].senter_id);
        //         let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].senter_id,get_user_chat_list_data);
        //         //console.log(get_recent_chat[i].userid,get_user_chat_list_data,check_user_exist_in_chat_list)
        //         if(check_user_exist_in_chat_list){
        //           opponent_profile=opponent_data[0].profile_pic;
        //         }else{
        //           opponent_profile='uploads/default/profile.png';
        //         }
        //       }else if(get_recent_chat[i].options==2){
                
        //         //check 
        //         let excepted_users=get_recent_chat[i].except_users;
        //         if(excepted_users!=''){
        //           excepted_users=JSON.parse(get_recent_chat[i].except_users)
        //         }else{
        //           excepted_users=[];
        //         }
        //         //console.log(user_id,get_recent_chat[i].except_users)
        //         if(excepted_users.includes(user_id)){
        //           opponent_profile='uploads/default/profile.png';
        //         }else{
        //           opponent_profile=opponent_data[0].profile_pic;
        //         }
        //         // console.log(opponent_profile)
        //         // exit 
        //       }else if(get_recent_chat[i].options==3){
        //         opponent_profile='uploads/default/profile.png';
        //       }
        //     }
            
        //     opponent_profile=opponent_data[0].profile_pic;
        //     opponent_phone=opponent_data[0].phone;
        //   }else{
        //     opponent_id='';
        //     opponent_name='';
        //     opponent_profile='';
        //     opponent_phone='';
        //   }
        // }
        //set base url to profile pic
        if(opponent_profile!=''){
          opponent_profile=BASE_URL+opponent_profile;
        }else{
          opponent_profile=BASE_URL+'uploads/default/profile.png';
        }
        
        //console.log('test data ',mute_status,mute_message,opponent_id,opponent_name,opponent_profile,opponent_phone);
        
        for(var j=0; j<group_status.length; j++){
          //console.log(group_status[j]);
          //check message is deleted or not
          if(group_status[j].user_id==user_id && group_status[j].status==0){
            //console.log('message is deleted')
            if('deleted_by' in group_status[j]){
              if(group_status[j].user_id==user_id){
                get_recent_chat[i].message='You deleted this message';
              }else{
                get_recent_chat[i].message='This message was deleted';
              }
            }else{
              get_recent_chat[i].message='This message was deleted';
            }
            let mark_as_unread=0;
            if('mark_as_unread' in group_status[j]){
              mark_as_unread=group_status[j].mark_as_unread;
            }else{
              mark_as_unread=0;
            }
            get_recent_chat[i].message_type='text';
            chat_list_data.push({
              id: get_recent_chat[i].id.toString(),
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count.toString(),
              userid: opponent_id.toString(),
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status.toString(),
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private',
              pin_status: get_recent_chat[i].pin_status.toString(),
              device_token: get_recent_chat[i].device_token,
              optional_text: get_recent_chat[i].optional_text,
              mark_as_unread: mark_as_unread.toString(),
              online_status: get_recent_chat[i].user_online_status
            })
          }else if(group_status[j].user_id==user_id && group_status[j].status==1){
            let mark_as_unread=0;
            if('mark_as_unread' in group_status[j]){
              mark_as_unread=group_status[j].mark_as_unread;
            }else{
              mark_as_unread=0;
            }
            //console.log('message is not deleted')
            //check message type
            if(get_recent_chat[i].message_type=='notification'){
              if(get_recent_chat[i].message=='block'){
                //exit ()
                if(user_id==get_recent_chat[i].senter_id){
                  get_recent_chat[i].message='You blocked this contact.';
                  //console.log('yes blocked',user_id,get_recent_chat[i].senter_id)
                }else{
                  //get last private message
                  //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //let get_last_private_message=get_last_private_message();
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  console.log('private ',get_last_private_message)
                  if(get_last_private_message==false){
                    console.log(get_recent_chat[i].message)
                    console.log(get_recent_chat[i].id)
                    //console.log(get_last_private_message[0].message)
                    
                    get_recent_chat[i].message='';
                    // chat_list_data.push({
                    //   id: get_recent_chat[i].id,
                    //   date: get_recent_chat[i].date,
                    //   message: '',
                    //   unread_message: unread_count,
                    //   user_id: opponent_id,
                    //   name: opponent_name,
                    //   profile: opponent_profile,
                    //   phone: opponent_phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_recent_chat[i].room,
                    //   message_type:get_recent_chat[i].message_type,
                    //   chat_type: 'private'
                    // })
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type
                    get_recent_chat[i].optional_text=get_last_private_message[0].optional_text;
                    // chat_list_data.push({
                    //   id: get_last_private_message[0].id,
                    //   date: get_last_private_message[0].date,
                    //   message: get_last_private_message[0].message,
                    //   unread_message: get_last_private_message[0].unread_message,
                    //   user_id: get_last_private_message[0].user_id,
                    //   name: get_last_private_message[0].name,
                    //   profile: get_last_private_message[0].profile,
                    //   phone: get_last_private_message[0].phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_last_private_message[0].room,
                    //   message_type:get_last_private_message[0].message_type,
                    //   chat_type: 'private'
                    // })
                  }
                }
              }else if(get_recent_chat[i].message=='unblock'){
                if(user_id==get_recent_chat[i].senter_id){
                  get_recent_chat[i].message='You unblocked this contact.';
                }else{
                  //get last private message
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    get_recent_chat[i].message='';
                    // chat_list_data.push({
                    //   id: get_recent_chat[i].id,
                    //   date: get_recent_chat[i].date,
                    //   message: '',
                    //   unread_message: unread_count,
                    //   user_id: opponent_id,
                    //   name: opponent_name,
                    //   profile: opponent_profile,
                    //   phone: opponent_phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_recent_chat[i].room,
                    //   message_type:get_recent_chat[i].message_type,
                    //   chat_type: 'private'
                    // })
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type
                    get_recent_chat[i].optional_text=get_last_private_message[0].optional_text
                    // chat_list_data.push({
                    //   id: get_last_private_message[0].id,
                    //   date: get_last_private_message[0].date,
                    //   message: get_last_private_message[0].message,
                    //   unread_message: get_last_private_message[0].unread_message,
                    //   user_id: get_last_private_message[0].user_id,
                    //   name: get_last_private_message[0].name,
                    //   profile: get_last_private_message[0].profile,
                    //   phone: get_last_private_message[0].phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_last_private_message[0].room,
                    //   message_type:get_last_private_message[0].message_type,
                    //   chat_type: 'private'
                    // })
                  }
                }
              }else if(get_recent_chat[i].message=='phone_number_changed'){
                console.log('phone_number_changed')
                
                if(user_id==get_recent_chat[i].senter_id){
                  //get last message
                  //console.log('get last messasge')
                  //console.log(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone)
                  //get last private message
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    //console.log('last message data not available')
                    get_recent_chat[i].message='';
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message;
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type;
                    get_recent_chat[i].optional_text=get_last_private_message[0].optional_text;
                    //console.log('last message data available')
                  }
                  // console.log(get_recent_chat[i].message)
                  // exit ()
                }else{
                  //console.log('show phone number change message')
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";;
                  //exit ()
                }
              }
            }else if(get_recent_chat[i].message_type=='contact'){
              //console.log('yes contact data',get_recent_chat[i].id)
              let contact_msg=get_recent_chat[i].message;
              let check_contact_user_available=false;
              if(contact_msg!=''){
                contact_msg=JSON.parse(get_recent_chat[i].message);
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
                //console.log(contact_msg)
              }else{
                contact_msg=[];
              }
              //console.log(contact_msg);
              for(var contacts=0; contacts<contact_msg.length; contacts++){
                console.log(contact_msg[contacts])
                if(contact_msg[contacts].user_id!=''){
                  check_contact_user_available=true;
                }
              }
              if(check_contact_user_available){
                if(contact_msg.length>1){
                  let remaining_user=contact_msg.length-1;
                  let other_contact_contact=' other contacts';
                  if(remaining_user==1){
                    other_contact_contact=' other contact';
                  }
                  if(remaining_user!=0){
                    if(contact_msg[0].contact_name!=''){
                      get_recent_chat[i].message=contact_msg[0].contact_name+' and '+remaining_user+other_contact_contact;
                    }else{
                      get_recent_chat[i].message=contact_msg[0].number+' and '+remaining_user+other_contact_contact;
                    }
                  }else{
                    if(contact_msg[0].contact_name!=''){
                      get_recent_chat[i].message=contact_msg[0].contact_name;
                    }else{
                      get_recent_chat[i].message=contact_msg[0].number;
                    }
                  }
                  
                }else{
                  if(contact_msg[0].contact_name!=''){
                    get_recent_chat[i].message=contact_msg[0].contact_name;
                  }else{
                    get_recent_chat[i].message=contact_msg[0].number;
                  }
                }
              }else{
                if(contact_msg.length>1){
                  get_recent_chat[i].message=contact_msg.length+' contacts';
                }else{
                  if(contact_msg[0].contact_name!=''){
                    get_recent_chat[i].message=contact_msg[0].contact_name;
                  }else{
                    get_recent_chat[i].message=contact_msg[0].number;
                  }
                }
              }
              get_recent_chat[i].message='👤'+get_recent_chat[i].message;
              //console.log('contact msg is ',get_recent_chat[i].message)
              //exit ()
            }
            
            //console.log(get_recent_chat[i].id);
            //console.log('opponent ',opponent_id,typeof(opponent_id),opponent_name,unread_count)
            // exit ()
            //push object to array chat list 
            chat_list_data.push({
              id: get_recent_chat[i].id.toString(),
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count.toString(),
              userid: opponent_id ? opponent_id.toString() : '',
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status.toString(),
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private',
              pin_status: get_recent_chat[i].pin_status.toString(),
              device_token: get_recent_chat[i].device_token,
              optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
              mark_as_unread: mark_as_unread.toString(),
              online_status: get_recent_chat[i].user_online_status
            })
            // if(get_recent_chat[i].id==5716){
            //   console.log('outer ',get_recent_chat[i].message)
            //   console.log('chat list ',chat_list_data)
            // }
            // if(get_recent_chat[i].id==650){
            //   console.log(get_recent_chat[i].message,get_recent_chat[i].message_type,chat_list_data)
            //   exit ()
            // }
          }else if(group_status[j].user_id==user_id && group_status[j].status==2){
            //console.log('message is cleared')
            //get last private message
            //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,opponent_id,opponent_profile,opponent_phone);
            let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
            //console.log(get_last_private_message)
            if(get_last_private_message==false){
              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: '',
                unread_message: unread_count.toString(),
                userid: opponent_id.toString(),
                name: opponent_name,
                profile: opponent_profile,
                phone: opponent_phone,
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'private',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                //optional_text: get_recent_chat[i].optional_text,
                optional_text: '',
                mark_as_unread: "0",
                online_status: get_recent_chat[i].user_online_status
              })
            }else{
              chat_list_data.push({
                id: get_last_private_message[0].id.toString(),
                date: get_last_private_message[0].date,
                message: get_last_private_message[0].message,
                unread_message: get_last_private_message[0].unread_message.toString(),
                userid: get_last_private_message[0].user_id.toString(),
                name: get_last_private_message[0].name,
                profile: get_last_private_message[0].profile,
                phone: get_last_private_message[0].phone,
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_last_private_message[0].room,
                message_type:get_last_private_message[0].message_type,
                chat_type: 'private',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                optional_text: get_last_private_message[0].optional_text ? get_last_private_message[0].optional_text : '',
                mark_as_unread: get_last_private_message[0].mark_as_unread.toString(),
                online_status: get_recent_chat[i].user_online_status
              })
            }
          }
        }
      }else{
        //group chat message
        let unread_count=0;
        let get_unread_message_count_for_group=await queries.get_unread_message_count_for_group(user_id,get_recent_chat[i].room);
        console.log('group unread count ',get_unread_message_count_for_group);
        unread_count=get_unread_message_count_for_group;
        // if(get_unread_message_count_for_group.length>0){
        //   //console.log('---',get_unread_message_count_for_group[0].group_status,get_recent_chat[i].id);
        //   let group_unread_message_status=JSON.parse(get_unread_message_count_for_group[0].group_status);
        //   if(get_unread_message_count_for_group[0].message_status==1){
        //     for(var k=0; k<group_unread_message_status.length; k++){
        //       console.log(group_unread_message_status[k].message_status);
        //       if(user_id==group_unread_message_status[k].user_id && group_unread_message_status[k].message_status==1){
        //         unread_count=unread_count+1;
        //       }else{
        //         unread_count=unread_count+0;
        //       }
        //     }
        //   }else{
        //     unread_count=0;
        //   }
        // }else{
        //   unread_count=0;
        // }
        // console.log('unread ',unread_count)
        // exit ();
        //console.log('unread group count',unread_count)
        //check group is muted by this user
        //let check_group_mute_notification=await queries.check_group_mute_notification(user_id,get_recent_chat[i].room);
        //console.log('group mute data ',check_group_mute_notification)
        //if(check_group_mute_notification.length>0){
        if(get_recent_chat[i].mute_id!=null){
          if(get_recent_chat[i].mute_type!='always' && get_recent_chat[i].mute_end_datetime!='0000-00-00 00:00:00'){
            //let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
            //console.log('sss inner loop',current_datetime,check_group_mute_notification[0].end_datetime)
            if(current_datetime<=get_recent_chat[i].mute_end_datetime){
              mute_status=1;
              mute_message='mute';
            }else{
              mute_status=0;
              mute_message='unmute';
            }
          }else{
            mute_status=1;
            mute_message='mute';
          }
        }else{
          mute_status=0;
          mute_message='unmute';
        }
        //get group data
        //let group_details=await queries.get_group_basic_details(get_recent_chat[i].room);
        //console.log('group basic details ', group_details, get_recent_chat[i].room)
        let group_name='';
        let group_profile='';
        let group_members;
        let group_current_members;
        let group_left_members;
        let group_removed_members;
        //if(group_details.length>0){
          if(get_recent_chat[i].group_id!=null){
          group_name=get_recent_chat[i].opponent_name;
          group_profile=get_recent_chat[i].opponent_profile_pic
          if(group_profile!=''){
            group_profile=BASE_URL+group_profile;
          }else{
            group_profile=BASE_URL+'uploads/default/group_profile.png';
          }
          if(get_recent_chat[i].members!=''){
            group_members=JSON.parse(get_recent_chat[i].members);
          }else{
            group_members=[];
          }
          if(get_recent_chat[i].current_members!=''){
            group_current_members=JSON.parse(get_recent_chat[i].current_members);
          }else{
            group_current_members=[];
          }
          if(get_recent_chat[i].left_members!=''){
            group_left_members=JSON.parse(get_recent_chat[i].left_members);
          }else{
            group_left_members=[];
          }
          if(get_recent_chat[i].removed_members!=''){
            group_removed_members=JSON.parse(get_recent_chat[i].removed_members);
          }else{
            group_removed_members=[];
          }
          if(get_recent_chat[i].subject_history!=''){
            //console.log(get_recent_chat[i].id,get_recent_chat[i].subject_history)
            subject_history=JSON.parse(get_recent_chat[i].subject_history);
          }else{
            subject_history=[];
          }
        }else{
          group_name='';
          group_profile=BASE_URL+'uploads/default/group_profile.png';
          group_members=[];
          group_current_members=[];
          group_left_members=[];
          group_removed_members=[];
          subject_history=[];
        }
        
        //check message is deleted or not
        if(group_status.length>0){
          for(var j=0; j<group_status.length; j++){
            //console.log('group_status json data',group_status[j].user_id)
            if(group_status[j].user_id==user_id && group_status[j].status==0){
              //check deleted_by key exist in array
              if('deleted_by' in group_status[j]){
                if(group_status[j].deleted_by==user_id){
                  get_recent_chat[i].message='You deleted this message';
                }else{
                  get_recent_chat[i].message='This message was deleted';
                }
              }else{
                get_recent_chat[i].message='This message was deleted';
              }

              let mark_as_unread=0;
              if('mark_as_unread' in group_status[j]){
                mark_as_unread=group_status[j].mark_as_unread;
              }else{
                mark_as_unread=0;
              }
              get_recent_chat[i].message_type='text';
              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count.toString(),
                userid: get_recent_chat[i].room.toString(),
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
                mark_as_unread: mark_as_unread.toString(),
                online_status: get_recent_chat[i].user_online_status
              });
              //console.log(get_recent_chat[i]);
              //exit ()
            }else if(group_status[j].user_id==user_id && group_status[j].status==1){
              let mark_as_unread=0;
              if('mark_as_unread' in group_status[j]){
                mark_as_unread=group_status[j].mark_as_unread;
              }else{
                mark_as_unread=0;
              }
              //set message based on message_type
              if(get_recent_chat[i].message_type=='notification'){
                if(get_recent_chat[i].message=='added'){
                  //console.log('group_members',group_members)
                  let added_by_msg='';
                  let added_user_msg='';
                  let added_users='';
                  for(var k=0; k<group_members.length;k++){
                    //not need to check first index of the array
                    //console.log(group_members[k].user_id,'length ',group_members.length)
                    if(k!=0){
                      //console.log(k)
                      //console.log(group_members[k].user_id,'length ',group_members.length)
                      if(get_recent_chat[i].date==group_members[k].datetime){
                        //check which user added
                        //console.log('sss');
                        
                        //console.log(k,user_id, group_members[k].added_by)
                        
                        if(user_id==group_members[k].added_by){
                          added_by_msg='You added ';
                        }else{
                          added_by_msg=await queries.get_username(group_members[k].added_by)+' added ';
                        }
                        // console.log(added_by_msg)
                        // console.log(k,user_id, group_members[k].user_id)
                        if(group_members[k].user_id==user_id){
                          added_user_msg='You';
                        }else{
                          //console.log('entered in loop')
                          //added_user_msg=group_members[k].username;
                          added_user_msg=await queries.get_username(group_members[k].user_id);
                        }
                        
                        added_users=added_users+added_user_msg+', ';
                        //console.log('added user',added_users)
                      }
                    }
                    
                  }

                  //console.log(added_user_msg)
                       

                  let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                  let added_msg=added_by_msg+remove_comma;
                  //console.log('added msg ',added_msg)
                  get_recent_chat[i].message=added_msg;
                  // get_all_group_messages[i].message_type='';
                  // get_all_group_messages[i].type='notification';

                }else if(get_recent_chat[i].message=='admin'){
                  let admin_notification_msg='';
                  let admin_notification_msg_status=false;
                  if(group_members.length>0){
                    for(var l=0; l<group_members.length; l++){
                      if(get_recent_chat[i].date==group_members[l].datetime){
                        if(user_id==group_members[l].user_id){
                          admin_notification_msg_status=true;
                          admin_notification_msg="You're now an admin";
                        }else{
                          //get the last message
                          let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members);
                          //console.log(get_last_group_message);
                          if(get_last_group_message==false){
                            
                            
                            get_recent_chat[i].message= '';
                          
                            
                          }else{
                            get_recent_chat[0].id= get_last_group_message[0].id;
                            get_recent_chat[0].date= get_last_group_message[0].date;
                            get_recent_chat[0].message= get_last_group_message[0].message;
                            get_recent_chat[0].message_type= get_last_group_message[0].message_type;
                          }
                        }
                      }
                    }
                  }
                  if(admin_notification_msg_status){
                    get_recent_chat[i].message=admin_notification_msg;
                  }
                  
                }else if(get_recent_chat[i].message=='left'){
                  let left_msg='';
                  if(group_left_members.length>0){
                    for(var m=0; m<group_left_members.length; m++){
                      if(get_recent_chat[i].date==group_left_members[m].datetime){
                        if(user_id==group_left_members[m].user_id){
                          left_msg='You left';
                        }else{
                          left_msg=await queries.get_username(group_left_members[m].user_id)+' left';
                        }
                      }
                    }
                  }
                  get_recent_chat[i].message=left_msg;
                }else if(get_recent_chat[i].message=='removed'){
                  let removed_user_msg='';
                  let removed_by='';
                  let removed_user='';
                  if(group_removed_members.length>0){
                    for(var n=0; n<group_removed_members.length;n++){
                      //console.log(get_recent_chat[i].date)
                      if(get_recent_chat[i].date==group_removed_members[n].datetime){
                        //check which user removed
                        if(get_recent_chat[i].senter_id==user_id){
                          removed_by='You removed ';
                        }else{
                          removed_by=await queries.get_username(get_recent_chat[i].senter_id)+' removed ';
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
                  get_recent_chat[i].message=removed_user_msg;
                }else if(get_recent_chat[i].message=='changed_group_icon'){
                  let icon_change_message='';
                  let content="changed this group's icon";
                  //console.log('senter id ',get_recent_chat[i].senter_id)
                  if(get_recent_chat[i].senter_id==user_id){
                    icon_change_message='You '+content;
                  }else{
                    icon_change_message=await queries.get_username(get_recent_chat[i].senter_id)+' '+content;
                  }
                  get_recent_chat[i].message=icon_change_message;
                  //exit ();
                }else if(get_recent_chat[i].message=='changed_group_description'){
                  let description_message='';
                  if(get_recent_chat[i].senter_id==user_id){
                    description_message='You changed the group description. Tap to view.';
                  }else{
                    description_message=await queries.get_username(get_recent_chat[i].senter_id)+' changed the group description. Tap to view.';
                  }
                  get_recent_chat[i].message=description_message;
                }else if(get_recent_chat[i].message=='changed_group_name'){
                  let subject_message='';
                  let subject_content='changed the subject from';
                
                  for(var subject_i=0; subject_i<subject_history.length; subject_i++){
                    if(get_recent_chat[i].date==subject_history[subject_i].datetime){
                      
                      if(subject_history[subject_i].user_id==user_id){
                        //you
                        let subject_index=subject_i-1;
                        if(subject_index>=0){
                          let old_subject=subject_history[subject_index].subject ? subject_history[subject_index].subject : '';
                          let new_subject=subject_history[subject_i].subject;
                          subject_message='You '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                      }else{
                        //get other user name
                        let subject_index=subject_i-1;
                        //console.log(group_subject_history[subject_i],subject_index)
                        if(subject_index>=0){
                          //console.log('date time loop',group_subject_history[subject_i].datetime,group_subject_history[subject_i].user_id,user_id)
                          let old_subject=subject_history[subject_index].subject ? subject_history[subject_index].subject : '';
                          let new_subject=subject_history[subject_i].subject;
                          subject_message=await queries.get_username(subject_history[subject_i].user_id)+' '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        
                      }
                    }
                  }
                  get_recent_chat[i].message=subject_message;
                }else if(get_recent_chat[i].message=='phone_number_changed'){
                  //console.log('group user phone_number_changed')
                  
                  if(get_recent_chat[i].senter_id==user_id){
                    //get last group chat message of the room
                    let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members);
                    //console.log(get_last_group_message);
                    if(get_last_group_message==false){
                      get_recent_chat[i].message= '';
                    }else{
                      get_recent_chat[i].id= get_last_group_message[0].id;
                      get_recent_chat[i].date= get_last_group_message[0].date;
                      get_recent_chat[i].message= get_last_group_message[0].message;
                      get_recent_chat[i].message_type= get_last_group_message[0].message_type;
                      get_recent_chat[i].optional_text=get_last_group_message[0].optional_text;
                    }
                  }else{
                    //show phone number changed message to user
                    //console.log(get_recent_chat[i]);
                    let get_numbers=get_recent_chat[i].optional_text.split(',');
                    get_recent_chat[i].message=get_numbers[0]+' changed to '+get_numbers[1];
                  }
                  // console.log('ssss',get_recent_chat[i].message);
                  // exit ()
                }else if(get_recent_chat[i].message=='group_call'){
                  let group_call_message='';
                  if(get_recent_chat[i].senter_id==user_id){
                    group_call_message='You started a call';
                  }else{
                    group_call_message=await queries.get_username(get_recent_chat[i].senter_id)+' started a call';
                  }
                  get_recent_chat[i].message=group_call_message;
                }
              }else if(get_recent_chat[i].message_type=='text'){
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: '+get_recent_chat[i].message;
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': '+get_recent_chat[i].message;
                }
              }else if(get_recent_chat[i].message_type=='image' || get_recent_chat[i].message_type=='voice' || get_recent_chat[i].message_type=='video' || get_recent_chat[i].message_type=='doc'){
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: ';
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': ';
                }
              }else if(get_recent_chat[i].message_type=='contact'){
                //console.log('group contact')
                let contact_msg=get_recent_chat[i].message;
                let contact_user_available=false;
                if(contact_msg!=''){
                  contact_msg=JSON.parse(contact_msg);
                  // console.log(get_recent_chat[i].id)
                  // console.log(contact_msg);
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
                for(contacts=0; contacts<contact_msg.length; contacts++){
                  //console.log(contact_msg[contacts]);
                  if(contact_msg[contacts].user_id!=''){
                    contact_user_available=true;
                  }
                }
                //console.log(contact_user_available)
                if(contact_user_available){
                  if(contact_msg.length>1){
                    let remaining_user=contact_msg.length-1;
                    let other_contact_contact=' other contacts';
                    if(remaining_user==1){
                      other_contact_contact=' other contact';
                    }
                    if(remaining_user!=0){
                      if(contact_msg[0].contact_name!=''){
                        get_recent_chat[i].message=contact_msg[0].contact_name+' and '+remaining_user+other_contact_contact;
                      }else{
                        get_recent_chat[i].message=contact_msg[0].number+' and '+remaining_user+other_contact_contact
                      }
                    }else{
                      if(contact_msg[0].contact_name!=''){
                        get_recent_chat[i].message=contact_msg[0].contact_name;
                      }else{
                        get_recent_chat[i].message=contact_msg[0].number;
                      }
                    }
                  }else{
                    if(contact_msg[0].contact_name!=''){
                      get_recent_chat[i].message=contact_msg[0].contact_name;
                    }else{
                      get_recent_chat[i].message=contact_msg[0].number;
                    }
                  }
                }else{
                  if(contact_msg.length>1){
                    get_recent_chat[i].message=contact_msg.length+' contacts';
                  }else{
                    if(contact_msg[0].contact_name!=''){
                      get_recent_chat[i].message=contact_msg[0].contact_name;
                    }else{
                      get_recent_chat[i].message=contact_msg[0].number;
                    }
                  }
                }
                console.log(get_recent_chat[i].senter_id)
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: 👤'+get_recent_chat[i].message;
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': 👤'+get_recent_chat[i].message;
                }
                console.log(get_recent_chat[i].id,get_recent_chat[i].message);
                //exit ()
              }

              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count.toString(),
                userid: get_recent_chat[i].room.toString(),
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
                mark_as_unread: mark_as_unread.toString(),
                online_status: get_recent_chat[i].user_online_status
              });
            }else if(group_status[j].user_id==user_id && group_status[j].status==2){
              console.log(get_recent_chat[i].room,get_recent_chat[i].id)
              //needed to find last message of the group
              let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members,subject_history);
              console.log(get_last_group_message);
              console.log(chat_list_data,get_recent_chat[i].room,get_recent_chat[i].id)
              if(get_last_group_message==false){
                //console.log(chat_list_data,get_recent_chat[i].room,get_recent_chat[i].id,group_name)
                chat_list_data.push({
                  id: get_recent_chat[i].id.toString(),
                  date: get_recent_chat[i].date,
                  message: '',
                  unread_message: unread_count.toString(),
                  userid: get_recent_chat[i].room.toString(),
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status.toString(),
                  mute_message: mute_message,
                  room: get_recent_chat[i].room,
                  message_type:get_recent_chat[i].message_type,
                  chat_type: 'group',
                  pin_status: get_recent_chat[i].pin_status.toString(),
                  device_token: get_recent_chat[i].device_token,
                  optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
                  mark_as_unread: '0',
                  online_status: get_recent_chat[i].user_online_status
                });
                
              }else{
                //console.log(get_last_group_message);
                chat_list_data.push({
                  id: get_last_group_message[0].id.toString(),
                  date: get_last_group_message[0].date,
                  message: get_last_group_message[0].message,
                  unread_message: unread_count.toString(),
                  userid: get_last_group_message[0].room.toString(),
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status.toString(),
                  mute_message: mute_message,
                  room: get_last_group_message[0].room,
                  message_type:get_last_group_message[0].message_type,
                  chat_type: 'group',
                  pin_status: get_recent_chat[i].pin_status.toString(),
                  device_token: get_recent_chat[i].device_token,
                  optional_text: get_last_group_message[0].optional_text ? get_last_group_message[0].optional_text : '',
                  mark_as_unread: get_last_group_message[0].mark_as_unread.toString(),
                  online_status: get_recent_chat[i].user_online_status
                });
              }
              
              
            }
          }
        }
      }
    }
    //set response based on archived_chat_list
    let archived_list=[];
    //console.log('before',chat_list_data.length,chat_list_data)
    //if(archived_chat_list.length>0){
    if(get_archived_and_deleted_chat_list.length>0){
       console.log(chat_list_data.length,chat_list_data)
      // console.log('deleted list', get_archived_and_deleted_chat_list)
      //exit ()
      for(var k=0; k<chat_list_data.length; k++){
        
        //check chat_list is deleted or not
        // console.log(chat_list_data.length)
        // console.log(chat_list_data[k].room,get_archived_and_deleted_chat_list)
        console.log('room - ',chat_list_data[k].room)
        let check_value_exist_in_deleted_chat_list=await sub_function.check_value_exist_in_deleted_chat_list(chat_list_data[k].room,get_archived_and_deleted_chat_list,'deleted');
        
        //console.log(check_value_exist_in_deleted_chat_list);
        if(check_value_exist_in_deleted_chat_list){
          console.log('deleted ')
          // console.log('remove deleted');
          // console.log(k)
          chat_list_data.splice(k, 1);
          k--;
          continue;
        }
        // console.log(k)
        // console.log(chat_list_data.length)
      
        if(k>=0){
          console.log('archieved list');
          //let check_value_exist_in_archived_chat_list=await sub_function.check_value_exist_in_archived_chat_list(chat_list_data[k].room,archived_chat_list);
          let check_value_exist_in_archived_chat_list=await sub_function.check_value_exist_in_archived_chat_list(chat_list_data[k].room,get_archived_and_deleted_chat_list,'archived');
          //console.log(check_value_exist_in_archived_chat_list,get_archived_and_deleted_chat_list,chat_list_data[k].room,chat_list_data[k].id)
          //console.log('if '+chat_list_data[k].id)
          if(check_value_exist_in_archived_chat_list){
            //remove from the array
            //console.log('remove archived')
            archived_list.push(chat_list_data[k]);
            chat_list_data.splice(k, 1);
            k--;
            continue;
          }
        }
      }
    }
    
    //console.log('after',chat_list_data.length,chat_list_data)
    let response_text_msg='No chat found';
    if(chat_list_data.length>0){
      response_text_msg="success";
    }
    let setresponse={
      status: true,
      statuscode: 200,
      message: response_text_msg, 
      socket: true,
      archived_chat_list:archived_list,
      data:chat_list_data
    }
    return setresponse;
  // }else{
  //   let setresponse={
  //     status: true,
  //     statuscode: 200,
  //     message: "No chat found", 
  //     socket: true,
  //     archived_chat_list:[],
  //     data:[]
  //   }
  //   return setresponse;
  // }
} 

async function search_chat_list_response(user_id,search){
  let get_recent_chat=[];
  let search_text_message=[];
  if(search!=''){
    get_recent_chat=await queries.search_chat_list_data(user_id,search);
    search_text_message=await queries.search_text_messages(user_id,search);
  }else{
    get_recent_chat=await queries.get_recent_chat(user_id);
  }

  // console.log('search chat ',get_recent_chat);
  // exit ()
  //console.log('testing')
  let chat_list_data=[];
  //get current datetime
  //let archived_chat_list=await queries.archived_chat_list_details(user_id);
  let get_archived_and_deleted_chat_list=await queries.archived_and_deleted_chat_list(user_id);
  // console.log(get_archived_and_deleted_chat_list);
  // exit ();
  let current_datetime=get_datetime();
  if(get_recent_chat.length>0){
    for(var i=0; i<get_recent_chat.length; i++){
      let group_status=JSON.parse(get_recent_chat[i].group_status);
      let mute_status=0;
      let mute_message='unmute';
      //console.log('group status',group_status)
      if(get_recent_chat[i].private_group==0){
        //console.log(get_recent_chat[i].id)
        //private chat message
        let get_unread_message_count=await queries.get_unread_message_count(user_id,get_recent_chat[i].room)
        //console.log(user_id,get_recent_chat[i].room,'get unread msg count',get_unread_message_count)
        let unread_count=0;
        if(get_unread_message_count==null){
          unread_count=0;
        }else{
          unread_count=get_unread_message_count;
        }
        //console.log('unread count',unread_count)
        //get mute notification data
        //console.log(user_id,get_recent_chat[i].receiver_id)
        
        //let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
        //console.log('mute data', get_mute_notification);
        //if(get_mute_notification.length>0){
        if(get_recent_chat[i].mute_id!=null){
          //console.log('ss',get_recent_chat[i])
          
          if(get_recent_chat[i].mute_type!='always' && get_recent_chat[i].mute_end_datetime!='0000-00-00 00:00:00'){
            //console.log('sss inner loop',current_datetime,get_mute_notification[0].end_datetime)
            if(current_datetime<=get_recent_chat[i].mute_end_datetime){
              //console.log('mute');
              mute_status=1;
              mute_message='mute';
            }else{
              //console.log('unmute');
              mute_status=0;
              mute_message='unmute';
            }
          }else{
            // console.log('ss',get_recent_chat[i].id)
            // exit 
            //always muted
            mute_status=1;
            mute_message='mute';
          }
        }else{
          mute_status=0;
          mute_message='unmute';
        }
        let opponent_data;
        let opponent_id='';
        let opponent_name='';
        let opponent_profile='';
        let opponent_phone='';
        let opponent_about='';
        //get opponent data
        //if(user_id==get_recent_chat[i].senter_id){
          //opponent_data=await queries.get_user_profile(get_recent_chat[i].receiver_id);
          //console.log('current user ',opponent_data);
          //if(opponent_data.length>0){
            opponent_id=get_recent_chat[i].opponent_id;
            opponent_name=get_recent_chat[i].opponent_name;
            //check who can see user profile pic
            //console.log(get_recent_chat[i].receiver_id)
           
            //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].receiver_id);
            //console.log(get_recent_chat[i].userid,get_recent_chat[i].options);
            if(get_recent_chat[i].options==null){
              //console.log('null data');
              //show profile pic to all user
              //opponent_profile=opponent_data[0].profile_pic;
              opponent_profile=get_recent_chat[i].opponent_profile_pic;
            }else{
              //console.log('not null')
              if(get_recent_chat[i].options==0){
                //opponent_profile=opponent_data[0].profile_pic;
                opponent_profile=get_recent_chat[i].opponent_profile_pic;
              }else if(get_recent_chat[i].options==1){
                //let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].userid);
                // let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].receiver_id);
                // let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].receiver_id,get_user_chat_list_data);
                // console.log('opponent id ',get_recent_chat[i].opponent_id);
                // let get_user_chat_list_data=await queries.user_chat_list_details(get_recent_chat[i].opponent_id);
                // console.log('chat list ',get_user_chat_list_data)
                // //let check_user_exist_in_chat_list=check_user_data_exist_in_array(get_recent_chat[i].opponent_id,get_user_chat_list_data);
                // let check_user_exist_in_chat_list=check_user_data_exist_in_array(user_id,get_user_chat_list_data);
                // console.log(get_recent_chat[i].userid,get_user_chat_list_data,check_user_exist_in_chat_list)
                // if(check_user_exist_in_chat_list){
                //   //opponent_profile=opponent_data[0].profile_pic;
                //   opponent_profile=get_recent_chat[i].opponent_profile_pic;
                // }else{
                //   opponent_profile='uploads/default/profile.png';
                // }

                let excepted_users=get_recent_chat[i].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(get_recent_chat[i].except_users)
                }else{
                  excepted_users=[];
                }
                //console.log(user_id,get_recent_chat[i].except_users)
                if(excepted_users.includes(user_id)){
                  //opponent_profile=opponent_data[0].profile_pic;
                  opponent_profile=get_recent_chat[i].opponent_profile_pic;
                }else{
                  opponent_profile='uploads/default/profile.png';
                }
              }else if(get_recent_chat[i].options==2){
                
                //check 
                let excepted_users=get_recent_chat[i].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(get_recent_chat[i].except_users)
                }else{
                  excepted_users=[];
                }
                //console.log(user_id,get_recent_chat[i].except_users)
                if(excepted_users.includes(user_id)){
                  opponent_profile='uploads/default/profile.png';
                }else{
                  //opponent_profile=opponent_data[0].profile_pic;
                  opponent_profile=get_recent_chat[i].opponent_profile_pic;
                }
                // console.log(opponent_profile)
                // exit 
              }else if(get_recent_chat[i].options==3){
                opponent_profile='uploads/default/profile.png';
              }
            }
            opponent_phone=get_recent_chat[i].opponent_phone;
            //check who can see my about
            let check_privacy_about=await queries.check_user_privacy(get_recent_chat[i].opponent_id,'about');
            if(check_privacy_about.length>0){
              let about_options=check_privacy_about[0].options;
              if(about_options==0){
                if(get_recent_chat[i].opponent_about!=""){
                  opponent_about=get_recent_chat[i].opponent_about;
                }else{
                  opponent_about='Hey there! I am using Smart Station';
                }
              }else if(about_options==1){
                let excepted_users=check_privacy_about[0].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(check_privacy_about[0].except_users);
                }else{
                  excepted_users=[];
                }
                if(excepted_users.includes(user_id)){
                  if(get_recent_chat[0].about!=''){
                    opponent_about=get_recent_chat[0].about;
                  }else{
                    opponent_about='Hey there! I am using Smart Station';
                  }
                }else{
                  opponent_about='';
                }
              }else if(about_options==2){
                let excepted_users=check_privacy_about[0].except_users;
                if(excepted_users!=''){
                  excepted_users=JSON.parse(check_privacy_about[0].except_users);
                }else{
                  excepted_users=[];
                }
                if(excepted_users.includes(user_id)){
                  opponent_about='';
                  
                }else{
                  if(get_recent_chat[0].about!=''){
                    opponent_about=get_recent_chat[0].about;
                  }else{
                    opponent_about='Hey there! I am using Smart Station';
                  }
                }
              }else if(about_options==3){
                opponent_about='';
              }
            }else{
              opponent_about=get_recent_chat[i].opponent_about;
            }
        //set base url to profile pic
        if(opponent_profile!=''){
          opponent_profile=BASE_URL+opponent_profile;
        }else{
          opponent_profile=BASE_URL+'uploads/default/profile.png';
        }
        
        //console.log('test data ',mute_status,mute_message,opponent_id,opponent_name,opponent_profile,opponent_phone);
        
        for(var j=0; j<group_status.length; j++){
          //console.log(group_status[j]);
          //check message is deleted or not
          if(group_status[j].user_id==user_id && group_status[j].status==0){
            //console.log('message is deleted')
            if('deleted_by' in group_status[j]){
              if(group_status[j].user_id==user_id){
                get_recent_chat[i].message='You deleted this message';
              }else{
                get_recent_chat[i].message='This message was deleted';
              }
            }else{
              get_recent_chat[i].message='This message was deleted';
            }
            let mark_as_unread=0;
            if('mark_as_unread' in group_status[j]){
              mark_as_unread=group_status[j].mark_as_unread;
            }else{
              mark_as_unread=0;
            }
            get_recent_chat[i].message_type='text';
            chat_list_data.push({
              id: get_recent_chat[i].id.toString(),
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count.toString(),
              userid: opponent_id.toString(),
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status.toString(),
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private',
              pin_status: get_recent_chat[i].pin_status.toString(),
              device_token: get_recent_chat[i].device_token,
              optional_text: get_recent_chat[i].optional_text,
              mark_as_unread: mark_as_unread.toString(),
              archived_status: '0',
              about: opponent_about 
            })
          }else if(group_status[j].user_id==user_id && group_status[j].status==1){
            let mark_as_unread=0;
            if('mark_as_unread' in group_status[j]){
              mark_as_unread=group_status[j].mark_as_unread;
            }else{
              mark_as_unread=0;
            }
            //console.log('message is not deleted')
            //check message type
            if(get_recent_chat[i].message_type=='notification'){
              if(get_recent_chat[i].message=='block'){
                if(user_id==get_recent_chat[i].senter_id){
                  get_recent_chat[i].message='You blocked this contact.';
                  //console.log('yes blocked',user_id,get_recent_chat[i].senter_id)
                }else{
                  //get last private message
                  //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //let get_last_private_message=get_last_private_message();
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    get_recent_chat[i].message='';
                    // chat_list_data.push({
                    //   id: get_recent_chat[i].id,
                    //   date: get_recent_chat[i].date,
                    //   message: '',
                    //   unread_message: unread_count,
                    //   user_id: opponent_id,
                    //   name: opponent_name,
                    //   profile: opponent_profile,
                    //   phone: opponent_phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_recent_chat[i].room,
                    //   message_type:get_recent_chat[i].message_type,
                    //   chat_type: 'private'
                    // })
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type
                    get_recent_chat[i].optional_text=get_last_private_message[0].optional_text;
                    // chat_list_data.push({
                    //   id: get_last_private_message[0].id,
                    //   date: get_last_private_message[0].date,
                    //   message: get_last_private_message[0].message,
                    //   unread_message: get_last_private_message[0].unread_message,
                    //   user_id: get_last_private_message[0].user_id,
                    //   name: get_last_private_message[0].name,
                    //   profile: get_last_private_message[0].profile,
                    //   phone: get_last_private_message[0].phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_last_private_message[0].room,
                    //   message_type:get_last_private_message[0].message_type,
                    //   chat_type: 'private'
                    // })
                  }
                }
              }else if(get_recent_chat[i].message=='unblock'){
                if(user_id==get_recent_chat[i].senter_id){
                  get_recent_chat[i].message='You unblocked this contact.';
                }else{
                  //get last private message
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    get_recent_chat[i].message='';
                    // chat_list_data.push({
                    //   id: get_recent_chat[i].id,
                    //   date: get_recent_chat[i].date,
                    //   message: '',
                    //   unread_message: unread_count,
                    //   user_id: opponent_id,
                    //   name: opponent_name,
                    //   profile: opponent_profile,
                    //   phone: opponent_phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_recent_chat[i].room,
                    //   message_type:get_recent_chat[i].message_type,
                    //   chat_type: 'private'
                    // })
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type
                    get_recent_chat[i].optional_text=get_last_private_message[0].optional_text
                    // chat_list_data.push({
                    //   id: get_last_private_message[0].id,
                    //   date: get_last_private_message[0].date,
                    //   message: get_last_private_message[0].message,
                    //   unread_message: get_last_private_message[0].unread_message,
                    //   user_id: get_last_private_message[0].user_id,
                    //   name: get_last_private_message[0].name,
                    //   profile: get_last_private_message[0].profile,
                    //   phone: get_last_private_message[0].phone,
                    //   mute_status: mute_status,
                    //   mute_message: mute_message,
                    //   room: get_last_private_message[0].room,
                    //   message_type:get_last_private_message[0].message_type,
                    //   chat_type: 'private'
                    // })
                  }
                }
              }else if(get_recent_chat[i].message=='phone_number_changed'){
                console.log('phone_number_changed')
                
                if(user_id==get_recent_chat[i].senter_id){
                  //get last message
                  //console.log('get last messasge')
                  //console.log(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone)
                  //get last private message
                  let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
                  //console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    //console.log('last message data not available')
                    get_recent_chat[i].message='';
                  }else{
                    get_recent_chat[i].id=get_last_private_message[0].id;
                    get_recent_chat[i].date=get_last_private_message[0].date;
                    get_recent_chat[i].message=get_last_private_message[0].message;
                    get_recent_chat[i].message_type=get_last_private_message[0].message_type;
                    get_recent_chat[i].optional_text=get_last_private_message[0].optional_text;
                    //console.log('last message data available')
                  }
                  // console.log(get_recent_chat[i].message)
                  // exit ()
                }else{
                  //console.log('show phone number change message')
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+" changed their phone number. You're currently chatting with their new number. Tap to add it to your contacts.";;
                  //exit ()
                }
              }
            }
            console.log(get_recent_chat[i].id);
             console.log('opponent ',opponent_id,typeof(opponent_id),opponent_name,unread_count)
            // exit ()
            //push object to array chat list 
            chat_list_data.push({
              id: get_recent_chat[i].id.toString(),
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count.toString(),
              userid: opponent_id.toString(),
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status.toString(),
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private',
              pin_status: get_recent_chat[i].pin_status.toString(),
              device_token: get_recent_chat[i].device_token,
              optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
              mark_as_unread: mark_as_unread.toString(),
              archived_status: '0',
              about: opponent_about 
            })
            // if(get_recent_chat[i].id==650){
            //   console.log(get_recent_chat[i].message,get_recent_chat[i].message_type,chat_list_data)
            //   exit ()
            // }
          }else if(group_status[j].user_id==user_id && group_status[j].status==2){
            //console.log('message is cleared')
            //get last private message
            //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,opponent_id,opponent_profile,opponent_phone);
            let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
            //console.log(get_last_private_message)
            if(get_last_private_message==false){
              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: '',
                unread_message: unread_count.toString(),
                userid: opponent_id.toString(),
                name: opponent_name,
                profile: opponent_profile,
                phone: opponent_phone,
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'private',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                //optional_text: get_recent_chat[i].optional_text,
                optional_text: '',
                mark_as_unread: "0",
                archived_status: '0',
                about: opponent_about 
              })
            }else{
              chat_list_data.push({
                id: get_last_private_message[0].id.toString(),
                date: get_last_private_message[0].date,
                message: get_last_private_message[0].message,
                unread_message: get_last_private_message[0].unread_message.toString(),
                userid: get_last_private_message[0].user_id.toString(),
                name: get_last_private_message[0].name,
                profile: get_last_private_message[0].profile,
                phone: get_last_private_message[0].phone,
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_last_private_message[0].room,
                message_type:get_last_private_message[0].message_type,
                chat_type: 'private',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                optional_text: get_last_private_message[0].optional_text ? get_last_private_message[0].optional_text : '',
                mark_as_unread: get_last_private_message[0].mark_as_unread.toString(),
                archived_status: '0',
                about: opponent_about 
              })
            }
          }
        }
      }else{
        //group chat message
        let unread_count=0;
        let get_unread_message_count_for_group=await queries.get_unread_message_count_for_group(user_id,get_recent_chat[i].room);
        unread_count=get_unread_message_count_for_group;
        //console.log('group unread count ',get_unread_message_count_for_group);
        // if(get_unread_message_count_for_group.length>0){
        //   console.log('---',get_unread_message_count_for_group[0].group_status,get_recent_chat[i].id);
        //   let group_unread_message_status=JSON.parse(get_unread_message_count_for_group[0].group_status);
        //   if(get_unread_message_count_for_group[0].message_status==1){
        //     for(var k=0; k<group_unread_message_status; k++){
        //       //console.log(group_unread_message_status[k]);
        //       if(user_id==group_unread_message_status[k].user_id && group_unread_message_status[k].message_status==1){
        //         unread_count=unread_count+1;
        //       }else{
        //         unread_count=unread_count+0;
        //       }
        //     }
        //   }else{
        //     unread_count=0;
        //   }
          
          
        // }else{
        //   unread_count=0;
        // }
        
        //console.log('unread group count',unread_count)
        //check group is muted by this user
        //let check_group_mute_notification=await queries.check_group_mute_notification(user_id,get_recent_chat[i].room);
        //console.log('group mute data ',check_group_mute_notification)
        //if(check_group_mute_notification.length>0){
        if(get_recent_chat[i].mute_id!=null){
          if(get_recent_chat[i].mute_type!='always' && get_recent_chat[i].mute_end_datetime!='0000-00-00 00:00:00'){
            //let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
            //console.log('sss inner loop',current_datetime,check_group_mute_notification[0].end_datetime)
            if(current_datetime<=get_recent_chat[i].mute_end_datetime){
              mute_status=1;
              mute_message='mute';
            }else{
              mute_status=0;
              mute_message='unmute';
            }
          }else{
            mute_status=1;
            mute_message='mute';
          }
        }else{
          mute_status=0;
          mute_message='unmute';
        }
        //get group data
        //let group_details=await queries.get_group_basic_details(get_recent_chat[i].room);
        //console.log('group basic details ', group_details, get_recent_chat[i].room)
        let group_name='';
        let group_profile='';
        let group_members;
        let group_current_members;
        let group_left_members;
        let group_removed_members;
        //if(group_details.length>0){
          if(get_recent_chat[i].group_id!=null){
          group_name=get_recent_chat[i].opponent_name;
          group_profile=get_recent_chat[i].opponent_profile_pic
          if(group_profile!=''){
            group_profile=BASE_URL+group_profile;
          }else{
            group_profile=BASE_URL+'uploads/default/group_profile.png';
          }
          if(get_recent_chat[i].members!=''){
            group_members=JSON.parse(get_recent_chat[i].members);
          }else{
            group_members=[];
          }
          if(get_recent_chat[i].current_members!=''){
            group_current_members=JSON.parse(get_recent_chat[i].current_members);
          }else{
            group_current_members=[];
          }
          if(get_recent_chat[i].left_members!=''){
            group_left_members=JSON.parse(get_recent_chat[i].left_members);
          }else{
            group_left_members=[];
          }
          if(get_recent_chat[i].removed_members!=''){
            group_removed_members=JSON.parse(get_recent_chat[i].removed_members);
          }else{
            group_removed_members=[];
          }
          if(get_recent_chat[i].subject_history!=''){
            //console.log(get_recent_chat[i].id,get_recent_chat[i].subject_history)
            subject_history=JSON.parse(get_recent_chat[i].subject_history);
          }else{
            subject_history=[];
          }
        }else{
          group_name='';
          group_profile=BASE_URL+'uploads/default/group_profile.png';
          group_members=[];
          group_current_members=[];
          group_left_members=[];
          group_removed_members=[];
          subject_history=[];
        }
        
        //check message is deleted or not
        if(group_status.length>0){
          for(var j=0; j<group_status.length; j++){
            //console.log('group_status json data',group_status[j].user_id)
            if(group_status[j].user_id==user_id && group_status[j].status==0){
              //check deleted_by key exist in array
              if('deleted_by' in group_status[j]){
                if(group_status[j].deleted_by==user_id){
                  get_recent_chat[i].message='You deleted this message';
                }else{
                  get_recent_chat[i].message='This message was deleted';
                }
              }else{
                get_recent_chat[i].message='This message was deleted';
              }

              let mark_as_unread=0;
              if('mark_as_unread' in group_status[j]){
                mark_as_unread=group_status[j].mark_as_unread;
              }else{
                mark_as_unread=0;
              }
              get_recent_chat[i].message_type='text';
              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count.toString(),
                userid: get_recent_chat[i].room.toString(),
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
                mark_as_unread: mark_as_unread.toString(),
                archived_status: '0',
                about: get_recent_chat[i].opponent_about 
              });
            }else if(group_status[j].user_id==user_id && group_status[j].status==1){
              let mark_as_unread=0;
              if('mark_as_unread' in group_status[j]){
                mark_as_unread=group_status[j].mark_as_unread;
              }else{
                mark_as_unread=0;
              }
              //set message based on message_type
              if(get_recent_chat[i].message_type=='notification'){
                if(get_recent_chat[i].message=='added'){
                  //console.log('group_members',group_members)
                  let added_by_msg='';
                  let added_user_msg='';
                  let added_users='';
                  for(var k=0; k<group_members.length;k++){
                    //not need to check first index of the array
                    //console.log(group_members[k].user_id,'length ',group_members.length)
                    if(k!=0){
                      //console.log(k)
                      //console.log(group_members[k].user_id,'length ',group_members.length)
                      if(get_recent_chat[i].date==group_members[k].datetime){
                        //check which user added
                        //console.log('sss');
                        
                        //console.log(k,user_id, group_members[k].added_by)
                        
                        if(user_id==group_members[k].added_by){
                          added_by_msg='You added ';
                        }else{
                          added_by_msg=await queries.get_username(group_members[k].added_by)+' added ';
                        }
                        // console.log(added_by_msg)
                        // console.log(k,user_id, group_members[k].user_id)
                        if(group_members[k].user_id==user_id){
                          added_user_msg='You';
                        }else{
                          //console.log('entered in loop')
                          //added_user_msg=group_members[k].username;
                          added_user_msg=await queries.get_username(group_members[k].user_id);
                        }
                        
                        added_users=added_users+added_user_msg+', ';
                        //console.log('added user',added_users)
                      }
                    }
                    
                  }

                  //console.log(added_user_msg)
                       

                  let remove_comma=added_users.replace(/,(?=[^,]*$)/, '');
                  let added_msg=added_by_msg+remove_comma;
                  //console.log('added msg ',added_msg)
                  get_recent_chat[i].message=added_msg;
                  // get_all_group_messages[i].message_type='';
                  // get_all_group_messages[i].type='notification';

                }else if(get_recent_chat[i].message=='admin'){
                  let admin_notification_msg='';
                  let admin_notification_msg_status=false;
                  if(group_members.length>0){
                    for(var l=0; l<group_members.length; l++){
                      if(get_recent_chat[i].date==group_members[l].datetime){
                        if(user_id==group_members[l].user_id){
                          admin_notification_msg_status=true;
                          admin_notification_msg="You're now an admin";
                        }else{
                          //get the last message
                          let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members);
                          //console.log(get_last_group_message);
                          if(get_last_group_message==false){
                            
                            
                            get_recent_chat[i].message= '';
                          
                            
                          }else{
                            get_recent_chat[0].id= get_last_group_message[0].id;
                            get_recent_chat[0].date= get_last_group_message[0].date;
                            get_recent_chat[0].message= get_last_group_message[0].message;
                            get_recent_chat[0].message_type= get_last_group_message[0].message_type;
                          }
                        }
                      }
                    }
                  }
                  if(admin_notification_msg_status){
                    get_recent_chat[i].message=admin_notification_msg;
                  }
                  
                }else if(get_recent_chat[i].message=='left'){
                  let left_msg='';
                  if(group_left_members.length>0){
                    for(var m=0; m<group_left_members.length; m++){
                      if(get_recent_chat[i].date==group_left_members[m].datetime){
                        if(user_id==group_left_members[m].user_id){
                          left_msg='You left';
                        }else{
                          left_msg=await queries.get_username(group_left_members[m].user_id)+' left';
                        }
                      }
                    }
                  }
                  get_recent_chat[i].message=left_msg;
                }else if(get_recent_chat[i].message=='removed'){
                  let removed_user_msg='';
                  let removed_by='';
                  let removed_user='';
                  if(group_removed_members.length>0){
                    for(var n=0; n<group_removed_members.length;n++){
                      //console.log(get_recent_chat[i].date)
                      if(get_recent_chat[i].date==group_removed_members[n].datetime){
                        //check which user removed
                        if(get_recent_chat[i].senter_id==user_id){
                          removed_by='You removed ';
                        }else{
                          removed_by=await queries.get_username(get_recent_chat[i].senter_id)+' removed ';
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
                  get_recent_chat[i].message=removed_user_msg;
                }else if(get_recent_chat[i].message=='changed_group_icon'){
                  let icon_change_message='';
                  let content="changed this group's icon";
                  //console.log('senter id ',get_recent_chat[i].senter_id)
                  if(get_recent_chat[i].senter_id==user_id){
                    icon_change_message='You '+content;
                  }else{
                    icon_change_message=await queries.get_username(get_recent_chat[i].senter_id)+' '+content;
                  }
                  get_recent_chat[i].message=icon_change_message;
                  //exit ();
                }else if(get_recent_chat[i].message=='changed_group_description'){
                  let description_message='';
                  if(get_recent_chat[i].senter_id==user_id){
                    description_message='You changed the group description. Tap to view.';
                  }else{
                    description_message=await queries.get_username(get_recent_chat[i].senter_id)+' changed the group description. Tap to view.';
                  }
                  get_recent_chat[i].message=description_message;
                }else if(get_recent_chat[i].message=='changed_group_name'){
                  let subject_message='';
                  let subject_content='changed the subject from';
                
                  for(var subject_i=0; subject_i<subject_history.length; subject_i++){
                    if(get_recent_chat[i].date==subject_history[subject_i].datetime){
                      
                      if(subject_history[subject_i].user_id==user_id){
                        //you
                        let subject_index=subject_i-1;
                        if(subject_index>=0){
                          let old_subject=subject_history[subject_index].subject ? subject_history[subject_index].subject : '';
                          let new_subject=subject_history[subject_i].subject;
                          subject_message='You '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                      }else{
                        //get other user name
                        let subject_index=subject_i-1;
                        //console.log(group_subject_history[subject_i],subject_index)
                        if(subject_index>=0){
                          //console.log('date time loop',group_subject_history[subject_i].datetime,group_subject_history[subject_i].user_id,user_id)
                          let old_subject=subject_history[subject_index].subject ? subject_history[subject_index].subject : '';
                          let new_subject=subject_history[subject_i].subject;
                          subject_message=await queries.get_username(subject_history[subject_i].user_id)+' '+subject_content+' "'+old_subject+'" to "'+new_subject+'"';
                        }
                        
                      }
                    }
                  }
                  get_recent_chat[i].message=subject_message;
                }else if(get_recent_chat[i].message=='phone_number_changed'){
                  //console.log('group user phone_number_changed')
                  
                  if(get_recent_chat[i].senter_id==user_id){
                    //get last group chat message of the room
                    let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members);
                    //console.log(get_last_group_message);
                    if(get_last_group_message==false){
                      get_recent_chat[i].message= '';
                    }else{
                      get_recent_chat[i].id= get_last_group_message[0].id;
                      get_recent_chat[i].date= get_last_group_message[0].date;
                      get_recent_chat[i].message= get_last_group_message[0].message;
                      get_recent_chat[i].message_type= get_last_group_message[0].message_type;
                      get_recent_chat[i].optional_text=get_last_group_message[0].optional_text;
                    }
                  }else{
                    //show phone number changed message to user
                    //console.log(get_recent_chat[i]);
                    let get_numbers=get_recent_chat[i].optional_text.split(',');
                    get_recent_chat[i].message=get_numbers[0]+' changed to '+get_numbers[1];
                  }
                  // console.log('ssss',get_recent_chat[i].message);
                  // exit ()
                }
              }else if(get_recent_chat[i].message_type=='text'){
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: '+get_recent_chat[i].message;
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': '+get_recent_chat[i].message;
                }
              }else if(get_recent_chat[i].message_type=='image' || get_recent_chat[i].message_type=='voice' || get_recent_chat[i].message_type=='video' || get_recent_chat[i].message_type=='doc'){
                if(get_recent_chat[i].senter_id==user_id){
                  get_recent_chat[i].message='You: ';
                }else{
                  get_recent_chat[i].message=await queries.get_username(get_recent_chat[i].senter_id)+': ';
                }
              }

              chat_list_data.push({
                id: get_recent_chat[i].id.toString(),
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count.toString(),
                userid: get_recent_chat[i].room.toString(),
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status.toString(),
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group',
                pin_status: get_recent_chat[i].pin_status.toString(),
                device_token: get_recent_chat[i].device_token,
                optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
                mark_as_unread: mark_as_unread.toString(),
                archived_status: '0',
                about: get_recent_chat[i].opponent_about
              });
            }else if(group_status[j].user_id==user_id && group_status[j].status==2){
              console.log(get_recent_chat[i].room,get_recent_chat[i].id)
              
              //needed to find last message of the group
              let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members,subject_history);
              console.log(get_last_group_message);
              console.log(chat_list_data,get_recent_chat[i].room,get_recent_chat[i].id)
              if(get_last_group_message==false){
                //console.log(chat_list_data,get_recent_chat[i].room,get_recent_chat[i].id,group_name)
                chat_list_data.push({
                  id: get_recent_chat[i].id.toString(),
                  date: get_recent_chat[i].date,
                  message: '',
                  unread_message: unread_count.toString(),
                  userid: get_recent_chat[i].room.toString(),
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status.toString(),
                  mute_message: mute_message,
                  room: get_recent_chat[i].room,
                  message_type:get_recent_chat[i].message_type,
                  chat_type: 'group',
                  pin_status: get_recent_chat[i].pin_status.toString(),
                  device_token: get_recent_chat[i].device_token,
                  optional_text: get_recent_chat[i].optional_text ? get_recent_chat[i].optional_text : '',
                  mark_as_unread: '0',
                  archived_status: '0',
                  about: get_recent_chat[i].opponent_about
                });
                
              }else{
                //console.log(get_last_group_message);
                chat_list_data.push({
                  id: get_last_group_message[0].id.toString(),
                  date: get_last_group_message[0].date,
                  message: get_last_group_message[0].message,
                  unread_message: unread_count.toString(),
                  userid: get_last_group_message[0].room.toString(),
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status.toString(),
                  mute_message: mute_message,
                  room: get_last_group_message[0].room,
                  message_type:get_last_group_message[0].message_type,
                  chat_type: 'group',
                  pin_status: get_recent_chat[i].pin_status.toString(),
                  device_token: get_recent_chat[i].device_token,
                  optional_text: get_last_group_message[0].optional_text ? get_last_group_message[0].optional_text : '',
                  mark_as_unread: get_last_group_message[0].mark_as_unread.toString(),
                  archived_status: '0',
                  about: get_recent_chat[i].opponent_about
                });
              }
              
              
            }
          }
        }
      }
    }
    //set response based on archived_chat_list
    archived_list=[];
    //console.log('before',chat_list_data.length,chat_list_data)
    //if(archived_chat_list.length>0){
    if(get_archived_and_deleted_chat_list.length>0){
       console.log(chat_list_data.length,chat_list_data)
      // console.log('deleted list', get_archived_and_deleted_chat_list)
      //exit ()
      for(var k=0; k<chat_list_data.length; k++){
        
        //check chat_list is deleted or not
        // console.log(chat_list_data.length)
        // console.log(chat_list_data[k].room,get_archived_and_deleted_chat_list)
        console.log('room - ',chat_list_data[k].room)
        let check_value_exist_in_deleted_chat_list=await sub_function.check_value_exist_in_deleted_chat_list(chat_list_data[k].room,get_archived_and_deleted_chat_list,'deleted');
        
        //console.log(check_value_exist_in_deleted_chat_list);
        if(check_value_exist_in_deleted_chat_list){
          console.log('deleted ')
          // console.log('remove deleted');
          // console.log(k)
          chat_list_data.splice(k, 1);
          k--;
          continue;
        }
        // console.log(k)
        // console.log(chat_list_data.length)
      
        if(k>=0){
          console.log('archieved list');
          //let check_value_exist_in_archived_chat_list=await sub_function.check_value_exist_in_archived_chat_list(chat_list_data[k].room,archived_chat_list);
          let check_value_exist_in_archived_chat_list=await sub_function.check_value_exist_in_archived_chat_list(chat_list_data[k].room,get_archived_and_deleted_chat_list,'archived');
          //console.log(check_value_exist_in_archived_chat_list,get_archived_and_deleted_chat_list,chat_list_data[k].room,chat_list_data[k].id)
          //console.log('if '+chat_list_data[k].id)
          if(check_value_exist_in_archived_chat_list){
            //console.log('archived')
            //change archived status
            chat_list_data[k].archived_status="1";
            // k--;
            // continue;
          }
        }
      }
    }
    
    //console.log('after',chat_list_data.length,chat_list_data)
    
    //console.log(search_text_message)
    // let text_message_data=[];
    // if(search_text_message.length>0){
    //   for(var m=0;m<search_text_message.length;m++){
    //     console.log(search_text_message[m])
    //     text_message_data.push({
    //       id: search_text_message[m].id,
    //       date: search_text_message[m].date,
    //       name: search_text_message[m].opponent_name,
    //       user_id: search_text_message[m].opponent_id,
    //       message: search_text_message[m].sender+': '+search_text_message[m].message,
    //       room: search_text_message[m].room
    //     })
    //   }
    // }
    // let setresponse={
    //   status: true,
    //   statuscode: 200,
    //   message: "success", 
    //   socket: true,
    //   //archived_chat_list:archived_list,
    //   data: chat_list_data,
    //   messages: text_message_data
    // }
    // return setresponse;
  }else{
    // let setresponse={
    //   status: true,
    //   statuscode: 200,
    //   message: "No chat found", 
    //   socket: true,
    //   //archived_chat_list:[],
    //   data:[],
    //   messages: []
    // }
    // return setresponse;
  }

  let text_message_data=[];
    if(search_text_message.length>0){
      for(var m=0;m<search_text_message.length;m++){
        console.log(search_text_message[m])
        let chat_type_msg='';
        if(search_text_message[m].private_group==1){
          chat_type_msg='group';
        }else{
          chat_type_msg='private';
        }
        text_message_data.push({
          id: search_text_message[m].id,
          date: search_text_message[m].date,
          name: search_text_message[m].opponent_name,
          user_id: search_text_message[m].opponent_id,
          message: search_text_message[m].sender+': '+search_text_message[m].message,
          room: search_text_message[m].room,
          chat_type: chat_type_msg
        });
      }
    }

  let setresponse={
    status: true,
    statuscode: 200,
    message: "success", 
    socket: true,
    //archived_chat_list:archived_list,
    data: chat_list_data,
    messages: text_message_data
  }
  return setresponse;


} 

async function individual_chat_push_notification(user_id,receiver_id,room,message,message_type){
  console.log(user_id,room,message,message_type)
  let current_datetime=get_datetime();
  let receiver_mute_status=await queries.receiver_mute_status(receiver_id);
  console.log(receiver_mute_status);
  
  if(receiver_mute_status.length>0){
    //console.log(receiver_mute_status[0].sound)
    //also check mute_chat_notification table
    let check_individual_mute_notification=await queries.check_individual_mute_notification(receiver_id,room);
    //console.log(check_individual_mute_notification)
    if(check_individual_mute_notification.length>0){
      //console.log('ssss')
      let mute_type=check_individual_mute_notification[0].type;
      //console.log(mute_type)
      if(mute_type=='always'){
        //notification is muted
      }else{
        
        let end_datetime=check_individual_mute_notification[0].end_datetime;
        //console.log(end_datetime,current_datetime)
        if(current_datetime>end_datetime){
          //send push notification
          let device_token=receiver_mute_status[0].deviceToken;
          //let title=await queries.get_username(user_id);
          console.log('device token', device_token)
          let check_profile_pic_privacy=await sub_function.check_profile_pic_privacy(user_id,receiver_id);
          //console.log('profile ',profile_pic)
          let get_user_profile_details=await queries.get_user_details(user_id)
          let title=get_user_profile_details[0].name;
          //console.log(get_user_profile_details)
          let profile_pic=BASE_URL+'uploads/default/profile.png';
          if(check_profile_pic_privacy==1){
            profile_pic=BASE_URL+get_user_profile_details[0].profile_pic;
          }
          if(message_type=='text'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,message,'individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='image'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'Photo','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='pdf'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'File','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='doc'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'File','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='voice'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'Audio','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='video'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'File','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='location'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'Location','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }else if(message_type=='contact'){
            let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,message,'individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
          }

        }else{
          //notification is muted
        }
      }
    }else{
      //not muted
      let device_token=receiver_mute_status[0].deviceToken;
      //let title=await queries.get_username(user_id);
      let check_profile_pic_privacy=await sub_function.check_profile_pic_privacy(user_id,receiver_id);
      //console.log('profile ',profile_pic)
      let get_user_profile_details=await queries.get_user_details(user_id)
      let title=get_user_profile_details[0].name;
      //console.log(get_user_profile_details)
      let profile_pic=BASE_URL+'uploads/default/profile.png';
      if(check_profile_pic_privacy==1){
        profile_pic=BASE_URL+get_user_profile_details[0].profile_pic;
      }
      //console.log('device token', device_token)
      if(message_type=='text'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,message,'individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='image'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'Photo','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='pdf'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'File','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='doc'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'File','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='voice'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'Audio','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='video'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'File','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='location'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,'Location','individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }else if(message_type=='contact'){
        let send_notification=await sub_function.send_firebase_notification(user_id,device_token,title,message,'individual',profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
      }
    }
  }
}

async function group_chat_push_notification(user_id='',room='',group_current_members=[],message='',message_type=''){
   console.log('push notification ',user_id,room,group_current_members,message,message_type)
  // console.log(group_current_members.length)
  //get group data
  let get_group_data=await queries.get_group_basic_details(room);
  console.log(get_group_data[0].group_name)
  
  let get_username=await queries.get_username(user_id)
  let group_profile_pic=get_group_data[0].group_profile;
  if(group_profile_pic!=''){
    group_profile_pic=BASE_URL+get_group_data[0].group_profile;
  }else{
    group_profile_pic='uploads/default/group_profile.png'
  }
  if(group_current_members.length>0){
    let current_datetime=get_datetime();
    for(var i=0; i<group_current_members.length; i++){
      console.log('user ',group_current_members[i].user_id)
      if(user_id!=group_current_members[i].user_id){
        //console.log(user_id,group_current_members[i].user_id);
        //get receiver firebase_accessToken from user table
        //console.log(group_current_members[i].user_id)
        let receiver_mute_status=await queries.receiver_mute_status(group_current_members[i].user_id);
        if(receiver_mute_status.length>0){
          //check mute_chat_notification table
          let check_mute_chat_notification=await queries.check_individual_mute_notification(group_current_members[i].user_id,room);
          if(check_mute_chat_notification.length>0){
            let mute_type=check_mute_chat_notification[0].type;
            if(mute_type=='always'){
              console.log('is muted')
            }else{
              console.log(' is not muted')
              let end_datetime=check_mute_chat_notification[0].end_datetime;
              console.log('end datetime', end_datetime)
              if(current_datetime>end_datetime){
                let device_token=receiver_mute_status[0].deviceToken;
                console.log(receiver_mute_status[0].sound,receiver_mute_status[0].vibration)
                //exit ()
                //let title=await queries.get_username(user_id);
                let title=get_group_data[0].group_name;
                if(device_token!=''){
                  if(message_type=='text'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+message,'group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='image'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'Photo','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='pdf'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'File','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='doc'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'File','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='voice'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'Audio','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='video'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'File','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='changed_group_icon'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+message,'group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='location'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'Location','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }else if(message_type=='contact'){
                    let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+message,'group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
                  }
                }else{
                  console.log('device token is empty')
                }
              }
            }
          }else{
            //not muted
            console.log('not muted')
            console.log(receiver_mute_status[0].sound,receiver_mute_status[0].vibration)
                
            let device_token=receiver_mute_status[0].deviceToken;
            let title=get_group_data[0].group_name;
            if(device_token!=''){
              if(message_type=='text'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+message,'group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='image'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'Photo','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='pdf'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'File','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='doc'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'File','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='voice'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'Audio','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='video'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'File','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='changed_group_icon'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+message,'group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='location'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+'Location','group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }else if(message_type=='contact'){
                let send_notification=await sub_function.send_firebase_notification_group(room,device_token,title,get_username+' : '+message,'group',group_profile_pic,message_type,receiver_mute_status[0].sound,receiver_mute_status[0].vibration,room);
              }
            }else{
              console.log('device token is empty')
            }
          }
        }
      }
    }
  }
}

async function create_group_id(){
  var current_date = new Date();
    var date = current_date.toISOString().slice(0, 10);
    //console.log(date);
    var split_date=date.split('-');
    var year=split_date[0];
    var month=split_date[1];
    var day=split_date[2];
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
    var time = hr + min + sec;
    //console.log('date', year,month,day)
    var group_id='group_' + year + month + day+ time;
    //check db group_id already exist or not
    let check_group_data=await queries.check_group_data(group_id);
    if(check_group_data.length>0){
      console.log('group id already exist');
      let random_sequence=Math.floor(1000 + Math.random() * 9000)
      return group_id+random_sequence;
    }else{
      //console.log('group not exist already')
      return group_id;
    }
}

function check_group_user_is_admin(user_id, group_members){
  return group_members.some(function(member){
    return member.user_id == user_id && member.type == 'admin';
  });
}
function check_user_already_member_in_group(user_id, group_members){
  return group_members.some(function(member){
    return member.user_id == user_id;
  });
}

function check_user_data_exist_in_array(user_id, user_array){
  return user_array.some(function(user){
    return user.user_id == user_id
  })
}

function isUrl(url) {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(url);
}

// function added_user_push_notification(user_id,new_user_id){
//   //get_user_access_token

// }

async function get_group_info(user_id,accessToken,group_id){
  let check_user_data=await queries.check_user_valid(user_id,accessToken);
  if(check_user_data.length>0){
    //check group data
    let check_group_data=await queries.check_group_data(group_id);
    //console.log(check_group_data);
    if(check_group_data.length>0){
      let current_group_users=check_group_data[0].current_members;
      if(current_group_users!=''){
        current_group_users=JSON.parse(check_group_data[0].current_members);
      }else{
        current_group_users=[];
      }
      //console.log('yes',current_group_users);
      let user_left_status="0";
      //check user exist in group -- user left status
      let check_user_left_status=await sub_function.check_user_data_exist_in_array(user_id,current_group_users);
      //console.log(check_user_left_status)
      if(check_user_left_status){
        user_left_status="1";
      }
      let group_users=[];
      for(var i=0; i<current_group_users.length; i++){
        let profile_pic='';
        let about='';
        let group_user_id=current_group_users[i].user_id;
        let get_user_chat_list_data=await queries.user_chat_list_details(group_user_id);
        //console.log('user chat list ',group_user_id,get_user_chat_list_data);
        
        let get_user_profile_data=await queries.get_user_profile(group_user_id)
        //console.log(get_user_profile_data[0].profile_pic)
        let name=get_user_profile_data[0].name;
        let device_token=get_user_profile_data[0].deviceToken;
        let online_status=get_user_profile_data[0].online_status;
        //check who can see my profile pic
        let check_privacy_profile_pic=await queries.check_user_privacy(group_user_id,'profile_pic');
        //console.log('profile privacy ',group_user_id,check_privacy_profile_pic);
        if(check_privacy_profile_pic.length>0){
          //console.log('user already set his privacy')
          let profile_options=check_privacy_profile_pic[0].options;
          if(profile_options==0){
            profile_pic=get_user_profile_data[0].profile_pic;
          }else if(profile_options==1){
            //show only to chat_list users
            //check this user is one of the member in chat_list
            //check user_id is exist in array
            //console.log('sssssss',get_user_chat_list_data)

            // let check_user_exist_in_chat_list=check_user_data_exist_in_array(user_id,get_user_chat_list_data)
            // if(check_user_exist_in_chat_list){
            //   profile_pic=get_user_profile_data[0].profile_pic;
            //   //console.log('s')
            // }else{
            //   profile_pic='uploads/default/profile.png';
            // }
            //console.log(check_user_exist_in_chat_list)

            let excepted_users=check_privacy_profile_pic[0].except_users;
            if(excepted_users!=''){
              excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
            }else{
              excepted_users=[];
            }
            // console.log(excepted_users);
            // console.log(excepted_users.indexOf(user_id))
            if(excepted_users.includes(user_id)){
              profile_pic=get_user_profile_data[0].profile_pic;
            }else{
              profile_pic='uploads/default/profile.png';
            }
          }else if(profile_options==2){
            //console.log('exclude chat list users',check_privacy_profile_pic)
            let excepted_users=check_privacy_profile_pic[0].except_users;
            if(excepted_users!=''){
              excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
            }else{
              excepted_users=[];
            }
            // console.log(excepted_users);
            // console.log(excepted_users.indexOf(user_id))
            if(excepted_users.includes(user_id)){
              profile_pic='uploads/default/profile.png';
            }else{
              profile_pic=get_user_profile_data[0].profile_pic;
            }
            //console.log(profile_pic)
            //exit 
          }else if(profile_options==3){
            profile_pic='uploads/default/profile.png';
          }
        }else{
          //console.log('user not set privacy') 
          profile_pic=get_user_profile_data[0].profile_pic;
        }


        
        //console.log(profile_pic,'-',get_user_profile_data[0].profile_pic);
        let type=current_group_users[i].type;

        //check who can see my about
        let check_privacy_about=await queries.check_user_privacy(group_user_id,'about');
        if(check_privacy_about.length>0){
          let about_options=check_privacy_about[0].options;
          if(about_options==0){
            //about=get_user_profile_data[0].about;
            if(get_user_profile_data[0].about!=''){
              about=get_user_profile_data[0].about;
            }else{
              about='Hey there! I am using Smart Station';
            }
          }else if(about_options==1){
            //check user is member of chat_list
            // let check_user_exist_in_chat_list=check_user_data_exist_in_array(user_id,get_user_chat_list_data)
            // //console.log(user_id,get_user_chat_list_data,check_user_exist_in_chat_list);
            // if(check_user_exist_in_chat_list){
            //   if(get_user_profile_data[0].about!=''){
            //     about=get_user_profile_data[0].about;
            //   }else{
            //     about='Hey there! I am using Smart Station';
            //   }
            // }else{
            //   about='Hey there! I am using Smart Station';
            // }

            let excepted_users=check_privacy_about[0].except_users;
            if(excepted_users!=''){
              excepted_users=JSON.parse(check_privacy_about[0].except_users);
            }else{
              excepted_users=[];
            }
            if(excepted_users.includes(user_id)){
              if(get_user_profile_data[0].about!=''){
                about=get_user_profile_data[0].about;
              }else{
                about='Hey there! I am using Smart Station';
              }
            }else{
              about='';
            }
          }else if(about_options==2){
            let excepted_users=check_privacy_about[0].except_users;
            if(excepted_users!=''){
              excepted_users=JSON.parse(check_privacy_about[0].except_users);
            }else{
              excepted_users=[];
            }
            if(excepted_users.includes(user_id)){
              about='';
              
            }else{
              if(get_user_profile_data[0].about!=''){
                about=get_user_profile_data[0].about;
              }else{
                about='Hey there! I am using Smart Station';
              }
            }
          }else if(about_options==3){
            about='';
          }
        }else{
          //console.log('user not set about option')
          if(get_user_profile_data[0].about!=''){
            about=get_user_profile_data[0].about;
          }else{
            about='Hey there! I am using Smart Station';
          }
        }
        
        let phone=get_user_profile_data[0].phone;
        group_users.push({
          user_id: group_user_id,
          username: name,
          type: type,
          profile_pic: BASE_URL+profile_pic,
          about: about,
          phone: phone,
          device_token: device_token,
          online_status: online_status.toString()
        })
      }
      //console.log(group_users)
      //get media, doc, files, audio, link count
      let media_count=0;
      let set_user_id='"'+user_id+'"';
      let get_group_chat_list_for_media_count=await queries.get_group_chat_list_for_media_count(group_id,set_user_id);
      if(get_group_chat_list_for_media_count.length>0){
        for(var i=0; i<get_group_chat_list_for_media_count.length; i++){
          let group_status=get_group_chat_list_for_media_count[i].group_status;
          let message_delete_status=false;
          if(group_status!=''){
            group_status=JSON.parse(get_group_chat_list_for_media_count[i].group_status);
          }else{
            group_status=[];
          }
          if(group_status.length>0){
            for(var j=0; j<group_status.length; j++){
              if(user_id==group_status[j].user_id && group_status[j].status==1){
                message_delete_status=true;
              }
            }
          }
          if(message_delete_status){
            if(get_group_chat_list_for_media_count[i].message_type=='voice' || get_group_chat_list_for_media_count[i].message_type=='video' || get_group_chat_list_for_media_count[i].message_type=='doc' || get_group_chat_list_for_media_count[i].message_type=='image'){
              media_count=media_count+1;
            }
            
            if(get_group_chat_list_for_media_count[i].message_type=='text'){
              //find url in the text message
              //console.log('text message')
              let check_url=isUrl(get_group_chat_list_for_media_count[i].message);
              console.log(get_group_chat_list_for_media_count[i].message,' - ',check_url);
              if(check_url){
                media_count=media_count+1;
              }
            }
          }
        }
      }else{
        media_count=0;
      }
      //console.log('media count ',media_count)
      //check private chat is muted or not
      let mute_status=0;
      let mute_end_datetime='';
      let check_group_muted=await queries.check_group_mute_notification(user_id,group_id);
      if(check_group_muted.length>0){
        //console.log('muted')
        let end_datetime=check_group_muted[0].end_datetime;
        if(end_datetime=='0000-00-00 00:00:00'){
          mute_end_datetime='always';
        }else{
          mute_end_datetime=end_datetime;
        }
        mute_status=1;
        mute_end_datetime=mute_end_datetime;
      }else{
        //console.log('not muted')
        mute_status=0;
        mute_end_datetime='';
      }
      let group_created_by_name=await queries.get_username(check_group_data[0].created_by)
      let response={
        status: true,
        statuscode: 200,
        message: 'success',
        user_left_status: user_left_status,
        group_name: check_group_data[0].group_name,
        group_profile: BASE_URL+check_group_data[0].group_profile,
        created_by: group_created_by_name,
        number_of_members: current_group_users.length,
        created_datetime: check_group_data[0].created_datetime,
        description: check_group_data[0].group_description,
        description_updated_datetime: check_group_data[0].description_updated_datetime,
        media_count: media_count,
        mute_status: mute_status,
        mute_end_datetime: mute_end_datetime,
        data: group_users
      }
      return response;
      //io.sockets.in(data.user_id+'_user_list').emit('get_group_user_list', response);
    }else{
      //io.sockets.in(data.user_id+'_user_list').emit('get_group_user_list', {status: false, statuscode: 200, message: "No group found",data:[]});
      let response={status: false, statuscode: 200, message: "No group found",data:[]}
      return response;
    }
  }else{
    //io.sockets.in(data.user_id+'_user_list').emit('get_group_user_list', {status: false, statuscode: 200, message: "No user data found", data:[]});
    let response={status: false, statuscode: 200, message: "No user data found",data:[]}
    return response;
  }
}

async function update_mark_as_unread_status(user_id,room){
  let get_room_last_message=await queries.get_room_last_message(user_id,room);
  console.log(get_room_last_message);
  let group_status='';
  if(get_room_last_message.length){
    group_status=get_room_last_message[0].group_status;
  }
  
  if(group_status!=''){
    let check_mark_as_unread_exist=false;
    group_status=JSON.parse(get_room_last_message[0].group_status) || [];
    //console.log(group_status)
    //exit ()
    for(var i=0; i<group_status.length; i++){
      if(user_id==group_status[i].user_id && 'mark_as_unread' in group_status[i]){
        if(group_status[i].mark_as_unread==1){
          group_status[i].mark_as_unread=0;
          check_mark_as_unread_exist=true;
        }
      }
    }
    //console.log(check_mark_as_unread_exist);
    
    if(check_mark_as_unread_exist){
      //update to db
      let update_mark_as_unread_status=await queries.remove_mark_as_unread(get_room_last_message[0].id,JSON.stringify(group_status));
      //console.log(update_mark_as_unread_status)
      if(update_mark_as_unread_status.affectedRows>0){
        console.log('updated successfully')
      }else{
        console.log('not updated to db')
      }
    }
  }
  
}

function check_user_room_exist_in_array(room, user_array){
  return user_array.some(function(user){
    return user.room == room
  })
}


function convert_datetime_format(datetime){
  console.log('function ',datetime)
  var date = datetime.toISOString().slice(0, 10);
  console.log(date)
  var hours = datetime.getHours();
  var minute = datetime.getMinutes();
  var second = datetime.getSeconds();
  var hr_str = "" + hours;
  var min_str = "" + minute;
  var sec_str = "" + second;
  var pad = "00"
  var hr = pad.substring(0, pad.length - hr_str.length) + hr_str;
  var min = pad.substring(0, pad.length - min_str.length) + min_str;
  var sec = pad.substring(0, pad.length - sec_str.length) + sec_str;
  var time = hr + ":" + min + ":" + sec;
  var set_datetime_format = date + " " + time;
  return set_datetime_format;
}

async function group_message_info(user_id, room, message_id){
  let response={};
  if(user_id!='' && room!='' && message_id!=''){
    let set_user_id='"'+user_id+'"';
    let check_message_id_is_valid_in_room= await queries.check_message_id_is_valid_in_room(user_id,set_user_id,message_id,room);
    console.log(check_message_id_is_valid_in_room);
    if(check_message_id_is_valid_in_room.length>0){
      let group_status=check_message_id_is_valid_in_room[0].group_status;
      if(group_status!=''){
        group_status=JSON.parse(check_message_id_is_valid_in_room[0].group_status);
      }else{
        group_status=[];
      }
      console.log(group_status);
      let users='';
      let read_by=[];
      let delivered_to=[];
      let remaining_delivered_user=0;
      let remaining_read_user=0;
      let total_user=group_status.length-1;
      for(var user=0; user<group_status.length; user++){
        users=users+"'"+group_status[user].user_id+"',";
      }
      users=users.replace(/(^,)|(,$)/g, "");
      //console.log(users)
      let get_users_profile_data=await queries.get_users_profile_data(users);
      console.log(get_users_profile_data,group_status);
      for(var i=0; i<group_status.length; i++){
        if(group_status[i].user_id!=user_id){
          let user_profile_data=get_users_profile_data.find(u=>u.id==group_status[i].user_id);
          let name='';
          let profile_pic=BASE_URL+'uploads/default/profile.png';
          if(user_profile_data!=undefined){
            name=user_profile_data.name;
            profile_pic=user_profile_data.profile_pic;
            if(profile_pic!=''){
              profile_pic=BASE_URL+user_profile_data.profile_pic;
            }
          }

          //check user privacy
          let check_privacy_profile_pic=await queries.check_user_privacy(group_status[i].user_id,'profile_pic');
          console.log(check_privacy_profile_pic,group_status[i].user_id);
          if(check_privacy_profile_pic.length>0){
            let profile_options=check_privacy_profile_pic[0].options;
            if(profile_options==0){
              //show profile data
              profile_pic=profile_pic;
            }else if(profile_options==1){
              let excepted_users=check_privacy_profile_pic[0].options;
              if(excepted_users!=''){
                excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
              }else{
                excepted_users=[];
              }
              if(excepted_users.includes(user_id)){
                profile_pic=profile_pic;
              }else{
                profile_pic=BASE_URL+'uploads/default/profile.png';
              }
            }else if(profile_options==2){
              let excepted_users=check_privacy_profile_pic[0].options;
              if(excepted_users!=''){
                excepted_users=JSON.parse(check_privacy_profile_pic[0].except_users);
              }else{
                excepted_users=[];
              }
              if(excepted_users.includes(user_id)){
                profile_pic=BASE_URL+'uploads/default/profile.png';
              }else{
                profile_pic=profile_pic;
              }
            }else if(profile_options==3){
              profile_pic=BASE_URL+'uploads/default/profile.png';
            }
          }
          
          //console.log('profile_pic',profile_pic,'name',name);
          if('delivered_status' in group_status[i]){
            if(group_status[i].delivered_status==1 && group_status[i].message_status==1){
              remaining_delivered_user=remaining_delivered_user+1;
            }else{
              if(group_status[i].message_status==1){
                remaining_read_user=remaining_read_user+1;
              }
            }
            console.log(remaining_delivered_user,remaining_read_user)
            if(group_status[i].delivered_status==0 && group_status[i].message_status==1){
              delivered_to.push({
                user_id: group_status[i].user_id,
                profile_pic: profile_pic,
                name: name,
                datetime: group_status[i].delivered_datetime
              });
            }else{
              
              if(group_status[i].message_status==1){
                remaining_read_user=remaining_read_user+1;
              }
              if(group_status[i].message_status==0){
                read_by.push({
                  user_id: group_status[i].user_id,
                  profile_pic: profile_pic,
                  name: name,
                  datetime: group_status[i].message_read_datetime
                });
              }
            }
          }else{
            //console.log('no')
            if(group_status[i].message_status==0){
              //remaining_delivered_user=remaining_delivered_user+1;
              remaining_read_user=remaining_read_user+1;
              read_by.push({
                user_id: group_status[i].user_id,
                profile_pic: profile_pic,
                name: name,
                datetime: group_status[i].message_read_datetime
              });
            }
          }
        }
      }
      response={
        status: true,
        statuscode: 200,
        message: "success",
        data: {
          remaining_read_user: remaining_read_user.toString(),
          read_by: read_by,
          remaining_delivered_user: remaining_delivered_user.toString(),
          delivered_to: delivered_to
        }
      }
      // console.log(response);
    }else{
      response={status: false, statuscode: 200, message: "You doesn't send this message", data:{}}
    }
  }else{
    response={status: true, statuscode: 200, message: "No data found", data: {}}
  }
  return response;
}

async function get_user_id_using_mobile_number(mobile_number=''){
  let user_id='';
  if(mobile_number!=''){
    let remove_symbol=mobile_number.replace(/[^a-zA-Z0-9 ]/g, "");
    let remove_space=remove_symbol.replace(/\s+/g, '');
    let number_length=remove_space.length;
    //console.log('removed symbol ',remove_symbol,remove_space,remove_space.length);
    if(number_length>5){
      let check_user_id_based_mobile_number=await queries.check_user_id_based_mobile_number(mobile_number);
      console.log(check_user_id_based_mobile_number)
      if(check_user_id_based_mobile_number.length>0){
        user_id=check_user_id_based_mobile_number[0].id;
      }else{
        user_id='';
      }
    }
  }
  return user_id;
}

function check_user_and_room_exist_in_array(user_id, room, user_array){
  return user_array.some(function(user){
    return user.room == room && user.senter_id == user_id
  })
}

function check_user_and_room_exist_in_array_group(user_id, room, user_array, messsage_id){
  return user_array.some(function(user){
    return user.room == room && user.senter_id == user_id && user.messsage_id == messsage_id;
  })
}


module.exports={
    get_individual_chat_list_response,
    get_group_chat_list_response,
    get_recent_chat_list_response,
    individual_chat_push_notification,
    group_chat_push_notification,
    check_user_already_member_in_group,
    check_group_user_is_admin,
    create_group_id,
    isUrl,
    get_group_info,
    check_user_data_exist_in_array,
    update_mark_as_unread_status,
    check_user_room_exist_in_array,
    convert_datetime_format,
    group_message_info,
    search_chat_list_response,
    get_user_id_using_mobile_number,
    individual_message_using_pagination,
    group_message_using_pagination,
    send_individual_message,
    send_group_message,
    check_user_and_room_exist_in_array,
    check_user_and_room_exist_in_array_group
}
