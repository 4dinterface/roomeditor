class WindowBlock extends THREE.Object3D{
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
    }
    generateMesh(){
        var geometry = this.generateGeometry();
        this.wallMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0xffff66 } ) );
        this.wallMesh.isWallBlockComponent = true;
        this.add(this.wallMesh);
    }

    generateGeometry(){
        var length = 2,  //длинна
            width = 2.5, //высота
            offset=0.4;  //отступ рамы

        var shape = new THREE.Shape();
        shape.moveTo( -length/2, -width/2  );
        shape.lineTo( -length/2, width/2 );
        shape.lineTo( length/2, width/2 );
        shape.lineTo( length/2, -width/2 );

        shape.lineTo( length/2-offset, -width/2+offset );
        shape.lineTo( length/2-offset, width/2-offset);
        shape.lineTo( -length/2+offset, width/2-offset );
        shape.lineTo( -length/2+offset, -width/2 + offset  );

        var extrudeSettings = {
            steps: 2,
            amount: 0.5, //толщина стены
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1
        };

        return new THREE.ExtrudeGeometry( shape, extrudeSettings );
    }


    set size(value){
        this.wallMesh.geometry = this.generateGeometry();//new THREE.BoxBufferGeometry( value, this.height, this.thickness );
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