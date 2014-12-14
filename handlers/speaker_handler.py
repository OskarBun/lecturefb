import tornado
from tornado.web import authenticated


class SpeakerHandler(tornado.web.RequestHandler):

    def initialize(self, page = "index.html"):
        self.page = page



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
        user = self.control._get_user_by_id(self.current_user)
        if(user.get("admin") is not True):
            self.redirect("/")
        else:
            self.render("speaker-index.html")