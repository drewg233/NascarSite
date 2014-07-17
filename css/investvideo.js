$(function() {
                    $('#menu-container .logo').css({'margin-left': '-175px'});
    
    $('#skip-intro').unbind('click');

    function endVideo() {
        window.videoIsEnded = true;
        if(window.cocoaDelegate) {
            window.cocoaDelegate('hideVideo');
        }
        deck.trigger('intro_video_end');

                                                    $('#menu-container').show();
            $('#menu').show();
            $('#intro-video,#skip-intro').animate({
              'margin-top': 500
            }, 1750);
            $('#video-overlay,#intro-logo').animate({
              'opacity': 0
            }, 1000, null, function() {
                $('#intro-logo,#video-overlay,#video-container, #skip-intro').remove();
                deck.close();
                deck.trigger('intro_menu_shown');
            });
                        };

    $('#skip-intro').click(endVideo);
    window.endVideo = true;

    var videoUrl = './videos/invest';

    var ua = navigator.userAgent;

    if (ua.match(/MSIE/i)) {
        jwplayer("thePlayer").setup({
            skin: 'http://nascar.thedigideck.com/organizations/nascar/jwplayer/modieus/modieus.xml',
            autoplay: true,
            "controlbar.hide": true,
            "controlbar.idlehide": true,
            width: '100%',
            height: '100%',
            stretching: "fill",
            volume: '40',
            image: 'http://nascar.thedigideck.com/organizations/nascar/posters/intro.jpg',
            modes: [
                { type: 'flash', src: 'http://nascar.thedigideck.com/bundles/spodigdigideck/presentation/jwplayer/player.swf' },
                { type: 'html5' }
            ],
            levels: [
            {file: videoUrl+'.mp4'}, {file: videoUrl+'.webm'}
            ]
        });
    } else {
        setTimeout(function() {
            jwplayer("thePlayer").setup({
                                            skin: 'http://nascar.thedigideck.com/organizations/nascar/jwplayer/modieus/modieus.xml',
                autoplay: true,
                "controlbar.hide": true,
                "controlbar.idlehide": true,
                width: '100%',
                height: '100%',
                stretching: "fill",
                volume: '40',
                image: 'http://nascar.thedigideck.com/organizations/nascar/posters/intro.jpg',
                modes: [
                    { type: 'html5' },
                    { type: 'flash', src: 'http://nascar.thedigideck.com/bundles/spodigdigideck/presentation/jwplayer/player.swf' }
                ],
                levels: [
                {file: videoUrl+'.mp4'}, {file: videoUrl+'.webm'}
                ]
            });
        }, 500);
    }

    jwplayer('thePlayer').onComplete(function(event) {
        endVideo();
     });

    $('#skip-intro').click(function() {
                            jwplayer('thePlayer').stop();
                        });

    $('#intro-video').append('<div class="pause-button"></div>');
    $('#intro-video').click(function() {
        if ($('#intro-video').find('.pause-button').hasClass('hidden')) {
            $('#intro-video').find('.pause-button').removeClass('hidden');
            $('#intro-video').find('.pause-button').show();
        } else {
            $('#intro-video').find('.pause-button').addClass('hidden');
            $('#intro-video').find('.pause-button').hide();
        }
    });

                });
