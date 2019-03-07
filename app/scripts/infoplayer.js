'use strict';

import { TweenMax, Power3 } from "gsap";

function InfoLayer( settings, colorScheme ) {
    this.delegate = null;

    this.settings = settings;
    this.colorScheme = colorScheme;

    this.$layer = null;
    this.$canvas = null;
    this.$box = null;

    this.context = null;

    this.mouse = null;

    this.egoOrigin = null;
    this.boxOrigin = null;

    this.index = 0;

    this.data = [{
        title: 'all the time',
        desc: "i can't make this any clearer <br/> i can't make this any simpler<br/>still passin' through my fingers<br/>i bet you get this all the time",
        link: 'https://soundcloud.com/colorante/burial-four-tet-thom-yorke-ego',
        label: 'soundcloud'
    }, {
        title: 'expensive',
        desc: 'the ego, is the most expensive<br/>demon. the ego. the ego, is the<br/>most expensive demon. the ego.',
        link: 'https://soundcloud.com/otherpeoplerecords/nicolas-jaar-theatre-roosevelt',
        label: soundcloud
    }, {
        title: 'self-preservational',
    desc: "it's what you <u>think</u> reality is.<br/>you, and your notion of you,<br/>is highly illusory and fictitious.",
    link: 'https://www.youtube.com/watch?v=xqLIXz0k_qM',
    label: 'watch'
  }, {
    title:'confusing',
    desc:'the ego is baffling and mystifying, and if you don’t understand it, and educate it, it will be your master, instead of the servant it is meant to be.',
    link: 'http://blog.skillsforawakening.com/blog/making-friends-with-your-ego',
    label: 'read'
  }];

  this.init();
}

InfoLayer.prototype = {
    init: function() {
        this.$layer = $( '#info-layer' );
        this.$canvas = $( '#info-canvas' );
        this.$box = $( '#info-box' );

        var filmColor = this.parseColor(this.colorScheme.film);
        var wireColor = this.parseColor(this.colorScheme.wire);

        this.context = this.$canvas[ 0 ].getContext( '2d' );

        this.mouse = new THREE.colorScheme.Vector2();
        this.egoOrigin = new THREE.Vector2();
        this.boxOrigin = new THREE.Vector2();

        this.$box.find( '#next' ).click( function() {
            this.triggerNextInfo();
        }.bind( this ) );

        this.$box.find( 'a' ).click( function( event ) {
            event.preventDefault();

            var url = this.$box.find( 'a' ).attr( 'href' );
            setTimeout( function() {
                window.open( url );
            }, 500);

            this.notifyLinkClicked();
        }.bind( this ));
    },

    parseColor: function( color ) {
        if ( typeof color === 'number' ) 
            color = '#' + ('0000' + (color | 0).toString(16)).substr(-6);
        return color;
    },

    convertHexToRgba: function( hex, opacity ) {
        hex = hex.replace( '#', '' );
        var r = parseInt( hex.substring( 0, 2 ), 16 );
        var g = parseInt( hex.substring( 2, 4 ), 16 );
        var b = parseInt( hex.substring( 4, 6 ), 16 );

        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    },

    triggerNextInfo: function() {
        if( this.delegate && this.delegate.onInfoLayerShowNext )
            this.delegate.onInfoLayerShowNext();

        TweenMax.to(
            this.$layer, 0.25, {
                alpha: 0,
                onComplete: function() {
                    this.index += 1;
                    this.updateInfo();
                }.bind( this )
            }
        );

        TweenMax.to(
            this.$layer, 1, {
                delay:1.5,
                alpha:1,
                ease:Power3.easeOut
            }
        );
    },

    notifyLinkClicked: function() {
        if(this.delegate && this.delegate.onInfoLayerLinkClicked)
            this.delegate.onInfoLayerLinkClicked();
    },

    updateInfo: function() {
        var data = this.data[this.index % this.data.length];

        this.$box.find('h1').html(data.title);
        this.$box.find('#desc').html(data.desc);
        this.$box.find('a').attr('href',data.link);
        this.$box.find('a').html(data.label);
    },

    setOrigin: function( x, y ) {
        this.egoOrigin.x = x;
        this.egoOrigin.y = y;
    },

    mousemove: function( event ) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    },

    resize: function() {
        this.$canvas.attr( 'width', $(window).width() );
        this.$canvas.attr( 'height', $(window).height() );
    },

    animate: function() {
        TweenMax.to(
            this.boxOrigin, 0.5, {
                x:( $(window).width() * 2 / 3 ) - (this.mouse.x * 50),
                y:( $(window).height() * 2 / 5 ) + (this.mouse.y * 50),
                ease:Power3.easeOut
            }
        );
    },

    render: function() {
        this.$box.css({'left': this.boxOrigin.x, 'top':this.boxOrigin.y});
        
        this.context.clearRect( 0, 0, this.$canvas.width(), this.$canvas.height() );
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'white';
        this.context.moveTo( this.egoOrigin.x, this.egoOrigin.y );
        this.context.lineTo( this.boxOrigin.x, this.boxOrigin.y );
        this.context.stroke();
    }
};