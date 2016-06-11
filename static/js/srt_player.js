(function(SRT_PLAYER, $, undefined) {

    var _content = undefined;
    var _srt_file = undefined;
    var _index = -1;
    var _timer;
    //holder for timer setInterval
    var _t_intvl;
    //holder for sub advance setTimeout
    var _sub_tout;
    //holder for start time timeout
    var _check_substrt;
    //milliseconds
    var _t_count = 0;

    function _start_timer() {
        _timer = _timer || new Date(1971, 0, 1, 0, 0, 0);
        _t_count = _timer.getTime();
        _interval_timer();
    };

    function _interval_timer() {
        _t_intvl = setInterval(_advance_timer, 100);
    };

    function _advance_timer() {
        _t_count += 100;
        _timer.setTime(_t_count);
        if ((_t_count % 1000) == 0) {
            _update_clock_display();
        }
    };

    function _stop_timer() {
        clearInterval(_t_intvl);
        _timer = new Date(1971, 0, 1, 0, 0, 0);
        _update_clock_display();
    };

    function _pause_timer() {
        clearInterval(_t_intvl);
    };

    function _pause_sequence() {
        clearTimeout(_sub_tout);
        clearTimeout(_check_substrt);
    };

    function _update_clock_display() {
        var minutes = _timer.getMinutes(); 
        var seconds = _timer.getSeconds();
        if (seconds < 10) {
            seconds = '0' + seconds;
        };
        minutes += _timer.getHours() * 60;
        var t = minutes + ':' + seconds;
        $('#current-time').text(t);
    };

    function _advance_subs() {
        //todo stop if length
        var sub = _content[_index + 1];
        var t_start = _time_from_timestamp(sub.tstart); 
        var t_stop = _time_from_timestamp(sub.tstop); 
        var intvl = t_stop.getTime() - t_start.getTime();
        function do_interval() {
            _sub_tout = setTimeout(function() {
                $('#subtitle-text').empty();
                return _advance_subs();
            }, intvl);
        }
        function check_start() {
            //start sub slightly early if possible to compensate for
            //render time. 
            if (_t_count + 140 >= t_start.getTime()) {
                _advance_frame();
                return do_interval();
            }
            else{
                _check_substrt = setTimeout(check_start, 50);
            }
        }
        check_start();
    };

    function _get_content(srt_file) {
        var rslt = true;
        if (srt_file == undefined) {
            return false
        }
        var url = '/srt/' + srt_file;
        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'json',
            async: false,
            success: function(rslt) {
                _content = rslt.srts;
                rslt = true
            }
        });
        return rslt
    };

    function _advance_frame() {
        _index += 1;
        if (_index > _content.length - 1) {
            _index -= 1;
            return
        }
        _refresh_display();
    };

    function _regress_frame() {
        _index -= 1;
        if (_index < 0) {
            _index -= 0;
            return
        }
        _refresh_display();
    };

    function _update_timer_time() {
        //manual update of timer based on sub start time
    };

    function _update_text(text_array) {
        //replaces subtitle text
        var html_txt = ''
        for (var i = 0, l = text_array.length; i < l; i ++) {
            var v = text_array[i];
            html_txt += '<div>' + v + '</div>';
            html_txt += '<br>';
        }
        $('#subtitle-text').empty().append(html_txt);
    };

    function _time_from_timestamp(timetext) {
        //returns javascript Date object from srt style text
        //only hours, minutes seconds and milliseconds are important
        //example: 00:01:30,082
        var splt = timetext.split(',');
        var millisec = +splt[1];
        var hms = splt[0].split(':');
        var hrs = +hms[0];
        var min = +hms[1];
        var sec = +hms[2];
        return new Date(1971, 0, 1, hrs, min, sec, millisec);
    };

    function _refresh_display() {
        //refreshes based on current index
        var node = _content[_index];
        _update_text(node.text);
    };

    function _check_get_content(file) {
        var rslt = _get_content(file);
        if (! rslt) {
            alert('cannot retrieve srt file.');
            return false
        }
        return true
    };

    function _mark_current_button(button) {
        //change css on currently active button
        $('#control-box .fa').css('opacity', '1');
        $(button).css('opacity', '.3');
    };
    
    //public methods
    SRT_PLAYER.initialize = function(file) {
        if (! _check_get_content(file)) {
            alert('cannot load subtitles');
            //return
        }
        var len = _content.length;
        alert(len);
        //_start_timer();
        //_advance_subs();
    };

    SRT_PLAYER.pause = function() {
        _pause_sequence();
        _pause_timer();
        _mark_current_button($('#pause-icon'));
    };

    SRT_PLAYER.play = function() {
        //_start_timer();
        if (_t_count > 0) {
            //timer has started and was paused
            _interval_timer();
        }
        else {
            //initial start
            _start_timer();
        }
        _advance_subs();
        _mark_current_button($('#play-icon'));
    };

    SRT_PLAYER.fwd = function() {
    };

    SRT_PLAYER.back = function() {
    };

    SRT_PLAYER.stop = function() {
    };

}(window.SRT_PLAYER = window.SRT_PLAYER || {}, $));
