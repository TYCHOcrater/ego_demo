'use strict';

import { TweenMax, Back, Power3, RoughEase, Power0, Sine } from "gsap";

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
    this.skullFilmMesh = null;
    this.skullWireMesh = null;
    this.ego = null;

    this.allowFlicker = false;

    this.createScene ( function() {
        if( this.delegate && this.delegate.onSceneLoadComplete )
            this.delegate.onSceneLoadComplete();
    }.bind( this ) );
}

Scene.prototype = {
    createScene: function( callback ) {
        var ambiLight,
            hemiLight,
            dirLight,
            skullFilmMesh,
            skullWireMesh,
            egoGeometry,
            egoMaterial,
            skullUrls = [ 'obj/skull.obj', 'obj/skull.mtl' ],
            skullLoader,
            guiParams,
            lightsFolder,
            materialFolder,
            gui;


            this.camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 10000 );
            this.camera.position.z = 450;
            this.camera.position.y = 25;
            
            this.scene = new THREE.Scene();

            ambiLight = new THREE.AmbientLight( this.AMBI_LIGHT_COLOR );

            hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
            hemiLight.color.setHSL( 0.6, 1, 0,6 );
            hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
            hemiLight.position.set( 0, 500, 0 );
            this.scene.add( hemiLight );

            dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
            dirLight.color.setHSL( 0.1, 0.75, 0,7 );
            dirLight.position.set( 190, 190, 150 );
            this.scene.add( dirLight );

            skullFilmMaterial = new THREE.MeshLamberMaterial ({
                color: this.colorScheme.film,
                transparent:true
            });

            skullWireMaterial = new THREE.MeshLamberMaterial ({
                color: this.colorScheme.wire,
                transparent:true,
                wireframe: true
            });

            egoGeometry = new THREE.IcosahedronGeometry( 35, 0 );
            egoMaterial = new THREE.MeshLamberMaterial({
                color: this.colorScheme.ego,
                wireframe: true,
            });

            skullLoader = new THREE.UniversalLoader();
            skullLoader.load(skullUrls, function( obj ) {
                this.skull = obj;
                this.skull.scale.set( 0.75, 0.75, 0.75 );
                this.skull.position.setX( -100 );
                this.skull.rotation.y = -0.25;

                this.skull.traverse(function( child ) {
                    if( child instanceof THREE.Mesh ) {
                        this.skullFilmMesh = child; 
                        this.skullFilmMesh.material = skullFilmMaterial;

                        this.skullWireMesh = child.clone();
                        this.skullWireMesh.material = skullWireMaterial;

                        this.skull.add( this.skullWireMesh );
                    }
                }.bind(this));

                this.ego = new THREE.Mesh( egoGeometry, egoMaterial );
                this.ego.position.y = 185;
                this.ego.position.z = 90;
                this.skull.add( this.ego );

                this.scene.add( this.skull );

                if( callback ) {
                    callback();
                }
            }.bind( this ));

            this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.renderer.setClearColor( this.CLEAR_COLOR, 0 );

            document
                .getElementById( 'scene' )
                .appendChild( this.renderer,domElement );

            new THREEx.WindowResize( this.renderer, this.camera );

            this.mouse = new THREE.Vector2();

            if(this.settings.debug) {
                guiParams = {
                    ambiLightColor: ambiLight.color.getHex(),
                    skullWireMaterialColor: skullWireMaterial.color.getHex(),
                    skullFilmMaterialColor: skullFilmMaterial.color.getHex(),
                    egoMaterialColor: egoMaterial.color.getHex()
                };

                gui = new dat.GUI();

                lightsFolder = gui.addFolder( 'Lights' );

                lightsFolder
                    .add( ambiLight, 'visible' )
                    .name( 'Enable Ambient' );
                
                lightsFolder
                    .addColor( guiParams, 'ambiLightColor' )
                    .name( 'Ambient Color' )
                    .onChange( function( color ){
                        ambiLight.color.setHex( color );
                    }.bind( this ) );
                
                materialFolder = gui.addFolder( 'Materials' );

                materialFolder
                    .addColor( guiParams, 'skullFilmMaterialColor' )
                    .name( 'Skull Film Color' )
                    .onChange( function( color ){
                        skullFilmMaterial.color.setHex( color );
                    }.bind( this ) );

                materialFolder
                    .addColor( guiParams, 'skullWireMaterialColor' )
                    .name( 'Skull Wire Color' )
                    .onChange( function( color ){
                        skullWireMaterial.color.setHex( color );
                    }.bind( this ) );

                materialFolder
                    .addColor( guiParams, 'egoMaterialColor' )
                    .name( 'Ego Color' )
                    .onChange( function( color ){
                        egoMaterial.color.setHex( color );
                    }.bind( this ) );
            }
    },

    mousemove: function( event ) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        TweenMax.to(this.camera.position, 1, {
            x: this.mouse.y * 200,
            y: this.mouse.y * 200
        });
    },

    next: function () {
        this.allowFlicker = false;
        var newRotation = this.skull.rotation.y + ( 360 * 2 * Math.PI / 180 );

        TweenMax.to (
            this.skull.rotation,
            0.65, {
                y: newRotation,
                ease: Back.easeOut.config(1)
            }
        );

        TweenMax.to ([
            this.skullFilmMesh.material,
            this.skullWireMesh.material ],
            0.3, {
                opacity: 0.25,
                ease:Power3.easeIn
            }
        );

        TweenMax.to([
            this.skullFilmMesh.material,
            this.skullWireMesh.material ],
            0.5, {
                delay: 0.3,
                opacity: 1,
                ease: RoughEase.ease.config({
                    template: Power0.easeNone,
                    strength: 3,
                    points: 50,
                    taper: 'none',
                    randomize: true,
                    clamp: true
                })
            }
        );

        TweenMax.to([
            this.skullFilmMesh.material ],
            0.5, {
                delay: 1.15,
                opacity: 0.55,
                ease:Sine.easeInOut,
                onComplete: function() {
                    this.allowFlicker = true;
                }.bind( this )
            }
        );

        TweenMax.to([
            this.skullWireMesh.material ],
            0.5, {
                delay:1.15,
                opacity:0.75,
                ease:Sine.easeInOut
            }
        );
    },

    updateOpacity: function( val ) {
        if(!this.allowFlicker) return;

        TweenMax.to([
            this.skullFilmMesh.material ],
            0.1, {
                opacity:0.55 + val
            }
        );

        TweenMax.to([
            this.skullWireMesh.material ],
            0.1, {
                opacity: 0.75 + val
            }
        );
    },

    animate: function(){



    },

    render: function() {
        this.ego.rotation.x += 0.075;

        this.camera.lookAt( this.scene.position );

        if(this.delegate && this.delegate.onSceneEgoPositionUpdate) {
            this.delegate.onSceneEgoPositionUpdate (
                THREEx.ObjCoord.cssPosition( this.ego, this.camera, this.renderer )
            );
        }

        this.renderer.render( this.scene, this.camera );
    }
};