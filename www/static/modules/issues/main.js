/**
 * Created by OskarBunyan on 09/12/14.
 */
define([
    "knockout", "moment"
    ],
    function(ko, moment){
        function Panel(params){
            this.appl = params.appl;
            this.lecture = ko.observable(params.lecture);
            this.status = params.status;
            this.comment = ko.observable();
            this.success = ko.observable();
        }

        Panel.prototype.issue = function(type){
            function when(date){
                var now = moment().unix();
                var then = moment(date, "YYYY-MM-DD HH:mm:ss").unix();
                return now-then;
            }
            this.appl.send("new_lecture_timeseries",
                {
                    "value": type=="slow"? -1 : 1,
                    "lecture_id": this.lecture().id,
                    "when": when(this.lecture().starts),
                    "issue_id": type=="repeat"? 1 : 2
                },
                function(response){
                    if(response.error){
                        debugger;
                        this.appl.error(response.error);
                        return;
                    }
                    this.success(type + " sent")
                }.bind(this)
            );
        };

        Panel.prototype.dispose = function(){
        };

        return Panel;
    }
);