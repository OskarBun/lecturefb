/**
 * Created by OskarBunyan on 08/12/14.
 */
define([
    "knockout", "datetimepicker", "kojqueryui"
    ],
    function(ko) {
        function Panel(params) {
            this.appl = params.appl;
            this.title = ko.observable();
            this.description = ko.observable();
            this.starts = ko.observable();
            this.id = ko.observable();
            this.success = ko.observable();
            this.error = ko.observable();
        }

        Panel.prototype.save = function(){
            this.appl.send("new_lecture",
                {
                    "title": this.title(),
                    "description": this.description(),
                    "starts": this.starts()
                },
                function(response){
                    if(response.error){
                        this.error(response.error);
                        return;
                    }
                    this.id(response.result.id);
                    this.success("Lecture created")
                }.bind(this)
            );
        };



        return Panel
    }
);