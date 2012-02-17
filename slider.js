var Slider = function (args) {
    this.positions = [];
    this.width = 0;
    this.current = args.current || 0;
    this.length = 0;
    this.elements = {
        container: $('.slides'),
        pagination: $('.pagination'),
        next: $('.next'),
        previous: $('.previous')
    };
    this.active = args.active || 'active';
    this.duration = args.duration || 450;
    this.timeoutDuration = args.timeoutDuration || 1000;
    this.callback = args.callback || {};
    this.auto = args.auto || false;
    this.key = args.key || {
        enable: true,
        previous: [37],
        next: [39]
    };
    this.hide = args.hide || true;

    var that = this;

    if (args.container !== undefined) {
        this.elements.container = $('.slides', args.container);
        this.elements.next = $('.next', args.container);
        this.elements.previous = $('.previous', args.container);
        this.elements.pagination = args.pagination || $(".pagination");
    }

    this.elements.container.find('.slide').each(function (i) {
        that.positions[i] = that.width;
        that.width += $(this).outerWidth();
    });

    if (this.elements.pagination.children().length !== 0) {
        this.length = this.elements.pagination.children().length;
    } else {
        this.length = this.positions.length;
    }
    this.elements.container.find(".slide").show();
    // Best to define the width of the container in CSS: it takes time to do it in js.
    this.elements.container.width(this.width);

    this.place(this.current);
    this.animate();
    // Previous / Next buttons
    this.elements.next.click(function () {
        return that.move("next");
    });
    this.elements.previous.click(function () {
        return that.move("previous");
    });

    if (this.key.enable) {
        $(document).unbind().bind("keydown", $.proxy(this, "keys"));
        $("input, textarea").focus(function() { $(document).unbind("keydown"); });
        $("input, textarea").blur(function() { $(document).unbind().bind("keydown", $.proxy(this, "keys")); });
    }

    // Pagination
    this.elements.pagination.children().each(function (i) {
        $(this).click(function () {
            that.current = that.place(i);
            that.animate(); 
            return false;
        });
    });
    
    // Auto advance
    this.loop();
};
Slider.prototype.move = function (name) {
    var cb = true;
    clearInterval(this.timeout);
    this.loop();
    if (this.callback[name] !== undefined) {
        cb = this.callback[name]();
    }
    if (cb !== false) {
        this[name]();
    }
    return false;
};
Slider.prototype.keys = function (e) {
    if (this.key.previous && this.key.previous.indexOf(e.keyCode) !== -1) {
        this.move('previous');
    }
    if (this.key.next && this.key.next.indexOf(e.keyCode) !== -1) {
        this.move('next');
    }
};
Slider.prototype.place = function (i) {
    if (i > this.length - 1) {
        current = this.length - 1;
    } else if (i < 0) {
        current = 0;
    } else {
        current = i;
        if (this.hide) {
            this.elements.next.show();
            this.elements.previous.show();
        }
    }

    if (i >= this.length - 1 && this.hide) {
        this.elements.next.hide();
    }
    if (i <= 0 && this.hide) {
        this.elements.previous.hide();
    }
    if (this.elements.pagination.length !== 0) {
        this.elements.pagination.children().removeClass(this.active);
        $(this.elements.pagination.children()[current]).addClass(this.active);
    }
    return current;
};
Slider.prototype.loop = function () {
    if (this.auto) {
        var that = this;
        this.timeout = setTimeout(function () {
            that.current = (that.current == that.length-1) ? -1: that.current;
            that.next();
            that.loop();
        }, this.timeout_duration);
    }
};
Slider.prototype.next = function () {
    var old = this.current;
    this.current = this.place(old + 1);
    if (this.current !== old) {
        this.animate();
    } 
};
Slider.prototype.previous = function () {
    var old = this.current;
    this.current = this.place(old-1);
    if (this.current !== old) {
        this.animate();
    } else {
        this.elements.previous.hide();
    }
};
Slider.prototype.animate = function (animate) {
    var args = {marginLeft: -this.positions[this.current]};
    if (typeof animate !== undefined) {
        this.elements.container.stop().animate(args, this.duration);
    } else {
        this.elements.container.css(args);
    }
};
