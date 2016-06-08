#!/usr/bin/env python

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return 'it worked'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    
