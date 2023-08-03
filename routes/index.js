var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Question = require("../models/question");
var Hintbox = require("../models/hintbox");
var Logs = require("../models/logs");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const user = require("../models/user");

// const CLIENT_ID =
//     "1060206165006-bg19hneqdnps6qg1erbv03atm630j96s.apps.googleusercontent.com";
// const CLEINT_SECRET = "q4kk_WxOQMLbm32W2hggd2dv";
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN =
//     "1//04pCxk--ScCJfCgYIARAAGAQSNwF-L9Ir3mjrJCdvh8N2MyNSBcIzyAQCVAyekqhc0e_qBTRw3KUMuDznerWZMfG0rdC3QcrqVzU";

// const oAuth2Client = new google.auth.OAuth2(
//     CLIENT_ID,
//     CLEINT_SECRET,
//     REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Event Switch
var eventIsOn = "isOff";

// Randomize
function makeid(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

// Caching
var cache = {};
var midWare = (req, res, next) => {
    const key = req.url;
    if (cache[key]) {
        res.send(cache[key]);
    } else {
        res.sendResponse = res.send;
        res.send = (body) => {
            cache[key] = body;
            res.sendResponse(body);
        };
        next();
    }
};

// An event trigger

const eventPassword = "cypherite_71";

router.get("/event-status", (req, res) => {
    if (req.user.username != "admin") {
        res.redirect("/login");
    } else {
        return res.render("trigger", {
            title: "Event Trigger",
            eventStatus: eventIsOn,
        });
    }
});

// router.post("/event-status", (req, res) => {
//     if (req.body.password != eventPassword) {
//         return res.render("trigger", {
//             title: "Event Trigger",
//             eventStatus: eventIsOn,
//             error: "Whoops! Incorrect Password. Enter a valid password or else Aliens will whisk you away.",
//         });
//     } else {
//         if (req.body.status == "Off") {
//             eventIsOn = "isOff";
//         } else if (req.body.status == "Start") {
//             eventIsOn = "isStart";
//         } else {
//             eventIsOn = "isOn";
//         }
//         return res.render("trigger", {
//             title: "Event Trigger",
//             eventStatus: eventIsOn,
//         });
//     }
// });

router.get("/over", (req, res) => {
    if (eventIsOn == "isOff") {
        return res.render("over", { title: "Event Over" });
    } else {
        res.redirect("/");
    }
});

// router.get('/', (req, res, next) => {
//   // if(req.user.disqualified == true){
//   //   res.redirect('/disqualified');
//   // }
//   if(eventIsOn=='isOff'){
//     return res.render('over', { title: 'Event Over'});
//   }
//   if(!req.user) {
//     res.redirect('/login');
//   } else {
//     res.redirect('/play');
//   }
// });
router.get("/", (req, res, next) => {
    return res.redirect("/home");
});
router.get("/home", (req, res, next) => {
    return res.render("home", { title: "De(c)ypher" });
});

router.get("/rules", (req, res, next) => {
    const rules = [
        "The hunt will span across 2 days, going live from 00:00:01 on 7th of August till 23:59:59 on 8th of August.",
        "The event encompasses an Online Cryptic Treasure Hunt in which participants must make their way through a series of cryptic levels in an attempt to reach the top.",
        "The participants aim is to crack the levels as quickly as they can so as to place themselves at the top of the leaderboard.",
        "At each level, the participants will encounter a number of clues which shall all, together, point to one answer. Each level has one correct answer only.",
        "Official clues may be released in the Discord server if and when deemed necessary by the admins.",
        "Answers will always be lower-case, alphanumeric and will contain no spaces. Special characters are allowed. For example, if the answer is '(C)YNC', you would type it in as 'cync'. (Don't worry, we normalize your inputs anyway)",
        "Every clue in the question is important, it's given for a reason.",
        "Be careful of the spelling you enter, it might lead to keyboards being broken.",
        "Remember to confirm your email. We will use it to get in touch with the winners after the event.",
        "Team play, answer sharing, hint sharing and collaborating with other competitors in general is strictly not allowed and any such evidence can lead to immediate disqualification.",
    ];
    return res.render("rules", { title: "Rules", rules: rules });
});
//Render login page
router.get("/login", (req, res, next) => {
    if (req.user) {
        return res.redirect("/play");
    }
    return res.render("login", { title: "Login" });
});

//LOGIN user
// router.post("/login", (req, res, next) => {
//     passport.authenticate("local", function (err, user) {
//         if (err) {
//             return res.render("login", { title: "Login", error: err.message });
//         }
//         if (!user) {
//             return res.render("login", {
//                 title: "Login",
//                 error: "Wrong username/password.",
//             });
//         }
//         req.logIn(user, function (err) {
//             return res.redirect("/play");
//         });
//     })(req, res, next);
// });

//LOGOUT user
router.get("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/");
});

//Render register page
router.get("/register", (req, res, next) => {
    if (req.user) {
        return res.redirect("/play");
    } else {
        return res.render("register", { title: "Register" });
    }
});

//REGISTER user
// router.post("/register", function (req, res) {
//     if (req.body.password != req.body.passwordConfirm) {
//         return res.render("register", {
//             title: "Register",
//             error: "The passwords dont match.",
//         });
//     } else {
//         User.findOne({ email: req.body.email }, function (err, user) {
//             if (!user) {
//                 var verifyid = makeid(64);
//                 User.register(
//                     new User({
//                         username: req.body.username,
//                         email: req.body.email,
//                         number: req.body.number,
//                         name: req.body.fullName,
//                         school: req.body.school,
//                         level: 1,
//                         verification: verifyid,
//                         password1: req.body.password,
//                         time: new Date(),
//                     }),
//                     req.body.password,
//                     function (err, user) {
//                         var output = `
//                 <!DOCTYPE html>
//                 <html lang="en">
//                 <head>
//                     <meta charset="UTF-8" />
//                     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//                     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                     <title>De(c)ypher</title>
//                 </head>
//                 <body style="color: #fff;width:fit-content;padding: 10px;background-color: transparent;">
//                     <style>
//                     @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;500;700&display=swap");

