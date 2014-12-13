/**
 * Created by OskarBunyan on 09/12/14.
 */
require.config({
    urlArgs: "v=" + (new Date()).getTime(),
    baseUrl: "static",
    paths: {
        "jquery":           "bower_components/jquery/dist/jquery",
        "bootstrap":        "bower_components/bootstrap/dist/js/bootstrap",
        "chartjs":          "lib/Chart.js/Chart",
        "knockout":         "bower_components/knockout/dist/knockout.debug",
        "text":             "bower_components/requirejs-text/text",
        "datetimepicker":   "bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min",
        "kojqueryui":       "utils/ko-jqueryui",
        "moment":           "bower_components/moment/moment",
        "signals":        "bower_components/js-signals/dist/signals",
        "hasher":           "bower_components/hasher/dist/js/hasher",
        "crossroads":       "bower_components/crossroads/dist/crossroads",
        "augment":          "bower_components/augment.js/augment"
    }
});

require([
    "jquery",
    "knockout",
    "signals",
    "./appl",
    "bootstrap",
    "augment"
    ],
    function($, ko, signals, Appl){

        ko.components.register("lecturelist", {
            viewModel: { require: "modules/lecturelist/main" },
            template: { require: "text!modules/lecturelist/main-tmpl.html"}
        });

        ko.components.register("lectureparticipate", {
            viewModel: { require: "modules/lectureparticipate/main" },
            template: { require: "text!modules/lectureparticipate/main-tmpl.html"}
        });

        ko.components.register("issues", {
            viewModel: { require: "modules/issues/main" },
            template: { require: "text!modules/issues/main-tmpl.html"}
        });

        ko.components.register("transcripts", {
            viewModel: { require: "modules/transcripts/main" },
            template: { require: "text!modules/transcripts/main-tmpl.html"}
        });

        ko.components.register("progressbar", {
            viewModel: { require: "modules/progressbar/main" },
            template: { require: "text!modules/progressbar/main-tmpl.html"}
        });

        var appl = window.appl = new Appl();

        appl.componentsignal = {
			showlecture : new signals.Signal(),
            messageslen : new signals.Signal()
		};

        $(function(){
            appl.toggle_connection();
            ko.applyBindings(appl);
        });
    }
);