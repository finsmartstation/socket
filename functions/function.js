const { get } = require('superagent');
const queries=require('../queries/queries');
const sub_function=require('./sub_function');
//require('dotenv').config();
const BASE_URL=process.env.BASE_URL;
async function get_individual_chat_list_response(sid,rid,room){
    var result= await queries.send_indv_message(rid,room);
            //console.log('testing response', result[0])
            let message_length=result[0].length
            let message_list_response=[];
            let date_array=[];
            for (var i = 0; i < message_length; i++) {
              console.log('replay id data ',result[0][i].replay_id)
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

              //result[i].data='12'
              //get reply message data
              if(result[0][i]['replay_id']!=0 && result[0][i]['replay_id']!=''){
                //console.log('msg has reply msg')
                //write reply msg query to get reply msg details
                let reply_message_details=await queries.reply_message_details(result[0][i]['replay_id']);
                console.log(reply_message_details[0]);
                //console.log('reply msg', reply_message_details[0][0].message)
                result[0][i]['reply_message']=reply_message_details[0][0].message;
                result[0][i]['reply_message_type']=reply_message_details[0][0].message_type,
                //result[0][i]['reply_senter']=reply_message_details[0].senter_id;
                result[0][i]['reply_duration']=reply_message_details[0][0].duration;
                console.log('id s',reply_message_details[0][0].id)
                result[0][i]['replay_id']=reply_message_details[0][0].id.toString();
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

              console.log('reply id  ', result[0][i]['replay_id'], result[0][i].replay_id, result[0][i]['reply_message'], result[0][i]['reply_message_type'],result[0][i]['reply_duration'])

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
              console.log('group data',result[0][i]['group_status'])
              //let group_status_json=JSON.parse(result[0][i]['group_status']) || [];
              if(result[0][i]['group_status']!=''){
                group_status_json=JSON.parse(result[0][i]['group_status']);
              }else{
                group_status_json=[];
              }
              
              if(group_status_json.length>0){

              
              //console.log(group_status_json)
              for(j=0; j < group_status_json.length; j++){
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
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: block_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 1
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
                            delete_status : ""
                          })
                          //add block message data entry
                          message_list_response.push({
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: block_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 0
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
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: unblock_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 0
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
                            delete_status : ""
                          })
                          //add block message data entry
                          message_list_response.push({
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: unblock_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 0
                          })
                         // console.log('inside data array data', date_array)
                        }
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
                        id: result[0][i].id,
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: result[0][i].message,
                        message_type:result[0][i].message_type,
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:result[0][i].type,
                        status:result[0][i].status,
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        forward_id : result[0][i].forward_id,
                        forward_count : result[0][i].forward_count,
                        forward_message_status : result[0][i].forward_message_status,
                        delete_status : 0
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
                        delete_status : ""
                      })
                      //add block message data entry
                      message_list_response.push({
                        id: result[0][i].id,
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: result[0][i].message,
                        message_type:result[0][i].message_type,
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:result[0][i].type,
                        status:result[0][i].status,
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        forward_id : result[0][i].forward_id,
                        forward_count : result[0][i].forward_count,
                        forward_message_status : result[0][i].forward_message_status,
                        delete_status : 0
                      })
                      console.log('inside data array data', date_array)
                    }
                  }
                  //console.log('all the dates', date_array)
                }else if(group_status_json[j].user_id==sid && group_status_json[j].status==1){
                  console.log('1')
                  //not deleted message
                  if(result[0][i]['message_type']=='notification'){
                    console.log('yes notification ')
                    //check user
                    if(result[0][i]['senter_id']==sid){
                      if(result[0][i]['message']=='block'){
                        console.log(' msg is block')
                        let block_msg="You blocked this contact. Tap to unblock.";
                        //check date is exist in date_array
                        if(date_array.includes(split_date[0])){
                          //date already exist
                          //add block message data entry
                          message_list_response.push({
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: block_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 1
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
                            delete_status : ""
                          })
                          //add block message data entry
                          message_list_response.push({
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: block_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 1
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
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: unblock_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 1
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
                            delete_status : ""
                          })
                          //add block message data entry
                          message_list_response.push({
                            id: result[0][i].id,
                            date: result[0][i].date,
                            senter_id: result[0][i].senter_id,
                            receiver_id: result[0][i].receiver_id,
                            message: unblock_msg,
                            message_type:"notification",
                            duration: result[0][i].duration.toString(),
                            message_status:result[0][i].message_status,
                            room:result[0][i].room,
                            type:"notification",
                            status:result[0][i].status,
                            replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                            forward_id : result[0][i].forward_id,
                            forward_count : result[0][i].forward_count,
                            forward_message_status : result[0][i].forward_message_status,
                            delete_status : 1
                          })
                          //console.log('inside data array data', date_array)
                        }
                      }
                    }
                  }else{
                    //console.log('no others')
                    //push other msg to the array
                    //check date is exist in date_array
                    if(date_array.includes(split_date[0])){
                      //date already exist
                      //add block message data entry
                      message_list_response.push({
                        id: result[0][i].id,
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: result[0][i].message,
                        message_type:result[0][i].message_type,
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:result[0][i].type,
                        status:result[0][i].status,
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        forward_id : result[0][i].forward_id,
                        forward_count : result[0][i].forward_count,
                        forward_message_status : result[0][i].forward_message_status,
                        delete_status : 1
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
                        delete_status : ""
                      })
                      //add block message data entry
                      message_list_response.push({
                        id: result[0][i].id,
                        date: result[0][i].date,
                        senter_id: result[0][i].senter_id,
                        receiver_id: result[0][i].receiver_id,
                        message: result[0][i].message,
                        message_type:result[0][i].message_type,
                        duration: result[0][i].duration.toString(),
                        message_status:result[0][i].message_status,
                        room:result[0][i].room,
                        type:result[0][i].type,
                        status:result[0][i].status,
                        replay_id:(result[0][i].replay_id ? result[0][i].replay_id : ''),
                            replay_message:(result[0][i].reply_message ? result[0][i].reply_message : ''),
                            replay_message_type:(result[0][i].reply_message_type ? result[0][i].reply_message_type : ''),
                            replay_senter:(result[0][i].reply_senter ? result[0][i].reply_senter : ''),
                            replay_duration:(result[0][i].reply_duration ? result[0][i].replay_duration : ''),
                        forward_id : result[0][i].forward_id,
                        forward_count : result[0][i].forward_count,
                        forward_message_status : result[0][i].forward_message_status,
                        delete_status : 1
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
            //console.log(user_details)
            //set base url in profile pic
            if(user_details[0].profile_pic!=''){
              user_details[0].profile_pic=BASE_URL+user_details[0].profile_pic;
            }else{
              //give default profile url
              user_details[0].profile_pic='';
            }
            let setresponse = {
              "status": true, "statuscode": 200, "message": "success", "data": {
                "name": user_details[0].name,
                "profile": user_details[0].profile_pic,
                "id": rid,
                "user_block_status":block_status,
                //"list": result[0]
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
  //check user is member of the group
  let check_user_in_group=await queries.check_user_and_group_data(set_user_id,group_id);
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
      delete_status:''
    }
    group_messages.push(group_started_data);
    //split group created_date
    let split_created_date=group_created_date.split(" ");
    date_array.push(split_created_date[0]);
    //set group created by data
    //created message
    let created_message='';
    if(created_by==user_id){
      created_message=created_message+'You created group '+group_name;
    }else{
      let username=await queries.get_username(user_id);
      created_message=created_message+username+' created group '+group_name;
    }
    let group_created_by_data={
      id:'',
      date:group_created_date,
      senter_id:'',
      message:created_message,
      message_type:'notification',
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
      delete_status:''
    }
    group_messages.push(group_created_by_data);
    //get group message from db

    let get_all_group_messages=await queries.group_chat_response(user_id,set_user_id,group_id) || [];

    console.log(get_all_group_messages);
    //exit();
    if(get_all_group_messages.length>0){
      for(var i=0; i<get_all_group_messages.length;i++){
        //console.log('message data ',get_all_group_messages[i]);
        let replay_id;
        let replay_message;
        let replay_message_type;
        let replay_senter_id;
        let senter;
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
         if(replay_senter_id==user_id){
            senter='You';
         }else{
            senter=await queries.get_username(replay_senter_id);
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
                    if(get_all_group_messages[i].date==group_members[group_members_admin].datetime){
                      //show message only to admin
                      //console.log('yes condition true')
                      if(user_id==group_members[group_members_admin].user_id){
                        admin_notification_msg="You're now an admin";
                        //console.log('ssss',group_members_admin)
                        break;
                      }else{
                        admin_notification_msg_status=true;
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
                }else{
                  if(admin_notification_msg_status){
                    //remove the array index from array
                    get_all_group_messages.splice(i, 1);
                    i--;
                    //console.log('balance ',get_all_group_messages)
                    //break;
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
                console.log('removed message');
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
              }
            }else if(get_all_group_messages[i].message_type=='text'){
              //console.log('message')
              
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
            
            //console.log(group_status_json[j].status)
            console.log('msg id',get_all_group_messages[i].id);
            if(group_status_json[j].status==0 && group_status_json[j].user_id==user_id){
              console.log('deleted')
              if(group_status_json[j].deleted_by){
                if(group_status_json[j].deleted_by==user_id){
                  get_all_group_messages[i].message='You deleted this message';
                }else{
                  get_all_group_messages[i].message='This message was deleted';
                }
              }else{
                get_all_group_messages[i].message='This message was deleted';
              }
              get_all_group_messages[i].message_type='text';
              //check date already exist in array
              if(date_array.includes(split_date[0])){
                console.log('date is already exist')
                group_messages.push({
                  id:get_all_group_messages[i].id,
                  date:get_all_group_messages[i].date,
                  senter_id:get_all_group_messages[i].senter_id.toString(),
                  message:get_all_group_messages[i].message,
                  message_type:get_all_group_messages[i].message_type,
                  duration: get_all_group_messages[i].duration.toString(),
                  room:get_all_group_messages[i].room,
                  message_status:get_all_group_messages[i].message_status,
                  name:get_all_group_messages[i].name,
                  type:get_all_group_messages[i].type,
                  status:group_status_json[j].status,
                  replay_id:replay_id,
                  replay_message:replay_message,
                  replay_message_type:replay_message_type,
                  replay_senter:replay_senter,
                  forward_id:forward_id.toString(),
                  forward_count:forward_message_count,
                  forward_message_status:forward_message_status,
                  delete_status:'' 
                });
              }else{
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
                  message_status:0,
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
                  delete_status:''
                });
                //add message data
                group_messages.push({
                  id:get_all_group_messages[i].id,
                  date:get_all_group_messages[i].date,
                  senter_id:get_all_group_messages[i].senter_id.toString(),
                  message:get_all_group_messages[i].message,
                  message_type:get_all_group_messages[i].message_type,
                  duration: get_all_group_messages[i].duration.toString(),
                  room:get_all_group_messages[i].room,
                  message_status:get_all_group_messages[i].message_status,
                  name:get_all_group_messages[i].name,
                  type:get_all_group_messages[i].type,
                  status:group_status_json[j].status,
                  replay_id:replay_id,
                  replay_message:replay_message,
                  replay_message_type:replay_message_type,
                  replay_senter:replay_senter,
                  forward_id:forward_id.toString(),
                  forward_count:forward_message_count,
                  forward_message_status:forward_message_status,
                  delete_status:'0' 
                });
                console.log('date is not exist')
              }
            }else if(group_status_json[j].status==1 && group_status_json[j].user_id==user_id){
              console.log('not deleted')
              
              if(date_array.includes(split_date[0])){
                console.log('date is already exist')
                group_messages.push({
                  id:get_all_group_messages[i].id,
                  date:get_all_group_messages[i].date,
                  senter_id:get_all_group_messages[i].senter_id.toString(),
                  message:get_all_group_messages[i].message,
                  message_type:get_all_group_messages[i].message_type,
                  duration: get_all_group_messages[i].duration.toString(),
                  room:get_all_group_messages[i].room,
                  message_status:get_all_group_messages[i].message_status,
                  name:get_all_group_messages[i].name,
                  type:get_all_group_messages[i].type,
                  status:group_status_json[j].status,
                  replay_id:replay_id,
                  replay_message:replay_message,
                  replay_message_type:replay_message_type,
                  replay_senter:replay_senter,
                  forward_id:forward_id.toString(),
                  forward_count:forward_message_count,
                  forward_message_status:forward_message_status,
                  delete_status:'1' 
                });
              }else{
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
                  message_status:0,
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
                  delete_status:''
                });
                //add message data
                group_messages.push({
                  id:get_all_group_messages[i].id,
                  date:get_all_group_messages[i].date,
                  senter_id:get_all_group_messages[i].senter_id.toString(),
                  message:get_all_group_messages[i].message,
                  message_type:get_all_group_messages[i].message_type,
                  duration: get_all_group_messages[i].duration.toString(),
                  room:get_all_group_messages[i].room,
                  message_status:get_all_group_messages[i].message_status,
                  name:get_all_group_messages[i].name,
                  type:get_all_group_messages[i].type,
                  status:'1',
                  replay_id:replay_id,
                  replay_message:replay_message,
                  replay_message_type:replay_message_type,
                  replay_senter:replay_senter,
                  forward_id:forward_id.toString(),
                  forward_count:forward_message_count,
                  forward_message_status:forward_message_status,
                  delete_status:'1' 
                });
                console.log('date is not exist')
              }
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

async function get_recent_chat_list_response(user_id){
  let get_recent_chat=await queries.get_recent_chat(user_id);
  //console.log('recent chat ',get_recent_chat);
  let chat_list_data=[];
  //get current datetime
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
        console.log(user_id,get_recent_chat[i].room,'get unread msg count',get_unread_message_count)
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
            
            console.log('sss inner loop',current_datetime,get_mute_notification[0].end_datetime)
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
          console.log('current user ',opponent_data);
          if(opponent_data.length>0){
            opponent_id=get_recent_chat[i].receiver_id;
            opponent_name=opponent_data[0].name;
            opponent_profile=opponent_data[0].profile_pic;
            opponent_phone=opponent_data[0].phone;
          }else{
            opponent_id='';
            opponent_name='';
            opponent_profile='';
            opponent_phone='';
          }
        }else{
          opponent_data=await queries.get_user_profile(get_recent_chat[i].senter_id);
          console.log('other user',opponent_data);
          if(opponent_data.length>0){
            opponent_id=get_recent_chat[i].senter_id;
            opponent_name=opponent_data[0].name;
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
          opponent_profile=BASE_URL+'uploads/default/profile.svg';
        }
        console.log('test data ',mute_status,mute_message,opponent_id,opponent_name,opponent_profile,opponent_phone);
        
        for(var j=0; j<group_status.length; j++){
          console.log(group_status[j]);
          //check message is deleted or not
          if(group_status[j].user_id==user_id && group_status[j].status==0){
            console.log('message is deleted')
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
              id: get_recent_chat[i].id,
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count,
              userid: opponent_id,
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status,
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private'
            })
          }else if(group_status[j].user_id==user_id && group_status[j].status==1){
            console.log('message is not deleted')
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
                  console.log(get_last_private_message)
                  if(get_last_private_message==false){
                    get_recent_chat[i].message=get_last_private_message[0].message;
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
                  console.log(get_last_private_message)
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
              id: get_recent_chat[i].id,
              date: get_recent_chat[i].date,
              message: get_recent_chat[i].message,
              unread_message: unread_count,
              userid: opponent_id,
              name: opponent_name,
              profile: opponent_profile,
              phone: opponent_phone,
              mute_status: mute_status,
              mute_message: mute_message,
              room: get_recent_chat[i].room,
              message_type:get_recent_chat[i].message_type,
              chat_type: 'private'
            })
          }else if(group_status[j].user_id==user_id && group_status[j].status==2){
            console.log('message is cleared')
            //get last private message
            //let get_last_private_message=get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,opponent_id,opponent_profile,opponent_phone);
            let get_last_private_message=await sub_function.get_last_private_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,opponent_profile,opponent_phone);
            console.log(get_last_private_message)
            if(get_last_private_message==false){
              chat_list_data.push({
                id: get_recent_chat[i].id,
                date: get_recent_chat[i].date,
                message: '',
                unread_message: unread_count,
                userid: opponent_id,
                name: opponent_name,
                profile: opponent_profile,
                phone: opponent_phone,
                mute_status: mute_status,
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'private'
              })
            }else{
              chat_list_data.push({
                id: get_last_private_message[0].id,
                date: get_last_private_message[0].date,
                message: get_last_private_message[0].message,
                unread_message: get_last_private_message[0].unread_message,
                userid: get_last_private_message[0].user_id,
                name: get_last_private_message[0].name,
                profile: get_last_private_message[0].profile,
                phone: get_last_private_message[0].phone,
                mute_status: mute_status,
                mute_message: mute_message,
                room: get_last_private_message[0].room,
                message_type:get_last_private_message[0].message_type,
                chat_type: 'private'
              })
            }
          }
        }
      }else{
        //group chat message
        let unread_count=0;
        let get_unread_message_count_for_group=await queries.get_unread_message_count_for_group(user_id,get_recent_chat[i].room);
        console.log('group unread count ',get_unread_message_count_for_group);
        if(get_unread_message_count_for_group.length>0){
          
          let group_unread_message_status=JSON.parse(get_unread_message_count_for_group[0].group_status);
          if(get_unread_message_count_for_group[0].message_status==1){
            for(var k=0; k<group_unread_message_status; k++){
              console.log(group_unread_message_status[k]);
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
        
        console.log('unread group count',unread_count)
        //check group is muted by this user
        let check_group_mute_notification=await queries.check_group_mute_notification(user_id,get_recent_chat[i].room);
        console.log('group mute data ',check_group_mute_notification)
        if(check_group_mute_notification.length>0){
          if(check_group_mute_notification[0].type!='always' && check_group_mute_notification[0].end_datetime!='0000-00-00 00:00:00'){
            //let get_mute_notification=await queries.get_mute_notification(user_id,get_recent_chat[i].receiver_id);
            console.log('sss inner loop',current_datetime,check_group_mute_notification[0].end_datetime)
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
        console.log('group basic details ', group_details, get_recent_chat[i].room)
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
            console.log('current member ', group_details[0].current_members)
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
        }else{
          group_name='';
          group_profile=BASE_URL+'uploads/default/group_profile.png';
          group_members=[];
          group_current_members=[];
          group_left_members=[];
          group_removed_members=[];
        }
        
        //check message is deleted or not
        if(group_status.length>0){
          for(var j=0; j<group_status.length; j++){
            console.log('group_status json data',group_status[j].user_id)
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
                id: get_recent_chat[i].id,
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count,
                userid: get_recent_chat[i].room,
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status,
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group'
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
                      console.log(get_recent_chat[i].date)
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
                id: get_recent_chat[i].id,
                date: get_recent_chat[i].date,
                message: get_recent_chat[i].message,
                unread_message: unread_count,
                userid: get_recent_chat[i].room,
                name: group_name,
                profile: group_profile,
                phone: '',
                mute_status: mute_status,
                mute_message: mute_message,
                room: get_recent_chat[i].room,
                message_type:get_recent_chat[i].message_type,
                chat_type: 'group'
              });
            }else if(group_status[j].user_id==user_id && group_status[j].status==2){
              //needed to find last message of the group
              let get_last_group_message=await sub_function.get_last_group_message(get_recent_chat[i].room,get_recent_chat[i].id,user_id,group_members,group_current_members,group_left_members,group_removed_members);
              console.log(get_last_group_message);
              if(get_last_group_message==false){
                chat_list_data.push({
                  id: get_recent_chat[0].id,
                  date: get_recent_chat[0].date,
                  message: get_recent_chat[0].message,
                  unread_message: unread_count,
                  userid: get_recent_chat[0].room,
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status,
                  mute_message: mute_message,
                  room: get_recent_chat[0].room,
                  message_type:get_recent_chat[0].message_type,
                  chat_type: 'group'
                });
              }else{
                chat_list_data.push({
                  id: get_last_group_message[0].id,
                  date: get_last_group_message[0].date,
                  message: get_last_group_message[0].message,
                  unread_message: unread_count,
                  userid: get_last_group_message[0].room,
                  name: group_name,
                  profile: group_profile,
                  phone: '',
                  mute_status: mute_status,
                  mute_message: mute_message,
                  room: get_last_group_message[0].room,
                  message_type:get_last_group_message[0].message_type,
                  chat_type: 'group'
                });
              }
              
            }
          }
        }
      }
    }
    console.log(chat_list_data)
    let setresponse={
      status: true,
      statuscode: 200,
      message: "success", 
      data:chat_list_data
    }
    return setresponse;
  }else{
    let setresponse={
      status: true,
      statuscode: 200,
      message: "No chat found", 
      data:[]
    }
    return setresponse;
  }
  
  
} 



async function individual_chat_push_notification(user_id,receiver_id,room,message,message_type){
  //console.log(user_id,room,message,message_type)
  let current_datetime=get_datetime();
  let receiver_mute_status=await queries.receiver_mute_status(receiver_id);
  //console.log(receiver_mute_status);
  if(receiver_mute_status.length>0){
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
          let title=await queries.get_username(user_id);
          console.log('device token', device_token)
          if(message_type=='text'){
            let send_notification=await sub_function.send_firebase_notification(device_token,title,message);
          }else if(message_type=='image'){
            let send_notification=await sub_function.send_firebase_notification(device_token,title,'Photo');
          }else if(message_type=='pdf'){
            let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
          }else if(message_type=='doc'){
            let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
          }else if(message_type=='voice'){
            let send_notification=await sub_function.send_firebase_notification(device_token,title,'Audio');
          }else if(message_type=='video'){
            let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
          }

        }else{
          //notification is muted
        }
      }
    }else{
      //not muted
      let device_token=receiver_mute_status[0].deviceToken;
      let title=await queries.get_username(user_id);
      //console.log('device token', device_token)
      if(message_type=='text'){
        let send_notification=await sub_function.send_firebase_notification(device_token,title,message);
      }else if(message_type=='image'){
        let send_notification=await sub_function.send_firebase_notification(device_token,title,'Photo');
      }else if(message_type=='pdf'){
        let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
      }else if(message_type=='doc'){
        let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
      }else if(message_type=='voice'){
        let send_notification=await sub_function.send_firebase_notification(device_token,title,'Audio');
      }else if(message_type=='video'){
        let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
      }
    }
  }
}

