#!/usr/bin/env python

import re
import codecs
import json
from hashlib import md5

def _get_hash(file_content):
    '''Returns md5 has from text string
    Args:
        file_content: text string.
    Returns: md5 hash string.
    '''
    hashf = md5()
    hashf.update(file_content)
    return hashf.hexdigest()

def _open_endoded(file_):
    '''Opens a file with appropriate encoding.
    Will attempt to encode utf-8.
    Args:
        file_: a file location.
    Returns:
        file contents (text)
        or 
        Boolean (False) if file can't be opened.
    '''
    encodes = ['utf-8', 'windows-1252', 'windows-1250', 'cp1250']
    #find out what kind of file is is and open like that
    can_open = False
    for encode in encodes:
        try:
            text = codecs.open(file_, 'r', encode).read()
            can_open = True
            file_encoding = encode
        except:
            pass

    if not can_open:
        return False

    try:
        text = text.decode(file_encoding)
    except:
        pass

    try:
        text = text.encode('utf8')
    except:
        text = text

    return text

def srt_parser(file_, hash_=None):
    '''Parses a srt file.
    Args:
        file_: path to srt file to parse.
        recheck: Boolean. if this a recheck stop at reading file

    Returns: JSON or Boolean (False) if file can't be read.
        JSON keys:
            srts:
            List of dictionaries each with following keys:
                    'tstart':str: time start
                    'tstop':str: time stop
                    'number':str: subtitle number
                    'text':list: list of text strings for subtitle.
            hash: md5 hash of file.
            file_name: name of file.
    '''
    out = {'subs': []}

    text = _open_endoded(file_)
    print("1")
    print(text)

    if not text:
        return False

    out['hash'] = _get_hash(text)

    if out['hash'] == hash_:
        return json.dumps({'recheck': 'current'})

    if hash_:
        out['recheck'] = 'yes'
    else:
        out['recheck'] = 'no'
    print(type(text))
    text = text.split(b'\n')
    print("2")
    print(text)
    print("3")

    count = 0
    joe_count=0
    tmp = {'text': []}
    print("4")
    print(len(text))
    for line in text:
        joe_count+=1
        line=line.decode()
        print("3.1")
        print(line)
        print(len(line))
        print(joe_count)
        #vtt files have this phrase at begining
        if 'WEBVTT' in line:
            continue

        line = line.strip()

        #blank lines between sub entries
        #if there is a sub with blank lines we won't include it.
        #nothing will show during that period which is expected.
        if len(line) <1: 
            count = 0
            if not False in [i in tmp for i in ['tstart', 'tstop', 'text', 'number']]:
                out['subs'].append(tmp)
            print("XXX HERE") 
            tmp = {'text': []}
            continue

        #subtitle number line
        if count == 0:
            try:
                line = str(int(line))
            except ValueError:
                #remove extra characters from sub number line
                number = re.search(r'\d+', line)
                if number:
                    line = number.group()
                else:
                    count += 1
                    continue
            except:
                #if there is another problem with reading line, keep going
                count += 1
                continue

            tmp['number'] = line

        #time from-to line
        elif count == 1:
            try:
                timeline = line.split('-->')
                assert len(timeline) == 2
                tst = timeline[0].strip()
                tsp = timeline[1].strip()
                assert len(tst.split(':')) == 3
                assert len(tsp.split(':')) == 3
                assert len(tst.split('.')) == 2
                assert len(tsp.split('.')) == 2
                tmp['tstart'] = tst
                tmp['tstop'] = tsp
            except:
                #if time is not in expected format skip this sub entry
                count += 1
                continue

        #text line. there can be more than one
        elif count > 1:
            tmp['text'].append(line)

        count += 1
    print("n-1")
    print(json.dumps(out))
    return json.dumps(out, ensure_ascii=False)


if __name__ == '__main__':
    content = parser('../static/subtitles/The.Gift.2015.720p.BluRay.x264-DRONES-HI.srt')
    for line in content:
        print(line)

