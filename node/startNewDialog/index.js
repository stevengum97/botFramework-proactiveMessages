"use strict";

var restify = require('restify');
var builder = require('botbuilder');
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
bot = require("./botadapter").patch(bot);

bot.dialog('/survey', [
  function (session, args, next) {
    if (session.message.text=="done"){
      session.send("Great, back to the original conversation");
      session.endDialog();
    }else{
          session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
    }
  },
  function (session, results) {
 
  }
]);

function startProactiveDialog(addr) {
  // set resume:false to resume at the root dialog
  // else true to resume the previous dialog
  bot.beginDialog(savedAddress, "*:/survey", {}, { resume: true });  
}

var savedAddress;
server.post('/api/messages', connector.listen());
server.get('/api/CustomWebApi', (req, res, next) => {
    startProactiveDialog(savedAddress);
    res.send('triggered');
    next();
  }
);

bot.dialog('/', function(session, args) {

  savedAddress = session.message.address;

  var message = 'Hey there, I\'m going to interrupt our conversation and start a survey in a few seconds.';
  session.send(message);
  
  connector.url
  message = 'You can also make me send a message by accessing: ';
  message += 'http://localhost:' + server.address().port + '/api/CustomWebApi';
  session.send(message);

  setTimeout(() => {
    startProactiveDialog(savedAddress);
  }, 5000)
});
