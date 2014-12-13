/**
 * Created by OskarBunyan on 08/12/14.
 */

define([
    "knockout", "moment"
    ],
    function(ko, moment) {
        function Panel(params) {
            this.appl = params.appl;
            this.options = {
                speaker_id: params.speaker_id,
                upcoming: params["upcoming"],
                archive: params["archive"],
                scroller: params["scroller"]
            };
            this.items = ko.observableArray();
            this.moment = moment;
            this.item = ko.observable();
            this.broadcast_sub = this.appl.broadcast.subscribe(function(message){
                if(message.signal=="new_lectured"){
                    if(this._ofinterest(message.message)){
                        this.load();
                    }
                }
                if(message.signal=="lecture_deleted"){
                    if(this._ofinterest(message.message)){
                        if(this.item() && message.message.id == this.item().id){
                            this.showlecture(null);
                        }
                        this.load();
                    }
                }
            }, this);
        }

        Panel.prototype.init = function(){
            this.load();
            this.appl.componentsignal.showlecture.add(this.item);
        };

        Panel.prototype._ofinterest = function(lecture){
            var success = true;
            var start = moment(lecture.starts, "YYYY-MM-DD HH:mm");
            var end  = moment(lecture.ends, "YYYY-MM-DD HH:mm");
            var now = moment();
            if(this.options.speaker_id && lecture.speaker_id!=this.options.speaker_id()){
                success = false;
            } else if(this.options.upcoming && this.options.archive && now.isAfter(start) && end.isAfter(now)){
                return success;
            } else if(this.options.upcoming && now.isAfter(start)){
                success = false;
            }else if(this.options.archive && end.isAfter(now)){
                success = false;
            }
            return success;
        };

        Panel.prototype.showlecture = function(value){
            var status = null;
            if(this.options.upcoming && this.options.archive){
                status = "current";
            } else {
                if(this.options.upcoming){
                    status = "upcoming";
                }
                if(this.options.archive){
                    status = "archive";
                }
            }
            this.appl.componentsignal.showlecture.dispatch(value, status);
        };

        //TODO svg pie chart component

        Panel.prototype.load = function(){
            function dateoption(d){
                if(d){
                    d = moment().format("YYYY-MM-DD HH:mm");
                }
                return d;
            }
            this.appl.send("filter_lectures",
                {
                    "speaker_id": this.options["speaker_id"],
                    "before_date": dateoption(this.options.upcoming),
                    "after_date": dateoption(this.options.archive)
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
            this.appl.componentsignal.showlecture.remove(this.item)
        };

        return Panel;
    }
);