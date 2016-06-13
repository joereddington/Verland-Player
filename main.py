#!/usr/bin/env python

from flask import Flask, render_template

from views import srt_parser
import json

app = Flask(__name__)

@app.route('/player/<srt_file>')
def player(srt_file):
    #srt_file = 'The.Gift.2015.720p.BluRay.x264-DRONES-HI.srt'
    #srt_file = 'Eng.srt'
    srt_file = 'esp.vtt'
    return render_template('player.html', srt_file=srt_file)

@app.route('/srt/<srt_file>', methods=["POST"])
def srt_json(srt_file):
    srt_file = 'static/subtitles/' + srt_file
    return json.dumps({'srts': srt_parser.srt_parser(srt_file)}, ensure_ascii=False)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