//                     * {
//                         margin: 0;
//                         padding: 0;
//                         font-family: "Comfortaa", cursive;
//                     }
//                     .right a:hover {
//                         color: #185adb !important;
//                     }
//                     .button a:hover{
//                         color: #000 !important;
//                         background-color: #DA1893 !important;
//                     }
//                     h2{
//                         font-size:20px !important;
//                     }
//                     @media (max-width:1112px){
//                         .left{
//                             width: 100% !important;
//                             padding: 0 !important;
//                             maRgin-top: 25px !important;
//                             padding-bottom: 25px !important;
//                         }
//                         .right{
//                             width: 100% !important;
//                             padding: 0 !important;
//                         }
//                         .textContainer{
//                             font-size: 2vw !important;
//                             line-height: 3vw !important;
//                         }
//                     }    
//                     @media (max-width:750px){
//                         body{
//                             width:90vw !important;
//                         }
//                         .card{
//                             width: 80% !important;
//                         }
//                         .textContainer{
//                             font-size: 2vw !important;
//                             padding:0 !important;
//                             line-height:20px !important;
//                         }
//                         h2{
//                             font-size:20px !important;
//                         }
//                     }
//                     </style>
//                     <section class="card" style="background-color: #080808;width: 50vw;border: 1px solid #fff;padding: 50px;position: relative;border-radius: 10px;">
//                     <div class="imgContainer" style="width:fit-content;margin:0 auto;padding-bottom:30px">
//                         <img src="https://static.clubcypher.club/img/decypher.png" style="height:auto;width:10vw;" alt="decypher" />
//                     </div>
//                     <div class="textContainer" style="text-align: center;font-size: 20px;padding:30px 0;">
//                         <h2 style="margin-bottom: 20px;">Thank you for registering for De(c)ypher!</h2>
//                     </div>
//                     <div class="content" style="width:fit-content;margin:0 auto;">
//                         <div class="left" style="width: fit-content;padding: 20px;margin:0 auto;">
//                             <h2 style="width:fit-content;margin-bottom: 20px;margin:0 auto;padding:30px;">Here are your credentials -</h2>
//                             <p style="text-align: center;padding:30px">
//                                 Username - ${req.body.username}
//                                 <br>
//                                 <br>
//                                 Password - ${req.body.password}
//                             </p>
//                         </div>
//                         <h2 style="text-align:center;">Verify your account by clicking on the button below:</h2>
//                         <div class="button" style="width:fit-content;margin:0 auto;padding: 30px;padding-bottom:60px;">
//                             <a style="color: #DA1893;border: 1px solid #DA1893;padding: 10px;font-size: 2.5vw;text-align: center;text-decoration: none;" href="https://www.decypher.club/verify/${verifyid}" target="_blank">Verify Here</a>
//                         </div>
//                         <div class="right" style="width: 80%;padding: 20px;text-align: center;margin:0 auto;">
//                             <h2 style="margin-bottom: 20px;text-align:center;">The details of the event are as follows:</h2>
//                             <h2 style="text-align:center;text-decoration:none">
//                                 Start Date: 2nd August 2021
//                                 <br />
//                                 <br />
//                                 Official Website:
//                                 <a style="color: #fff;transition: 0.2s ease;text-decoration: none;" href="https://www.decypher.club" target="_blank">www.decypher.club</a>
//                                 <br /><br />
//                                 Other details can be found on the
//                                 official De(c)ypher website.
//                                 <br /><br />
//                                 All further communication and announcements will be done via the official <a style="color:#DA1893" href="https://discord.gg/FWrfqAJ2ZY">De(c)ypher Discord Server</a>.
//                                 <br /><br />
//                                 For any further queries please feel free to contact us at cypherdps@gmail.com
//                             </h2>
//                         </div>
//                     </div>
//                     <div class="end" style="padding: 20px;width: fit-content;margin:0 auto">
//                         <div class="endText" style="margin-bottom: 40px;">
//                             We look forward to your active participation and co-operation to make
//                             this endeavor a grand success.
//                             <br /><br />
//                             Thank You.
//                             <br /><br />
//                             Team (c)ypher, DPS Bhopal
//                         </div>
//                         <div class="endLinks" style="width: fit-content;margin:0 auto">
//                             <a href="https://www.instagram.com/cypherdps/"
//                                 ><img src="https://static.clubcypher.club/email/instagram2x.png" style="height: auto;width: 5vw;" alt=""
//                             /></a>
//                             <a href="https://www.youtube.com/channel/UCSULXN5apeQSDa0sLYuwEnA"
//                                 ><img src="https://static.clubcypher.club/email/youtube2x.png" style="height: auto;width: 5vw;" alt=""
//                             /></a>
//                         </div>
//                         <div class="imgContainer2" style="width: fit-content; margin:0 auto">
//                             <img src="https://static.clubcypher.club/email/cypher-01.png" style="height:auto;width:20vw;margin:0 auto" alt="" />
//                         </div>
//                     </div>
//                     </section>
//                 </body>
//                 </html>
//                 `;

//                         var da_mail = `${req.body.email}`;

//                         const accessToken = oAuth2Client.getAccessToken();

//                         const transporter = nodemailer.createTransport({
//                             service: "gmail",
//                             auth: {
//                                 type: "OAuth2",
//                                 user: "decypher.clubcypher@gmail.com",
//                                 clientId: CLIENT_ID,
//                                 clientSecret: CLEINT_SECRET,
//                                 refreshToken: REFRESH_TOKEN,
//                                 accessToken: accessToken,
//                             },
//                         });

