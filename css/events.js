jQuery.fn.centerVertical = (function(jQuery) {
    return function(inSpaceElement) {
        inSpaceElement || (inSpaceElement = 'parent');
        this.each(function() {
            var $t = $(this);
            var $space = inSpaceElement === 'parent' ? $t.parent() : $(inSpaceElement);
            if ($t.outerHeight() >= $space.height()) {
                $t.css({
                    top: '0%',
                    marginTop: '0px'
                });
                return;
            }
            $t.css({
                top: '50%',
                marginTop: Math.round($t.outerHeight() / -2)
            });
        });
    };
}(jQuery));


window.deck = (function() {
    var deckEvents = {};
    return {
        on: function(eventName, callback) {
            if (undefined == deckEvents[eventName]) {
                deckEvents[eventName] = [];
            }

            deckEvents[eventName][ deckEvents[eventName].length ] = callback;

            return this;
        },

        off: function(eventName, handler) {
            if (!handler) {
                deckEvents[eventName] = [];

                return this;
            }

            for (callbackIndex in deckEvents[eventName]) {
                if (deckEvents[eventName][callbackIndex] === handler) {
                    deckEvents[eventName].splice(callbackIndex, 1);
                }
            }

            return this;
        },

        trigger: function(eventName) {
            var promiseCount = 0;
            var deferred = $.Deferred();
            if (undefined === deckEvents[eventName]) {
                deferred.resolve();
                return deferred.promise();
            }

            var args = Array.prototype.slice.call(arguments, 1);

            var r;
            var resolveDeferred = function() {
                --promiseCount;
                if (promiseCount == 0) {
                    deferred.resolve();
                }
            };

            for (callbackIndex in deckEvents[eventName]) {
                r = deckEvents[eventName][callbackIndex].apply(this, args);
                if (undefined !== r) {
                    ++promiseCount;
                    $.when(r).then(resolveDeferred);
                }
            }

            if (promiseCount == 0) {
                deferred.resolve();
            }

            return deferred.promise();
        }
    };
})();


