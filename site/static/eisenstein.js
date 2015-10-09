//var connection = new WebSocket('ws://192.168.1.14:8080');
var connection;
var userCodeBase = [];
var allUsers = {};
var userName = '';
var userProfile = {};
var isLogged = false;
var techSystems = [];
var redBanner = false;
var sirenActive = true;

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

jQuery(document).ready(function(){
	connection = new WebSocket('ws://127.0.0.1:8080');

	connection.onclose = function(){
		alert('CONNECTION ABORTED');
		location.reload(true);
	};
	connection.onmessage = function (e) {
		var data = JSON.parse(e.data);
		//load users + login
		if(data.type == 'userData' && data.update == false){
			allUsers = JSON.parse(data.data).users;
			for (var user in allUsers){
				userCodeBase.push(allUsers[user].code);
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
		}else if(data.type == 'userData' && data.update == true){
			deleteCookie('logged');
			location.reload(true);
		}
		//load chat
		if(data.type == 'chatData'){
			$('#chatWindow').html(data.data);
		}
		//load specail chat
		if(data.type == 'specChatData'){
			$('#chatWindowSpec').html(data.data);
		}
		//load med log
		if(data.type == 'medJournal'){
			$('.medJournal').html(data.data);
		}
		//load ship log
		if(data.type == 'bortJournal'){
			$('.bortJournal').html(data.data);
		}
		//load date
		if(data.type == 'dateData'){
			if(isLogged == true){
				var CurrentDate = new Date();
				CurrentDate.setMonth(CurrentDate.getMonth() + 5664);
				$('.welcome').html('<b>Привет, '+userProfile.job+' '+userProfile.name+'. ' +
				'Дата : '+CurrentDate.toLocaleDateString()+'. ' +
				'Бортовое время: '+CurrentDate.toLocaleTimeString()+'</b>' +
				'<br /><a href="#" style="display: block" class="userExit">Выйти</a>');
			}
		}
		//load tech data
		if(data.type == 'techData'){
			techBuild(data.data);
		}
		//get red banner flag
		if(data.type == 'redBanner'){
			if(data.data == true){
				redAlertStart();
			}else{
				redAlertStop();
			}
		}
	};
});





function afterLogin() {

	isLogged = true;
	if (userProfile.permissions.indexOf('admin') > 0){
		$('#redBanner').show();
		$('#redBanner').on('click', function () {
			connection.send(JSON.stringify({
				type:"redBanner",
				redBanner:true
			}));
		});
	}
	$('#chatSend').on('click', function(){
		var text = $('#chat').val();
		var chatMessage = '<div>'+ '<span style="font-weight: bold">'+ userProfile.name +': </span>' +text+'</div>';
		connection.send(JSON.stringify({
			type:"chat",
			chatMessage:chatMessage
		}));
		$('#chat').val('');
	});

	$('#chatSendSpec').on('click', function(){
		var text = $('#chatSpec').val();
		var chatMessage = '<div>'+ '<span style="font-weight: bold">'+ userProfile.name +': </span>' +text+'</div>';
		connection.send(JSON.stringify({
			type:"specChat",
			specChatMessage:chatMessage
		}));
		$('#chat').val('');
	});

	$('.medJournal-entrySend').on('click', function(){
		var topic = $('.medJournal-topic').val();
		var text = $('.medJournal-entry').val();
		var date = new Date();
		date.setMonth(CurrentDate.getMonth() + 5664);
		var journalEntry = '<div class="journalEntrySingle">'+
			'<div>Врач: <span style="font-weight: bold">'+
			userProfile.name +
			'</span></div>' +
			'<div>Дата: <span style="font-weight: bold">'+
			date.toLocaleString()
			+'</span></div>' +
			'<div>Тема: <span style="font-weight: bold">' +
			topic +
			'</span></div>' +
			'<div>Запись: ' +text+'</div></div>';
		connection.send(JSON.stringify({
			type:"medJournal",
			journalEntry:journalEntry
		}));
		$('.medJournal').val('');
	});
	$('.bortJournal-entrySend').on('click', function(){
		if(userProfile.permissions.indexOf('capitan') > 0 || userProfile.permissions.indexOf('omni') > 0){
			var topic = $('.bortJournal-topic').val();
			var text = $('.bortJournal-entry').val();
			var date = new Date();
			date.setMonth(CurrentDate.getMonth() + 5664);
			var journalEntry = '<div class="journalEntrySingle">'+
				'<div>Капитан: <span style="font-weight: bold">'+
				userProfile.name +
				'</span></div>' +
				'<div>Дата: <span style="font-weight: bold">'+
				date.toLocaleString()
				+'</span></div>' +
				'<div>Тема: <span style="font-weight: bold">' +
				topic +
				'</span></div>' +
				'<div>Запись: ' +text+'</div></div>';
			connection.send(JSON.stringify({
				type:"bortJournal",
				journalEntry:journalEntry
			}));
			$('.bortJournal').val('');
		}else{
			alert('Captain permissions required');
		}
	});

	$('#chat').on('keyup', function(e){
		if(e.keyCode == 13 && e.ctrlKey == false){
			$('#chatSend').click();
			$(this).focus()
		}else if(e.keyCode == 13 && e.ctrlKey == true){
			$(this).val($(this).val() + "\n");
		}
	});
	var CurrentDate = new Date();
	CurrentDate.setMonth(CurrentDate.getMonth() + 5664);
	$('.welcome').html('<b>Привет, '+userProfile.job +' '+ userProfile.name+'. ' +
	'Дата : '+CurrentDate.toLocaleDateString()+'. ' +
	'Бортовое время: '+CurrentDate.toLocaleTimeString()+'</b>' +
	'<br /><a href="#" style="display: block" class="userExit">Выйти</a>');

	$(document).on('click','.userExit', function(){
		deleteCookie('logged');
		location.reload(true);
	});

	$(document).on('click', '.techSystemSingle', function(){
		if(parseInt($(this).find('.systemState').text()) < 100 && techSystems[$(this).index()].stateRepairable == true){
			window.techSystemNumber = $(this).index();
			$('.techgame').show();
			window.myGame.restart();
			techAlertStop();
		}else if($(this).find('.systemState').text() == 100){
			alert('System nominal');
		}else{
			alert('System unrepairable');
			techAlertStop();
		}
	});

	$('.systemOpener').on('click', function(){
		if(isLogged == true){
			if(userProfile.permissions.indexOf($(this).parent().attr('id')) > 0
				|| userProfile.permissions.indexOf('omni') > 0
				|| $(this).parent().attr('id')== 'bortJournal'){
				$(this).hide();
				$(this).next().show();
			}
			else{
				alert('PERMISSION DENIED')
			}
		}
	});

	$('.systemClose').on('click', function(){
		$(this).parent().hide();
		$(this).parent().prev().show();
	});
	if(userProfile.permissions.indexOf('omni') > 0
		||(userProfile.permissions.indexOf('captian') > 0 && redBanner == true)){
		$('#specialChat').show();
	}

}

function techBuild(data){
	$('.techSystems').html(' ');
	var tempSysArr =[];
	var allSystems = JSON.parse(data);
	for (var i=0; i<=allSystems.systems.length-1;i++){
		tempSysArr.push(allSystems.systems[i]);
	}
	techSystems = tempSysArr;
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
			if(userProfile){
				if(userProfile.permissions.indexOf('tech') > 0 && techSystems[i].stateRepairable == true){
					techAlertStart()
				}
			}
		}else if(techSystems[i].statePercent == 0){
			system.removeClass('red');
			system.removeClass('green');
			system.removeClass('yellow');
			system.removeClass('grey');
			system.addClass('grey');
			if(techSystems[i].isSiren){
				sirenActive = false;
			}
		}
		$('.techSystems').append(system);
		if($('.red').length <= 0){
			techAlertStop();
		}
	}
}

