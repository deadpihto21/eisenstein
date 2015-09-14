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


var engineModel = function() {
	this.engineStatus = ko.observable(100);
	this.destroyEngine = function(){
		var destruct = Math.floor((Math.random() * 10) + 1);
		var result = this.engineStatus() - destruct;
		if(result > 0) {
			this.engineStatus(result);
		}else{
			this.engineStatus(0);
		}
	};
	this.repairEngine = function(){
		var repaire = Math.floor((Math.random() * 10) + 1);
		var result = this.engineStatus() + repaire;
		if(result <= 100){
			this.engineStatus(result);
		}else{
			this.engineStatus(100);
		}
	};
};
function eisenstein(){
	this.engineModel = engineModel;

}

function afterLoad(){
	ko.applyBindings(new eisenstein());
	$('#chatSend').on('click', function(){
		var text = $('#chat').val();
		var chatMessage = '<div>'+ '<span style="font-weight: bold">'+ userProfile.name +': </span>' +text+'</div>';
		connection.send(JSON.stringify({
			type:"chat",
			chatMessage:chatMessage
		}));
		$('#chatWindow').prepend(chatMessage);
	});
}



jQuery(document).ready(function(){
	connection.onclose = function(){
		setTimeout(function(){connection = new WebSocket('ws://127.0.0.1:8080');}, 500);
	};
	connection.onmessage = function (e) {
		var data = JSON.parse(e.data);
		if(data.type == 'chatData'){
			$('#chatWindow').prepend(data.data);
		}else if(data.type == 'userData'){
			allUsers = JSON.parse(data.data);
			for (var i=0; i<=allUsers.usersLength-1;i++){
				userCodeBase.push(allUsers[i].code);
			}
			console.log(userCodeBase)
			if(getCookie('logged').length == 0){
				userName = prompt('STATE YOUR NAME');
				if(userCodeBase.indexOf(userName) > -1){
					setCookie('logged', userName, 365);
					alert('WELCOME');
					userProfile = allUsers[userCodeBase.indexOf(userName)];
					afterLoad();
				}else{
					alert('PERMISSION DENIED');
					location.reload(true);
				}
			}else{
				userName = getCookie('logged');
				userProfile = allUsers[userCodeBase.indexOf(userName)];
				afterLoad();
			}
		}
	};
});