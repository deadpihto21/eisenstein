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
jQuery(document).ready(function(){
	ko.applyBindings(new eisenstein());

	var connection = new WebSocket('ws://192.168.1.12:8080');
	connection.onmessage = function (e) {
		alert('Server: ' + e.data);
	};
	$('#chatSend').on('click', function(){
		connection.send($('#chat').val())
	})
})
