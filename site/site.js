var path = require('path');
var express = require('express');
var fs = require('fs');
var staticSiteOptions = {
	portnum: 666,
	maxAge: 1000 * 60 * 15
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

wss.on('connection', function(ws) {
	fs.readFile('chat/chat.txt', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		ws.send(JSON.stringify({type:'chatData', data:data}));
	});
	fs.readFile('users/users.json', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		ws.send(JSON.stringify({type:'userData', data:data}));
	});
	ws.on('message', function(message) {
		var recivedMessage = JSON.parse(message);
		if(recivedMessage.type == 'chat'){
			var file = "chat/chat.txt"
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
	});
	setInterval(function(){
		wss.broadcast(JSON.stringify({type:'dateData', data:true}));
	}, 5000)
});
