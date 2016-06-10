(function(SRT_PLAYER, $, undefined) {

    var _content = undefined;
    var _srt_file = undefined;
    var _index = 0;
    var _timer;
    var _t_intvl;
    //milliseconds
    var _t_count = 0;

    function _start_timer() {
        _timer = _timer || new Date(1971, 0, 1, 0, 0, 0);
        _t_count = _timer.getTime();
        _t_intvl = setInterval(_advance_timer, 100);
    }

    function _advance_timer() {
        _t_count += 100;
        _timer.setTime(_t_count);
        if ((_t_count % 1000) == 0) {
            _update_clock_display();
        }
    }

    function _stop_timer() {
        clearInterval(_t_intvl);
        _timer = new Date(1971, 0, 1, 0, 0, 0);
        _update_clock_display();
    }

    function _pause_timer() {
        clearInterval(_t_intvl);
    }

    function _update_clock_display() {
        var minutes = _timer.getMinutes(); 
        var seconds = _timer.getSeconds();
        if (seconds < 10) {
            seconds = '0' + seconds;
        };
        minutes += _timer.getHours() * 60;
        var t = minutes + ':' + seconds;
        $('#current-time').text(t);
    }

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

    function _content_at_index() {
        return _content[_index];
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

    function _update_text(text_array) {
        //replaces subtitle text
        var html_txt = ''
        for (var i = 0, l = text_array.length; i < l; i ++) {
            var v = text_array[i];
            html_txt += '<div>' + v + '</div>';
            html_txt += '<br>';
        }
        $('#subtitle-text').empty().append(html_txt);
    }

    function _time_from_timestamp(timetext) {
        //returns javascript Date object from srt style text

    }

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
    
    //public methods
    SRT_PLAYER.initialize = function(file) {

        if (! _check_get_content(file)) {
            return
        }
        _refresh_display();
        _start_timer();
        //alert(_content.srts);

    };

}(window.SRT_PLAYER = window.SRT_PLAYER || {}, $));
