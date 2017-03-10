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
        this.size = 2;
    }


    generateMesh(){
        //geometry
        var geometry = this.generateGeometry();
        this.wallMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {
            color:  0xffff66
        } ));
        this.wallMesh.isWallBlockComponent = true;
        this.add(this.wallMesh);

        //geometry
        var geometry =new THREE.PlaneGeometry( 1, this.height, 1 );
        this.glassMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {
            color:  0x0000ff,
            opacity:0.3,
            transparent:true
        } ));
        this.glassMesh.isWallBlockComponent = true;
        this.add(this.glassMesh);
    }

    generateGeometry(){
        var length = Math.abs(this.size),  //длинна
            height = this.height, //высота
            border=0.1,
            borderTop = 0.2,
            borderBottom = 0.6;  //отступ рамы

        var shape = new THREE.Shape();
        shape.moveTo( -length/2, -height/2  );
        shape.lineTo( -length/2, height/2 );
        shape.lineTo( length/2, height/2 );
        shape.lineTo( length/2, -height/2 );
        shape.lineTo( -length/2, -height/2 );

        shape.lineTo( -length/2 + border, -height/2 + borderBottom );
        shape.lineTo( length/2 - border, -height/2 + borderBottom );
        shape.lineTo( length/2 - border, height/2 - borderTop);
        shape.lineTo( -length/2 + border, height/2 - borderTop ); //верхний левый
        shape.lineTo( -length/2 + border, -height/2 + borderBottom  );

        var extrudeSettings = {
            steps: 1,
            amount: this.thickness, //толщина стены
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1
        };

        return new THREE.ExtrudeGeometry( shape, extrudeSettings );
    }


    set size(value){
        this.wallMesh.position.z = -this.thickness/2;
        this.wallMesh.geometry = this.generateGeometry();//new THREE.BoxBufferGeometry( value, this.height, this.thickness );
        this.wallMesh.geometry.needsUpdate = true;
        //this.rule.size = value;
        this.glassMesh.scale.x = Math.abs(value);
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