//                         var mailOptions = {
//                             from: '"Club Cypher" <decypher.clubcypher@gmail.com>',
//                             to: da_mail,
//                             subject: "Registeration Details",
//                             text: output,
//                             html: output,
//                         };
//                         if (err) {
//                             return res.render("register", {
//                                 title: "Register",
//                                 error: "The user has already been registered.",
//                             });
//                         } else
//                             transporter.sendMail(
//                                 mailOptions,
//                                 function (err, info) {
//                                     if (err)
//                                         return res.render("register", {
//                                             title: "Register",
//                                             error: "You have been registered successfully.",
//                                         });
//                                     else
//                                         return res.render("register", {
//                                             title: "Register",
//                                             error: "You have been registered successfully. Credentials have been sent to your email. If you are unable to find it, check your spam folder or contact us at cypherdps@gmail.com",
//                                         });
//                                 }
//                             );
//                     }
//                 );
//             } else {
//                 return res.render("register", {
//                     title: "Register",
//                     error: "The email is already registered.",
//                 });
//             }
//         });
//     }
// });
// User.findOne({ username: "Jain" }, function (err, user) {
//     var output = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8" />
//         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title>(C)YNC v7.0</title>
//     </head>
//     <body style="color: #fff;width:fit-content;padding: 10px;background-color: transparent;">
//         <style>
//         @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;500;700&display=swap");

//         /* {
//             margin: 0;
//             padding: 0;
//             font-family: "Comfortaa", cursive;
//         }
//         .right a:hover {
//             color: #185adb !important;
//         }
//         .button a:hover{
//             color: #000 !important;
//             background-color: #DA1893 !important;
//         }
//         @media (max-width:1112px){
//             .left{
//                 width: 100% !important;
//                 padding: 0 !important;
//                 maRgin-top: 25px !important;
//                 padding-bottom: 25px !important;
//             }
//             .right{
//                 width: 100% !important;
//                 padding: 0 !important;
//             }
//             .textContainer{
//                 font-size: 2vw !important;
//                 line-height: 3vw !important;
//             }
//         }
//         @media (max-width:750px){
//             body{
//                 width:90vw !important;
//             }
//             .card{
//                 width: 80% !important;
//             }
//             .textContainer{
//                 font-size: 2vw !important;
//                 padding:0 !important;
//                 line-height:20px !important;
//             }
//             h2{
//                 font-size:13px !important;
//             }
//         }
//         </style>
//         <section class="card" style="background-color: #080808;width: 50vw;border: 1px solid #fff;padding: 50px;position: relative;border-radius: 10px;">
//         <div class="imgContainer" style="width:fit-content;margin:0 auto;padding-bottom:30px">
//             <img src="https://static.clubcypher.club/img/decypher.png" style="height:auto;width:10vw;" alt="decypher" />
//         </div>
//         <div class="textContainer" style="text-align: center;font-size: 20px;padding:30px 0;">
//             <h2 style="margin-bottom: 20px;">De(c)ypher</h2>
//         </div>
//         <div class="content" style="width:fit-content;margin:0 auto;">
//             <div class="left" style="width: fit-content;padding: 20px;margin:0 auto;">
//                 <h2 style="width:fit-content;margin-bottom: 20px;margin:0 auto;">Hey ${user.name} !</h2>
//             </div>
//             <h2 style="text-align:center;">Congratulations!! You are one of the few people from the thousands that participated who out shined the rest and claimed a spot on the leaderboard!<br><br>
//             The entire team of (c)ypher and DPS Bhopal congratulates you on your achievement and thanks you for participating. See you again next year!</h2>
//             <div class="button" style="width:fit-content;margin:0 auto;padding: 30px;padding-bottom:60px;">
//                 <a style="color: #DA1893;border: 1px solid #DA1893;padding: 10px;font-size: 2.5vw;text-align: center;text-decoration: none;" href="https://forms.gle/gcVS2T97KEcrbubd7" target="_blank">Click Here to claim your prize!</a>
//             </div>
//         </div>
//         <div class="end" style="padding: 20px;width: fit-content;margin:0 auto">
//             <div class="endLinks" style="width: fit-content;margin:0 auto">
//                 <a href="https://www.instagram.com/cypherdps/"
//                     ><img src="https://static.clubcypher.club/email/instagram2x.png" style="height: auto;width: 5vw;" alt=""
//                 /></a>
//                 <a href="https://www.youtube.com/channel/UCSULXN5apeQSDa0sLYuwEnA"
//                     ><img src="https://static.clubcypher.club/email/youtube2x.png" style="height: auto;width: 5vw;" alt=""
//                 /></a>
//             </div>
//             <div class="imgContainer2" style="width: fit-content; margin:0 auto">
//                 <img src="https://static.clubcypher.club/email/cypher-01.png" style="height:auto;width:20vw;margin:0 auto" alt="" />
//             </div>
//         </div>
//         </section>
//     </body>
//     </html>
//     `;

//     var da_mail = `${user.email}`;

//     const accessToken = oAuth2Client.getAccessToken();

//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             type: "OAuth2",
//             user: "decypher.clubcypher@gmail.com",
//             clientId: CLIENT_ID,
//             clientSecret: CLEINT_SECRET,
//             refreshToken: REFRESH_TOKEN,
//             accessToken: accessToken,
//         },
//     });

//     var mailOptions = {
//         from: '"Club Cypher" <decypher.clubcypher@gmail.com>',
//         to: da_mail,
//         subject: "(c)ync v7.0 prizes",
//         text: output,
//         html: output,
//     };
//     if (err) {
//         return res.render("register", {
//             title: "Register",
//             error: "The user has already been registered.",
//         });
//     } else
//         transporter.sendMail(mailOptions, function (err, info) {
//             if (err)
//                 return res.render("register", {
//                     title: "Register",
//                     error: "You have been registered successfully.",
//                 });
//             else
//                 return res.render("register", {
//                     title: "Register",
//                     error: "You have been registered successfully. Credentials have been sent to your email. If you are unable to find it, check your spam folder or contact us at cypherdps@gmail.com",
//                 });
//         });
// });

//Render leaderboard page
// router.get("/leaderboard", (req, res, next) => {
//     // else if(eventIsOn=='isStart'){
//     //     res.render('start', { title: "Start" });
//     // }
//     if (req.user) {
//         var currentUserUsername = req.user.username;
//         var currentUserLevel = req.user.level;
//         var currentUserId = req.user.id;
//         var query = { username: { $ne: "admin" } };
//         var query2 = { disqualified: false };

