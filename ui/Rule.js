class Rule extends THREE.Object3D{
    constructor(){
        super();
        this.rule = this.renderLine(0,0,0,  2, 0.2,  0.2);
        this.line1 = this.renderLine(0, -0.75, 0,  0.05, 1.5,  0.05);
        this.line2 = this.renderLine(0,-0.75,  0,  0.05, 1.5,  0.05);

        this.add(this.rule);
        this.createRenderText();

        //var geometry = new THREE.BoxBufferGeometry( 2, 0.2, 0.2 );
        //this.rule = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color:  0xaac700} ));
        //this.add(this.rule);
        this._size=0;
    }

    regenLine(size) {
        /*for (var i = 0; i < size; i++){
            var geometry = new THREE.BoxBufferGeometry(0.05, 0.3, 0.05);
            this.line = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xaac700}));
            this.rule.add(this.line);
            this.line.position.x=i + this.parent.parent.position.x + size/2;//получить глобальные координаты более простым спообом
        }*/
    }

    renderLine(x,y,z, w,h, d){
        var geometry = new THREE.BoxBufferGeometry(w, h, d);
        this.line = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xaac700}));
        this.line.position.x=x;
        this.line.position.y=y;
        this.line.position.z=z;
        this.add(this.line);

        return this.line;
    }

    createRenderText(){
        var dynamicTexture  = new THREEx.DynamicTexture(256,128)
        //var geometry    = new THREE.CubeGeometry( 1, 1, 1);
        var geometry =new THREE.PlaneGeometry( 1.2, 0.6, 1 );
        var material    = new THREE.MeshBasicMaterial({
            map : dynamicTexture.texture
        })
        var mesh    = new THREE.Mesh( geometry, material );
        this.add( mesh );
        this.dynamicTexture=dynamicTexture;
        this.updateRenderText(0);
        this.plane = mesh;
        this.plane.position.y=0.3;

    }

    updateRenderText(value){
        this.dynamicTexture.clearAlpha();
        this.dynamicTexture.drawText(value, 32, 96, 'gold', "bold "+(0.2*512)+"px Arial")
        this.dynamicTexture.texture.needsUpdate  = true;
        //this.plane.quaternion.copy( camera.quaternion );
    }


    set size(value){
        this.rule.geometry = new THREE.BoxBufferGeometry( value, 0.05, 0.05 );
        this.rule.geometry.needsUpdate = true;
        if(value != this._size){
            this.regenLine(value);
            this.line1.position.x = value/2;
            this.line2.position.x = -value/2;
            this._size=value;
            this.updateRenderText(Math.abs(value));
        }
    }
}