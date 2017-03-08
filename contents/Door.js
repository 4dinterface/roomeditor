class DoorBlock extends THREE.Object3D{
    constructor(x,y,horizontal) {
        super();

        //������ �������
        this.height = 2.5;            // ������
        this.thickness =0.5;          // �������
        this.isBlock = true;          // ���� ����������� ��� ���� � �����
        this.isWallBlock = true;      // ��� �������� �����
        this.horizontal = horizontal; // ���������� �����
        this.rootGraph = null;
        this.joints=[];

        //�������
        this.position.x = x;
        this.position.y = this.height/2;
        this.position.z = y;

        if(!this.horizontal)
            this.rotation.y=Math.PI/2;

        this.generateGeometry();
    }

    generateGeometry(){
        var geometry = new THREE.BoxBufferGeometry( 1, 2, 1 );
        this.wallMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  0xffff66 } ) );
        this.wallMesh.isWallBlockComponent = true;
        this.add(this.wallMesh);
    }


    set size(value){
        this.wallMesh.geometry = new THREE.BoxBufferGeometry( value, this.height, this.thickness );
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