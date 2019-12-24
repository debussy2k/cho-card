import * as THREE from '../threejs_master/build/three.module.js';
import { OrbitControls } from '../threejs_master/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../threejs_master/examples/jsm/loaders/GLTFLoader.js';

var scene, camera, renderer;
var controls;
var mixer, actions, clock, animationPaused = true;
var objects = null;
var surfaces = null;

init();
animate();

function init() {
	// document container
	let container = document.createElement( 'div' );
	document.body.appendChild( container );
    window.addEventListener( 'resize', onWindowResize, false );

	// Buttons: event handler
	let page1Button = document.getElementById('page1Button');
	page1Button.onclick = onClickPage1Button;
	let page2Button = document.getElementById('page2Button');
	page2Button.onclick = onClickPage2Button;
	let animationButton = document.getElementById('animationButton');
	animationButton.onclick = onClickAnimationButton;

	// Create clock
	clock = new THREE.Clock();

	camera = createCamerea();
	renderer = createRenderer();
	controls = createOrbitControls();
	scene = createScene();
	setLights();

    container.appendChild( renderer.domElement );

	// Load gltf model
	loadModel2();
}


function createCamerea() {
	// Create camera
	let camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.up.set(0, 0, -1);
	camera.position.set(0, 4, 2);
	return camera;
}


function createRenderer() {
	// Create renderer
	let renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaOutput = false; // use if texture image is not gamma-corrected
	renderer.shadowMap.enabled = true;
	return renderer;
}

// Create scene
function createScene() {
	let scene = new THREE.Scene();
	scene.background = new THREE.Color(0xdfdfdf);
	scene.up.set(0, 1, 0);
	scene.position.set(0, 0, 0);
	return scene;
}

// Create OrbitControls
function createOrbitControls() {
    let controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.5;
	controls.enableZoom = true;
	controls.enablePan = false; 
	controls.enableRotate = true;
	controls.rotateSpeed = 1.0;
	controls.minDistance = 2;
	controls.maxDistance = 20;

	return controls;
}

// Create light sources
function setLights() {
	let ambientlight = new THREE.AmbientLight(0x404040);

	let dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
	dirLight1.position.set(0, 1, 2);

	let dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
	dirLight2.position.set(0, -1, 2);

	let pointLight1 = new THREE.PointLight(0xffffff, 0.5, 30);
	pointLight1.position.set(0, -5, 3);
	
	let pointLight2 = new THREE.PointLight(0xffffff, 0.5, 30);
	pointLight2.position.set(0, 5, 3);
	scene.add( ambientlight );
	scene.add( dirLight1 );
	scene.add( dirLight2 );
	scene.add( pointLight1 );
	scene.add( pointLight2 );
}


function loadModel1() {
	let textureFileNameP1 = './models/hcard_page1.png';
	let textureFileNameP2 = './models/hcard_page2.png';
	let textureP1 = getTextureLoader(textureFileNameP1);
	let textureP2 = getTextureLoader(textureFileNameP2);
	
	let model_file_name = 'hcard1.glb';
	// GLTK model
	var loader = new GLTFLoader().setPath( './models/' );
	loader.load( model_file_name, function ( gltf ) {
		gltf.scene.position.x = 0; //Position (x = right+ left-) 
		gltf.scene.position.y = 0; //Position (y = up+, down-)
		gltf.scene.position.z = 0; //Position (z = front +, back-)

		scene.add( gltf.scene );
		// object and surface names are from blender model (Note "." is not kept)
		objects = gltf.scene.children.filter(child=> child.isMesh && child.name.startsWith("Object")); 
		surfaces = gltf.scene.children.filter(child=> child.isMesh && child.name.startsWith("Surface"));

		objects.forEach( obj => {
			obj.material = new THREE.MeshLambertMaterial({ color: 0xffffffee });
			obj.material.needsUpdate = true;
		});

		surfaces.forEach( obj => {
			obj.material = new THREE.MeshLambertMaterial({ 
				color: 0xffffffee,
				opacity: 1.0,
				map: (obj.name.endsWith('front')) ? textureP1 : textureP2
			}); 
			obj.material.needsUpdate = true;
		});
	} );
}


function loadModel2() {
	let modelFileName = 'hcard3.glb';
	let surfaceDics = [
		{ name: 'Surface_main_front', textureFile: './models/hcard_page1.png' },
		{ name: 'Surface_main_back', textureFile: './models/hcard_page2.png' },
		{ name: 'Surface_main_in_up', textureFile: './models/hcard_page4.png' },
		{ name: 'Surface_main_in_down', textureFile: './models/hcard_page4.png' }
	];
	let sheetObjectDics = [
		{ name: 'Object_main1' },
		{ name: 'Object_main2' }
	];
	
	// GLTK model
	var loader = new GLTFLoader().setPath( './models/' );
	loader.load( modelFileName, function ( gltf ) {
		gltf.scene.position.x = 0; //Position (x = right+ left-) 
		gltf.scene.position.y = 0; //Position (y = up+, down-)
		gltf.scene.position.z = 0; //Position (z = front +, back-)

		scene.add( gltf.scene );
		// object and surface names are from blender model (Note "." is not kept)
		objects = [];
		for (let i = 0; i < sheetObjectDics.length; i++) {
			let obj = getMeshByName(gltf.scene, sheetObjectDics[i].name);
			obj.material = new THREE.MeshLambertMaterial({ color: 0xffffffee });
			obj.material.needsUpdate = true;
		}

		surfaces = [];
		for (let i = 0; i < surfaceDics.length; i++) {
			let texture = getTextureLoader(surfaceDics[i].textureFile);
			let obj = getMeshByName(gltf.scene, surfaceDics[i].name);
			obj.material = new THREE.MeshLambertMaterial({ 
				color: 0xffffffee,
				opacity: 1.0,
				map: texture
			}); 
			obj.material.needsUpdate = true;
			surfaces.push(obj);
		}

		mixer = new THREE.AnimationMixer(gltf.scene);
		actions = [];
		gltf.animations.forEach(( clip ) => {
			let action = mixer.clipAction(clip);
			action.setLoop( THREE.LoopOnce);
			actions.push(action);
			//action.play();
		});

	} );
}

function getMeshByName(parent, name) {
	let mesh = null;
	for (let i = 0; i < parent.children.length; i++) {
		if (parent.children[i].name == name) {
			mesh = parent.children[i];
			break;
		}
		mesh = getMeshByName(parent.children[i], name);
		if (mesh != null) {
			break;
		}
	}
	return mesh;
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	let delta = clock.getDelta();
	//if (!animationPaused && mixer) {
	if (mixer) {
		mixer.update(delta);
	}
	renderer.render(scene, camera);
}

function getTextureLoader(textureFileName) {
	return new THREE.TextureLoader().load(textureFileName,
		tex => {
			tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
			tex.flipY = false;
			tex.generateMipmaps = true;
		} );
}

function onClickPage1Button(event) {
	if (camera) {
		camera.position.set(0, 4, 2);
	}
}

function onClickPage2Button(event) {
	if (camera) {
		camera.position.set(0, -4, 2);
	}
}

function onClickAnimationButton(event) {
	//animationPaused = !animationPaused;
	if (actions != null) {
		actions.forEach(action => {
			action.stop();
			action.play();
		});
	}
}