function techRepaire(system){
	var repaireInterval = setInterval(function(){
		techSystems[system].statePercent +=  Math.floor((Math.random() * 10) + 1);
		if(techSystems[system].statePercent >= 100){
			techSystems[system].statePercent = 100;
			clearInterval(repaireInterval);
		}
		connection.send(JSON.stringify({
			type:"tech",
			techData:{"systems":techSystems}
		}));
	}, 3000);

	return techSystems[system].name;
}

function techAlertStart(){
	if($('body').hasClass('alarm') == false){
		$('body').addClass('alarm');
	}
	var siren = document.getElementById('siren');
	if(siren.paused && sirenActive == true){
		siren.play();
	}
}

function redAlertStart(){
	if($('body').hasClass('alarm') == false){
		$('body').addClass('alarm');
	}
	if($('body').hasClass('redBanner') == false){
		$('body').addClass('redBanner');
	}
	var siren = document.getElementById('siren');
	if(siren.paused && sirenActive == true){
		siren.play();
	}
}

function techAlertStop(){
	$('body').removeClass('alarm');
	var siren = document.getElementById('siren');
	siren.load();
	siren.pause();
}

function redAlertStop(){
	$('body').removeClass('alarm').removeClass('redBanner');
	var siren = document.getElementById('siren');
	siren.load();
	siren.pause();
}