//         // if (currentUserLevel == 14.1) {
//         //     User.find()
//         //         .sort("-level")
//         //         .find(query)
//         //         .find(query2)
//         //         .sort("lastLevelOn")
//         //         .exec(function (err, leaderboard) {
//         //             return res.render("fake-leaderboard1", {
//         //                 isLoggedIn: true,
//         //                 leaderboard: leaderboard,
//         //                 title: "Leaderboard",
//         //             });
//         //         });
//         // } else if (currentUserLevel == 14.2) {
//         //     User.find()
//         //         .sort("-level")
//         //         .find(query)
//         //         .find(query2)
//         //         .sort("lastLevelOn")
//         //         .exec(function (err, leaderboard) {
//         //             return res.render("fake-leaderboard2", {
//         //                 isLoggedIn: true,
//         //                 leaderboard: leaderboard,
//         //                 title: "Leaderboard",
//         //             });
//         //         });
//         // } else if (currentUserLevel == 14.3) {
//         //     User.find()
//         //         .sort("-level")
//         //         .find(query)
//         //         .find(query2)
//         //         .sort("lastLevelOn")
//         //         .exec(function (err, leaderboard) {
//         //             return res.render("fake-leaderboard3", {
//         //                 isLoggedIn: true,
//         //                 leaderboard: leaderboard,
//         //                 title: "Leaderboard",
//         //             });
//         //         });
//         // } else if (currentUserLevel == 14.4) {
//         //     User.find()
//         //         .sort("-level")
//         //         .find(query)
//         //         .find(query2)
//         //         .sort("lastLevelOn")
//         //         .exec(function (err, leaderboard) {
//         //             return res.render("fake-leaderboard4", {
//         //                 isLoggedIn: true,
//         //                 leaderboard: leaderboard,
//         //                 title: "Leaderboard",
//         //             });
//         //         });
//         // } else {
//         User.find()
//             .sort("disqualified")
//             .sort("-level")
//             .find(query)
//             .sort("lastLevelOn")
//             .exec(function (err, leaderboard) {
//                 return res.render("leaderboard", {
//                     isLoggedIn: true,
//                     leaderboard: leaderboard,
//                     title: "Leaderboard",
//                 });
//             });
//         // }
//     } else {
//         var query = { username: { $ne: "admin" } };
//         var query2 = { disqualified: false };
//         User.find()
//             .sort("disqualified")
//             .sort("-level")
//             .find(query)
//             .sort("lastLevelOn")
//             .exec(function (err, leaderboard) {
//                 return res.render("leaderboard", {
//                     leaderboard: leaderboard,
//                     title: "Leaderboard",
//                 });
//             });
//     }
// });

//Render play page
// router.get("/play", (req, res, next) => {
//     if (!req.user) {
//         res.redirect("/login");
//     } else {
//         if (eventIsOn == "isOff") {
//             res.render("over", { title: "Event Over" });
//         } else if (eventIsOn == "isStart") {
//             res.render("start", { title: "Start" });
//         } else if (req.user.disqualified == true) {
//             res.redirect("/disqualified");
//         } else {
//             var currentUserLevel = req.user.level;
//             if (req.user.level != 27) {
//                 Question.getQuestion(
//                     req.user.level,
//                     (question, hint1, hint2, hint3, isOver) => {
//                         var query = { level: req.user.level };
//                         Hintbox.find()
//                             .find(query)
//                             .exec(function (err, hints) {
//                                 if (currentUserLevel == 14.1) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 15",
//                                     });
//                                 } else if (currentUserLevel == 14.2) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 16",
//                                     });
//                                 } else if (currentUserLevel == 14.3) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 17",
//                                     });
//                                 } else if (currentUserLevel == 14.4) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 18",
//                                     });
//                                 } else {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level " + req.user.level,
//                                     });
//                                 }
//                             });
//                     }
//                     // }
//                 );
//             } else {
//                 return res.render("congratulations", {
//                     title: "Congratulations!",
//                 });
//             }
//         }
//     }
// });

// router.get("/play/leet", (req, res, next) => {
//     if (req.user.disqualified == true) {
//         res.redirect("/disqualified");
//     }
//     if (eventIsOn == "isOff") {
//         res.render("over", { title: "Event Over" });
//     } else if (eventIsOn == "isStart") {
//         res.render("start", { title: "Start" });
//     }
//     if (!req.user) {
//         res.redirect("/login");
//     }
//     var currentUserLevel = req.user.level;
//     if (req.user.level == 23) {
//         Question.getQuestion(
//             req.user.level,
//             (question, hint1, hint2, hint3, isOver) => {
//                 var query = { level: req.user.level };
//                 Hintbox.find()
//                     .find(query)
//                     .exec(function (err, hints) {
//                         if (currentUserLevel == 14.1) {
//                             return res.render("play-leet", {
//                                 question: question,
//                                 hint1: hint1,
//                                 hint2: hint2,
//                                 hint3: hint3,
//                                 hints: hints,
//                                 isOver: isOver,
//                                 title: "Level 15",
//                             });
//                         } else if (currentUserLevel == 14.2) {
//                             return res.render("play-leet", {
//                                 question: question,
//                                 hint1: hint1,
//                                 hint2: hint2,
//                                 hint3: hint3,
//                                 hints: hints,
//                                 isOver: isOver,
//                                 title: "Level 16",
//                             });
//                         } else if (currentUserLevel == 14.3) {
//                             return res.render("play-leet", {
//                                 question: question,
//                                 hint1: hint1,
//                                 hint2: hint2,
//                                 hint3: hint3,
//                                 hints: hints,
//                                 isOver: isOver,
//                                 title: "Level 17",
//                             });
//                         } else if (currentUserLevel == 14.4) {
//                             return res.render("play-leet", {
//                                 question: question,
//                                 hint1: hint1,
//                                 hint2: hint2,
//                                 hint3: hint3,
//                                 hints: hints,
//                                 isOver: isOver,
//                                 title: "Level 18",
//                             });
//                         } else {
//                             return res.render("play-leet", {
//                                 question: question,
//                                 hint1: hint1,
//                                 hint2: hint2,
//                                 hint3: hint3,
//                                 hints: hints,
//                                 isOver: isOver,
//                                 title: "Level " + req.user.level,
//                             });
//                         }
//                     });
//             }
//             // }
//         );
//     } else {
//         return res.redirect("/play");
//     }
// });
// router.post("/play/leet", (req, res, next) => {
//     if (eventIsOn == "isOff") {
//         return res.render("over", { title: "Event Over" });
//     }
//     if (!req.user.disqualified) {
//         var currentUserUsername = req.user.username;
//         var currentUserLevel = req.user.level;
//         var currentUserId = req.user.id;
//         var newAnswer = req.body.answer.replace(/\s+/g, "").toLowerCase();
//         var logData = {
//             username: req.user.username,
//             level: currentUserLevel,
//             answer: newAnswer,
//             time: new Date(),
//         };

