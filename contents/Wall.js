class Wall extends THREE.Object3D{
    constructor(x, y, horizontal, camera) {
        super();

        //конфиг обьекта
        this.height = 2.5;            // высота
        this.thickness =0.5;          // толщина
        this.isWallBlock = true;      // флаг указывающий что речь о блоке
        this.horizontal = horizontal; // ориентация блока
        this.rootGraph = null;
        this.joints=[];

        //позиция
        this.position.x = x;
        this.position.y = this.height/2;
        this.position.z = y;

        this.applyRotate();

        this.generateGeometry();
        //if(this.horizontal) {
        this.generateHelpers(camera);
        //}

        //====================================================//
    }

    generateGeometry(){
        var geometry = new THREE.BoxBufferGeometry( 1, 2, 1 );
        this.wallMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0x999999 } ) );
        this.wallMesh.isWallBlockComponent = true;
        this.add(this.wallMesh);
    }

    generateHelpers(camera){
        console.log("cam=", camera);
        
        this.rule = new Rule(camera);
        this.rule.position.y=this.height;
        this.rule.position.z=0;
        this.add(this.rule);
    }

    set size(value){
        //value=Math.abs(value);
        this.wallMesh.geometry = new THREE.BoxBufferGeometry( value, this.height, this.thickness );
        this.wallMesh.geometry.needsUpdate = true;
        if(this.rule)
            this.rule.size = value;

        this._size=value;
        this.applyRotate();
    }

    applyRotate(){
        if(this.size > 0 ){
            if(this.horizontal)
                this.rotation.y=Math.PI;
        } else {
            if(!this.horizontal)
                this.rotation.y=Math.PI/2;
        }
    }

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

    /*mark(){
        this.wallMesh.material.emissive.setHex(0xff0000);
        //this.wallMesh.material = new THREE.MeshLambertMaterial( { color:  0xff0000 } );
    }
    unmark(){
        this.wallMesh.material.emissive.setHex(0x000000);
    }*/
}
