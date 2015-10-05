var path = require('path');
var express = require('express');
var fs = require('fs');
var tws;
var staticSiteOptions = {
	portnum: 666,
	maxAge: 1000 * 60 * 60
};
var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 8080});
wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		client.send(data);
	});
};
//Hello world
express().use(express.static(
	path.join(__dirname, 'static'),
	staticSiteOptions
)).listen(staticSiteOptions.portnum);

function sendTechData(ws){
	fs.readFile('techSystems/systems.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		wss.broadcast(JSON.stringify({type:'techData', data:data}));
	});
}

wss.on('connection', function(ws) {
	tws = ws;
	fs.readFile('chat/chat.txt', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		wss.broadcast(JSON.stringify({type:'chatData', data:data}));
	});
	fs.readFile('chat/specChat.txt', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		wss.broadcast(JSON.stringify({type:'specChatData', data:data}));
	});
	fs.readFile("medJournal/medJournal.txt", 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		wss.broadcast(JSON.stringify({type:'medJournal', data:data}));
	});
	fs.readFile('users/users.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		wss.broadcast(JSON.stringify({type:'userData', data:data}));
	});
	sendTechData(ws);

	ws.on('message', function(message) {
		var recivedMessage = JSON.parse(message);
		if(recivedMessage.type == 'chat'){
			var file = "chat/chat.txt";
			var data = fs.readFileSync(file); //read existing contents into data
			var fd = fs.openSync(file, 'w+');
			fs.writeSync(fd, recivedMessage.chatMessage, 0, recivedMessage.chatMessage.length); //write new data
			fs.writeSync(fd, data, 0, data.length); //append old data
			fs.close(fd);
			fs.readFile('chat/chat.txt', 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				wss.broadcast(JSON.stringify({type:'chatData', data:data}));
			});
		}
		if(recivedMessage.type == 'specChat'){
			var file = "chat/specChat.txt";
			var data = fs.readFileSync(file); //read existing contents into data
			var fd = fs.openSync(file, 'w+');
			fs.writeSync(fd, recivedMessage.specChatMessage, 0, recivedMessage.specChatMessage.length); //write new data
			fs.writeSync(fd, data, 0, data.length); //append old data
			fs.close(fd);
			fs.readFile('chat/specChat.txt', 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				wss.broadcast(JSON.stringify({type:'specChatData', data:data}));
			});
		}

		if(recivedMessage.type == 'redBanner'){
			wss.broadcast(JSON.stringify({type:'redBanner', data:true}));
		}

		if(recivedMessage.type == 'medJournal'){
			var file = "medJournal/medJournal.txt";
			var data = fs.readFileSync(file); //read existing contents into data
			var fd = fs.openSync(file, 'w+');
			fs.writeSync(fd, recivedMessage.journalEntry, 0, recivedMessage.journalEntry.length); //write new data
			fs.writeSync(fd, data, 0, data.length); //append old data
			fs.close(fd);
			fs.readFile("medJournal/medJournal.txt", 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				wss.broadcast(JSON.stringify({type:'medJournal', data:data}));
			});
		}
		if(recivedMessage.type == 'tech'){
			fs.writeFile("techSystems/systems.json", JSON.stringify(recivedMessage.techData, null, 4), function(err){
				return console.log(err);
			})
		}
	});
	setInterval(function(){
		wss.broadcast(JSON.stringify({type:'dateData', data:true}));
	}, 5000)
});
fs.watch('techSystems/systems.json', function (event, filename) {
	if (event == 'change') {
		sendTechData(tws)
	}
});