//         //LOG creation
//         Logs.create(logData, (error, log) => {
//             if (error) {
//                 return next(error);
//             }
//         });
//         Question.checkAnswer(currentUserLevel, newAnswer, (err) => {
//             if (err) {
//                 Question.getQuestion(
//                     req.user.level,
//                     (question, hint1, hint2, hint3, isOver) => {
//                         var query = { level: req.user.level };
//                         Hintbox.find()
//                             .find(query)
//                             .exec(function (err, hints) {
//                                 if (currentUserLevel == 14.1) {
//                                     return res.render("play-leet", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 15",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 14.2) {
//                                     return res.render("play-leet", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 16",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 14.3) {
//                                     return res.render("play-leet", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 17",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 14.4) {
//                                     return res.render("play-leet", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 18",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 15) {
//                                     User.findById(
//                                         currentUserId,
//                                         function (err, user) {
//                                             if (
//                                                 newAnswer ==
//                                                 "togettotheotherside"
//                                             ) {
//                                                 user.level = 14.2;
//                                                 user.lastLevelOn = new Date();
//                                                 user.save();
//                                                 return res.redirect("/play");
//                                             } else {
//                                                 return res.render("play-leet", {
//                                                     question: question,
//                                                     hint1: hint1,
//                                                     hint2: hint2,
//                                                     hint3: hint3,
//                                                     hints: hints,
//                                                     isOver: isOver,
//                                                     title: "Level 15",
//                                                     error: "That aint it chief!",
//                                                 });
//                                             }
//                                         }
//                                     );
//                                 } else {
//                                     return res.render("play-leet", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level " + req.user.level,
//                                         error: "That aint it chief!",
//                                     });
//                                 }
//                             });
//                     }
//                     // }
//                 );
//             } else {
//                 User.findById(currentUserId, function (err, user) {
//                     if (!user) {
//                         return res.redirect("/play");
//                     } else {
//                         if (currentUserLevel == 14) {
//                             user.level = 14.1;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.1) {
//                             user.level = 14.2;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.2) {
//                             user.level = 14.3;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.3) {
//                             user.level = 14.4;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.4) {
//                             user.level = 15;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else {
//                             user.level = currentUserLevel + 1;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         }
//                         return res.redirect("/play");
//                     }
//                 });
//             }
//         });
//     } else {
//         return res.redirect("/disqualified");
//     }
// });

// router.get("/disqualified", (req, res) => {
//     if (!req.user.disqualified) {
//         return res.redirect("/");
//     }
//     return res.render("disqualified", { title: "Diqualified" });
// });

// router.get("/user/:id", (req, res, next) => {
//     var query = { username: req.params.id };
//     if (req.params.id == "admin") {
//         res.redirect("/leaderboard");
//     }
//     User.find()
//         .find(query)
//         .exec(function (err, userprofile) {
//             return res.render("user", {
//                 userprofile: userprofile,
//                 title: req.params.id,
//             });
//         });
// });
// router.get("/verify/:id", (req, res, next) => {
//     User.findOne({ verification: req.params.id }, function (err, user) {
//         if (!user) {
//             return res.render("error");
//         } else {
//             user.verified = true;
//             user.save();
//             return res.render("verified");
//         }
//     });
// });
// router.get("/verify/:id", (req, res, next) => {
//     User.findOne({ verification: req.params.id }, function (err, user) {
//         if (!user) {
//             return res.render("error");
//         } else {
//             user.verified = true;
//             user.save();
//             return res.render("verified");
//         }
//     });
// });
// //MAIN ANSWER CHECKING
// router.post("/play", (req, res, next) => {
//     if (eventIsOn == "isOff") {
//         return res.render("over", { title: "Event Over" });
//     }
//     if (!req.user.disqualified) {
//         var currentUserUsername = req.user.username;
//         var currentUserLevel = req.user.level;
//         var currentUserId = req.user.id;
//         var newAnswer = req.body.answer.replace(/\s+/g, "").toLowerCase();
//         var logData = {
//             username: req.user.username,
//             level: currentUserLevel,
//             answer: newAnswer,
//             time: new Date(),
//         };

