import calendar
import logging
import datetime
from sqlalchemy.engine import create_engine, reflection
from sqlalchemy.orm.session import sessionmaker
from sqlalchemy.schema import MetaData, ForeignKeyConstraint, DropConstraint,\
    DropTable, Table
from sqlalchemy.sql.expression import and_
from lecturefb import model
from lecturefb import utils
from lecturefb.protocol import Protocol
import cmath

class Control(Protocol):

    _SESSION_EXTENSIONS_ = []
    _SESSION_KWARGS_ = {"autoflush":False}


    def __init__(self, db_url, echo=False, drop_all=False):
        '''
        Constructor
        '''
        self._clients = []
        self._pending = []

        logging.info("connecting to %s",db_url)
        params = dict(echo=echo)
        if 'mysql' in db_url:
            params['encoding']='utf-8'
            params['pool_recycle']=3600
            params['isolation_level']='READ COMMITTED'
        self._engine = create_engine(db_url, **params)
        self._Session = sessionmaker(bind=self._engine,
                                      extension=self._SESSION_EXTENSIONS_,
                                      **self._SESSION_KWARGS_)
        if drop_all is True:
            with self.session as session:
                self._drop_all_(session)
        self._create_all_()
        if drop_all is True:
            with self.session as session:
                session.add(model.Issue(id=1, name="repeat idea", type = model.Issue.TYPE[0]))
                session.add(model.Issue(id=2, name="speed", type = model.Issue.TYPE[1]))
                session.commit()



    @property
    def session(self):
        '''
            returns a self closing session for use by with statements
        '''
        session = self._Session()
        class closing_session:
            def __enter__(self):
                return session
            def __exit__(self, _type, value, traceback):
                session.close()
        return closing_session()

    def _create_all_(self):
        model.Base.metadata.create_all(self._engine)  # @UndefinedVariable

    def _drop_all_(self, session):

        inspector = reflection.Inspector.from_engine(session.bind)

        # gather all data first before dropping anything.
        # some DBs lock after things have been dropped in
        # a transaction.

        metadata = MetaData()

        tbs = []
        all_fks = []

        for table_name in inspector.get_table_names():
            fks = []
            for fk in inspector.get_foreign_keys(table_name):
                if not fk['name']:
                    continue
                fks.append(
                    ForeignKeyConstraint((),(),name=fk['name'])
                    )
            t = Table(table_name,metadata,*fks)
            tbs.append(t)
            all_fks.extend(fks)

        for fkc in all_fks:
            session.execute(DropConstraint(fkc))

        for table in tbs:
            session.execute(DropTable(table))

        session.commit()

    def _flush(self, error = None):
        if not error:
            for message in self._pending:
                for client in self._clients:
                    client.broadcast(message)
        self._pending.clear()

    def _broadcast(self, message):
        self._pending.append(utils.dumps(message))

    def _get_user_by_id(self, id):
        with self.session as session:
            person = session.query(model.Person).get(id)
            return {
                "id": person.id,
                "email": person.email,
                "admin": person.admin
            }

    def _login(self, email, password):
        with self.session as session:
            person = session.query(model.Person).filter(and_(model.Person.email==email,
                                                             model.Person.password==model.Person.salt_n_hash(password))).first()
            if person is None:
                person = session.query(model.Person).filter(model.Person.email==email).first()
                if person is not None:
                    raise Exception("Email or Password incorrect")
                person = model.Person(email = email, password = password, admin = False)
                session.add(person)
                session.commit()
            return str(person.id), person.admin

    def _issue_impact(self, timeseries):
        delta = calendar.timegm(datetime.datetime.now().timetuple()) - calendar.timegm((timeseries.lecture.starts + datetime.timedelta(seconds = timeseries.when)).timetuple())
        delta= delta/60 #from seconds to minutes
        decay_constant = 5 #rate of exponential decay
        impact = timeseries.value*cmath.e**(-delta/decay_constant)
        return impact

    def _get_lecture_heat(self, accl, lecture_id):
        with self.session as session:
            times = session.query(model.Timeseries).filter(and_(model.Timeseries.lecture_id==1,
                                                                model.Timeseries.issue_id==2,
                                                                model.Timeseries.person_id!=0))
            heat = 0
            for t in times:
                heat += self._issue_impact(t)
            return heat

    def new_lecture(self, accl, title, description, starts, ends):
        with self.session as session:
            starts = datetime.datetime.strptime(starts, "%Y-%m-%d %H:%M")
            ends = datetime.datetime.strptime(ends, "%Y-%m-%d %H:%M")
            if starts > ends:
                raise Exception("You must start before you can finish")
            lecture = session.query(model.Lecture).filter(and_(model.Lecture.title==title,
                                                               model.Lecture.starts==starts,
                                                               model.Lecture.speaker_id==accl)).first()
            if lecture is not None:
                raise Exception("Lecture already exists")
            lecture = model.Lecture(title = title, description = description, starts = starts, ends = ends, speaker_id = accl)
            session.add(lecture)
            session.commit()
            self._broadcast({"signal": "new_lectured", "message": self.lecture_to_json(lecture)})
            return {"id": lecture.id}

    def remove_lecture(self, accl, lecture_id):
        with self.session as session:
            lecture = session.query(model.Lecture).filter(model.Lecture.id == lecture_id)
            if lecture is None:
                raise Exception("That lecture Doesn't exist")
            instance = lecture.first()
            session.query(model.Transcript).filter(model.Transcript.lecture_id == lecture_id).delete()
            session.query(model.Timeseries).filter(model.Timeseries.lecture_id == lecture_id).delete()
            lecture.delete()
            session.commit()
            self._broadcast({"signal": "lecture_deleted", "message": self.lecture_to_json(instance)})
            return {}

    def filter_lectures(self, accl, speaker_id = None, before_date = None, after_date = None):
        with self.session as session:
            lectures = session.query(model.Lecture)
            if speaker_id:
                lectures = lectures.filter(model.Lecture.speaker_id == speaker_id)
            if before_date and after_date:
                lectures = lectures.filter(model.Lecture.starts <= before_date)
                lectures = lectures.filter(model.Lecture.ends >= after_date)
            else:
                if before_date:
                    before_date = datetime.datetime.strptime(before_date, "%Y-%m-%d %H:%M")
                    lectures = lectures.filter(model.Lecture.starts >= before_date)
                if after_date:
                    after_date = datetime.datetime.strptime(after_date, "%Y-%m-%d %H:%M")
                    lectures = lectures.filter(model.Lecture.ends <= after_date)
            if after_date:
                lectures = lectures.order_by(model.Lecture.starts.desc())
            else:
                lectures = lectures.order_by(model.Lecture.starts)
            return [self.lecture_to_json(l) for l in lectures]

    def new_lecture_transcript(self, accl, lecture_id, comment, type):
        with self.session as session:
            when = datetime.datetime.today()
            comment = model.Transcript(lecture_id=lecture_id, when=when, comment=comment, type=type, person_id=accl)
            session.add(comment)
            session.commit()
            self._broadcast({"signal": "lecture_commented", "message": self.transcript_to_json(comment)})
            return {"id": comment.id}


    def lecture_transcripts(self, accl, lecture_id, type, person_id = None):
        with self.session as session:
            comments = session.query(model.Transcript).filter(and_(model.Transcript.lecture_id==lecture_id,
                                                                   model.Transcript.type==type))
            if person_id is not None:
                comments = comments.filter(model.Transcript.person_id==person_id)
            return [self.transcript_to_json(t) for t in comments]

    def new_lecture_issue(self, accl, value, lecture_id, when, issue_id):
        heat = self._get_lecture_heat(accl, lecture_id)
        with self.session as session:
            timeseries = model.Timeseries(issue_id = issue_id, lecture_id = lecture_id, when = when, person_id = accl, value=heat+value)
            session.add(timeseries)
            session.commit()
            self._broadcast({"signal":"lecture_issued", "message":{"lecture_id":lecture_id, "when": when, "value":heat+value}})
            return {"issue":value}

    def lecture_timeseries(self, accl, lecture_id):
        with self.session as session:
            timeseries = session.query(model.Timeseries).filter(model.Timeseries.lecture_id==lecture_id)
            return [self.timeseries_to_json(t) for t in timeseries]
