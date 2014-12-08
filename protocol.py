__author__ = 'OskarBunyan'

class Protocol(object):

    def lecture_to_json(self, lecture):
        return {
            "id": lecture.id,
            "_type": "Lecture",
            "title": lecture.title,
            "starts": lecture.starts,
            "description": lecture.description,
            "speaker_id": lecture.speaker_id
        }