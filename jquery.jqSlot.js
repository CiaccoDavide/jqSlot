/*
 * jQuery jqSlot Plugin
 * http://ciaccodavi.de/jqslot/
 * Copyright (c) 2015 Ciacco Davide
 * Version: 0.0.1 (1/11/2015)
 * Dual licensed under the MIT and GPL licenses
 * Requires: jQuery v1.4.1 or later
 */

(function($){
    $.jqSlot = function(el, options){
        var base = this;

        base.$el = $(el);
        base.el = el;

        base.$el.data("jqSlot", base);

        base.init = function() {

            base.options = $.extend({},$.jqSlot.defaultOptions, options);

            base.setup();
            base.bindEvents();

        };
        // ################# //
        //  DEFAULT OPTIONS  //
        // ################# //
        $.jqSlot.defaultOptions = {
            spinner : '',        // CSS Selector: element to bind the start event to
            container : '',
            spinEvent : 'click', // String: event to start slots on this event
            onStart : $.noop,    // Function: runs on spin start,
            onEnd : $.noop,      // Function: run on spin end. It is passed (finalNumbers:Array). finalNumbers gives the index of the li each slot stopped on in order.
            onWin : $.noop,      // Function: run on winning number. It is passed (winCount:Number, winners:Array)
            easing : 'swing',    // String: easing type for final spin
            time : 7000,         // Number: total time of spin animation
            loops : 6            // Number: times it will spin during the animation
        };
        // ################# //
        //      HELPERS      //
        // ################# //
        base.randomRange = function(low, high) {
            return Math.floor( Math.random() * (1 + high - low) ) + low;
        };
        // ################# //
        //       VARS        //
        // ################# //

        base.isSpinning = false;
        base.spinSpeed = 0;
        base.doneCount = 0;

        base.$liHeight = 0;
        base.$liWidth = 0;

        base.allSlots = [];

        // ################# //
        //     FUNCTIONS     //
        // ################# //
        base.setup = function() {
            // set sizes
            var $list = base.$el;
            var $li = $list.find('li').first();
            base.$liHeight = $li.outerHeight();
            base.$liWidth = $li.outerWidth();
            base.liCount = base.$el.children().length;
            base.listWidth = base.$liWidth * base.liCount;
            base.increment = (base.options.time / base.options.loops) / base.options.loops;
            $list.css('position', 'relative');
            $li.clone().appendTo($list);
            base.$wrapper = $list.wrap('<div class="jqSlot-wrapper"></div>').parent();
            // remove original, so it can be recreated as a Slot
            base.$el.remove();
            base.allSlots.push( new base.Slot() );
        };

        base.bindEvents = function() {
            $(base.options.container).css('width',base.$liWidth*(base.liCount+1)+'px');
            $(base.options.spinner).bind(base.options.spinEvent, function(event) {
                if (!base.isSpinning) {
                    base.playSlots();
                }
            });
        };
        // Slot contstructor
        base.Slot = function() {
            this.spinSpeed = 0;
            this.el = base.$el.clone().appendTo(base.$wrapper)[0];
            this.$el = $(this.el);
            this.loopCount = 0;
        };
        base.Slot.prototype = {
            // do one rotation
            spinEm : function() {
                var that = this;
                that.$el
                    .css( 'left', -base.listWidth )
                    .animate( { 'left' : '0px' }, that.spinSpeed, 'linear', function() {
                        that.lowerSpeed();
                    });
            },

            lowerSpeed : function() {
                this.spinSpeed += base.increment;
                this.loopCount++;
                if ( this.loopCount < base.options.loops ) {
                    this.spinEm();
                } else {
                    this.finish();
                }
            },
            // final rotation
            finish : function() {
                var that = this;
                var endNum = base.randomRange( 1, base.liCount );
                var finalPos = - ( (base.$liHeight * endNum) - base.$liHeight );
                var finalSpeed = ( (this.spinSpeed * 0.5) * (base.liCount) ) / endNum;
                that.$el
                    .css( 'left', -base.listWidth )
                    .animate( {'left': finalPos}, finalSpeed, base.options.easing, function() {
                        //reset the slot with the last number as the initial!
                    });
            }
        };


        base.playSlots = function() {
            base.isSpinning = true;
            base.doneCount = 0;
            if ( $.isFunction(base.options.onStart) ) {
                base.options.onStart();
            }
            $.each(base.allSlots, function(index, val) {
                this.spinSpeed = 0;
                this.loopCount = 0;
                this.spinEm();
            });
        };
        // durante il setup si decide che funzione eseguire in caso di vittoria
        base.onWin = function() {
            if ( $.isFunction(base.options.onWin) ) {
                base.options.onWin();
            }
        };
        // Run initializer
        base.init();
    };
    // ################# //
    //     JQUERY FN     //
    // ################# //
    $.fn.jqSlot = function(options){
        if (this.length) {
            return this.each(function(){
                (new $.jqSlot(this, options));
            });
        }
    };
})(jQuery);
