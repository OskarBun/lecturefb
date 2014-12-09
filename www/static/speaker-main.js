require.config({
    urlArgs: "v=" + (new Date()).getTime(),
    baseUrl: "static",
    paths: {
        "jquery":   "bower_components/jquery/dist/jquery",
        "bootstrap": "bower_components/bootstrap/dist/js/bootstrap",
        "chartjs":  "lib/Chart.js/Chart",
        "knockout": "bower_components/knockout/dist/knockout.debug",
        "text":     "bower_components/requirejs-text/text",
        "datetimepicker": "bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min",
        "kojqueryui":   "lib/ko-jqueryui",
        "moment":       "bower_components/moment/moment",
        "jssignals":    "bower_components/js-signals/dist/signals"
    }
});

require([
    "jquery",
    "knockout",
    "jssignals",
    "./appl",
    "bootstrap"
    ],
    function($, ko, signals, Appl){

        ko.components.register("charts", {
            viewModel: { require: "modules/charts/main" },
            template: { require: "text!modules/charts/main-tmpl.html" }
        });

        ko.components.register("lectureform", {
            viewModel: { require: "modules/lectureform/main" },
            template: { require: "text!modules/lectureform/main-tmpl.html"}
        });

        ko.components.register("lecturelist", {
            viewModel: { require: "modules/lecturelist/main" },
            template: { require: "text!modules/lecturelist/main-tmpl.html"}
        });

        ko.components.register("lecturereview", {
            viewModel: { require: "modules/lecturereview/main" },
            template: { require: "text!modules/lecturereview/main-tmpl.html"}
        });

        ko.components.register("transcripts", {
            viewModel: { require: "modules/transcripts/main" },
            template: { require: "text!modules/transcripts/main-tmpl.html"}
        });

        var appl = window.appl = new Appl();

        appl.componentsignal = {
			showlecture : new signals.Signal()
		};

        $(function(){
            appl.toggle_connection();
            ko.applyBindings(appl);
        });
    }
);