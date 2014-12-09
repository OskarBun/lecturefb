
define([
	"knockout", "./connect"
	],
	function(ko, Connect){

	function Appl(){
		this.title = ko.observable("Lecture Feedback");
		this.connection = new Connect();
		this.user = ko.observable();
		this.error = ko.observable();
		this.broadcast = this.connection.broadcast;
		this.broadcast.subscribe(function(obj){
			if(obj["user"] !== undefined) {
				this.user(obj.user);
			}
		}, this);
	}

	Appl.prototype.send = function(action, args, callback){
		this.connection.send(action, args, callback);
	};

	Appl.prototype.toggle_connection = function(){
		this.connection.toggle_connection();
	};

	return Appl;
});

