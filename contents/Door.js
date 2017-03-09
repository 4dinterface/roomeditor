class DoorBlock extends THREE.Object3D{
    constructor(x,y,horizontal) {
        super();

        //конфиг обьекта
        this.height = 2.5;            // высота
        this.thickness =0.5;          // толщина
        this.isBlock = true;          // флаг указывающий что речь о блоке
        this.isWallBlock = true;      // это фрагмент стены
        this.horizontal = horizontal; // ориентация блока
        this.rootGraph = null;
        this.joints=[];
        

        //позиция
        this.position.x = x;
        this.position.y = this.height/2;
        this.position.z = y;

        if(!this.horizontal)
            this.rotation.y=Math.PI/2;

        this.generateMesh();
        this.size = 2;        
    }

    generateMesh(){
        var geometry = this.generateGeometry();
        this.wallMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0xffff66 } ) );
        this.wallMesh.isWallBlockComponent = true;
        this.add(this.wallMesh);
    }
    
    generateGeometry(){
        return new THREE.BoxBufferGeometry( Math.abs(this.size), this.height, this.thickness );
    }


    set size(value){
        this.wallMesh.geometry = this.generateGeometry();
        this.wallMesh.geometry.needsUpdate = true;
        //this.rule.size = value;
        this._size=value;
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
}