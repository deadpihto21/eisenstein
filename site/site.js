// Перечисление зависимостей:
var path = require('path');
var express = require('express');

// Описание настроек:
var staticSiteOptions = {
	portnum: 666, // слушать порт 666
	maxAge: 1000 * 60 * 15 // хранить страницы в кэше пятнадцать минут
};

// Запуск сайта:
express().use(express.static(
	path.join(__dirname, 'static'),
	staticSiteOptions
)).listen(staticSiteOptions.portnum);

var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port: 8080});
wss.on('connection', function(ws) {
	ws.on('message', function(message) {
		console.log('received: %s', message);
	});
});