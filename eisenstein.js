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
jQuery(document).ready(function() {
	ko.applyBindings(new eisenstein());
})