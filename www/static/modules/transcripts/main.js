/**
 * Created by OskarBunyan on 09/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment){
        function Panel(params) {
            this.appl = params.appl;
            this.type = params.type;
            this.options = {
                person_id : params["person_id"],
                blocks : params["blocks"],
                email : params["email"],
                length : params["length"]
            };
            this.lecture = ko.observable(params.lecture);
            this.messages = ko.observableArray();
            this.moment = moment;
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="lecture_commented"){
                    if(message.message.lecture_id==this.lecture().id && message.message.type==this.type){
                        if(this.options.person_id){
                            if(message.message.person_id==this.options.person_id()){
                                this.messages.splice(0,0,message.message);
                            }
                            return;
                        }
                        this.messages.splice(0,0,message.message);
                    }
                }
            }, this);
            this.lecture.subscribe(function(){
                this.load();
            }, this);

        }

        Panel.prototype.init = function(){
            if(this.options.length){
                this.messages.subscribe(function(messages){
                    this.appl.componentsignal.messageslen.dispatch(messages.length)
                }, this);
            }
            this.load();
        };

        Panel.prototype.load = function(){
            this.appl.send("lecture_transcripts",
                {
                    "lecture_id": this.lecture().id,
                    "type": this.type,
                    "person_id": this.options.person_id
                },
                function (response) {
                    if (response.error) {
                        this.appl.error(response.error);
                        return;
                    }
                    this.messages(response.result.reverse());
                }.bind(this)
            );
        };

        Panel.prototype.dispose = function(){
            this.broadcast_sub.dispose();
        };

        return Panel;
    }
);