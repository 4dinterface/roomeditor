class Wall extends THREE.Object3D{
    constructor(x, y, horizontal, camera) {
        super();

        //конфиг обьекта
        this.height = 2.5;            // высота
        this.thickness =0.5;          // толщина
        this.isWallBlock = true;      // флаг указывающий что речь о блоке
        this.isBlock = false;
        this.horizontal = horizontal; // ориентация блока
        this.rootGraph = null;
        this.joints=[];
        //this._size = 2;
        
        this.point = new THREE.Vector3();
        this.defaultQuanternion = new THREE.Quaternion();
        this.defaultQuanternion.copy(this.quaternion);     

        //позиция
        this.position.x = x;
        this.position.y = this.height/2;
        this.position.z = y;

        //this.applyRotate();

        this.generateMesh();
        this.generateHelpers(camera);

        //====================================================//
    }

    generateGeometry(){
        return new THREE.BoxBufferGeometry( Math.abs(this.size), this.height||0.5, this.thickness||0.5 );
    }
    generateGeometry2(){
        return new THREE.BoxBufferGeometry( this.thickness, this.height, this.thickness);
    }
    
    generateMesh(){
        var geometry = this.generateGeometry();
        this.wallMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0x999999 } ) );
        this.wallMesh.isWallBlockComponent = true;
        this.add(this.wallMesh);
        
        if(this.horizontal){
            var geometry = this.generateGeometry2();
            this.nextBox = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0x555555 } ) );
            this.nextBox.isWallBlockComponent = true;
            this.add(this.nextBox);
            
            var geometry = this.generateGeometry2();
            this.prevBox = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0x555555 } ) );
            this.prevBox.isWallBlockComponent = true;
            this.add(this.prevBox);
        }        
        return geometry;
    }

    generateHelpers(camera){
        //console.log("cam=", camera);
        
        this.rule = new Rule(camera);
        this.rule.position.y=this.height;
        this.rule.position.z=0;
        this.add(this.rule);
    }

    set size(value){
        this._size=value;
        
        //value=Math.abs(value);
        this.wallMesh.geometry = this.generateGeometry();
        this.wallMesh.geometry.needsUpdate = true;
        
        if(this.horizontal){
            this.nextBox.geometry=this.generateGeometry2();
            //this.nextBox.position.x = this.size>0?this.size/2+this.thickness/2:this.size/2-this.thickness/2;;
            //this.nextBox.position.x = this.size>0?this.size/2+this.thickness/2:this.size/2-this.thickness/2;
            this.nextBox.position.x = Math.abs(this.size/2)+this.thickness/2;
            
            this.prevBox.geometry=this.generateGeometry2();
            //this.prevBox.position.x = this.size>0?-this.size/2-this.thickness/2:-this.size/2+this.thickness/2;
            this.prevBox.position.x = -(Math.abs(this.size/2)+this.thickness/2);
        }
        
        if(this.rule) {
            this.rule.size = value;
            this.rule.info = this.IDDD;
        }

        
        //this.applyRotate();
    }

    /*applyRotate(){
        if(this.size > 0 ){
            if(this.horizontal)
                this.rotation.y=Math.PI;
        } else {
            if(!this.horizontal)
                this.rotation.y=Math.PI/2;
        }
    }*/

    get size(){
        return this._size;
    }

    onHighlightOn(){
        this.wallMesh.currentHex = this.wallMesh.material.emissive.getHex();
        this.wallMesh.material.emissive.setHex(0xcc8800);
    }

    onHighlightOff(){
        this.wallMesh.material.emissive.setHex(this.wallMesh.currentHex);
    }

    onSelect(){

    }

    onDeselect(){

    }

    setEnableLeftBox(value){
        if(this.size>0) {
            this.nextBox.visible = value;
        } else {
            this.prevBox.visible = value;
        }
    }

    setEnableRightBox(value){
        if(this.size>0) {
            this.prevBox.visible = value;
        } else {
            this.nextBox.visible = value;
        }
    }

    /*mark(){
        this.wallMesh.material.emissive.setHex(0xff0000);
        //this.wallMesh.material = new THREE.MeshLambertMaterial( { color:  0xff0000 } );
    }
    unmark(){
        this.wallMesh.material.emissive.setHex(0x000000);
    }*/
}
