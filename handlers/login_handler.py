import tornado


class LoginHandler(tornado.web.RequestHandler):

	@property
	def control(self):
		return self.application.settings["control"]

	@property
	def cookie_name(self):
		return self.application.settings.get("cookie_name")


	def get(self, error = None):
		email = self.get_argument("email", default = None)
		self.render("login.html",
					email = email,
					error = error)

	def post(self):
		try:
			email = self.get_argument("email")
			password = self.get_argument("password")
			accl, admin = self.control._login(email, password)
			self.set_secure_cookie(self.cookie_name, accl)
			if admin is True:
				self.redirect("/speaker")
			else:
				self.redirect("/")
		except Exception as ex:
			self.get(str(ex))

