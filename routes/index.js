var express = require('express');
var router = express.Router();



//***********************************
//*			Install Modules			*
//*---------------------------------*
//*		Install with command		*
//*									*
//* npm install request				*
//* npm install facebook-chat-api	*
//*									*
//***********************************
// Facebook Chat API By Schmavery
// Git_URL: https://github.com/Schmavery/facebook-chat-api
// Code: Trunghieuth10 - trunghieuth10@gmail.com

// Khai báo
    var request = require("request");
    var login = require("facebook-chat-api");
    var SimsimiAnswered;
    var text;
    var botkey = "http://www.simsimi.com/getRealtimeReq?uuid=UwmPMKoqosEETKleXWGOJ6lynN1TQq18wwvrmCy6IRt&lc=vn&ft=0&reqText=";
// var botkey = "http://www.simsimi.com/getRealtimeReq?uuid=m0njJQ6vh8ElgCfIsaZ6Zp8yYoZ0O1szQWaIvPOlpXg&lc=vi&ft=0&reqText="; // Key thay thế
// mục botkey, có đoạn ft=0 (tức là không lọc chát - sẽ chát cả từ thô tục), ft=1 là để lọc chát nhé

//đăng nhập facebook
    login(
        {	// tắt bảo mật 2 lớp (đăng nhập xác nhận sms) của facebook đi, bot chạy rồi bật lại
            email: "", // Điền email facebook
            password: "" // Điền mật khẩu fb
        },

        function callback (err, api)
        {
            if(err) return console.error(err);

            api.setOptions({forceLogin: true, selfListen: false, logLevel: "silent"}); //tùy chọn đăng nhập

            api.listen(function callback(err, message)
            {
                if(message.body === "/logout") { //khi nhận được tin nhắn có nội dung "/logout" thì bot sẽ logout khỏi facebook, bot sẽ dừng
                    api.sendMessage(";) Sim Trả Lời:\nSim đi ngủ nhé, tạm biệt ạ.", message.threadID); // auto gửi tin nhắn đi
                    api.markAsRead(message.threadID); //đánh dấu tin nhắn là đã đọc
                    return api.logout(err);
                }
                if (message.body==="Getid"||message.body==="getid"||message.body==="get id"||message.body==="Get id") {
                    console.log("FormID: " + message.threadID + '->Message: '+message.body);
                    api.sendMessage("Your ID: ", message.threadID); // auto gửi tin nhắn đi
                    api.sendMessage(message.senderID, message.threadID); // auto gửi user_id
                    api.markAsRead(message.threadID); //đánh dấu tin nhắn là đã đọc
                    console.log("Sender ID: " + message.senderID);
                } else if (message.senderID==="id_loại_trừ_1"||message.senderID==="id_loại_trừ_2") {
                    // id_loại_trừ: thêm id người dùng mà bot không tự trả lời
                    // hiện tại mình để cho 2 id, có thể viết thêm theo cấu trúc như trên
                    console.log("FormID: " + message.threadID + '->Message: '+message.body);
                    return;
                } else if (message.senderID==="287145918134037"||message.isGroup) {
                    console.log("FormID: " + message.threadID + '->Message: '+message.body);
                    return;
                } else if (message.body)
                {
                    console.log("FormID: " + message.threadID + '->Message: '+message.body);
                    request(botkey + encodeURI(message.body),  // gửi tin nhắn của người dùng lên máy chủ Simsimi
                        function(error, response, body)
                        {    // trả về tin nhắn khi lấy từ máy chủ Simsimi
                            if (error) api.sendMessage("Tao đang đơ, không trả lời được :)", message.threadID); //trả về tin nhắn khi thất bại
                            if (body.indexOf("502 Bad Gateway") > 0 || body.indexOf("respSentence") < 0)
                                api.sendMessage("Tao đéo hiểu mày viết gì...\n" + message.body, message.threadID //trả về tin nhắn khi thất bại
                                );
                            text = JSON.parse(body);
                            if (text.status == "200")
                            {
                                SimsimiAnswered = text.respSentence; // trả về tin nhắn được lấy thành công
                                if (message.body===text.respSentence) {
                                    return;
                                } else
                                    SimsimiAnswered = text.respSentence; // trả về tin nhắn được lấy thành công
                                api.sendMessage(SimsimiAnswered, message.threadID);
                                api.markAsRead(message.threadID);
                                console.log("Answered:"+SimsimiAnswered);
                            }
                        });
                }
            });
        });


module.exports = router;
