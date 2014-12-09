/**
 * Created by OskarBunyan on 08/12/14.
 */

define([
    "knockout", "moment","jssignals"
    ],
    function(ko, moment) {
        function Panel(params) {
            this.appl = params.appl;
            this.items = ko.observableArray();
            this.moment = moment;
            this.sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="new_lectured"){
                    this.items.push(message.message);
                }
            }.bind(this));
        }

        Panel.prototype.init = function(){
            this.load();
        };

        Panel.prototype.load = function(){
            this.appl.send("filter_lectures",
                {
                    "speaker_id": this.appl.user().id
                },
                function(response){
                    if(response.error){
                        this.appl.error(response.error);
                        return;
                    }
                    this.items(response.result);
                }.bind(this)
            );
        };

        Panel.prototype.dispose = function(){
            this.sub.dispose();
        };

        Panel.prototype.showlecture = function(lecture){
            this.appl.componentsignal.showlecture.dispatch(lecture);
        };

        return Panel;
    }
);