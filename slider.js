(function (window, document, undefined) {
    // Methods for compatibility matters
    var util = {
        getComputedStyle: function (el, style) {
            var computedStyle;
            if (typeof(el.currentStyle) != 'undefined') {
                computedStyle = el.currentStyle;
            } else {
                computedStyle = document.defaultView.getComputedStyle(el, null);
            }
            return computedStyle[style];
        },
        getElementsByClassName: function (classname, node) {
            node = node || document.body;
            return node.getElementsByClassName(classname);
        },
        indexOf: function (array, search) {
            return array.indexOf(search);
        }
    },
    // define properties for both width and height motions
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


    function Slider(wrapper, params) {
        wrapper = (typeof wrapper === "string") ? document.getElementById(wrapper) : wrapper;
        params = params || {};

        this.index = params.index || 0;     // index of the current slide [0]
        this.current = undefined;           // html object of the current slide
        this.length = 0;                    // number of slides [0]
        this.loop = params.loop || false;   // is the slider looping? [false]
        this.hide = (params.hide === false) ? false : true;     // hide previous or next when first or last [true]
        this.property = (params.property === "height") ? "height" : "width";    // up/down or right/left [width]

        this.animation = (params.animation === false || !$) ? false : true;     // animate the slider using jquery if it's there [true]
        params.duration = params.duration || {};
        this.duration = {
            timeout: undefined,                       // timer for the loop 
            animation: params.duration.effect || 450, // duration of the animation
            pause: params.duration.pause || 1000      // duration of the pause between each loop
        };

        params.node = params.node || {};
        params.node.wrapper = wrapper; // shortcut for the wrapper
        this.node = {
            wrapper: params.node.wrapper,       // where all default nodes are
            slides: undefined,                  // container of slides
            slide: undefined,                   // all slides
            pagination: params.node.pagination, // container of pages
            page: undefined,                    // all pages
            next: params.node.next,             // next html element
            previous: params.node.previous      // previous html element
        };
        this.findNodes();

        this.positions = [];    // How much should the slider slides for each slide?

        params.key = params.key || {};
        this.key = {
            enable: (params.key.enable === false) ? false : true,                   // are the keydown shortcuts enable?
            previous: params.key.previous || property[this.property].key.previous,  // shortcuts for previous
            next: params.key.next || property[this.property].key.next               // shortcuts for next
        };

        this.run();     // Let's start the slider
    }

    Slider.prototype.run = function () {
        this.css();
        this.bind();
        this.parse();

        this.move();

        return this;
    };

    // Initialize nodes with they are not specified
    Slider.prototype.findNodes = function () {
        this.node.slides = this.node.slides || util.getElementsByClassName('slides', this.node.wrapper)[0];
        //this.node.slide = util.getElementsByClassName("slide", this.node.slides);
        this.node.slide = this.node.slides.childNodes;

        // Optional
        this.node.pagination = this.node.pagination || util.getElementsByClassName('pagination', this.node.wrapper)[0];
        if (this.node.pagination) {
            this.node.page = util.getElementsByClassName('page', this.node.pagination);
        } else {
            this.node.page = [];
        }

        this.node.next = this.node.next || util.getElementsByClassName('next', this.node.wrapper)[0] || {};
        this.node.previous = this.node.previous || util.getElementsByClassName('previous', this.node.wrapper)[0] || {};
    };

    // Define css for nodes
    Slider.prototype.css = function () {
        this.node.wrapper.style.overflow = "hidden";
        this.node.slides.style.overflow = "hidden";
    };

    // Parse slides and extract information
    Slider.prototype.parse = function () {
        var slide, value,
            sum = 0;

        this.positions = [];
        this.length = this.node.slide.length;

        for (var i = 0; i < this.length; i += 1) {
            slide = this.node.slide[i];
            if (this.property === "width") {
                slide.style.cssFloat = "left";
                slide.style.styleFloat = "left";
            }
            value = parseInt(util.getComputedStyle(slide, this.property), 10);
            this.positions.push(sum);
            sum += value;
        }
        this[this.property] = sum;
        this.node.wrapper.style[this.property] = value + "px";
        // Initialize the container of slides with the sum of width/height of all slides
        this.node.slides.style[this.property] = sum + "px";
    };

    // Update pagination elements after moving
    Slider.prototype.pagination = function () {
        var i, page, classname, length,
            that = this;

        // next and previous elements
        if (this.hide !== false) {
            if (this.node.previous.style) {
                if (this.first) {
                    this.node.previous.style.display = "none";
                } else {
                    this.node.previous.style.display = "block";
                }
            }

            if (this.node.next.style) {
                if (this.last) {
                    this.node.next.style.display = "none";
                } else {
                    this.node.next.style.display = "block";
                }
            }
        }

        // pages
        length = this.node.page.length;
        if (length > 0) {
            for (i = 0; i < length; i += 1) {
                classname = this.node.page[i].className;
                this.node.page[i].className = classname.replace(' current', '');
                
            }
            this.node.page[this.index].className += " current";
        }
    };
    
    // Bind elements with actions
    Slider.prototype.bind = function () {
        var that = this,
            previous_onkeydown = document.onkeydown;

        // next and previous elements
        this.node.next.onclick = function () {
            that.next();
        };

        this.node.previous.onclick = function () {
            that.previous();
        };

        // keyboard shortcuts
        function onkeydown (e) {
            var keyCode = e.keyCode || e.which;
            previous_onkeydown && previous_onkeydown(e);

            if (that.key.enable) {
                if (that.key.next && (util.indexOf(that.key.next, keyCode) !== -1)) {
                    that.next();
                }
                if (that.key.previous && (util.indexOf(that.key.previous, keyCode) !== -1)) {
                    that.previous();
                }
            }
        }

        if (document.addEventListener) {
            document.addEventListener('keydown', onkeydown);
        } else {
            document.attachEvent('onkeydown', onkeydown);
        }

        // pages elements
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
    
    // Resume/start the loop
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

    // Pause the loop
    Slider.prototype.pause = function () {
        window.clearInterval(this.duration.timeout);
    };

    // Move to the next slide
    Slider.prototype.next = function (reset) {
        this.events.trigger('next.before', this);
        this.events.trigger('move.before', this);

        this.index += (this.index >= (this.length - 1)) ? 0 : 1;
        this.last = (this.index === this.length-1);

        this.events.trigger('next', this);
        this.move(reset);
    };

    // Move to the previous slide
    Slider.prototype.previous = function (reset) {
       this.events.trigger('previous.before', this);
       this.events.trigger('move.before', this);

       this.index -= (this.index <= 0) ? 0 : 1;

       this.events.trigger('previous', this);
       this.move(reset);
    };

    // Common behavior the moving action
    Slider.prototype.move = function (reset) {
        var args,
            that = this,
            attribute = property[this.property].style,
            value = - this.positions[this.index];

        // The resume function doesn't resume the loop
        if (reset !== false) {
            this.pause();
            this.resume();
        }

        this.current = this.node.slide[this.index];
        this.first = (this.index === 0);

        this.pagination();

        that.events.trigger('move', this);

        // Animate the slider if asked and jQuery is there
        if (this.animation && $) {
            args = {};
            args[attribute] = value;
            $(this.node.slides).stop().animate(args, {
                duration: this.duration.animation,
                complete: function () {
                    that.events.trigger('animate.after', that);
                }
            });
        } else {
            // Lazy update otherwise
            this.node.slides.style[attribute] = value + "px";
        }
        that.events.trigger('animate', this);
    };

    // Dummy events system
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

    // HELPERS
    // Remove a slide
    Slider.prototype.remove = function (i) {
        var removed = (i === undefined || i < 0 || i > this.length) ? this.current : this.node.slide[i];
        this.node.slides.removeChild(removed);
        this.parse();
    };

    Slider.prototype.insert = function (node, i) {
        var insertBefore = (i === undefined || i < 0 || i > this.length) ? this.current : this.node.slide[i];
        this.node.slides.insertBefore(node, insertBefore);
        this.parse();
    };

    window.Slider = Slider;

})(window, document);
