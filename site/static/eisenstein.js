var connection = new WebSocket('ws://127.0.0.1:8080');
var userCodeBase = [];
var allUsers = {};
var userName = '';
var userProfile = {};
var isLogged = false;
var techSystems = [];

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
	isLogged = true;
}

function techBuild(data){
	$('.techSystems').html();
	var allSystems = JSON.parse(data);
	for (var i=0; i<=allSystems.systemsLength-1;i++){
		techSystems.push(allSystems[i]);
	}
	for (var i=0; i <= techSystems.length -1 ; i++){
		var system = $('<div class="techSystemSingle ' +
			'system'+i+'-container' +
			'"><span class="systemName">' +
			techSystems[i].name +
			'</span><span class="systemState">' +
			techSystems[i].statePercent +
			'</span></div>');
		if(techSystems[i].statePercent >= 80){
			system.removeClass('red');
			system.removeClass('green');
			system.removeClass('yellow');
			system.removeClass('grey');
			system.addClass('green');
		}else if(techSystems[i].statePercent < 80 && techSystems[i].statePercent >= 35){
			system.removeClass('red');
			system.removeClass('green');
			system.removeClass('yellow');
			system.removeClass('grey');
			system.addClass('yellow');
		}else if(techSystems[i].statePercent < 35 && techSystems[i].statePercent > 0){
			system.removeClass('red');
			system.removeClass('green');
			system.removeClass('yellow');
			system.removeClass('grey');
			system.addClass('red');
			techAlertStart()
		}else if(techSystems[i].statePercent == 0){
			system.removeClass('red');
			system.removeClass('green');
			system.removeClass('yellow');
			system.removeClass('grey');
			system.addClass('grey');
		}
		$('.techSystems').append(system);
	}
}

function techAlertStart(){
	if($('body').hasClass('alarm') == false){
		$('body').addClass('alarm');
	}
	var siren = document.getElementById('siren');
	siren.play();
}

function techAlertStop(){
	$('body').removeClass('alarm');
	var siren = document.getElementById('siren');
	siren.load();
	siren.pause();
}

jQuery(window).load(function(){
	connection.onclose = function(){
		alert('CONNECTION ABORTED');
		location.reload(true);
	};
	connection.onmessage = function (e) {
		var data = JSON.parse(e.data);

		//load users + login
		if(data.type == 'userData'){
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
		//load chat
		else if(data.type == 'chatData'){
			$('#chatWindow').html(data.data);
		}
		//load date
		else if(data.type == 'dateData'){
			if(isLogged == true){
				var CurrentDate = new Date();
				CurrentDate.setMonth(CurrentDate.getMonth() + 5664);
				$('.welcome').html('<b>Привет, '+userProfile.name+'. ' +
				'Дата : '+CurrentDate.toLocaleDateString()+'. ' +
				'Бортовое время: '+CurrentDate.toLocaleTimeString()+'</b>' +
				'<br /><a href="#" style="display: block" class="userExit">Выйти</a>');
			}
		}
		//load tech data
		else if(data.type == 'techData'){
			techBuild(data.data);
		}
	};
});