//         //LOG creation
//         Logs.create(logData, (error, log) => {
//             if (error) {
//                 return next(error);
//             }
//         });
//         Question.checkAnswer(currentUserLevel, newAnswer, (err) => {
//             if (err) {
//                 Question.getQuestion(
//                     req.user.level,
//                     (question, hint1, hint2, hint3, isOver) => {
//                         var query = { level: req.user.level };
//                         Hintbox.find()
//                             .find(query)
//                             .exec(function (err, hints) {
//                                 if (currentUserLevel == 14.1) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 15",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 14.2) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 16",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 14.3) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 17",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 14.4) {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level 18",
//                                         error: "That aint it chief!",
//                                     });
//                                 } else if (currentUserLevel == 15) {
//                                     User.findById(
//                                         currentUserId,
//                                         function (err, user) {
//                                             if (
//                                                 newAnswer ==
//                                                 "togettotheotherside"
//                                             ) {
//                                                 user.level = 14.2;
//                                                 user.lastLevelOn = new Date();
//                                                 user.save();
//                                                 return res.redirect("/play");
//                                             } else {
//                                                 return res.render("play", {
//                                                     question: question,
//                                                     hint1: hint1,
//                                                     hint2: hint2,
//                                                     hint3: hint3,
//                                                     hints: hints,
//                                                     isOver: isOver,
//                                                     title: "Level 15",
//                                                     error: "That aint it chief!",
//                                                 });
//                                             }
//                                         }
//                                     );
//                                 } else {
//                                     return res.render("play", {
//                                         question: question,
//                                         hint1: hint1,
//                                         hint2: hint2,
//                                         hint3: hint3,
//                                         hints: hints,
//                                         isOver: isOver,
//                                         title: "Level " + req.user.level,
//                                         error: "That aint it chief!",
//                                     });
//                                 }
//                             });
//                     }
//                     // }
//                 );
//             } else {
//                 User.findById(currentUserId, function (err, user) {
//                     if (!user) {
//                         return res.redirect("/play");
//                     } else {
//                         if (currentUserLevel == 14) {
//                             user.level = 14.1;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.1) {
//                             user.level = 14.2;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.2) {
//                             user.level = 14.3;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.3) {
//                             user.level = 14.4;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else if (currentUserLevel == 14.4) {
//                             user.level = 15;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         } else {
//                             user.level = currentUserLevel + 1;
//                             user.lastLevelOn = new Date();
//                             user.save();
//                         }
//                         return res.redirect("/play");
//                     }
//                 });
//             }
//         });
//     } else {
//         return res.redirect("/disqualified");
//     }
// });

// // Admin Panel Route
// router.get("/admin", (req, res) => {
//     if (req.user.username != "admin") {
//         res.redirect("/login");
//     }
//     return res.render("admin", { title: "Admin Panel" });
// });

// //Render add-question page
// router.get("/admin/add-question", (req, res, next) => {
//     if (req.user.username != "admin") {
//         res.redirect("/");
//     }
//     return res.render("add-question", { title: "Add Question" });
// });

// //ADD A QUES
// router.post("/admin/add-question", (req, res, next) => {
//     Question.addQuestion(
//         req.body.level,
//         req.body.question,
//         req.body.hint1,
//         req.body.hint2,
//         req.body.hint3,
//         req.body.answer,
//         (err) => {
//             if (err) {
//                 return res.render("add-question", {
//                     error:
//                         "Question for Level " +
//                         req.body.level +
//                         " already exists.",
//                     title: "Add Question",
//                 });
//             }
//             return res.render("add-question", {
//                 error:
//                     "Question for Level " +
//                     req.body.level +
//                     " created successfully.",
//                 title: "Add Question",
//             });
//         }
//     );
// });

// //Render LOGS page
// router.get("/admin/logs", (req, res, next) => {
//     if (req.user.username != "admin") {
//         res.redirect("/");
//     }
//     Logs.find()
//         .sort("-time")
//         .limit(120)
//         .exec(function (err, logs) {
//             return res.render("logs", {
//                 logs: logs,
//                 title: "Logs",
//                 isLogs: true,
//             });
//         });
// });
// router.get("/admin/logs/:id", (req, res, next) => {
//     if (req.user.username != "admin") {
//         res.redirect("/");
//     }
//     var query = { username: req.params.id };
//     Logs.find()
//         .find(query)
//         .sort("-time")
//         .exec(function (err, logs) {
//             return res.render("logs", {
//                 logs: logs,
//                 title: "Player Logs",
//             });
//         });
// });
// router.get("/admin/logs/:id/:level", (req, res, next) => {
//     if (req.user.username != "admin") {
//         res.redirect("/");
//     }
//     var query1 = { username: req.params.id };
//     var query2 = { level: req.params.level };
//     Logs.find()
//         .find(query1)
//         .find(query2)
//         .sort("-time")
//         .exec(function (err, logs) {
//             return res.render("logs", {
//                 logs: logs,
//                 title: "Player Logs",
//             });
//         });
// });

// //Render manage teams page
// router.get("/admin/teams", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     }
//     User.find()
//         .sort("-level")
//         .sort("lastLevelOn")
//         .exec(function (err, teams) {
//             Question.find()
//                 .sort("level")
//                 .exec(function (err, question) {
//                     return res.render("teams", {
//                         teams: teams,
//                         questions: question,
//                         title: "Manage Teams",
//                     });
//                 });
//         });
// });

// //SET LEVEL for teams
// router.post("/admin/teams", (req, res, next) => {
//     User.findOne({ username: req.body.username }, function (err, user) {
//         user.level = req.body.newLevel;
//         user.lastLevelOn = new Date();
//         user.save();
//     });

//     return res.redirect("/admin/teams");
// });

// // Send Email to teams
// router.get("/admin/email", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     } else {
//         return res.render("admin-email", { title: "Send Mail" });
//     }
// });
// router.post("/admin/email", (req, res, next) => {
//     var query = { username: { $ne: "admin" } };
//     User.find()
//         .find(query)
//         .exec(function (err, mails) {
//             for (i in mails) {
//                 var tempMail = mails[i].email;
//                 var output = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8" />
//                 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                 <title>(C)YNC v7.0</title>
//             </head>
//             <body style="color: #fff;width:fit-content;padding: 10px;background-color: transparent;">
//                 <style>
//                 @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;500;700&display=swap");

