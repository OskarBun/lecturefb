from sqlalchemy.types import String, Integer, Numeric, DateTime, Date, Time, Enum, Boolean, Text
from sqlalchemy.schema import Table, Column, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative.api import declared_attr, has_inherited_table, declarative_base
import re


#see: http://docs.sqlalchemy.org/en/rel_0_8/orm/extensions/declarative.html#augmenting-the-base

class _Base_(object):
    ''' provides default tablename and table_args properties'''

    __table_args__ = {'mysql_engine': 'InnoDB'}

    @declared_attr
    def __tablename__(self):
        if has_inherited_table(self):
            return None
        name = self.__name__
        return (name[0].lower() +
            re.sub(r'([A-Z])', lambda m:'_' + m.group(0).lower(), name[1:]))

Base = declarative_base(cls=_Base_)


class Issue(Base):

    TYPE = ['toggle','heat']

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    type = Column(Enum(*TYPE))


class Lecture(Base):

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(String(255))
    speaker_id = Column(Integer, ForeignKey('person.id'))
    speaker = relationship('Person', uselist=False,
        primaryjoin='Lecture.speaker_id==Person.id', remote_side='Person.id',
        back_populates='lectures')
    starts = Column(DateTime)


class Person(Base):

    id = Column(Integer, primary_key=True)
    email = Column(String(255))
    password = Column(String(255))
    admin = Column(Boolean())
    lectures = relationship('Lecture', uselist=True,
        primaryjoin='Lecture.speaker_id==Person.id', remote_side='Lecture.speaker_id',
        back_populates='speaker')


class Timeseries(Base):

    id = Column(Integer, primary_key=True)
    issue_id = Column(Integer, ForeignKey('issue.id'))
    issue = relationship('Issue', uselist=False,
        primaryjoin='Timeseries.issue_id==Issue.id', remote_side='Issue.id')
    value = Column(Numeric(36,12))
    lecture_id = Column(Integer, ForeignKey('lecture.id'))
    lecture = relationship('Lecture', uselist=False,
        primaryjoin='Timeseries.lecture_id==Lecture.id', remote_side='Lecture.id')
    when = Column(Integer)
    person_id = Column(Integer, ForeignKey('person.id'))
    person = relationship('Person', uselist=False,
        primaryjoin='Timeseries.person_id==Person.id', remote_side='Person.id')


class Transcript(Base):

    TYPE = ['formal','informal']

    id = Column(Integer, primary_key=True)
    lecture_id = Column(Integer, ForeignKey('lecture.id'))
    lecture = relationship('Lecture', uselist=False,
        primaryjoin='Transcript.lecture_id==Lecture.id', remote_side='Lecture.id')
    when = Column(DateTime)
    comment = Column(String(255))
    type = Column(Enum(*TYPE))
    person_id = Column(Integer, ForeignKey('person.id'))
    person = relationship('Person', uselist=False,
        primaryjoin='Transcript.person_id==Person.id', remote_side='Person.id')

