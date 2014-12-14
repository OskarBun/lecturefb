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
        "signals":          "bower_components/js-signals/dist/signals",
        "hasher":           "bower_components/hasher/dist/js/hasher",
        "crossroads":       "bower_components/crossroads/dist/crossroads",
        "augment":          "bower_components/augment.js/augment",
        "d3":               "bower_components/d3/d3",
        "c3":               "bower_components/c3/c3"
    },
    shim:{
        "bootstrap": {
            "deps": ["jquery"]
        }
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

        ko.components.register("progressbar", {
            viewModel: { require: "modules/progressbar/main" },
            template: { require: "text!modules/progressbar/main-tmpl.html"}
        });

        ko.components.register("speakerdefault", {
            template: {require: "text!modules/speaker-default.html"}
        });

        ko.components.register("speakerarchive", {
            template: {require: "text!modules/speaker-archive.html"}
        });

        var appl = window.appl = new Appl();

        appl.componentsignal = {
			showlecture : new signals.Signal(),
            messageslen : new signals.Signal(),
            datalen: new signals.Signal()
		};

        appl.addRoute("", function(){
            appl.template("speakerdefault");
        });

        appl.addRoute("/archive", function(){
            appl.template("speakerarchive");
        });

        $(function(){
            appl.start();
            appl.toggle_connection();
            ko.applyBindings(appl);
        });
    }
);