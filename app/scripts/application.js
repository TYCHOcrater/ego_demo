'use strict';

import { TweenMax } from "gsap";
import { throws } from "assert";

function Application( options ) {
    this.defaults = {
        debug: true
    };

    this.settings = _.extend(this.defaults, options);

    this.sound = null;
    this.infoLayer = null;
    this.scene = null;

    this.audioScriptNode = null;

    this.soundLoaded = false;
    this.colorSchemes = [
        { film:0x4d00a7, wire:0x00b3ff, ego:0xffffff },

        { film:0xb3005f, wire:0xfff000, ego:0xffffff },

        { film:0x1400ac, wire:0x0096ff, ego:0xffffff },

        { film:0x18cf00, wire:0x6900ff, ego:0xffffff }
    ];

    $(document).ready( this.init.bind( this ) );
}

Application.prototype = {
    init: function() {
        if (!Detector.webgl) {
            $('html').addClass('detector-no-webgl');
            return;
        }

        this.activateColorScheme = this.colorSchemes[Math.round(Math.random() * (this.colorSchemes.length - 1))];

        this.sound = new buzz.sound("audio/crackle.mp3", {preload:true, autoplay:false, loop:true, volume:100});
        this.sound.bind('loadeddata', function(){
            this.soundLoadComplete();
        }.bind( this ));

        this.infoLayer = new InfoLayer( this.settings, this.activateColorScheme );
        this.infoLayer.delegate = this;

        this.scene = new Scene( this.settings, this.activateColorScheme );
        this.scene.delegate = this;

        $(window).resize( this.resize.bind(this) );
    },

    soundLoadComplete: function() {
        this.soundLoaded = true;
        this.verifyAssetLoad();
    },

    verifyAssetLoad: function() {
        if( this.soundLoaded && this.sceneLoaded )
            this.start();
    },

    start: function() {
        this.resize();

        this.sound.play();
        if(this.settings.debug)
            this.sound.mute();

        this.monitorVolume();

        this.infoLayer.triggerNextInfo();

        $(window).mousemove( function(event ) {
            event.preventDefault();
            this.scene.mousemove( event );
            this.infoLayer.mousemove( event );
        }.bind( this ));

        $(window).on("blud focus", function(e) {
            var prevType = $(this).data("prevType");

            if(prevType != e.type) {
                switch (e.type) {
                    case "focus":
                        if(this.sound)
                            this.sound.fadeTo(100, 500);
                        break;
                }
            }

            $(this).data("prevType", e.type);
        }.bind( this ));
        
        TweenMax.ticker.fps(60);
        TweenMax.ticker.addEventListener( 'tick', this.tick.bind( this ) );
    },

    resize: function() {
        if(this.infoLayer)
            this.infoLayer.resize();
    },

    monitorVolume: function() {
        var AudioContext = (window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext || 
            window.oAudioContext ||
            window.msAudioContext);

        var context = new AudioContext();

        this.audioScriptNode = context.createScriptProcessor(2048, 1, 1);
        this.audioScriptNode.connect(context.destination);

        var analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 1024;
        analyser.connect(this.audioScriptNode);

        var sourceNode = context.createMediaElementSource(this.sound.sound);
        sourceNode.connect(analyser);
        sourceNode.connect(context.destination);

        this.audioScriptNode.onaudioprocess = function() {
            this.processAudioFrame(analyser);
        }.bind( this );
    },

    processAudioFrame: function(analyser) {
        var array = new Uint8Array(analyser.frequencyBinCount);

        analyser.getByteFrequencyData(array);

        var average = this.getAverageVolume(array);
        this.scene.updateOpacity(average / 100);
    },

    getAverageVolume: function(array) {
        var values = 0,
            averages,
            length = array.length;
        for ( var i = 0; i < length; i++ )
            values += array[i];
        return values / length;
    },

    tick: function() {
        this.scene.animate();
        this.infoLayer.animate();

        this.scene.render();
        this.infoLayer.render();
    },

    onInfoLayerShowNext: function() {
        this.scene.next();
    },

    onInfoLayerLinkClicked: function() {
        if(this.sound)
            this.sound.fadeTo( 0, 250 );
    },

    onSceneLoadComplete: function() {
        this.sceneLoaded = true;
        this.verifyAssetLoad();
    },

    onSceneEgoPositionUpdate: function() {
        this.infoLayer.setOrigin( position.x, position.y );
    },
};