(function (window, document, undefined) {
    var util = {
        getComputedStyle: function (el, style) {
            var computedStyle;
            if (typeof(el.currentStyle) != 'undefined') {
                computedStyle = el.currentStyle;
            } else {
                computedStyle = document.defaultView.getComputedStyle(el, null);
            }
            return computedStyle[style];
        }
    },
    property = {
        width: {
            style: "marginLeft",
            key: {
                previous: [37],
                next: [39]
            }
        },
        height: {
            style: "marginTop",
            key: {
                previous: [38],
                next: [40]
            }
        }
    };

    function Slider() {
        var wrapper, next,
            params = {},
            args = Array.prototype.slice.call(arguments),
            next = args.shift();

        // assign arguments depending on their type
        // string: id of the wrapper
        // otherwise: it's a dictionary of options
        while (next) {
            type = typeof next;
            if (type === "string") {
                wrapper = document.getElementById(next);
            } else {
                params = next;
            }
            next = args.shift();
        }

        this.index = params.index || 0;     // index of the current slide
        this.current = undefined;           // html object of the current slide
        this.length = 0;                    // number of slides
        this.loop = params.loop || false;   // is the slider looping?
        this.hide = (params.hide === false) ? false : true; // hide previous or next when first or last
        this.property = (params.property === "height") ? "height" : "width";

        this.animation = (params.animation === false || !$) ? false : true;
        params.duration = params.duration || {};
        this.duration = {
            timeout: undefined,
            effect: params.duration.effect || 450,
            pause: params.duration.pause || 1000
        };

        params.node = params.node || {};
        params.node.wrapper = params.node.wrapper || wrapper;
        this.node = {
            wrapper: params.node.wrapper,
            slides: undefined,
            slide: undefined,
            pagination: params.node.pagination,
            next: params.node.next,
            previous: params.node.previous
        };
        this.findNodes();

        this.positions = [];

        params.key = params.key || {};
        this.key = {
            enable: (params.key.enable === false) ? false : true,
            previous: params.key.previous || property[this.property].key.previous,
            next: params.key.next || property[this.property].key.next
        };

        this.run();
    }

    Slider.prototype.run = function () {
        this.css();
        this.bind();
        this.parse();

        this.move();

        return this;
    };

    Slider.prototype.findNodes = function () {
        this.node.slides = this.node.slides || this.node.wrapper.getElementsByClassName('slides')[0];
        this.node.slide = this.node.slides.getElementsByClassName("slide");

        // Optional
        this.node.pagination = this.node.pagination || this.node.wrapper.getElementsByClassName('pagination')[0];
        if (this.node.pagination) {
            this.node.page = this.node.pagination.getElementsByClassName('page');
        } else {
            this.node.page = [];
        }

        this.node.next = this.node.next || this.node.wrapper.getElementsByClassName('next')[0];
        this.node.previous = this.node.previous || this.node.wrapper.getElementsByClassName('previous')[0];
    };

    Slider.prototype.css = function () {
        this.node.wrapper.style.overflow = "hidden";
    };

    Slider.prototype.parse = function () {
        var slide, value,
            sum = 0;

        this.positions = [];
        this.length = this.node.slide.length;

        for (var i = 0; i < this.length; i += 1) {
            slide = this.node.slide[i];
            if (this.property === "width") {
                slide.style.cssFloat = "left";
            }
            value = parseInt(util.getComputedStyle(slide, this.property))
            this.positions.push(sum);
            // TODO include padding, margin ?
            sum += value;
        }
        this[this.property] = sum;
        this.node.wrapper.style[this.property] = value + "px";
        this.node.slides.style[this.property] = sum + "px";
    };

    Slider.prototype.pagination = function () {
        var i, page, classname,
            that = this;

        if (this.hide !== false) {
            if (this.first) {
                this.node.previous.style.display = "none";
            } else {
                this.node.previous.style.display = "block";
            }

            if (this.last) {
                this.node.next.style.display = "none";
            } else {
                this.node.next.style.display = "block";
            }
        }

        for (var i = 0; i < this.node.page.length; i += 1) {
            classname = this.node.page[i].className;
            this.node.page[i].className = classname.replace(' current', '');
            
        }
        this.node.page[this.index].className += " current";
    };
    
    Slider.prototype.bind = function () {
        var that = this,
            previous_onkeydown = document.onkeydown;

        this.node.next.onclick = function () {
            that.next();
        };

        this.node.previous.onclick = function () {
            that.previous();
        };

        document.onkeydown = function (e) {
            previous_onkeydown && previous_onkeydown(e);

            if (that.key.enable) {
                if (that.key.next && (that.key.next.indexOf(e.which) !== -1)) {
                    that.next();
                }
                if (that.key.previous && (that.key.previous.indexOf(e.which) !== -1)) {
                    that.previous();
                }
            }
        };

        for (i = 0; i < this.node.page.length; i += 1) {
            page = this.node.page[i];
            page.onclick = function (i) {
                return function (e) {
                    that.index = i;
                    that.move();
                    return false;
                };
            }(i);
        }
    };
    
    Slider.prototype.remove = function (i) {
        var removed = (i === undefined || i < 0 || i > this.length) ? this.current : this.node.slide[i];
        this.node.slides.removeChild(removed);
        this.parse();
    };

    Slider.prototype.resume = function () {
        var that = this;

        if (this.loop) {
            this.duration.timeout = window.setTimeout(function () {
                that.index = (that.index === that.length-1) ? -1: that.index;
                that.next(false);
                that.resume();
            }, this.duration.pause);
        }
    };

    Slider.prototype.pause = function () {
        window.clearInterval(this.duration.timeout);
    };

    Slider.prototype.next = function (reset) {
        this.events.trigger('next.before', this);
        this.events.trigger('move.before', this);

        this.index += (this.index >= (this.length - 1)) ? 0 : 1;

        this.events.trigger('next', this);
        this.move(reset);
    };

    Slider.prototype.previous = function (reset) {
       this.events.trigger('previous.before', this);
       this.events.trigger('move.before', this);

       this.index -= (this.index <= 0) ? 0 : 1;

       this.events.trigger('previous', this);
       this.move(reset);
    };

    Slider.prototype.move = function (reset) {
        var args,
            that = this,
            attribute = property[this.property].style,
            value = - this.positions[this.index];

        if (reset !== false) {
            this.pause();
            this.resume();
        }

        this.current = this.node.slide[this.index];
        this.first = (this.index === 0);
        this.last = (this.index === this.length-1);

        this.pagination();

        that.events.trigger('move', this);

        if (this.animation && $) {
            args = {};
            args[attribute] = value;
            $(this.node.slides).stop().animate(args, {
                duration: this.duration.effect,
                complete: function () {
                    that.events.trigger('animate.after', that);
                }
            });
        } else {
            this.node.slides.style[attribute] = value + "px";
        }
        that.events.trigger('animate', this);
    };

    Slider.prototype.events = {
        _listeners: {},
        bind: function (name, callback) {
            this._listeners[name] = this._listeners[name] || [];
            this._listeners[name].push(callback);
        },
        unbind: function (name) {
            this._listeners[name] = [];
        },
        trigger: function (name, message) {
            this._listeners[name] = this._listeners[name] || [];
            for (var i = 0; i < this._listeners[name].length; i += 1) {
                this._listeners[name][i].call(message, name);
            }
        }
    };

    window.Slider = Slider;
})(window, document)
