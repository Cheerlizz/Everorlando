
import * as THREE from 'three';
import { Scene, SphereGeometry, Vector3, PerspectiveCamera, WebGLRenderer, Color, MeshBasicMaterial, Mesh, Clock,DirectionalLight,AudioLoader,Audio,AudioAnalyser,AudioListener} from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.146/examples/jsm/controls/OrbitControls.js';
import { createSculptureWithGeometry } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/OBJLoader.js";
import { spCode } from '/sp-code.js';


// Create a new audio context
const audioContext = new AudioContext();

// Ask for permission to access the microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    // Create a media stream source from the microphone
    const microphone = audioContext.createMediaStreamSource(stream);

    // Create an audio analyser node
    const analyser = audioContext.createAnalyser();

    // Connect the microphone to the analyser
    microphone.connect(analyser);

    // Set the FFT size (number of frequency bins)
    analyser.fftSize = 64;



let scene = new Scene();

let camera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.set( 0.5, 0.1, 1.4 );

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( new Color(1, 1, 1), 0);
    document.body.appendChild( renderer.domElement );


//give track of time
let clock = new Clock();

//The parameters of 3d shader

let state = {
  offX: 0.0,
  offY: -0.9,
  petal: 0.55,
  fuse: -1.3,
  numPoints: 32,
  rotX: 20,
  rotY: 20,
  offsetX:1000,
  offsetY:1320,
  offsetZ:231,

  time: 0.0,
  currAudio: 0.0,
  avgAudio: 0,
  scaledAudio: 0,
  lowAudio: 0,
  hiAudio: 0,
  midAudio: 0,
  volume:0,
}





// Sky

const canvas = document.createElement( 'canvas' );
      canvas.width = 1;
      canvas.height = 32;

const context = canvas.getContext( '2d' );
const gradient = context.createLinearGradient( 0, 0, 0, 32 );

      gradient.addColorStop( 0.0,'#C1EFF8' );
      gradient.addColorStop( 0.5, '#F7FACD' );
      gradient.addColorStop( 1.0,  '#BBB0D6' );
      context.fillStyle = gradient;
      context.fillRect( 0, 0, 1, 32 );

const skyMap = new THREE.CanvasTexture( canvas );
      skyMap.colorSpace = THREE.SRGBColorSpace;

const sky = new THREE.Mesh(
  new THREE.SphereGeometry( 10 ),
  new THREE.MeshBasicMaterial( { map: skyMap, side: THREE.BackSide } )
);
scene.add( sky );



// Create a basic geometry
let geometry  = new SphereGeometry(2, 45, 45);

// The shader is like 3d texture of the object
let mesh = createSculptureWithGeometry(geometry, spCode(), () => {
  return {
    offX: state.offX,
    offY: state.offY,
    petal: state.petal,
    fuse: -0.8+state.hiAudio,
    numPoints: state.numPoints,
    rotX: state.rotX,
    rotY: state.rotY,
    time: state.time, // time uniform

  }
})

scene.add(mesh);


//// GUI 
// Uncomment when debugging
// *For some reason, using the GUI makes the rendering slow, while directly sending the sound signal to control is smooth.

// const gui = new GUI();

// gui.add( state, 'offsetX', 0, 2000 ).name( 'colorX' ).onChange( function ( value ) {
// 		state.offX = value;
// 	render();
// } );
// gui.add( state, 'offsetY', 0, 2000).name( 'colorY' ).onChange( function ( value ) {
// 		state.offY = value;
// 	render();
// } );
// gui.add( state, 'offsetZ', 0,2000 ).name( 'colorZ' ).onChange( function ( value ) {
// 		state.offZ = value;
// 	render();
// } );



// Add mouse controlls
let controls = new OrbitControls( camera, renderer.domElement, {
  enableDamping : true,
  dampingFactor : 0.25,
  zoomSpeed : 0.5,
  rotateSpeed : 0.5
} );


    // Create an array to hold the frequency data
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  
let rotateY = 0.1;
let angleY = 0;
  
let render = () => {
  requestAnimationFrame( render );
  state.time += clock.getDelta();

  // Get the frequency data from the analyser
  analyser.getByteFrequencyData(frequencyData);
  
  //This section uses the frequency of the sound to construct the shape of the object
  if(frequencyData) {

    let sum = 0;
    let avgFrequency = 0;
    let midScale = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    avgFrequency =Math.pow((sum / frequencyData.length)/255,0.4);
    // Map the frequency date from 0-255 to 0-1 
    //state.scaledAudio = ((( avgFrequency-35)/ 70) * 0.7) + 0.3;
    state.scaledAudio = Math.pow(( frequencyData[1]/255)*0.8,6)*10;
    // smooth the change, we're getting 80% of the previous audio and 20% of the current 
    state.avgAudio= .2 * state.scaledAudio + .8 * state.avgAudio; 
    state.offX = Math.max(-0.8, Math.min(0.8, -0.2 + state.avgAudio));

    // Calculate the volume based on the average amplitude
    state.volume =.2* avgFrequency+.8*state.volume ;
    state.offY = Math.max(-0.8, Math.min(0.8, -0.8 + state.volume));
    // //Use three frequency bands of sound as parameters
    
    // midScale = Math.pow((frequencyData[16])/255,0.8)*4;
    // state.midAudio = .3 * midScale  + .7 * state.midAudio;

     state.hiAudio = .2 * (Math.pow(frequencyData[31]/ 255,2)*6) + .8 * state.hiAudio;
     // Get the values at indices 10 and 20 in the frequency data array
     const value1 = frequencyData[10];
     const value2 = frequencyData[21];

    // Calculate the proportion of value1 and value2 in the frequency data
    const proportion1 = value1 /255;
    const proportion2 = value2 /255;
    const sub =6*(proportion1-proportion2);
    
    state.midAudio = .3 * sub  + .7 * state.midAudio;

    //console.log('avg',state.avgAudio);
    //console.log('osc',state.hiAudio);

    //console.log('mid', state.midAudio);
    console.log('offX',state.offX);
    // console.log('ary',frequencyData);
    console.log('vol',state.volume);
    console.log('offY',state.offY);

    const angle = Math.sin(state.time*0.01) * Math.PI / 16; // Adjust this value to control the lift angle

    camera.rotation.x = angle;
  

  }


  renderer.render( scene, camera );

};

render();


let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize );

})
.catch(function(err) {
  console.log('The following getUserMedia error occurred: ' + err);
});


