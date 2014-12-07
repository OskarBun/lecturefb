import logging
import tornado.websocket
from tornado.escape import json_decode



class ControlHandler(tornado.websocket.WebSocketHandler):

    @property
    def control(self):
        return self.application.settings["control"]

    @property
    def cookie_name(self):
        return self.application.settings.get("cookie_name")


    def get_current_user(self):
        accl = self.get_secure_cookie(self.cookie_name)
        if accl:
            return int(accl)


    def open(self):
        if not self.current_user:
            self.close()
            return
        logging.info("WebSocket opened")
        self.control._clients.append(self)
        self.write_message(self.control._opinion)
        for x in self.control._clients:
            x.write_message({"connections":len(self.control._clients)})

    def on_message(self, message):
        message = json_decode(message)
        broadcast = None
        if message.get("opinion") == "increment":
            self.control.increment()
            broadcast = self.control._opinion
        elif message.get("opinion") == "decrement":
            self.control.decrement()
            broadcast = self.control._opinion
        else:
            self.write_message({"echo":"You said: {}".format(message.get("echo"))})
            logging.info(message)
        if broadcast is not None:
            for x in self.control._clients:
                x.write_message(broadcast)

    def on_close(self):
        logging.info("WebSocket closed")
        self.control._clients.remove(self)