(function() {
    function resizeImg(slide) {
        var finalCss;
        var zIndex;

        slide.find('.fit-container>img').each(function() {
            var t = $(this);
            var containH = t.parent().height();
            var containW = t.parent().width();
            var containRatio = containH / containW;
            if (!t.data('height')) {
                t.data('height', t.height());
            }
            if (!t.data('width')) {
                t.data('width', t.width());
            }
            var w = t.data('width');
            var h = t.data('height');
            if (w == 0 || h == 0) {
                return;
            }
            var ratio = h/w;

            zIndex = t.css('z-index');

            if (containRatio > ratio) {
                finalCss = {
                    width: containW + 'px',
                    height: (containW * ratio) + 'px',
                    marginTop: (containW * ratio) / -2 + 'px',
                    top: '50%',
                    left: '0px',
                    marginLeft: '0px'
                };
            } else {
                finalCss = {
                    width: (containH / ratio) + 'px',
                    height: containH + 'px',
                    top: '0px',
                    left: '50%',
                    marginLeft: (containH / ratio) / -2 + 'px',
                    marginTop: '0px'
                };
            }

            t.css(finalCss);
            t.parent().find('.match-image').css(finalCss);
        });
    };

    var sizing = (function() {
        var timingInterval;
        return function sizing(slide) {
            clearInterval(timingInterval);
            centers = slide.find('.center-vertical');
            resizeImg(slide);
            slide.find('.center-vertical').centerVertical();
            timingInterval = setInterval(function() {
                resizeImg(slide);
                centers.centerVertical();
            }, 100);
        };
    })();

    window.deck.on('prepare_slide', sizing);
    window.deck.on('present_slide', function(slide) {
        slide.find('.background-size-polyfill').each(function() {
            var t = $(this).parent()[0];
            if (t.backgroundSize) {
                t.backgroundSize();
            }
        });
    });

    window.deck.on('prepare_slide', function(slide) {
        var pano = slide.find('div.content-area-pano');
        pano.attr('id', slide.attr('id') + '-krpano-container');
        pdfCheck = window.location.pathname.indexOf('pdf');

        if (!pano.length || pdfCheck > 0) {
            return;
        }

        embedpano({
            swf:"/bundles/spodigdigideck/presentation/krpano/pano.swf",
            id:"pano-" + slide.attr('id'),
            xml:pano.data('panoxml'),
            target:slide.attr('id') + '-krpano-container',
            wmode:"opaque"
        });
    });

    window.deck.on('prepare_slide', function(slide) {
        var panos = slide.find('div.dsm-panorama');
        panos.each(function() {
            var pano = $(this);
            var pdfCheck = window.location.pathname.indexOf('pdf');

            if (!pano.length || pdfCheck > 0) {
                return;
            }

            embedpano({
                swf:"/bundles/spodigdigideck/presentation/krpano/pano.swf",
                xml:pano.data('panoxml'),
                target: pano.attr('id'),
                wmode:"opaque"
            });
        });
    });

    window.deck.on('close_slide', function(slide) {
        if (!slide) {
            return;
        }

        var pano = slide.find('div.content-area-pano');
        if (!pano.length) {
            return;
        }
        pano.html('');
    });
window.panorama = function(id) {
    return (function($, dd) {
        var panoEl = document.getElementById(id);
        if (!panoEl) {
            return {
                loadSlide: function() { },
                switchPano: function() { },
                loadHotspot: function() { }
            };
        }

        panoEl.tabIndex = 0;
        panoEl.focus();

        var currentPanorama;
        for (var panoId in dd.panoramas) {
            currentPanorama = panoId;
            break;
        }
        var hotspots = dd.panoramas;
        var url = dd.presentation.url;

        function findHotspot(id) {
            var slide;
            var panoramaId;
            if (currentPanorama && hotspots[currentPanorama]) {
                for (slide in hotspots[currentPanorama].slides) {
                    if (hotspots[currentPanorama].slides[slide].id == id) {
                        return currentPanorama;
                    }
                }
            }

            for (panoramaId in hotspots) {
                if (currentPanorama == panoramaId) {
                    continue;
                }

                for (slide in hotspots[panoramaId].slides) {
                    if (hotspots[panoramaId].slides[slide].id == id) {
                        return panoramaId;
                    }
                }
            }
            return false;
        };
        var isTouch = 'ontouchstart' in window;
        var touchEvent = isTouch ? 'touchend' : 'click';
        var curHotspots = [];

        var returnObj = {

            el: panoEl,

            hideAll: function() {
                if (isTouch) {
                    for (var curHotspot in curHotspots) {
                        panoEl.call('removehotspot(hs' + curHotspots[curHotspot].id + ');');
                    }
                    curHotspots = [];
                } else {
                    for (mask in hotspots[currentPanorama].masks) {
                        panoEl.set("hotspot[hs" + hotspots[currentPanorama].masks[mask].id + '].alpha', '0.0');
                    }
                }
            },

            getCurrentView: function() {
                var h = panoEl.get('view.hlookat');
                var v = panoEl.get('view.vlookat');
                var f = panoEl.get('view.fov');

                return {
                    'hlookat': Math.round(h*100)/100,
                    'vlookat': Math.round(v*100)/100,
                    'fov': Math.round(f*100)/100
                };
            },

            loadHotspot: function(id, doNotLoadSlide) {
                var slides = [];
                for (var panorama in hotspots) {
                    for (var slide in hotspots[panorama].slideMasks) {
                        for (var mask in hotspots[panorama].slideMasks[slide]) {
                            if (hotspots[panorama].slideMasks[slide][mask] == id) {
                                if (typeof console != 'undefined') {
                                    console.log('Clicked hotspot: mask id # ' + id + ', slide id # ' + slide + ', panorama id # ' + panorama);
                                }
                                slides[slides.length] = [slide, hotspots[panorama].slideMasks[slide].length];
                            }
                        }
                    }
                }

                if (slides.length === 0) {
                    return;
                }

                // Heuristic: Load the slide that has the fewest hotspots attached
                // to it. More likely to be more specific to that hotspot
                
                slides.sort(function(a,b) {
                    return a[1] - b[1];
                });

                this.loadSlide(slides[0][0], doNotLoadSlide);
            },

            loadSlide: function(id, doNotLoadSlide, doNotSwitchPano) {
                var h = findHotspot(id);
                var mask;
                var panoSwitched = false;

                if (h === false) {
                    return;
                }

                if (h && h != currentPanorama) {
                    if (doNotSwitchPano) {
                        window.deck.close();
                        return;
                    }
                    $('#panorama-switcher-' + h).trigger(touchEvent);
                    return;
                }

                if (!doNotLoadSlide) {
                    deck.showBySelector('.slide-' + id, true);
                }

                // Find sign
                var found = false;
                for (var signI in hotspots[currentPanorama].panoramaSigns) {
                    var sign = hotspots[currentPanorama].panoramaSigns[signI];
                    if (!sign.sign || sign.sign.slide_ids.length === 0) {
                        continue;
                    }
                    if (sign.sign.slide_ids.indexOf(id*1) !== -1) {
                        if (isTouch) {
                            panoEl.call('lookto(' + sign.tlookto_h + ',' + sign.tlookto_v + ',' + sign.tlookto_fov + ');');
                        } else {
                            panoEl.call('lookto(' + sign.lookto_h + ',' + sign.lookto_v + ',' + sign.lookto_fov + ');');
                        }
                        found = true;
                        break;
                    }
                }

                if (isTouch) {
                    for (var curHotspot in curHotspots) {
                        panoEl.call('removehotspot(hs' + curHotspots[curHotspot].id + ');');
                    }
                    curHotspots = [];
                } else {
                    for (mask in hotspots[currentPanorama].masks) {
                        panoEl.set("hotspot[hs" + hotspots[currentPanorama].masks[mask].id + '].alpha', '0.0');
                    }
                }

                if (hotspots[currentPanorama].slideMasks[id]) {
                    for (mask in hotspots[currentPanorama].slideMasks[id]) {
                        var maskObj;
                        for (maskObjIndex in hotspots[currentPanorama].masks) {
                            if (hotspots[currentPanorama].masks[maskObjIndex].id == hotspots[currentPanorama].slideMasks[id][mask]) {
                                maskObj = hotspots[currentPanorama].masks[maskObjIndex];
                                curHotspots[curHotspots.length] = maskObj;
                                break;
                            }
                        }
                        if (isTouch && !hotspots[currentPanorama].legacyHotspotsInXml) {
                            panoEl.call('addhotspot(hs' + maskObj.id + ');');
                            panoEl.set('hotspot[hs' + maskObj.id + '].ath', maskObj.ath);
                            panoEl.set('hotspot[hs' + maskObj.id + '].atv', maskObj.atv);
                            panoEl.set('hotspot[hs' + maskObj.id + '].ox', maskObj.ox);
                            panoEl.set('hotspot[hs' + maskObj.id + '].oy', maskObj.oy);
                            panoEl.set('hotspot[hs' + maskObj.id + '].width', maskObj.width);
                            panoEl.set('hotspot[hs' + maskObj.id + '].height', maskObj.height);
                            if (window.cachedapp) {
                                panoEl.set('hotspot[hs' + maskObj.id + '].url', 'masks/' + window.digideck.presentation.logoId + '/' + maskObj.id + '.png');
                            } else {
                                panoEl.set('hotspot[hs' + maskObj.id + '].url', '/masks/' + window.digideck.presentation.logoId + '/' + maskObj.id + '.png');
                            }
                            panoEl.set('hotspot[hs' + maskObj.id + '].edge', 'lefttop');
                            panoEl.set('hotspot[hs' + maskObj.id + '].visible', 'true');
                            panoEl.set('hotspot[hs' + maskObj.id + '].enabled', 'true');
                            panoEl.set('hotspot[hs' + maskObj.id + '].zorder', '1');
                            panoEl.set('hotspot[hs' + maskObj.id + '].refreshrate', 'auto');
                            panoEl.set('hotspot[hs' + maskObj.id + '].keep', 'false');
                            panoEl.set('hotspot[hs' + maskObj.id + '].zoom', 'false');
                            panoEl.set('hotspot[hs' + maskObj.id + '].distorted', 'true');
                            panoEl.set('hotspot[hs' + maskObj.id + '].details', '8');
                            panoEl.set('hotspot[hs' + maskObj.id + '].flying', '0');
                            panoEl.set('hotspot[hs' + maskObj.id + '].edge', 'lefttop');
                            panoEl.set('hotspot[hs' + maskObj.id + '].alpha', '1.00');
                            panoEl.set('hotspot[hs' + maskObj.id + '].autoalpha', 'false');
                            panoEl.set('hotspot[hs' + maskObj.id + '].blendmode', 'normal');
                            panoEl.set('hotspot[hs' + maskObj.id + '].smoothing', 'true');
                            panoEl.set('hotspot[hs' + maskObj.id + '].pixelhittest', 'false');
                        }
                        else {
                            panoEl.set("hotspot[hs" + hotspots[currentPanorama].slideMasks[id][mask] + '].alpha', '1.00');
                        }
                    }

                    if (!found) {
                        panoEl.call("looktohotspot(hs" + hotspots[currentPanorama].slideMasks[id][0] + ", 30);");
                    }
                    found = true;
                }

                if (!found) {
                    panoEl.call("lookto(90.97, -9.80, 60);");
                }
            },

            switchPano: function(id) {
                if (id == currentPanorama) {
                    return;
                }
                currentPanorama = id;
                if (hotspots[currentPanorama].show_switcher) {
                    $('.toggle-pano').show();
                } else {
                    $('.toggle-pano').hide();
                }
                panoEl.call("loadpano(" + id + ".xml, null, BLEND(1));");
            },

            getCurrentPanorama: function() {
                return currentPanorama;
            },

            callPanoBySlide: function(slideNumber) {
                var krpano = document.getElementById('pano'),
                    masks = hotspots[returnObj.getCurrentPanorama()].slideMasks[slideNumber],
                    slides = hotspots[returnObj.getCurrentPanorama()].slides;

                for (var slide in slides) {
                    if (slides[slide].id == slideNumber) {
                        break;
                    }
                }

                krpano.call("hide-glows");

                krpano.call("lookto(" +
                    slides[slide].lookto_h + ", " +
                    slides[slide].lookto_v + ", " +
                    slides[slide].lookto_fov + ");");

                for (mask in masks) {
                    krpano.call("hotspot[hs-glowing-" + masks[mask] + "].loadstyle('show-glow');");
                }
            }
        };

        // export for krpano
        window.loadHotspot = function() {
            returnObj.loadHotspot.apply(returnObj, arguments);
        };
        return returnObj;

    })(jQuery, window.digideck);
};
})();

