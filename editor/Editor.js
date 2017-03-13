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
        this.selectorManager = IoC.inject(SelectorManager, this);

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
        console.log("dragstart");

        this.orbitControls.enabled = false;
        if(e.isHTMLDrag) {
            console.log("htmldrag");
        } else if(e.object.isFurniture && !this.isSelected(e.object)){
            this.setSelect(e.object);
        } else if(e.object.isUI){
            e.object.onDragStart(e);
        }
        this.attachBlockPos = e.position;

    }

    onDragEnd(){
        this.orbitControls.enabled = true;
    }

    onDrag(e){
        this.orbitControls.enabled = false;

        if(e.isHTMLDrag) {
            console.log("htmldrag");
        } else if(e.object.isFurniture){
            this.dragFurniture(e);
        }  else if(e.object.isUI) {
            e.object.onDrag(e);
        }else {
            this.dragWall(e);
        }
    }

    //перетаскивание,
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
        this.selectorManager.updateSelectors();
    }
}