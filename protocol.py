__author__ = 'OskarBunyan'

class Protocol(object):

    def lecture_to_json(self, lecture):
        return {
            "id": lecture.id,
            "_type": "Lecture",
            "title": lecture.title,
            "starts": lecture.starts,
            "ends": lecture.ends,
            "description": lecture.description,
            "speaker_id": lecture.speaker_id
        }

    def transcript_to_json(self, comment):
        return {
            "id": comment.id,
            "_type": "Transcript",
            "lecture_id": comment.lecture_id,
            "when": comment.when,
            "comment": comment.comment,
            "type": comment.type,
            "person_id": comment.person_id,
            "person_email": comment.person.email
        }

    def timeseries_to_json(self, timeseries):
        return {
            "id": timeseries.id,
            "_type": "Lecture",
            "type": timeseries.issue.type,
            "lecture_id": timeseries.lecture_id,
            "when": timeseries.when,
            "value": timeseries.value,
            "person_id": timeseries.person_id
        }