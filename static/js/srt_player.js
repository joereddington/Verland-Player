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
    //holder for sub hide setTimeout
    var _hide_timeout; 
    //milliseconds
    var _t_count = 0;
    //ajax result
    var _get_sub_rslt = false;
    //end time
    var _end_time;
    //slidebar step value
    var _slide_step = 1;
    //var _slide = $('#slidebar'); 

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
        //end of time
        if (_timer >= _end_time) {
            _time = _end_time;
            _update_clock_display();
            clearInterval(_t_intvl);
            clearTimeout(_sub_tout);
            clearTimeout(_check_substrt);
            return;
        }
        //ff and rewind move timecount off hundreds places.
        var roundup = Math.ceil((_t_count + 10) / 100) * 100;
        if ((roundup % 1000) == 0) {
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
        clearTimeout(_hide_timeout);
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

    function _set_hide() {
        //removes slide text after appropriate time;
        //we'll keep just a fraction longer than specified time
        //it will be hidden by next sub if next sub pops up first
        var sub = _content[_index];
        var t_start = _time_from_timestamp(sub.tstart); 
        var t_stop = _time_from_timestamp(sub.tstop); 
        var intvl = t_stop.getTime() - t_start.getTime();
        clearTimeout(_hide_timeout);
        _hide_timeout = setTimeout(function() {
            $('#subtitle-text').empty();
        }, intvl + 100);
    };

    function _advance_subs() {
        var sub = _content[_index + 1];
        var t_start = _time_from_timestamp(sub.tstart); 
        var t_stop = _time_from_timestamp(sub.tstop); 
        var intvl = t_stop.getTime() - t_start.getTime();
        function do_interval() {
            _sub_tout = setTimeout(function() {
                clearTimeout(_hide_timeout);
                $('#subtitle-text').empty();
                return _advance_subs();
            }, intvl);
        }
        function check_start() {
            //start sub slightly early if possible to compensate for
            //render time.
            if (_t_count + 140 >= t_start.getTime()) {
                $.when(_advance_frame()).done(function() {
                    _set_hide();
                });
                return do_interval();
            }
            else{
                _check_substrt = setTimeout(check_start, 50);
            }
        }
        check_start();
    };

    function _set_end_time() {
        var last = _content[_content.length - 1];
        _end_time = _time_from_timestamp(last.tstop); 
    };

    function _get_content(srt_file) {
        //var rslt = true;
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
                _content = rslt.subs;
                if (_content != undefined) {
                    _get_sub_rslt = true
                    _set_end_time();
                }
            }
        });
        return _get_sub_rslt;
    };

    function _advance_frame() {
        _index += 1;
        if (_index > _content.length - 1) {
            _index -= 1;
            return
        }
        _refresh_display();
        _time_move_slide();
    };

    function _regress_frame() {
        _index -= 1;
        if (_index < 0) {
            _index = 0;
            return
        }
        _refresh_display();
        _time_move_slide();
    };

    function _update_timer_time() {
        //manual update of timer based on sub start time for current
        var sub = _content[_index];
        _timer = _time_from_timestamp(sub.tstart);
        _t_count = _timer.getTime();
        _update_clock_display();
    };

    function _update_text(text_array) {
        //replaces subtitle text
        var html_txt = ''
        for (var i = 0, l = text_array.length; i < l; i ++) {
            var v = text_array[i];
            html_txt += '<div>' + v + '</div>';
            //html_txt += '<br>';
        }
        $('#subtitle-text').empty().append(html_txt);
    };

    function _time_from_timestamp(timetext) {
        //returns javascript Date object from srt style text
        //only hours, minutes seconds and milliseconds are important
        //example: 00:01:30,082
        var splt = timetext.split('.');
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
        $('#control-box .fa').css('opacity', '1').removeClass('button_current');
        $(button).css('opacity', '.3').addClass('button_current');
    };

    function _stop_player() {
        _stop_timer();
        _pause_sequence();
        _t_count = 0;
        _index = -1;
        $('#subtitle-text').empty();
    };

    function _time_move_slide() {
        //moves the slidebar based on step increment
        if ((_index % _slide_step) == 0) {
            $('#slidebar').val(_index);
        }
    };

    function _initialize_slide() {
        //set slider bar intervals and bind sliding to sub update.
        //if there are lots of slides step by multiples on slide.
        var num_slides = _content.length;
        var _slide_step = Math.ceil(num_slides / 100);
        var max = num_slides;
        $('#slidebar').attr('value', 0);
        $('#slidebar').val(0);
        $('#slidebar').attr('max', max);
        $('#slidebar').attr('step', _slide_step);
        $('#slidebar').on('change', function() {
            //advance_frame will add one on index;
            _index = $(this).val() - 1;
            $.when(_advance_frame()).then(function() {
                _update_timer_time();
            });
        });
    };

    //public methods
    SRT_PLAYER.initialize = function(file) {
        if (! _check_get_content(file)) {
            alert('cannot load subtitles');
        }
        _initialize_slide(); 
    };

    SRT_PLAYER.pause = function() {
        _pause_sequence();
        _pause_timer();
        _mark_current_button($('#pause-icon'));
    };

    SRT_PLAYER.play = function() {
        var button = $('#play-icon');
        if ($(button).hasClass('button_current')) {
            return;
        }
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
        _mark_current_button($(button));
    };

    SRT_PLAYER.step = function(direction) {
        //fwd and rewind. will pause first
        SRT_PLAYER.pause();
        if (direction == 'fwd') {
            _advance_frame();
        }
        else if (direction == 'back') {
            _regress_frame();
        }
        _update_timer_time();
    };

    SRT_PLAYER.stop = function() {
        _stop_player();
        _mark_current_button($('#stop-icon'));
    };

}(window.SRT_PLAYER = window.SRT_PLAYER || {}, $));
