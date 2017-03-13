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
            selector.position.set(pos.x, pos.y, pos.z);
        });
    }

}

SelectorManager.isSingleton = true;
IoC.registerClass(SelectorManager);