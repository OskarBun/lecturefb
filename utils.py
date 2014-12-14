import json
from decimal import Decimal    
import datetime
        

class DateTimeEncoder(json.JSONEncoder):
    """Encodes datetimes and Decimals"""
    
    def default(self, obj):  
        try:      
            if hasattr(obj, 'isoformat'):
                return obj.isoformat().replace("T"," ")
            elif isinstance(obj, Decimal):
                return float(obj)
            return json.JSONEncoder.default(self, obj)
        except:
            raise
#            return str(obj)
        
        
def loads(*args, **kwargs):
    return json.loads(*args, **kwargs)


def dumps(o, **kwargs):
    return json.dumps(o, cls=DateTimeEncoder, **kwargs)



def parse_date(value, date_format = "%Y-%m-%dT%H:%M:%S.%fZ"):
    """Returns a Python datetime.datetime object, the input must be in some date ISO format""" 
    result = None
    if input:
        try:
            result = datetime.datetime.strptime(value, date_format)
        except:
            try:
                result =  datetime.datetime.strptime(value,"%Y-%m-%d %H:%M:%S.%f")
            except:
                try:
                    result =  datetime.datetime.strptime(value,"%Y-%m-%d %H:%M:%S")
                except:
                    try:
                        result =  datetime.datetime.strptime(value,"%Y-%m-%d %H:%M")
                    except:
                        result =  datetime.datetime.strptime(value,"%Y-%m-%d")
                
    return result


def parse_unix_time(value):
    return datetime.datetime.fromtimestamp(int(value))

