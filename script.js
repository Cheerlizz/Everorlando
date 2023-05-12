
import * as THREE from 'three';
import { Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, Mesh, Clock,DirectionalLight,AudioLoader,Audio,AudioAnalyser,AudioListener} from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.146/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/OBJLoader.js";
import { spCode } from '/sp-code.js';

let scene = new Scene();

let camera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set( 0.5, 0.5, 1.0 );

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( new Color(1, 1, 1), 0);
    document.body.appendChild( renderer.domElement );


//give track of time
let clock = new Clock();


// AUDIO

let button = document.querySelector('.button');
    button.innerHTML = "Loading Audio..."

// create an AudioListener and add it to the camera
const listener = new AudioListener();
camera.add( listener );

// create an Audio source
const sound = new Audio( listener );
let startTime = Date.now();

// load a sound and set it as the Audio object's buffer
const audioLoader = new AudioLoader();
audioLoader.load( 'https://cdn.glitch.me/d0cdb937-b74c-4381-bd5e-899273644164/BUB5.wav?v=1683312121396', function( buffer ) {
  sound.setBuffer( buffer );
  sound.setLoop(true);
  sound.setVolume(0.5);
  button.innerHTML = "Play Audio"
  button.addEventListener('pointerdown', () => {
    button.style.display = 'none';
    sound.play();
  }, false);
});

// create an AudioAnalyser, passing in the sound and desired fftSize
// get the average frequency of the sound
const analyser = new AudioAnalyser( sound, 32 );



// Sky

const canvas = document.createElement( 'canvas' );
      canvas.width = 1;
      canvas.height = 32;

const context = canvas.getContext( '2d' );
const gradient = context.createLinearGradient( 0, 0, 0, 32 );

      gradient.addColorStop( 0.0, '#BBB0D6' );
      gradient.addColorStop( 0.5, '#F7FACD' );
      gradient.addColorStop( 1.0, '#C1EFF8' );
      context.fillStyle = gradient;
      context.fillRect( 0, 0, 1, 32 );

const skyMap = new THREE.CanvasTexture( canvas );
      skyMap.colorSpace = THREE.SRGBColorSpace;

const sky = new THREE.Mesh(
  new THREE.SphereGeometry( 10 ),
  new THREE.MeshBasicMaterial( { map: skyMap, side: THREE.BackSide } )
);
scene.add( sky );



//The parameters of 3d shader

let state = {
  offX: 0.2,
  offY: 0.2,
  petal: 0.4,
  fuse: -1.4,
  numPoints: 26,
  rotX: 20,
  rotY: 20,

  time: 0.0,
  currAudio: 0.0,
  avgAudio: 0,
  scaledAudio: 0,
  lowAudio: 0,
  hiAudio: 0,
  midAudio: 0
}

// Create a basic geometry
let geometry  = new SphereGeometry(2, 45, 45);

// The shader is like 3d texture of the object
let mesh = createSculptureWithGeometry(geometry, spCode(), () => {
  return {
    offX: state.midAudio,
    offY: state.offY,
    petal: state.avgAudio,
    fuse: state.hiAudio,
    numPoints: state.numPoints,
    rotX: state.rotX,
    rotY: state.rotY,
    time: state.time, // time uniform

  }
})

scene.add(mesh);



//// GUI 
//// Uncomment when debugging
//// *For some reason, using the GUI makes the rendering slow, while directly sending the sound signal to control is smooth.

// const gui = new GUI();

// gui.add( state, 'offX', -1, 1 ).step( 0.01 ).name( 'offX' ).onChange( function ( value ) {
// 		state.offX = value;
// 	render();

// } );

// gui.add( state, 'offY', -1, 1 ).step( 0.01 ).name( 'offY' ).onChange( function ( value ) {
// 		state.offY = value;
// 	render();
// } );

// gui.add( state, 'petal', 0, 1 ).step( 0.1 ).name( 'petal' ).onChange( function ( value ) {
// 		state.petal = value;
// 	render();
// } );

// gui.add( state, 'fuse', -2, 2 ).step( 0.01 ).name( 'fuse' ).onChange( function ( value ) {
// 		state.fuse = value;
// 	render();
// } );

// gui.add( state, 'numPoints', 0, 40 ).step( 1 ).name( 'numPoints' ).onChange( function ( value ) {
// 		state.numPoints = value;
// 	render();
// } );

// gui.add( state, 'rotX', 0, 10 ).step( 1 ).name( 'rotX' ).onChange( function ( value ) {
// 		state.numPoints = value;
// 	render();

// } );

// gui.add( state, 'rotY', 0, 10 ).step( 1 ).name( 'rotY' ).onChange( function ( value ) {
// 		state.numPoints = value;
// 	render();
// } );


// Add mouse controlls
let controls = new OrbitControls( camera, renderer.domElement, {
  enableDamping : true,
  dampingFactor : 0.25,
  zoomSpeed : 0.5,
  rotateSpeed : 0.5
} );

let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize );


let render = () => {
  requestAnimationFrame( render );
  state.time += clock.getDelta();
  
  //This section uses the frequency of the sound to construct the shape of the object
  if(analyser) {

    // Map the frequency date from 0-255 to 0-1 
    state.scaledAudio = (((analyser.getAverageFrequency()-35)/ 70) * 0.7) + 0.3;

    // smooth the change, we're getting 80% of the previous audio and 20% of the current 
    state.avgAudio= Math.sin(.2 * state.scaledAudio + .8 * state.avgAudio); 
    
    //Use three frequency bands of sound as parameters
    state.lowAudio = (((analyser.getFrequencyData()[2]-200) / 40)*2-1) * 1;
    state.midAudio = Math.sin(.2 * (((analyser.getFrequencyData()[5] -30)/60)*2-1)  + .8 * state.midAudio);
    state.hiAudio = .2 * (((analyser.getFrequencyData()[9] -20)/ 30)*2-1) + .8 * state.hiAudio;
    
    //console.log(state.avgAudio);
    //console.log(state.hiAudio);
  }

  
  renderer.render( scene, camera );
};

render();