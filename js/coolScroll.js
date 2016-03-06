

function scrollWatcher(watchers) {


    var targets = [];
    _.each(watchers, function (watcher) {
        var $target = $(watcher.query);
        targets.push($target);
    });

    $(window).bind('scroll', function () {
        inScroll($(window).scrollTop(), watchers, targets);
    });
    $(window).scroll(_.debounce(function () {
        inScroll($(window).scrollTop(), watchers, targets);
    }, 150));


    function inScroll(scroll, watchers, targets) {



        _.each(watchers, function (watcher, index) {

            console.log("scroll: " + scroll);

            var $target = targets[index];

            var scroll_start_px = getRangeValue(watcher.active_scroll.from);
            var scroll_end_px = getRangeValue(watcher.active_scroll.to);

            /* css properties manipulation */
            if (_.is(watcher.css_properties)) {
                _.each(watcher.css_properties, function (property) {

                    var from = property.from.replace(/ /g, '');
                    var to = property.to.replace(/ /g, '');
                    var unity = (from.indexOf("px") != -1) ? "px" : (from.indexOf("em") != -1) ? "em" : (from.indexOf("%") != -1) ? "%" : "";

                    var cssPropName = from.substr(0, from.indexOf(':'));

                    var from_value = from.substr(from.indexOf(':') + 1, from.length).replace(unity, "") * 1;
                    var to_value = to.substr(to.indexOf(':') + 1, to.length).replace(unity, "") * 1;

                    var normalized_property = getNormalizedValues(from_value, to_value, scroll, scroll_start_px, scroll_end_px);

                    //console.log(cssPropName+" : "+normalized_property);
                    $target.css(cssPropName, normalized_property + unity);

                });
            }
            else {

                /* css class manipulation DISCRETE SWITCHING */
                if (_.is(watcher.css_className)) {
                    if (scroll > watcher.active_scroll.from && scroll < watcher.active_scroll.to) {
                        $target.addClass(watcher.css_className);
                    }
                    else {
                        $target.removeClass(watcher.css_className);
                    }
                }
            }
        });
    }


    function getNormalizedValues(propertyFrom, propertyTo, current_scroll, scroll_start_px, scroll_end_px) {
        if (propertyFrom > propertyTo) {
            var gap = propertyFrom - propertyTo;
            var ret = propertyFrom - (gap * scrollPerc(current_scroll, scroll_start_px, scroll_end_px));
            return ret;
        }
        else {
            var gap = propertyTo - propertyFrom;
            var ret = propertyFrom + (gap * scrollPerc(current_scroll, scroll_start_px, scroll_end_px));
            return ret;
        }
    }


    function scrollPerc(current_scroll, scroll_start_px, scroll_end_px) {

        var ret;
        if (current_scroll >= scroll_start_px && current_scroll <= scroll_end_px) {
            var delta = scroll_end_px - scroll_start_px;
            ret = ((100 / delta) * (current_scroll - scroll_start_px) ) / 100;
            ret = Math.round(ret * 100) / 100;
        }
        else {
            if (current_scroll > scroll_end_px) {
                ret = 1;
            }
            else {
                ret = 0.001
            }
        }
        return ret;
    }

    function getRangeValue(value){
        var ret;
        if(_.isNumber(value))
            ret =  value;
        else
            ret = eval(value);
        return ret;
    }

}