async function group_chat_push_notification(user_id='',room='',group_current_members=[],message='',message_type=''){
  // console.log('push notification ',user_id,room,group_current_members,message,message_type)
  // console.log(group_current_members.length)
  if(group_current_members.length>0){
    let current_datetime=get_datetime();
    for(var i=0; i<group_current_members.length; i++){
      console.log('user ',group_current_members[i].user_id)
      if(user_id!=group_current_members[i].user_id){
        console.log(user_id,group_current_members[i].user_id);
        //get receiver firebase_accessToken from user table
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
                let title=await queries.get_username(user_id);
                if(device_token!=''){
                  if(message_type=='text'){
                    let send_notification=await sub_function.send_firebase_notification(device_token,title,message);
                  }else if(message_type=='image'){
                    let send_notification=await sub_function.send_firebase_notification(device_token,title,'Photo');
                  }else if(message_type=='pdf'){
                    let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
                  }else if(message_type=='doc'){
                    let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
                  }else if(message_type=='voice'){
                    let send_notification=await sub_function.send_firebase_notification(device_token,title,'Audio');
                  }else if(message_type=='video'){
                    let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
                  }
                }else{
                  console.log('device token is empty')
                }
              }
            }
          }else{
            //not muted
            console.log('not muted')
            let device_token=receiver_mute_status[0].deviceToken;
            let title=await queries.get_username(user_id);
            if(device_token!=''){
              if(message_type=='text'){
                let send_notification=await sub_function.send_firebase_notification(device_token,title,message);
              }else if(message_type=='image'){
                let send_notification=await sub_function.send_firebase_notification(device_token,title,'Photo');
              }else if(message_type=='pdf'){
                let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
              }else if(message_type=='doc'){
                let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
              }else if(message_type=='voice'){
                let send_notification=await sub_function.send_firebase_notification(device_token,title,'Audio');
              }else if(message_type=='video'){
                let send_notification=await sub_function.send_firebase_notification(device_token,title,'File');
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

function create_group_id(){
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
    var group_id='group_' + year + month + day+ time
    return group_id;
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


module.exports={
    get_individual_chat_list_response,
    get_group_chat_list_response,
    get_recent_chat_list_response,
    individual_chat_push_notification,
    group_chat_push_notification,
    check_user_already_member_in_group,
    check_group_user_is_admin,
    create_group_id
}