$(function() {



// MODULES
//
// Each of these modules should be made into something that could be loaded
// asynchronously. RequireJS, or?
//
// Each of these modules specifies their dependencies on other modules in
// the function they are wrapped in.


// Module to active the cube slide transitionsk
window.activateCubeTransition = (function CubeTransition($, deck) {
        var $outer = $('.slide-container-outer-border'),
            $inner = $('.slide-container-inner-border'),
            $pano = $('#pano-wrapper'),
            $wrapper = $('#wrapper'),
            concavity = 'outer',
            speed = 800,
            requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame;

        // Resets the css transforms to the normal state
        function finish($oldSlide, $curSlide, deferred) {
            $outer.removeClass('transition');
            $inner.removeClass('transition');
            $inner.removeClass('flipped');
            $inner.removeClass('unflipped');
            $outer.css({
                '-webkit-transform': 'none',
                'transform': 'none',
                '-ms-transform': 'none'
            });
            $curSlide.css({
                'webkitTransform': 'none',
                'transform': 'none',
                'msTransform': 'none'
            });
            $oldSlide.css({
                'webkitTransform': 'none',
                'transform': 'none',
                'msTransform': 'none'
            });
            $pano.show();
            deferred.resolve();
        };

        function transitionEvent($oldSlide, $curSlide) {
            if (window.ie) {
                return;
            }
            // If this is the first slide, don't transition
            if (!$oldSlide) {
                $curSlide.show();
                return;
            }

            // If one of these slides shows something in the pano, don't do this transition
            if ($oldSlide.hasClass('slide-type-pano') || $curSlide.hasClass('slide-type-pano')) {
                return;
            }
            $pano.hide();

            var width = $outer.outerWidth();

            var z = 'translateZ(' + Math.round(width / 2) + 'px)';
            var negZ = 'translateZ(-' + Math.round(width / 2) + 'px)';
            var negZoom = 'translateZ(-' + Math.round(width / 2 + 300) + 'px)';
            
            if (concavity === 'inner') {
                z = 'translateZ(-' + Math.round(width / 2) + 'px)';
                negZ = 'translateZ(' + Math.round(width / 2) + 'px)';
                negZoom = 'translateZ(' + Math.round(width / 2 - 300) + 'px)';
            }
            var perspective = Math.round(width / .7);

            // Set perspective based on the current window size
            $wrapper.css({
                '-webkit-perspective': perspective,
                '-webkit-perspective-origin': '50% ' + Math.round(100* $outer.height() / $outer.outerHeight()) + '%',
                'perspective': perspective,
                'perspective-origin': '50% ' + Math.round(100* $outer.height() / $outer.outerHeight()) + '%',
                '-moz-perspective': perspective,
                '-moz-perspective-origin': '50% ' + Math.round(100* $outer.height() / $outer.outerHeight()) + '%'
            });

            // Push the entire container deeper, so that the center of the cube
            // will be behind the viewport pane
            $outer.css({
                '-webkit-transform': negZ,
                'transform': negZ,
                '-moz-transform': negZ
            });

            // Rotate the new slide either left or right, depending on if it is
            // after or before the current slide
            var rotationClass;
            if (($curSlide.index() > $oldSlide.index() && concavity !== 'inner') ||
                ($curSlide.index() < $oldSlide.index() && concavity === 'inner'))
            {
                rotationClass = 'unflipped';
                $curSlide.css({
                    'webkitTransform': 'rotateY(90deg) ' + z,
                    'transform': 'rotateY(90deg) ' + z,
                    'mozTransform': 'rotateY(90deg) ' + z
                });
            } else {
                rotationClass = 'flipped';
                $curSlide.css({
                    'webkitTransform': 'rotateY(-90deg) ' + z,
                    'transform': 'rotateY(-90deg) ' + z,
                    'mozTransform': 'rotateY(-90deg) ' + z
                });
            }

            // Bring the old slide back to the surface of the viewport
            // (since the whole container was pushed back above)
            $oldSlide.css({
                'webkitTransform': z,
                'transform': z,
                'mozTransform': z
            });

            var deferred = $.Deferred();

            // RAF ensures that the setup css transforms above have applied
            // before sending the animations to the GPU
            requestAnimationFrame(function() {
                // Enable transition timing
                $outer.addClass('transition');
                $inner.addClass('transition');

                // Zoom out transition
                $outer.css({
                    '-webkit-transform': negZoom,
                    'transform': negZoom,
                    'mozTransform': negZoom
                });

                // Make the new slide visible
                $curSlide.show();

                // Rotation transition
                $inner.addClass(rotationClass);

                // Zoom in transition
                // runs after zoom out finishes
                setTimeout(function() {
                    $outer.css({
                        '-webkit-transform': negZ,
                        'transform': negZ,
                        'mozTransform': negZ
                    });
                }, speed/2);

                // After the transitions are done, 
                // reset the css transforms to the normal state
                setTimeout(function() {
                    finish($oldSlide, $curSlide, deferred);
                }, speed + 10);
            });
            return deferred;
        };

        return function bindEvent(direction, speed) {
            concavity = direction;
            if (speed) {
                timing = speed;
            }
            deck.on('show_slide', transitionEvent);
        };
    })(jQuery, window.deck);
});




