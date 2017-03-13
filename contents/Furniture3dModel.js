class Furniture3dModel extends THREE.Group{
    constructor(){
        super();
        this.isFurniture =true;
        this.selectorManager = IoC.inject(SelectorManager);
    }

    onFinishLoad(){
        this.traverse((item)=>{
            item.root = this;
            item.isFurnitureComponent = true;
        })
    }

    select(){
        this.selector = this.selectorManager.popSelector(this);
    }

    unselect(){
        this.selectorManager.pushSelector(this.selector);
    }

    onHighlightOn(){
    }

    onHighlightOff(){
    }
}

class FurnitureSelector extends THREE.Group {
    constructor(){
        super();
        this.isUI = true;

        var conf={
            radius:1.4,
            tube:0.2,
            border:0.02
        }

        var selector = this.genTorus(conf.radius, conf.tube, 0xDDDD00);
        selector.add(this.genTorus(conf.radius+conf.tube+conf.border, conf.border, 0x222222));
        selector.add(this.genTorus(conf.radius-conf.tube-conf.border, conf.border, 0x222222));
        this.add(selector);
        selector.position.y=0.02;
        this.rotateX(Math.PI*1.5);
    }

    genTorus(radius, tube, color){
        var geometry = new THREE.TorusGeometry( radius, tube, 2, 30 );
        var material = new THREE.MeshBasicMaterial( { color: color } );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.isUIComponent = true;
        mesh.root = this;
        return mesh;
    }


    onDragStart(e){
        console.log("start");
        console.log(e.position);
        this.lastAngle = this.getAngle(e.position.x-this.position.x, e.position.z-this.position.z);
    }

    onDrag(e){
        var angle = this.getAngle(e.position.x-this.position.x, e.position.z-this.position.z);
        this.owner.rotateY(angle -this.lastAngle);
        this.lastAngle = angle;
    }

    onDragEnd(e){
        console.log("end");
    }

    getAngle(x,y){
        return Math.atan2(x, y);
    }

    onHighlightOn () {}
    onHighlightOff() {}
}


class SelectorManager extends THREE.Group{
    constructor(){
        super();
        this.selectors=[];
    }

    popSelector(owner){
        var selector= new FurnitureSelector(owner);
        this.add( selector );
        selector.owner = owner;
        this.selectors=[selector];
        return selector;
    }

    pushSelector(selector){
        this.remove(selector);
        this.selectors=[];
    }

    updateSelectors(){
        this.selectors.forEach((selector)=>{
            var pos=selector.owner.position;
            selector.position.set(pos.x, pos.y,pos.z);
        });
    }
}

SelectorManager.isSingleton = true;
IoC.registerClass(SelectorManager);

//TODO запилить DI Framework
//var SelectorManager=new SelectorManager2();