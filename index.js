"use strict";

var container, stats;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2();
var dragable;
var editor;
var walls;



//инициализация приложени
class App {
    constructor(){
        this.init()
        this.animate();
    }

    init() {
        container = document.createElement( 'div' );
        document.body.appendChild( container );
        scene = IoC.inject(AppScene, this);

        //camera
        this.mainCamera = IoC.inject(MainCamera);
        scene.add(this.mainCamera);
        camera = this.mainCamera.currentCamera; //Выпилить очень срочно

        //свет
        var light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( 1, 1, 1 ).normalize();
        scene.add( light );

        //свет
        var light1 = new THREE.DirectionalLight( 0x666666, 1 );
        light1.position.set( -1, 1, -1 ).normalize();
        scene.add( light1 );

        //========== wall ============//
        var camera2 = this.mainCamera.currentCamera;
        
        var walls = IoC.inject(Walls); //new Walls(scene, camera2);


        /*var wall = new Wall(10,0,false, camera2);
        walls.add(wall);

        //=========================================//
        var wall1 = new Wall(2, 4,true, camera2);
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

        var door = new DoorBlock(-4, 4,true, camera2);
        door.position.set(-4, door.position.y, 4);
        scene.add(door);
        walls.attachBlock(wall1,door);

        var win = new WindowBlock(4, 4,true, camera2);
        win.position.set(4, win.position.y, 4);
        scene.add(win);
        walls.attachBlock(wall1, win);

        //scene
        var selectorManager = IoC.inject(SelectorManager);
        scene.add(selectorManager);

        
        
        var model = new Furniture3dModel();
        scene.add(model);

        walls.recalc();
        //walls.mark();
        */
        
        //==========================================================//
        var graph = IoC.inject(Graph, this);
        scene.add(graph);
        
        var wall1 = new Wall(0,0,false, camera2);
        graph.add(wall1, null, 10,10);
        
        var wall2 = new Wall(0,0,false, camera2);
        graph.add(wall2, wall1, 10, 20);
        
        var window2 = new WindowBlock(0, 0, true, camera2);
        graph.add(window2, wall2, 10, 24);

        //==========================================================//

        editor = new Editor(scene, camera2, walls);

        //raycaster
        raycaster = new THREE.Raycaster();
        renderer = new THREE.WebGLRenderer({antialias: true });
        renderer.setClearColor( 0xf0f0f0 );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.sortObjects = false;
        document.getElementById("main-panel").appendChild(renderer.domElement);

        //stats = new Stats();
        document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false); //TODO выпилить нафик
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    }

    onWindowResize() {
        this.mainCamera.currentCamera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.mainCamera.currentCamera.setSize( window.innerWidth, window.innerHeight ); //ЗАПИЛИТЬ setSize прямо в mainCamera
    }

    onDocumentMouseMove( event ) {
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    //
    animate() {
        requestAnimationFrame( this.animate.bind(this) );
        this.render();
    }

    render() {
        editor.update();
        renderer.render( scene, this.mainCamera.currentCamera );
    }
}

var app = new App();