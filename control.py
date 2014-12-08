import logging
import datetime
from sqlalchemy.engine import create_engine, reflection
from sqlalchemy.orm.session import sessionmaker
from sqlalchemy.schema import MetaData, ForeignKeyConstraint, DropConstraint,\
	DropTable, Table
from sqlalchemy.sql.expression import and_
from lecturefb import model


class Control(object):
	
	_SESSION_EXTENSIONS_ = []
	_SESSION_KWARGS_ = {"autoflush":False}


	def __init__(self, db_url, echo=False, drop_all=False):
		'''
		Constructor
		'''
		self._clients = []
		self._pending = []
		self._opinion = {"opinion":0}
		
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
	
	def increment(self):
		self._opinion["opinion"] = self._opinion["opinion"] + 1

	def decrement(self):
		self._opinion["opinion"] = self._opinion["opinion"] - 1

	def get_user_by_id(self, id):
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
															 model.Person.password==password)).first()
			if person is None:
				person = session.query(model.Person).filter(model.Person.email==email).first()
				if person is not None:
					raise Exception("Email or Password incorrect")
				person = model.Person(email = email, password = password, admin = False)
				session.add(person)
				session.commit()
			return str(person.id)

	def new_lecture(self, accl, title, description, starts):
		with self.session as session:
			starts = datetime.datetime.strptime(starts, "%Y-%m-%d %H:%M")
			lecture = session.query(model.Lecture).filter(and_(model.Lecture.title==title,
															   model.Lecture.starts==starts,
															   model.Lecture.speaker_id==accl)).first()
			if lecture is not None:
				raise Exception("Lecture already exists")
			lecture = model.Lecture(title = title, description = description, starts = starts, speaker_id = accl)
			session.add(lecture)
			session.commit()
			return {"id": lecture.id}



		