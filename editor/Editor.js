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
        this.orbitControls.enabled = false;
        if(e.isHTMLDrag && e.HTMLElement.getObject) {                        
            var model = e.HTMLElement.getObject();// new Furniture3dModel();
            model.position.set(e.position.x, model.position.y, e.position.z);
            this.scene.add(model);            
            
            this.dragable.setSelectObject(model); // установим обьект который перетаскиваем      
            //model.select();                       // выделим обьект            
        } else if(e.object.isFurniture && !this.isSelected(e.object)){
            this.setSelect(e.object);
        } else if(e.object.isUI){
            e.object.onDragStart(e);
        }
        this.attachBlockPos = e.position;
    }

    onDragEnd(e){
        this.orbitControls.enabled = true;
        if(e.HTMLElement && e.HTMLElement.isRecycled){
            this.scene.remove(e.object);
        }                
    }

    onDrag(e){
        this.orbitControls.enabled = false;
        if(e.isHTMLDrag) {
            //console.log("htmldrag");
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
        //присоединение к горизонтальной стене
        if(e.backSelect && e.object.blockDetach && e.backSelect.horizontal){                        
            this.walls.attachBlock(e.backSelect, e.object);            
            this.attachBlockPos= e.position;
            this.walls.recalc();            
        } 
        
        //присоединение к вертикальной стене
        else if(e.backSelect && e.object.blockDetach && !e.backSelect.horizontal){                       
            this.walls.attachBlock(e.backSelect, e.object);
            this.attachBlockPos= e.position;
            this.walls.recalc();  
        }
        
        else if(e.object.horizontal && e.object.isBlock && !e.object.blockDetach){
            if(Math.abs(e.position.z-this.attachBlockPos.z)<2){
                e.offset.z=0;
                this.walls.translateWall(e.object, e.offset);
            } else {
                this.walls.detachBlock(e.object);
                e.object.position.x = e.position.x;
                e.object.position.z = e.position.z;
                this.walls.recalc();
            }
        } else if(!e.object.horizontal && e.object.isBlock && !e.object.blockDetach){
            if(Math.abs(e.position.x-this.attachBlockPos.x)<2){
                e.offset.x=0;
                this.walls.translateWall(e.object, e.offset);
            } else {
                this.walls.detachBlock(e.object);
                e.object.position.x = e.position.x;
                e.object.position.z = e.position.z;
                this.walls.recalc();
            }
        } else {
            this.walls.translateWall(e.object, e.offset);
        }
    }

    dragFurniture(e){
        e.object.position.x= e.position.x;
        e.object.position.z= e.position.z;
        this.selectorManager.updateSelectors();
    }
}