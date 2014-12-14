import unittest
from lecturefb import utils
from sqlalchemy import and_
from lecturefb import model
from lecturefb.control import Control

__author__ = 'OskarBunyan'
class Test(unittest.TestCase):


    def setUp(self):
        db_url="sqlite:///test.db"
        self.control = Control(db_url=db_url, drop_all=True)


    def tearDown(self):
        pass

    def heat_list(self, list):
        if list is not None:
            x = 0
            for heat in list:
                x += heat[1]
            return x


    def testName(self):
        self.control.new_lecture(1, "test", "blah", "2014-12-13 17:00", "2014-12-13 17:50")
        self.control.new_lecture_timeseries(accl = 1, value = 1, lecture_id = 1, when= 1*60, issue_id = 2)
        self.control.new_lecture_timeseries(accl = 1, value = 1, lecture_id = 1, when= 3*60, issue_id = 2)
        self.control.new_lecture_timeseries(accl = 1, value = 1, lecture_id = 1, when= 5*60, issue_id = 2)
        self.control.new_lecture_timeseries(accl = 1, value = -1, lecture_id= 1, when= 10*60, issue_id =2)
        with self.control.session as session:
            lecture = session.query(model.Lecture).get(1)
            heats = list(lecture.lecture_series(10*60))
            sample = [(0, 0)]
            for issue in heats:
                sample.append((issue[0], self.heat_list(lecture.lecture_series(issue[0]))))
            print(sample)



if __name__ == "__main__":
    unittest.main()