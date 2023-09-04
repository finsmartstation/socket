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

module.exports={
    check_id_exist_in_message_array
}