//                 * {
//                     margin: 0;
//                     padding: 0;
//                     font-family: "Comfortaa", cursive;
//                 }
//                 h3{
//                     font-size:1.1em !important;
//                 }
//                 .right a:hover {
//                     color: #185adb !important;
//                 }
//                 .button a:hover{
//                     color: #000 !important;
//                     background-color: #DA1893 !important;
//                 }
//                 @media (max-width:1112px){
//                     .left{
//                         width: 100% !important;
//                         padding: 0 !important;
//                         maRgin-top: 25px !important;
//                         padding-bottom: 25px !important;
//                     }
//                     .right{
//                         width: 100% !important;
//                         padding: 0 !important;
//                     }
//                     .textContainer{
//                         font-size: 2vw !important;
//                         line-height: 3vw !important;
//                     }
//                 }    
//                 @media (max-width:750px){
//                     body{
//                         width:90vw !important;
//                     }
//                     .card{
//                         width: 80% !important;
//                     }
//                     .textContainer{
//                         font-size: 2vw !important;
//                         padding:0 !important;
//                         line-height:20px !important;
//                     }
//                     h2{
//                         font-size:20px !important;
//                     }
//                     h3{
//                         font-size:15px !important;
//                     }
//                 }
//                 </style>
//                 <section class="card" style="background-color: #080808;width: 50vw;border: 1px solid #fff;padding: 50px;position: relative;border-radius: 10px;">
//                 <div class="imgContainer" style="width:fit-content;margin:0 auto;padding-bottom:30px">
//                     <img src="https://static.clubcypher.club/img/decypher.png" style="height:auto;width:10vw;" alt="decypher" />
//                 </div>
//                 <div class="textContainer" style="text-align: center;font-size: 20px;padding:30px 0;">
//                     <h2 style="margin-bottom: 20px;">De(c)ypher</h2>
//                 </div>
//                 <div class="content" style="width:fit-content;margin:0 auto;">
//                     <div class="left" style="width: fit-content;padding: 20px;margin:0 auto;">
//                         <h3 style="width:fit-content;margin-bottom: 20px;margin:0 auto;padding:30px;">
//                             ${req.body.content}
//                         </h3>
//                     </div>
//                 </div>
//                 <div class="end" style="padding: 20px;width: fit-content;margin:0 auto">
//                     <div class="endLinks" style="width: fit-content;margin:0 auto">
//                         <a href="https://www.instagram.com/cypherdps/"
//                             ><img src="https://static.clubcypher.club/email/instagram2x.png" style="height: auto;width: 5vw;" alt=""
//                         /></a>
//                         <a href="https://www.youtube.com/channel/UCSULXN5apeQSDa0sLYuwEnA"
//                             ><img src="https://static.clubcypher.club/email/youtube2x.png" style="height: auto;width: 5vw;" alt=""
//                         /></a>
//                     </div>
//                     <div class="imgContainer2" style="width: fit-content; margin:0 auto">
//                         <img src="https://static.clubcypher.club/email/cypher-01.png" style="height:auto;width:20vw;margin:0 auto" alt="" />
//                     </div>
//                 </div>
//                 </section>
//             </body>
//             </html>
//             `;

//                 var da_mail = `${tempMail}`;

//                 const accessToken = oAuth2Client.getAccessToken();

//                 const transporter = nodemailer.createTransport({
//                     service: "gmail",
//                     auth: {
//                         type: "OAuth2",
//                         user: "decypher.clubcypher@gmail.com",
//                         clientId: CLIENT_ID,
//                         clientSecret: CLEINT_SECRET,
//                         refreshToken: REFRESH_TOKEN,
//                         accessToken: accessToken,
//                     },
//                 });

//                 var mailOptions = {
//                     from: '"Club Cypher" <decypher.clubcypher@gmail.com>',
//                     to: da_mail,
//                     subject: "Registeration Details",
//                     text: output,
//                     html: output,
//                 };
//                 if (err) {
//                     return res.render("admin-email", {
//                         title: "Send Mail",
//                         error: err,
//                     });
//                 } else
//                     transporter.sendMail(mailOptions, function (err, info) {
//                         if (err)
//                             return res.render("admin-email", {
//                                 title: "Send Mail",
//                                 error: "Mail sent successfully.",
//                             });
//                         else
//                             return res.render("admin-email", {
//                                 title: "Send Mail",
//                                 error: "Mail sent successfully.",
//                             });
//                     });
//             }
//         });

//     return res.redirect("/admin/email");
// });

// router.post("/admin/email/verify", (req, res, next) => {
//     var query1 = { username: { $ne: "admin" } };
//     var query2 = { verified: false };
//     User.find()
//         .find(query1)
//         .find(query2)
//         .exec(function (err, mails) {
//             for (i in mails) {
//                 var tempMail = mails[i].email;
//                 var output = `
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8" />
//                 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//                 <title>(C)YNC v7.0</title>
//             </head>
//             <body style="color: #fff;width:fit-content;padding: 10px;background-color: transparent;">
//                 <style>
//                 @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;500;700&display=swap");

//                 * {
//                     margin: 0;
//                     padding: 0;
//                     font-family: "Comfortaa", cursive;
//                 }
//                 .right a:hover {
//                     color: #185adb !important;
//                 }
//                 .button a:hover{
//                     color: #000 !important;
//                     background-color: #DA1893 !important;
//                 }
//                 @media (max-width:1112px){
//                     .left{
//                         width: 100% !important;
//                         padding: 0 !important;
//                         maRgin-top: 25px !important;
//                         padding-bottom: 25px !important;
//                     }
//                     .right{
//                         width: 100% !important;
//                         padding: 0 !important;
//                     }
//                     .textContainer{
//                         font-size: 2vw !important;
//                         line-height: 3vw !important;
//                     }
//                 }    
//                 @media (max-width:750px){
//                     body{
//                         width:90vw !important;
//                     }
//                     .card{
//                         width: 80% !important;
//                     }
//                     .textContainer{
//                         font-size: 2vw !important;
//                         padding:0 !important;
//                         line-height:20px !important;
//                     }
//                     h2{
//                         font-size:20px !important;
//                     }
//                 }
//                 </style>
//                 <section class="card" style="background-color: #080808;width: 50vw;border: 1px solid #fff;padding: 50px;position: relative;border-radius: 10px;">
//                 <div class="imgContainer" style="width:fit-content;margin:0 auto;padding-bottom:30px">
//                     <img src="https://static.clubcypher.club/img/decypher.png" style="height:auto;width:10vw;" alt="decypher" />
//                 </div>
//                 <div class="textContainer" style="text-align: center;font-size: 20px;padding:30px 0;">
//                     <h2 style="margin-bottom: 20px;">De(c)ypher!</h2>
//                 </div>
//                 <div class="content" style="width:fit-content;margin:0 auto;">
//                     <div class="left" style="width: fit-content;padding: 20px;margin:0 auto;">
//                         <h2 style="width:fit-content;margin-bottom: 20px;margin:0 auto;padding:30px;">Hey ${mails[i].username} !</h2>
//                     </div>
//                     <h2 style="text-align:center;">Verify your account by clicking on the button below:</h2>
//                     <div class="button" style="width:fit-content;margin:0 auto;padding: 30px;padding-bottom:60px;">
//                         <a style="color: #DA1893;border: 1px solid #DA1893;padding: 10px;font-size: 2.5vw;text-align: center;text-decoration: none;" href="https://www.decypher.club/verify/${mails[i].verification}" target="_blank">Verify Here</a>
//                     </div>
//                 </div>
//                 <div class="end" style="padding: 20px;width: fit-content;margin:0 auto">
//                     <div class="endLinks" style="width: fit-content;margin:0 auto">
//                         <a href="https://www.instagram.com/cypherdps/"
//                             ><img src="https://static.clubcypher.club/email/instagram2x.png" style="height: auto;width: 5vw;" alt=""
//                         /></a>
//                         <a href="https://www.youtube.com/channel/UCSULXN5apeQSDa0sLYuwEnA"
//                             ><img src="https://static.clubcypher.club/email/youtube2x.png" style="height: auto;width: 5vw;" alt=""
//                         /></a>
//                     </div>
//                     <div class="imgContainer2" style="width: fit-content; margin:0 auto">
//                         <img src="https://static.clubcypher.club/email/cypher-01.png" style="height:auto;width:20vw;margin:0 auto" alt="" />
//                     </div>
//                 </div>
//                 </section>
//             </body>
//             </html>
//             `;

