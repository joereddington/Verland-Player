(function(SRT_PLAYER, $, undefined) {

    var _content = undefined;
    var _srt_file = undefined;

    var _panel_list = function(element) {

        this.node = function(element) {
            this.next = null;
            this.prev = null;
        }

        var length = 0;
        var head = null;
        var tail = null;

    }

    function _get_content(srt_file) {
        var rslt = true;
        if (srt_file == undefined) {
            return false
        }
        var url = '/srt/' + srt_file;
        $.ajax({
            type: 'POST',
            //url: '/srt/' + 'hi',
            url: url,
            dataType: 'json',
            async: false,
            success: function(rslt) {
                _content = rslt;
                rslt = true
            }
        });
        return rslt
    }

    function _check_get_content(file) {
        var rslt = _get_content(file);
        if (! rslt) {
            alert('cannot retrieve srt file.');
            return false
        }
        return true
    }

    SRT_PLAYER.initialize = function(file) {

        if (! _check_get_content(file)) {
            return
        }
        alert(_content.srts);

    }


}(window.SRT_PLAYER = window.SRT_PLAYER || {}, $));
