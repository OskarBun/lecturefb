/**
 * Created by OskarBunyan on 08/12/14.
 */

define([
    "knockout", "moment"
    ],
    function(ko, moment) {
        function Panel(params) {
            this.appl = params.appl;
            this.items = ko.observableArray();
            this.moment = moment;
            this.item = ko.observable();
            this.item.subscribe(function(value){
                this.appl.componentsignal.showlecture.dispatch(value);
            }, this);
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="new_lectured"){
                    if(message.message["speaker_id"]==this.appl.user().id){
                        this.items.push(message.message);
                    }
                }
            }, this);
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
            this.broadcast_sub.dispose();
        };

        return Panel;
    }
);