//                 var da_mail = `${tempMail}`;

//                 const accessToken = oAuth2Client.getAccessToken();

//                 const transporter = nodemailer.createTransport({
//                     service: "gmail",
//                     auth: {
//                         type: "OAuth2",
//                         user: "decypher.clubcypher@gmail.com",
//                         clientId: CLIENT_ID,
//                         clientSecret: CLEINT_SECRET,
//                         refreshToken: REFRESH_TOKEN,
//                         accessToken: accessToken,
//                     },
//                 });

//                 var mailOptions = {
//                     from: '"Club Cypher" <decypher.clubcypher@gmail.com>',
//                     to: da_mail,
//                     subject: "Registeration Details",
//                     text: output,
//                     html: output,
//                 };
//                 if (err) {
//                     return res.render("admin-email", {
//                         title: "Send Mail",
//                         error: err,
//                     });
//                 } else
//                     transporter.sendMail(mailOptions, function (err, info) {
//                         if (err)
//                             return res.render("admin-email", {
//                                 title: "Send Mail",
//                                 error: "Verification mail sent successfully.",
//                             });
//                         else
//                             return res.render("admin-email", {
//                                 title: "Send Mail",
//                                 error: "Verification mail sent successfully.",
//                             });
//                     });
//             }
//         });

//     return res.redirect("/admin/email");
// });

// //Render manage questions page
// router.get("/admin/questions", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     }
//     Question.find()
//         .sort("level")
//         .exec(function (err, question) {
//             return res.render("questions", {
//                 questions: question,
//                 title: "Manage Questions",
//             });
//         });
// });

// //SET ANSWERS for questions
// router.post("/admin/questions", (req, res, next) => {
//     Question.findOne({ level: req.body.level }, function (err, question) {
//         question.question = req.body.question;
//         question.hint1 = req.body.hint1;
//         question.hint2 = req.body.hint2;
//         question.hint3 = req.body.hint3;
//         question.answer = req.body.answer;
//         question.save();
//     });
//     return res.redirect("/admin/questions");
// });

// router.get("/admin/disqualify", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     }
//     User.find()
//         .sort("username")
//         .sort("lastLevelOn")
//         .exec(function (err, teams) {
//             return res.render("disqualify", {
//                 teams: teams,
//                 title: "Disqualify",
//             });
//         });
// });

// router.post("/admin/disqualify", (req, res, next) => {
//     User.findOne({ username: req.body.username }).then((User) => {
//         User.disqualified = true;
//         User.save();
//     });
//     return res.redirect("/admin/disqualify");
// });

// router.get("/admin/requalify", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     }
//     var query2 = { disqualified: true };
//     User.find()
//         .sort("username")
//         .sort("lastLevelOn")
//         .find(query2)
//         .exec(function (err, teams) {
//             return res.render("requalify", {
//                 teams: teams,
//                 title: "Requalify",
//             });
//         });
// });

// router.post("/admin/requalify", (req, res, next) => {
//     User.findOne({ username: req.body.username }).then((User) => {
//         User.disqualified = false;
//         User.save();
//     });
//     return res.redirect("/admin/requalify");
// });

// router.get("/admin/delete", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     }
//     User.find()
//         .sort("username")
//         .sort("lastLevelOn")
//         .exec(function (err, teams) {
//             return res.render("delete", {
//                 teams: teams,
//                 title: "Delete Users",
//             });
//         });
// });

// router.post("/admin/delete", (req, res, next) => {
//     User.findOne({ username: req.body.username }).remove().exec();
//     return res.redirect("/admin/delete");
// });

// router.get("/admin/hints", (req, res, next) => {
//     if (req.user.username != "admin" || !req.user.username) {
//         res.redirect("/");
//     }
//     Question.find()
//         .sort("level")
//         .exec(function (err, questionList) {
//             return res.render("admin-hints", {
//                 questions: questionList,
//                 title: "Add Hints",
//             });
//         });
// });

// router.post("/admin/hints", (req, res, next) => {
//     Hintbox.addHint(req.body.levels, req.body.hint, (err) => {
//         if (err) {
//             Question.find()
//                 .sort("level")
//                 .exec(function (err, questionList) {
//                     return res.render("admin-hints", {
//                         questions: questionList,
//                         error: "Hint uploaded",
//                         title: "Add Hints",
//                     });
//                 });
//         } else {
//             Question.find()
//                 .sort("level")
//                 .exec(function (err, questionList) {
//                     return res.render("admin-hints", {
//                         questions: questionList,
//                         error: "Hint uploaded",
//                         title: "Add Hints",
//                     });
//                 });
//         }
//     });
// });

module.exports = router;