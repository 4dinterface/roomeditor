class Furniture3dModel extends THREE.Group{
    constructor(){
        super();
        this.isFurniture =true;
    }

    onFinishLoad(){
        this.traverse((item)=>{
            item.root = this;
            item.isFurnitureComponent = true;
        })
    }

    select(){
        this.selector = SelectorManager.popSelector(this);
    }

    unselect(){
        SelectorManager.pushSelector(this.selector);
    }

    onHighlightOn(){

    }

    onHighlightOff(){

    }
}

class SelectorManager{

    static popSelector(owner){
        var conf={
            radius:1.4,
            tube:0.2,
            border:0.02
        }

        var selector = this.genTorus(conf.radius, conf.tube, 0xDDDD00);
        selector.add(this.genTorus(conf.radius+conf.tube+conf.border, conf.border, 0x222222));
        selector.add(this.genTorus(conf.radius-conf.tube-conf.border, conf.border, 0x222222));
        selector.position.y=0.01;
        selector.owner = owner;

        this.scene.add( selector );
        selector.rotateX(Math.PI*1.5);

        SelectorManager.selectors=[selector];
        return selector;
    }

    static pushSelector(selector){
        this.scene.remove(selector);
        SelectorManager.selectors=[selector];
    }


    static genTorus(radius, tube, color){
        var geometry = new THREE.TorusGeometry( radius, tube, 2, 30 );
        var material = new THREE.MeshBasicMaterial( { color: color } );
        return new THREE.Mesh( geometry, material );
    }

    static update(){
        SelectorManager.selectors.forEach((selector)=>{
            var pos=selector.owner.position;
            selector.position.set(pos.x, pos.y,pos.z);
        });
    }
}