$(function() {
    var ua = navigator.userAgent,
            event = (ua.match(/iPad/i)) ? "touchstart" : "click";
    function centerProposalContent(slide) {
        var $contain = slide.find('.proposal-contain'),
            $proposal = slide.find('.proposal'),
            $content = slide.find('.proposal-content'),
            space = $contain.parent().height(),
            innerHeight = $proposal.height(),
            ib = slide.find('.slide-inner-border'),
            outerHeight = ib.length ? ib.height() : slide.height(),
            barHeight = slide.find('.proposal-bar').outerHeight(),
            height = (innerHeight > space ? innerHeight : space) - barHeight;

        $proposal.css('height', height + 'px');
        $content.centerVertical();
    };

    window.deck.on('prepare_slide', function(slide) {
        var propSlide = slide.find('.proposal-slide-content');
        if (propSlide.length) {
            propSlide.find('.proposal-content-contain').centerVertical();
        }
        var $bar = slide.find('.proposal-bar');
        if (!$bar.length) {
            return;
        }

        // Set the propsal header to the same as the slide header
        var $propHeader = slide.find('.proposal .header');
        var $header = slide.find('.header,h1,h3').not($propHeader);
        $propHeader.html($header.html());

        centerProposalContent(slide);

        slide.find('.proposal-contain').css('height', $bar.outerHeight() + 'px');
        $bar.removeClass('expanded');
        $bar.find('span').html('Click for Proposal');
        slide.find('.proposal-contain').css('border-bottom-width', '0px');
        slide.find('.proposal').css('opacity', '0.4');
    });

    window.deck.on('resize_slide', function(slide) {
        if (!slide.find('.proposal-bar').length) {
            return;
        }

        centerProposalContent(slide);
    });

    $('.proposal-bar').bind(event, function() {
        var $t = $(this);
        $t.toggleClass('expanded');
        if (!$t.hasClass('expanded')) {
            $t.find('span').html('Click for Proposal');
            $t.parent().find('.proposal').css('overflow', 'hidden');
            if ($t.parents('.popdown').length) {
                $t.parent().parent().animate({
                    'height':
                    $t.parents('.popdown').data('actual-height')
                }, 800);
            }
            $t.parent().animate({ 'height': '46px' }, 800, 'swing', function() {
                $t.parent().css('border-bottom-width', '0px');
            });
            $t.parent().find('.proposal').animate({ 'opacity': '0.4' }, 800);
            return;
        }
        $t.find('span').html('Hide Proposal');
        $t.parent().css('border-bottom-width', '2px');
        if ($t.parents('.slide').data('taller')) {
            $t.parents('.popdown').data('actual-height', $t.parents('.popdown').height());
            $t.parents('.popdown').animate({'height': $t.parent().find('.proposal').height()}, 800);
        }
        $t.parent().animate({ 'height': '100%' }, 800, 'swing', function() {
            if (!$t.parents('.slide').data('taller')) {
                $t.parent().find('.proposal').css('overflow', 'auto');
            }
        });
        $t.parent().find('.proposal').animate({ 'opacity': '1' }, 800);
    });
    var AccordionMenu = (function AccordionMenu($) {

        function AccordionMenu(container) {
            this.$container = $(container);
            this.$positioner = this.$container.find('.section-menu-positioner');
            this.$sizer = this.$container.find('.section-menu-sizing-constraint');
            this.$menu = this.$container.find('.section-menu');
            this.containerRatio = 2;
            this.$items = this.$container.find('.menu-item');
            this.$links = this.$container.find('.menu-item a');
            this.$links.css({opacity: 0});
            this.itemWidth = 0;
            this.$container.css('visiblity', 'hidden');
            this.$items.css('width', 0);
            this.extraWidth = this.$items.eq(0).outerWidth() * this.$items.length;
            this.resize();
            this.reset();
            this.$container.css('visiblity', 'visible');
            this.$container.css('display', 'none');
            this.bindEvents();
        };

        AccordionMenu.prototype = {
            bindEvents: function bindEvents() {
                var me = this;
                var left = false;

                var interval;
                interval = setInterval(function() {
                    if (me.resize()) {
                        clearInterval(interval);
                    }
                }, 100);
                $(window).resize(function() { me.resize(); });

                this.$items.mouseenter(function() {
                    me.activate($(this), true);
                    left = false;
                });

                this.$items.mouseleave(function() {
                    left = true;
                    setTimeout(function() {
                        if (left) {
                            left = false;
                            me.reset(true);
                        }
                    }, 200);
                });
            },
            resize: function resize() {
                if (this.$sizer.width() == 0 || this.$sizer.height() == 0) {
                    return false;
                }
                this.$sizer.css({
                    'margin-left': (this.$container.width() - this.$sizer.width()) / 2
                });
                if (2 >= this.$sizer.width() / this.$sizer.height()) {
                    this.$positioner.width(this.$sizer.width());
                    this.$positioner.height(this.$positioner.width()/2);
                } else {
                    this.$positioner.height(this.$sizer.height());
                    this.$positioner.width(this.$positioner.height()*2);
                }
                this.$menu.width(this.$positioner.width() + this.$items.length*2);
                this.$positioner.css({
                    'margin-top': (this.$positioner.height()/-2) + 'px',
                    'margin-left': (this.$positioner.width()/-2) + 'px'
                });
                this.itemWidth = (this.$positioner.width() - this.extraWidth) / this.$items.length + 1;
                this.$items.width(this.itemWidth);
                return true;
            },

            reset: function reset(animate) {
                var duration = animate ? 350 : 0;
                this.$items.animate({ width: this.itemWidth }, duration);
                this.$links.animate({ opacity: 0 }, duration);
            },

            activate: function activate($item, animate) {
                this.$items.stop();
                var targetWidth = Math.floor(.45 * this.itemWidth * this.$items.length);
                var offItemWidth;
                var duration = animate ? 350 : 0;
                var $link = $item.find('a');
                if (targetWidth > this.itemWidth) {
                    offItemWidth = Math.floor((this.itemWidth * (this.$items.length - 1) - (targetWidth - this.itemWidth)) / (this.$items.length - 1));
                    this.$items.not($item).animate({
                        width: offItemWidth
                    }, duration);
                    $item.animate({ width: targetWidth }, duration);
                }
                this.$links.not($link).animate({ opacity: 0 }, duration);
                $link.animate({ opacity: 1 }, duration);
            }
        };

        return AccordionMenu;
    })(jQuery);

    var sectionMenu = new AccordionMenu('#menu-container');
    var ua = navigator.userAgent,
            event = (ua.match(/iPad/i)) ? "touchstart" : "click";

    window.deck.on('section_menu_shown', function() {
        if (window.digideck.section) {
            $('.menu-item-' + window.digideck.section.shortName).trigger('mouseenter');
        }
    });
    $('.rotator-slides').each(function() {
        $(this).find('.rotator-slide').eq(0).addClass('active');
    });
    $('.dsm-rotator .rotator-arrow-next').click(function() {
        var slides = $(this).parent().find('.rotator-slide');
        var active = $(this).parent().find('.rotator-slide.active');
        var index = slides.index(active);
        var newIndex;
        if (index == slides.length - 1) {
            newIndex = 0;
        } else {
            newIndex = index + 1;
        }
        active.removeClass('active');
        slides.eq(newIndex).addClass('active');
    });

    $('.dsm-rotator .rotator-arrow-previous').click(function() {
        var slides = $(this).parent().find('.rotator-slide');
        var active = $(this).parent().find('.rotator-slide.active');
        var index = slides.index(active);
        var newIndex;
        if (index == 0) {
            newIndex = slides.length - 1;
        } else {
            newIndex = index - 1;
        }
        active.removeClass('active');
        slides.eq(newIndex).addClass('active');
    });

    function resizeVideo(slide) {
        var video = slide.find('.video-container');
        if (!video.length) {
            return;
        }
        var width;
        var slideWidth = slide.find('.slide-inner-border').width();
        width = Math.round(slideWidth / 100 * 70) - 80;
        video.css('width', width + 'px');
        var height = Math.round(width / 700 * 400);
        var offset = Math.round(height/2) * -1;
        video.css('height', height + 'px');
        video.css('margin-top', offset + 'px');
    };

    window.deck.on('prepare_slide', resizeVideo);
    window.deck.on('resize_slide', resizeVideo);
    $('#video-overlay').append('<div class=\'intro-logo\'/>');

    function createVideo(container) {
        var videoInfo = container.data('video');

        if (window.cocoaDelegate) {
            var videoName = container.find('.ipadvideo');
            var parts = videoName.text().split(',');
            videoName.hide();
            window.cocoaDelegate('showVideo', parts[0], parts[1]);
        }

        var parts = videoInfo.split(':');
        var autoplay = false;
        var prefix = '/videos/';

        if (parts[0] === 'cdn') {
            prefix = 'http://831a7cf173c0d91861ef-a8c7d1aca3398043614c64ffa8e96f7b.r71.cf1.rackcdn.com/';
        }

        if (parts[0] == 'local') {
            prefix = '';
            autoplay = true;
        }

        if (!container.prev().hasClass('popup-screen')) {
            autoplay = false;
        }

        var playerElement = container.find('.video-player');
        var thisjwplayer = 'video-' + (new Date()).getTime();
        
        playerElement.attr('id', thisjwplayer);

        var config = {
            autoplay: autoplay,
            controlbar: {
                hide: true,
                idlehide: true
            },
            width: '100%',
            height: '100%',
            skin: '/organizations/nascar/jwplayer/modieus/modieus.xml',
            icons: 'true',
            stretching: "fill",
            bufferlength: '15',
            volume: '40',
            levels: [
                {file: prefix + parts[1] + '.mp4' },
                {file: prefix + parts[1] + '.webm' },
                {file: prefix + parts[1] + '.ogg' }
            ]
        };

        if(ua.match(/MSIE/i)) {
            config.modes = [
                { type: 'flash', src: '/organizations/nascar/jwplayer/player.swf' },
                { type: 'html5' }
            ]
        } else {
            config.modes = [
                { type: 'html5' },
                { type: 'flash', src: '/organizations/nascar/jwplayer/player.swf' }
            ]
        }

        if (parts[2]) {
            config.image = parts[2];
        }

        jwplayer(thisjwplayer).setup(config);
        return thisjwplayer;
    };


    window.deck.on('prepare_slide', function(slide) {
        var containers = slide.find('.dsm-video .video-container');
        if (!containers.length) {
            return;
        }

        containers.each(function() {
            createVideo($(this));
        });
    });

    window.deck.on('close_slide', function(slide) {
        var videos = slide.find('.dsm-video .video-container');
        if (!videos.length) {
            return;
        }

        videos.each(function() {
            $(this).html('<div style="height: 100%; width: 100%; position: relative"><div class="video-player"></div></div>');
        });
    });

    var currentVideoLayer;
    var currentVideoModule;
    $('.toggle-video').bind(event, function() {
        var module = $(this).parent();
        var layer = module.find('.video-layer');
        var container = module.find('.video-container');
        currentVideoLayer = layer;
        currentVideoModule = module;
        $('body').append(layer);

        if ($(this).data('jwplayer')) {
            curjwplayer = $(this).data('jwplayer');
        } else {
            curjwplayer = createVideo(container);
            $(this).data('jwplayer', curjwplayer);
        }
        layer.fadeIn();

        if (!ua.match(/iPhone|iPad|iPod/i)) {
            jwplayer(curjwplayer).play();
        }
    });

    function closePopupVideo(slide, noAnimate) {
        if (window.cocoaDelegate) {
            window.cocoaDelegate('hideVideo');
        } else {
            jwplayer(curjwplayer).stop();
        }

        if (noAnimate) {
            currentVideoLayer.hide();
            currentVideoModule.append(currentVideoLayer);
        }
        currentVideoLayer.fadeOut({
            'complete': function() {
                currentVideoModule.append(currentVideoLayer);
            }
        });
    };

    $('.close-video,.video-layer .popup-screen').bind(event, function() {
        closePopupVideo(currentVideoModule.parents('.slide'));
    });

    window.deck.on('close_slide', function(slide) {
        if (!$('body>.video-layer').length) {
            return;
        }
        closePopupVideo(slide, true);
    });

    var strongText = $('.left-column h3 strong');
    var menuButton = $('#section-menu-btn');
    var menuItemTitle = $('.menu-item p');
    var sectionTab = $('.section-tab');
    var propBar = $('.proposal-bar');

    switch(window.digideck.section.name) {
        case 'Power of NASCAR':
            strongText.css('color', '#f4902d');
            menuButton.css('background', 'url("http://nascar.thedigideck.com/organizations/nascar/images/section-menu-button-orange.png")');
            menuItemTitle.css('background', '#f4902d');
            sectionTab.css('background', '#f4902d');
            propBar.css({ 'background': '#f4902d' });
            break;
        case 'Official NASCAR Partnership':
            strongText.css('color', '#e9142b');
            menuButton.css('background', 'url("http://nascar.thedigideck.com/organizations/nascar/images/section-menu-button-red.png")');
            menuItemTitle.css('background', '#e9142b');
            sectionTab.css('background', '#e9142b');
            propBar.css({ 'background': '#e9142b' });
            break;
        case 'NASCAR Green':
            strongText.css('color', '#21aa5e');
            menuButton.css('background', 'url("http://nascar.thedigideck.com/organizations/nascar/images/section-menu-button-green.png")');
            menuItemTitle.css('background', '#21aa5e');
            sectionTab.css('background', '#21aa5e');
            propBar.css({ 'background': '#21aa53' });
            break;
        case 'Media Integration':
            strongText.css('color', '#a93f87');
            menuButton.css('background', 'url("http://nascar.thedigideck.com/organizations/nascar/images/section-menu-button-purple.png")');
            menuItemTitle.css('background', '#a93f87');
            sectionTab.css('background', '#a93f87');
            propBar.css({ 'background': '#a93f87' });
            break;
        case 'Team & Driver':
            strongText.css('color', '#6b70a9');
            menuButton.css('background', 'url("http://nascar.thedigideck.com/organizations/nascar/images/section-menu-button-indigo.png")');
            menuItemTitle.css('background', '#6b70a9');
            sectionTab.css('background', '#6b70a9');
            propBar.css({ 'background': '#6b70a9' });
            break;
        case 'Track Facilities':
            strongText.css('color', '#0092d2');
            menuButton.css('background', 'url("http://nascar.thedigideck.com/organizations/nascar/images/section-menu-button-blue.png")');
            menuItemTitle.css('background', '#0092d2');
            sectionTab.css('background', '#0092d2');
            propBar.css({ 'background': '#0092d2' });
            break;
        default:
            break;
    }

    $('.section-menu-positioner').append(
        '<div class="menu-logo"></div>'
    );

    window.deck.on('show_slide', function ($oldSlide, $curSlide) {
        var deferred = $.Deferred();
        $curSlide.css('opacity', 0);
        $curSlide.show();
        $curSlide.transition({ 'opacity': 1 }, 500, function () {
            deferred.resolve();
        });
        if($oldSlide) {
            $oldSlide.transition({ 'opacity': 0 }, 500, function() {
                $oldSlide.hide();
                $oldSlide.css('opacity', 1);
            });
        }
        return deferred;
    });

    window.deck.on('intro_video_end', function() {
        if (!ua.match(/iPhone|iPad|iPod/i)) {
            $('.video-menu').show();
        }
    });

    if (window.digideck.section && window.digideck.section.shortName) {
        if (!ua.match(/iPhone|iPad|iPod/i)) {
            $('.video-menu').show();
        }
    }

});