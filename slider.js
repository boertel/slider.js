(function ($) {
    jQuery.fn.slider = function () {
        var slider = {
            positions: [],
            width: 0,
            current: 0,
            length: 0,
            elements: {
                container: $('.slides'),
                pagination: $('.pagination'),
                next: $('.next'),
                previous: $('.previous')
            },
            active: 'active',
            duration: 450,
            timeout_duration: 1000,
            callback: {},
            auto: false,
            key: {
                enable: true,
                previous: [37],
                next: [39]
            },
            hide: true,

            init: function (container) {
                if (typeof container !== undefined) {
                    slider.elements.container = $('.slides', container);
                    slider.elements.next = $('.next', container);
                    slider.elements.previous = $('.previous', container);
                }
                slider.width = 0;
                slider.current = 0;
                slider.length = 0;
                slider.positions = [];

                slider.elements.container.find('.slide').each(function (i) {
                    slider.positions[i] = slider.width;
                    slider.width += $(this).outerWidth();
                });
                if (slider.elements.pagination.children().length !== 0) {
                    slider.length = slider.elements.pagination.children().length;
                }
                else {
                    slider.length = slider.positions.length;
                }
                slider.elements.container.find('.slide').show();
                // Best to define the width of the container in CSS: it takes time to do it in js.
                slider.elements.container.width(slider.width);

                slider.place(slider.current);
                slider.animate();
                // Previous / Next buttons
                slider.elements.next.click(function () {
                    return slider.bind.next();
                });
                slider.elements.previous.click(function () {
                    return slider.bind.previous();
                })

                if (slider.key.enable) {
                    $(document).unbind().bind('keydown', slider.bind.keys);
                    $('input, textarea').focus(function() { $(document).unbind('keydown'); });
                    $('input, textarea').blur(function() { $(document).unbind().bind('keydown', slider.bind.keys); });
                }

                // Pagination
                slider.elements.pagination.children().each(function (i) {
                    $(this).click(function () {
                        slider.current = slider.place(i);
                        slider.animate(); 
                        return false;
                    });
                });
                
                // Auto advance
                slider.loop();
            },
            bind: {
                move: function (name) {
                    var cb = true;
                    clearInterval(slider.timeout);
                    slider.loop();
                    slider.callback[name] && (cb = slider.callback[name]());
                    if (cb) {
                        slider[name]();
                    }
                    return false;
                },
                next: function () {
                    return slider.bind.move('next');
                },
                previous: function () {
                    return slider.bind.move('previous');
                },
                keys: function (e) {
                    if (slider.key.previous.indexOf(e.keyCode) !== -1) {
                        slider.bind.previous();
                    }
                    if (slider.key.next && slider.key.next.indexOf(e.keyCode) !== -1) {
                        slider.bind.next();
                    }
                }
            },
            place: function (i) {
                if (i > slider.length-1) {
                    current = slider.length-1;
                } else if (i < 0) {
                    current = 0;
                }
                else {
                    current = i;
                    if (slider.hide) {
                        slider.elements.next.show();
                        slider.elements.previous.show();
                    }
                }

                if (i >= slider.length-1 && slider.hide) {
                    slider.elements.next.hide();
                }
                if (i <= 0 && slider.hide) {
                    slider.elements.previous.hide();
                }
                if (slider.elements.pagination.length !== 0) {
                    slider.elements.pagination.children().removeClass(slider.active);
                    $(slider.elements.pagination.children()[current]).addClass(slider.active);
                }
                return current;
            },
            loop: function () {
                if (slider.auto) {
                    slider.timeout = setTimeout(function () {
                        slider.current = (slider.current == slider.length-1) ? -1: slider.current;
                        slider.next();
                        slider.loop();
                    }, slider.timeout_duration);
                }
            },
            next: function () {
                var old = slider.current;
                slider.current = slider.place(old+1);
                if (slider.current !== old) {
                    slider.animate();
                } 
            },
            previous: function () {
                var old = slider.current;
                slider.current = slider.place(old-1);
                if (slider.current !== old) {
                    slider.animate();
                } else {
                    slider.elements.previous.hide();
                }
            },
            animate: function (animate) {
                var args = {marginLeft: -slider.positions[slider.current]};
                if (typeof animate !== undefined) {
                    slider.elements.container.stop().animate(args, slider.duration);
                }
                else {
                    slider.elements.container.css(args);
                }
            }
        };

        var args = arguments[0] || {};
        function merge(obj1, obj2) {
            for (var p in obj2) {
                if (obj2[p].constructor == Object) {
                    obj1[p] = merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            }
            return obj1;
        }
        
        merge(slider, args);

        $(this).each(function () {
            slider.init($(this));
        });
    };
})(jQuery);

