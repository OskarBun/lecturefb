import logging
import tornado.websocket
from tornado.escape import json_decode

from lecturefb import utils


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
        self.user_record = self.control.get_user_by_id(self.current_user)
        logging.info("WebSocket opened")
        self.control._clients.append(self)
        self.write_message({"user": self.user_record})
        self.write_message(self.control._opinion)
        for x in self.control._clients:
            x.write_message({"connections":len(self.control._clients)})


    def on_message(self, raw_message):
        '''
        message = json_decode(message)
        broadcast = None
        if message.get("opinion") == "increment":
            self.control.increment()
            broadcast = self.control._opinion
        elif message.get("opinion") == "decrement":
            self.control.decrement()
            broadcast = self.control._opinion
        elif message.get("echo"):
            broadcast = {"echo":"{} said: {}".format(self.user_record["email"],
                                                     message["echo"])}
        elif message.get("new_lecture"):
            lecture = message["new_lecture"]
            starts = datetime.strptime(lecture["datetime"], "%Y-%m-%d %H:%M")
            try:
                self.control.new_lecture(lecture["title"], lecture["description"], starts, self.user_record["id"])
                self.write_message({"success":"Lecture created!"})
            except Exception as ex:
                self.write_message({"error": str(ex)})

        if broadcast is not None:
            for x in self.control._clients:
                x.write_message(broadcast)
        '''

        message = utils.loads(raw_message)
        action = message.get("action")

        try:
            logging.info(message)
            args = message.get("args", {})

            method = getattr(self.control, action)

            result = method(self.current_user, **args)
            self.write_message(utils.dumps({"result": result,
                                            "response_id": message.get("request_id")}))

        except Exception as ex:
            logging.exception(ex)
            error = str(ex)
            self.write_message({"result": None,
                                "error" : error,
                                "response_id": message.get("request_id"),
                                })

    def on_close(self):
        logging.info("WebSocket closed")
        self.control._clients.remove(self)
