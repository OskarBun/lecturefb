import unittest
from lecturefb.control import Control
from lecturefb import model


class Test(unittest.TestCase):


	def setUp(self):
		db_url="sqlite:///test.db"
		self.control = Control(db_url=db_url, drop_all=True)

	def tearDown(self):
		pass


	def testName(self):
		with self.control.session as session:
			oskar = model.Person(email = "oskar@spddo.co.uk", name = "Oskar")
			dash = model.Person(email = "dooze", name = "Dash")
			session.add_all([oskar, dash])
			session.commit()
		with self.control.session as session:
			oskar = session.query(model.Person).filter(model.Person.name=="Oskar").first()
			self.assertEqual(oskar.name, "Oskar")

if __name__ == "__main__":
	unittest.main()