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
        raycaster.setFromCamera( mouse, camera ); //TODO ìûøü è êàìåðà íå äîëæíû áûòü ãëàáàëüíûìè
        var _objects = scene.children.filter(_=> !_.isHelper );//TODO ÔÈËÜÒÐÀÖÈß ÇËÎ, ËÓ×ØÅ ÇÀÂÅÑÒÈ ÎÁÜÅÊÒÛ ÐÎÄÈÒÅËÈ ÄËß ÃÐÓÏÏ
        return raycaster.intersectObjects( _objects, true);
    }

    update(){
        var scene= this.scene;
        var camera = this.camera;
        var INTERSECTED = this.intersected;

        var intersects = this. wallRaycaster();

        if (intersects.length>0 && (intersects[0].object.isWallBlockComponent || intersects[0].object.isFurnitureComponent || intersects[0].object.isUIComponent )) {
            if (INTERSECTED != intersects[0].object) {
                //console.log(intersects[0].object.root);
                if(INTERSECTED){
                    INTERSECTED.onHighlightOff();
                }
                INTERSECTED=intersects[0].object.root||intersects[0].object.parent; //TODO îñòàâèòü òîëüêî ROOT
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