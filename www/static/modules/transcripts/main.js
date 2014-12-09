/**
 * Created by OskarBunyan on 09/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment){
        function Panel(params) {
            this.appl = params.appl;
            this.lecture = ko.observable(params.lecture);
            this.messages = ko.observableArray();
            this.moment = moment;
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="lecture_commented"){
                    if(message.message.lecture_id==this.lecture().id){
                        this.messages.splice(0,0,message.message);
                    }
                }
            }, this);
            this.lecture.subscribe(function(){
                this.load()
            }, this);
            this.comment = ko.observable(); //only for now
        }

        Panel.prototype.init = function(){
            this.load();
        };

        Panel.prototype.load = function(){
            this.appl.send("lecture_transcripts",
                {
                    "lecture_id": this.lecture().id,
                    "type": "formal"
                },
                function (response) {
                    if (response.error) {
                        this.appl.error(response.error);
                        return;
                    }
                    this.messages(response.result);
                }.bind(this)
            );
        };

        Panel.prototype.new_transcript = function(){ //only here for now
            this.appl.send("new_lecture_transcript",
                {
                    "lecture_id": this.lecture().id,
                    "comment": this.comment,
                    "type": "formal"
                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                    }
                }.bind(this)
            );
            this.comment('')
        };

        Panel.prototype.dispose = function(){
            this.broadcast_sub.dispose();
        };

        return Panel;
    }
);