// Module Image Rotators



window.Rotator = (function($) {
    function Rotator(scope, timeInterval, bind) {
        this.$el = $(scope);
        this.$slides = this.$el.find('.rotator-slide');
        this.index = 0;
        this.$nextArrow = this.$el.find('.rotator-arrow-next');
        this.$previousArrow = this.$el.find('.rotator-arrow-previous');
        this.$dotContainer = this.$el.find('.rotator-dots');
        this.time = timeInterval;
        this.$dotContainer.html('');

        var index = 1;
        var me = this;
        this.$slides.each(function() {
            me.$dotContainer.append('<a href="javascript:void(0)">'
                + index + '</a>');
            ++index;
        });
        this.$dots = this.$dotContainer.find('>a');

        this.$slides.eq(0).fadeIn();
        this.$dots.eq(0).addClass('active');

        if (bind) {
            this.bind();
        }

        this.interval = null;
    };

    Rotator.prototype = {
        bind: function() {
            var me = this;
            this.$nextArrow.on('click', function() {
                me.next();
            });

            this.$previousArrow.on('click', function() {
                me.previous();
            });

            this.$dots.on('click', function(e) {
                me.activate(me.$dots.index(e.currentTarget));
            });

            this._resetInterval();
        },
        unbind: function() {
            this.$nextArrow.off('click');
            this.$previousArrow.off('click');
            clearTimeout(this.interval);
        },
        activate: function(newIndex) {
            this._resetInterval();
            this.$slides.eq(this.index).fadeOut();
            this.$slides.eq(newIndex).fadeIn();
            this.$dots.eq(this.index).removeClass('active');
            this.$dots.eq(newIndex).addClass('active');
            this.index = newIndex;
        },
        next: function() {
            var newIndex = 0;
            if (this.index !== this.$slides.length - 1) {
                newIndex = this.index + 1;
            }
            this.activate(newIndex);
        },
        previous: function() {
            var newIndex = this.$slides.length - 1;
            if (this.index !== 0) {
                newIndex = this.index - 1;
            }
            this.activate(newIndex);
        },
        _resetInterval: function() {
            if (!this.time) {
                return;
            }

            if (this.interval) {
                clearTimeout(this.interval);
            }

            var me = this;
            if (!this.$el.find('.dsm-video').length) {
                this.interval = setTimeout(function() {
                    me.next();
                }, this.time);
            }
        }
    };

    return Rotator;
})(jQuery);

