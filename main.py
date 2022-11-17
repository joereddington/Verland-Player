#!/usr/bin/env python

from flask import Flask, render_template, request

#from views import srt_parser
from views import srt_parser, srt_list
import json

app = Flask(__name__)

@app.route('/')
def index():
    subs = srt_list.srt_list()
    return render_template('index.html', subs=subs)

@app.route('/player/<srt_file>')
def player(srt_file):
    return render_template('player.html', srt_file=srt_file)

@app.route('/srt/<srt_file>', methods=["POST"])
def srt_json(srt_file):
    print("They have called this function from inside the js")
    hash_ = request.form['hash']
    print("Now the hash")
    print(hash)
    if hash_ == 'none':
        hash_ = None
    srt_file = 'static/subtitles/' + srt_file
    print("srt_file" +srt_file)
    return srt_parser.srt_parser(srt_file, hash_);

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000, debug=True)



