
define([
	"knockout"
	],
	function(ko){

	function Connect(){
		this.status = ko.observable("disconnected");
		this.ws = null;
		this.broadcast = ko.observable();
		this.callbacks = {};
		this.request_seed = 0;
	}

	Connect.prototype.send = function(action, args, callback){
		var request_id = ++this.request_seed;
		if(callback){
			this.callbacks[request_id] = callback;
		}
		this.ws.send(ko.toJSON({
			"action": action,
			"args": args,
			"request_id": request_id
		}));
	};

	Connect.prototype.opened = function(){
		this.status("connected");
	};

	Connect.prototype.closed = function(){
		this.status("disconnected");
		this.ws = null;
	};

	Connect.prototype.received = function(obj){
		console.log(obj);
		if(obj["response_id"]){
			var callback = this.callbacks[obj["response_id"]];
			if(callback){
				callback(obj);
			}
		} else{
			this.broadcast(obj);
		}
	};

	Connect.prototype.toggle_connection = function(){
		if(this.ws){
			this.ws.close();
		}
		else{
			var protocol = document.location.protocol == "https:"? "wss://" : "ws://";
			var ws = this.ws = new WebSocket(protocol + document.domain + ":" + document.location.port + "/websocket");
			ws.onopen = this.opened.bind(this);
			var received = this.received.bind(this);
			ws.onmessage = function(evt){
				var obj = ko.utils.parseJson(evt.data);
				received(obj);
			};
			ws.onclose = this.closed.bind(this);
		}
	};

	return Connect;
});

