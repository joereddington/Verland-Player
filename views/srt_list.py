#!/usr/bin/env python
import os
import time

def srt_list():
    '''Returns a list of sorted sub files with times'''
    out = []
    path = 'static/subtitles'
    subs = os.listdir(path)
    for s in sorted(subs):
        file_ = os.path.join(path, s)
        time_modified = time.ctime(os.path.getmtime(file_))
        out.append((s, time_modified))
    return out

if __name__ == '__main__':
    srt_list()


