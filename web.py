import logging

import tornado.ioloop
import tornado.web
from tornado.options import parse_command_line, define, options
from pkg_resources import resource_filename  # @UnresolvedImport

from lecturefb.control import Control
from lecturefb.handlers.control_handler import ControlHandler
from lecturefb.handlers.login_handler import LoginHandler
from lecturefb.handlers.main_handler import MainHandler

define("port", 8888, int, help="port to listen on")

def main():
	handlers = [
		(r"/", MainHandler),
		(r"/websocket", ControlHandler),
		(r"/login", LoginHandler)
	]
	settings = dict(
		static_path = resource_filename('lecturefb',"www/static"),
		template_path = resource_filename('lecturefb',"www/templates"),
		control = Control(db_url = "sqlite:///test.db", drop_all = False),
		login_url = "/login",
		cookie_name = "lecturefb",
		cookie_secret = "it was a dark and stormy night @rsa",
		gzip = True,
		debug = True)
	application = tornado.web.Application(handlers, **settings)

	logging.info("Listening on port {}".format(options.port))
	application.listen(options.port)
	tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	parse_command_line()
	main()
	
	
	
	
	