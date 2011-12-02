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
    key: true,
    hide: true,

    init: function () {
        slider.elements.container.find('.slide').each(function (i) {
            slider.positions[i] = slider.width;
            slider.width += $(this).width();
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
        // Previous / Next buttons
        slider.elements.next.click(function () {
            slider.bind.next();
        });
        slider.elements.previous.click(function () {
            slider.bind.previous();
        })

        if (slider.key) {
            $(document).keyup(function (e) {
                if (e.keyCode == 27) {
                    slider.bind.previous();
                }
            });
        }

        // Pagination
        slider.elements.pagination.children().each(function (i) {
            $(this).click(function () {
                slider.current = slider.place(i);
                slider.animate({marginLeft: -slider.positions[slider.current]}); 
            });
        });
        
        // Auto advance
        slider.loop();
    },
    bind: {
        next: function () {
            clearInterval(slider.timeout);
            slider.loop();
            slider.next();
            slider.callback.next && slider.callback.next();
            return false;
        },
        previous: function () {
            clearInterval(slider.timeout);
            slider.loop();
            slider.previous();
            slider.callback.previous && slider.callback.previous();
            return false;
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
            slider.elements.next.show();
            slider.elements.previous.show();
        }

        if (i >= slider.length-1 && slider.hide) {
            slider.elements.next.hide();
        }
        if (i <= 0 && slider.hide) {
            slider.elements.previous.hide();
        }
        if (slider.elements.pagination.length !== 0) {
            slider.elements.pagination.children().removeClass(slider.active);
            slider.elements.pagination.children()[current].className = slider.active;
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
            slider.animate({marginLeft: -slider.positions[slider.current]});
        } 
    },
    previous: function () {
        var old = slider.current;
        slider.current = slider.place(old-1);
        if (slider.current !== old) {
            slider.animate({marginLeft: -slider.positions[slider.current]});
        } else {
            slider.elements.previous.hide();
        }
    },
    animate: function (arg) {
        slider.elements.container.stop().animate(arg, slider.duration);
    }
};
