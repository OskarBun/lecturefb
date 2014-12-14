import tornado
from tornado.web import authenticated


class StudentHandler(tornado.web.RequestHandler):


    @property
    def cookie_name(self):
        return self.application.settings.get("cookie_name")

    @property
    def control(self):
        return self.application.settings["control"]


    def get_current_user(self):
        accl = self.get_secure_cookie(self.cookie_name)
        if accl:
            return int(accl)


    @authenticated
    def get(self):
        self.render("person-index.html")