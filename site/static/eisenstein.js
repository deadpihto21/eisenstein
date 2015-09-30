var connection = new WebSocket('ws://127.0.0.1:8080');
var userCodeBase = [];
var allUsers = {};
var userName = '';
var userProfile = {};


function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname){
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}
function deleteCookie( name ) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function afterLogin(){
	$('#chatSend').on('click', function(){
		var text = $('#chat').val();
		var chatMessage = '<div>'+ '<span style="font-weight: bold">'+ userProfile.name +': </span>' +text+'</div>';
		connection.send(JSON.stringify({
			type:"chat",
			chatMessage:chatMessage
		}));
	});

	var CurrentDate = new Date();
	CurrentDate.setMonth(CurrentDate.getMonth() + 5664);
	$('.welcome').html('<b>Привет, '+userProfile.name+'. ' +
		'Дата : '+CurrentDate.toLocaleDateString()+'. ' +
		'Бортовое время: '+CurrentDate.toLocaleTimeString()+'</b>' +
		'<br /><a href="#" style="display: block" class="userExit">Выйти</a>');

	$('.userExit').on('click', function(){
		deleteCookie('logged');
		location.reload(true);
	});
	$('.systemOpener').on('click', function(){
		if(userProfile.permissions.indexOf($(this).parent().attr('id')) > 0){
			$(this).hide();
			$(this).next().show();
		}
		else{
			alert('PERMISSION DENIED')
		}
	});
	$('.systemClose').on('click', function(){
		$(this).parent().hide();
		$(this).parent().prev().show();
	});
}



jQuery(document).ready(function(){
	connection.onclose = function(){
		setTimeout(function(){connection = new WebSocket('ws://127.0.0.1:8080');}, 500);
	};
	connection.onmessage = function (e) {

		var data = JSON.parse(e.data);
		if(data.type == 'chatData'){
			$('#chatWindow').html(data.data);
		}

		else if(data.type == 'userData'){
			allUsers = JSON.parse(data.data);
			for (var i=0; i<=allUsers.usersLength-1;i++){
				userCodeBase.push(allUsers[i].code);
			}
			if(getCookie('logged').length == 0){
				userName = prompt('STATE YOUR NAME');
				if(userCodeBase.indexOf(userName) > -1){
					setCookie('logged', userName, 365);
					alert('WELCOME');
					userProfile = allUsers[userCodeBase.indexOf(userName)];
					afterLogin();
				}else{
					alert('PERMISSION DENIED');
					location.reload(true);
				}
			}else{
				userName = getCookie('logged');
				userProfile = allUsers[userCodeBase.indexOf(userName)];
				afterLogin();
			}
		}
		else if(data.type == 'dateData'){
			var CurrentDate = new Date();
			CurrentDate.setMonth(CurrentDate.getMonth() + 5664);
			$('.welcome').html('<b>Привет, '+userProfile.name+'. ' +
			'Дата : '+CurrentDate.toLocaleDateString()+'. ' +
			'Бортовое время: '+CurrentDate.toLocaleTimeString()+'</b>' +
			'<br /><a href="#" style="display: block" class="userExit">Выйти</a>');
		}
	};
});