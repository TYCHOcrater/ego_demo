'use strict';

function Scene( settings, colorScheme ) {
    this.CLEAR_COLOR = 0x000000;
    this.AMBI_LIGHT_COLOR = 0xffffff;

    this.delegate = null;

    this.settings = settings;
    this.colorScheme = colorScheme;

    this.camera = null;
    this.scene = null;
    this.renderer = null;

    this.mouse = null;

    this.skull = null;
    
}