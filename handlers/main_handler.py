import tornado
from tornado.web import authenticated


class MainHandler(tornado.web.RequestHandler):

    @property
    def cookie_name(self):
        return self.application.settings.get("cookie_name")




    def get_current_user(self):
        accl = self.get_secure_cookie(self.cookie_name)
        if accl:
            return int(accl)


    @authenticated
    def get(self):
        self.render("index.html")