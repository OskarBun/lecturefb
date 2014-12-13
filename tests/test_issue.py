import calendar
import unittest
import datetime
import cmath
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

    def _issue_impact(self, timeseries):
        delta = calendar.timegm(datetime.datetime.now().timetuple()) - calendar.timegm((timeseries.lecture.starts + datetime.timedelta(minutes = timeseries.when)).timetuple())
        delta= delta/60 #from seconds to minutes
        decay_constant = 5 #rate of exponential decay
        impact = timeseries.value*cmath.e**(-delta/decay_constant)
        return impact


    def testName(self):
        self.control.new_lecture(1, "test", "blah", "2014-12-13 13:00", "2014-12-13 13:50")
        with self.control.session as session:
            timeseries = model.Timeseries(issue_id = 2, lecture_id = 1, when = 1, value=1)
            timeseries2 = model.Timeseries(issue_id = 2, lecture_id = 1, when = 3, person_id = 1, value=1)
            timeseries3 = model.Timeseries(issue_id = 2, lecture_id = 1, when = 5, person_id = 1, value=1)
            session.add(timeseries)
            session.add(timeseries2)
            session.add(timeseries3)
            session.commit()
        with self.control.session as session:
            times = session.query(model.Timeseries).filter(and_(model.Timeseries.lecture_id==1,
                                                                model.Timeseries.issue_id==2,
                                                                model.Timeseries.person_id))
            heat = 0
            for t in times:
                heat += self._issue_impact(t)
            print(heat)

if __name__ == "__main__":
    unittest.main()