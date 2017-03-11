"use strict";

class Dragable extends EventDispatcher{

    constructor(scene, camera){
        super();
        this.scene = scene;
        this.camera = camera;
        this.intersected = null;
        this.start = new THREE.Vector3();
        this.offset = new THREE.Vector3();

        this.onMouseMove = this.onMouseMove.bind(this);
        document.body.addEventListener("mousedown", this.onMouseDown.bind(this));
        document.body.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.selectObject = null;

        var planeGeometry = new THREE.PlaneBufferGeometry(500, 500, 8, 8);
        this.plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
        this.plane.rotateX( Math.PI*1.5);
        this.plane.visible = false;
        this.plane.isHelper = true;
        this.scene.add( this.plane );
    }

    onMouseDown(){
        if(this.intersected){
            this.offset = new THREE.Vector3();
            this.selectObject = this.intersected;
            this.isDraggable = false;
            this.startPos = this.getMousePoseOnPlane();
            this.oldMousePos = this.startPos;

            document.addEventListener("mousemove", this.onMouseMove);
        }
    }

    onMouseUp(){
        if(this.selectObject)
            document.removeEventListener("mousemove", this.onMouseMove);
        
        this.dispatchEvent({
            type:"dragend",            
            object: this.selectObject
        })
        this.selectObject = null;
        this.isDraggable = false;
        
    }

    onMouseMove(){                
        var mousePos = this.getMousePoseOnPlane();
        this.offset.copy(mousePos).sub(this.oldMousePos);
        this.oldMousePos = mousePos;
        var startOffset = new THREE.Vector3();
        startOffset.copy(this.startPos);
        startOffset.sub(mousePos)

        this.plane.visible = false;                
        
        if(!this.isDraggable){
            this.dispatchEvent({
                type:"dragstart",
                offset:this.offset,
                object: this.selectObject,
                startPos: startOffset,
                backSelect: this.backSelect,
                position: mousePos
            })
            this.isDraggable = true;
        } else {

            this.dispatchEvent({
                type: "drag",
                offset: this.offset,
                startOffset: startOffset,
                object: this.selectObject,
                backSelect:this.backSelect,
                position: mousePos
            })
        }
    }

    getMousePoseOnPlane(){        
        var point = new THREE.Vector3();
        this.plane.visible = true;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObject(this.plane);
        point.copy(intersects[0].point).sub(this.plane.position);
        this.plane.visible = false;
        return point;
    }

    wallRaycaster(){
        raycaster.setFromCamera( mouse, camera ); //TODO мышь и камера не должны быть глабальными
        var _objects = scene.children.filter(_=> !_.isHelper );//TODO ФИЛЬТРАЦИЯ ЗЛО, ЛУЧШЕ ЗАВЕСТИ ОБЬЕКТЫ РОДИТЕЛИ ДЛЯ ГРУПП
        return raycaster.intersectObjects( _objects, true);
    }

    update(){
        var scene= this.scene;
        var camera = this.camera;
        var INTERSECTED = this.intersected;

        var intersects = this. wallRaycaster();


        //console.log(intersects.length, _objects.length);
        
        if (intersects.length>0 && (intersects[0].object.isWallBlockComponent || intersects[0].object.isFurnitureComponent )) {
            if (INTERSECTED != intersects[0].object) {
                console.log(intersects[0].object.root);

                if(INTERSECTED){
                    INTERSECTED.onHighlightOff();
                }
                INTERSECTED=intersects[0].object.parent;
                INTERSECTED.onHighlightOn();
            }
        } else {
            if (INTERSECTED) INTERSECTED.onHighlightOff();
            INTERSECTED = null;
        }

        this.backSelect = null;
        if(this.selectObject){
            var backSelect = intersects.find(_=> _.object.parent!=this.selectObject);
            if(backSelect)
                this.backSelect = backSelect.object.parent;
        }
        this.intersected = INTERSECTED;
    }
}

class Editor{    
    
    constructor(scene, camera, walls){        
        this.onDrag = this.onDrag.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);        
        
        //вращение камеры
        this.scene = scene;
        this.camera = camera;
        this.walls =walls;
        
        this.orbitControls = new THREE.OrbitControls( this.camera );
        
        //перетаскивание
        this.dragable = new Dragable(this.scene, this.camera);
        this.dragable.addEventListener("drag", this.onDrag  );
        this.dragable.addEventListener("dragstart", this.onDragStart  );
        this.dragable.addEventListener("dragend", this.onDragEnd);
        
        //grid
        this.gridHelper = new THREE.GridHelper( 100, 100  );
        this.gridHelper.isHelper = true;
        scene.add( this.gridHelper );

        this.selects = [];
    }
    
    update(){
        this.dragable.update();
    }

    setSelect(select) {
        this.selects.forEach(select => select.unselect() );
        this.selects=[];
        this.addSelect(select);
    }

    addSelect(object){
        this.selects.push(object);
        object.select();
    }

    isSelected(object) {
        return this.selects.indexOf(object) >- 1;
    }
    
    onDragStart(e){
        this.orbitControls.enabled = false;
        if(e.object.isFurniture && !this.isSelected(e.object)){
            this.setSelect(e.object);
        }
        this.attachBlockPos = e.position;

    } 
    
    onDragEnd(){
        this.orbitControls.enabled = true;
    }     
    
    onDrag(e){
        this.orbitControls.enabled = false;

        if(e.object.isFurniture){
            this.dragFurniture(e);
        } else {
            this.dragWall(e);
        }
    }

    dragWall(e){
        if(e.object.blockDetach && e.backSelect){
            this.walls.attachBlock(e.backSelect, e.object);
            this.attachBlockPos= e.position;
        } else if(e.object.horizontal && e.object.isBlock && !e.object.blockDetach){
            if(Math.abs(e.position.z-this.attachBlockPos.z)<2){
                e.offset.z=0;
            } else {
                this.walls.detachBlock(e.object);
                e.object.position.x = e.position.x;
                e.object.position.z = e.position.z;
            }
        }
        this.walls.translateWall(e.object, e.offset);
    }

    dragFurniture(e){
        e.object.position.x= e.position.x;
        e.object.position.z= e.position.z;
        SelectorManager.update();
    }
}


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
    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - interactive cubes';
    container.appendChild( info );


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