// Module to bind image rotator to slide events
window.activateRotators = (function(deck, Rotator) {
    return function activateRotators(autoNextIntervalTime) {
        deck.on('prepare_slide', function($slide) {
            var $rot = $slide.find('.dsm-rotator');
            if (!$rot.length) {
                return;
            }

            $slide.data('dsm-rotator', (new Rotator($slide, autoNextIntervalTime, true)));
            $slide.find('.rotator-slide').fadeOut().eq(0).fadeIn();
        });

        deck.on('close_slide', function($slide) {
            if ($slide.data('dsm-rotator')) {
                $slide.data('dsm-rotator').unbind();
            }
        });
    };
})(window.deck, window.Rotator);

// jQuery plugin for handling dynamic text scaling
(function( $ ) {
    $.fn.textResizr = function(scaleFactor, maxScale, minScale) {

        var $element = this;
        var $parent  = this.parent();

        var setTextScale = function () {
            var pWidth = $parent.width();
            var fontSize = pWidth * scaleFactor;
            if (fontSize > maxScale) {
                fontSize = maxScale;
            } else if (fontSize < minScale) {
                fontSize = minScale;
            }
            $element.css({
                'font-size': fontSize + '%',
                'width': pWidth + 'px',
            });
        };
        $(window).resize(function() {
            setTextScale();
        });
        setTextScale();
    };
} ( jQuery ));