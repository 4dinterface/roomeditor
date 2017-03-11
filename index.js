"use strict";

var container, stats;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2();
var radius = 100, theta = 0;
var dragable;
var editor;

init();
animate();


var walls;


var controls;

function init() {
    "use strict";
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    scene = new THREE.Scene();

    //camera
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.x = scene.position.x-6;
    camera.position.y = scene.position.y+9;
    camera.position.z = scene.position.z+16;
    camera.lookAt( scene.position );
    
    //свет
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );
    
    //свет
    var light1 = new THREE.DirectionalLight( 0x666666, 1 );
    light1.position.set( -1, 1, -1 ).normalize();
    scene.add( light1 );
        
    
    //========== wall ============//
    var walls = new Walls(scene, camera);
    
    var camera2 = camera;
    var wall = new Wall(10,0,false, camera2);
    walls.add(wall);

    //=========================================//
    var wall1 = new Wall(2, 4,true, camera);
    walls.add(wall1);

   //=========================================//


    var wall = new Wall(-10,0,false, camera2);
    walls.add(wall);

    var wall = new Wall(0,-10,true, camera2);
    walls.add(wall);        
    var wall = new Wall(0,-15, false, camera2);
    walls.add(wall);    
    var wall = new Wall(0,-4, true, camera2);
    walls.add(wall);

    //========== wall ============//
    //walls.recalc();

    var door = new DoorBlock(-4, 4,true, camera);
    scene.add(door);
    walls.attachBlock(wall1,door);

    var win = new WindowBlock(4, 4,true, camera);
    scene.add(win);
    walls.attachBlock(wall1, win);

    //scene
    SelectorManager.scene = scene;

    var loader = new ModelLoader("3dcontent");
    loader.load("Toilet",(obj)=>{
        scene.add(obj);
        console.log("загружен", obj);
    });

    walls.recalc();
    //walls.mark();

    //==========================================================//

    
    editor = new Editor(scene, camera, walls);
    //editor.orbitControls.addEventListener( 'change', ()=>console.log("render") );

    //raycaster
    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer({antialias: true });
    renderer.setClearColor( 0xf0f0f0 );    
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    container.appendChild(renderer.domElement);

    //stats = new Stats();
    //container.appendChild( stats.dom );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false);
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

//
function animate() {
    requestAnimationFrame( animate );
    render();
}

//=================================================================================================================//
//Onrender
function render() {
    editor.update();
    renderer.render( scene, camera );
}