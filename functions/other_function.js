const queries=require('../queries/queries');
const sub_function=require('./sub_function');
const functions=require('./function');
//require('dotenv').config();
const BASE_URL=process.env.BASE_URL;

async function check_id_exist_in_message_array(id,message_array){
    return message_array.some(function(message){
        return message.id == id;
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

module.exports={
    check_id_exist_in_message_array,
    check_profile_pic_privacy
}