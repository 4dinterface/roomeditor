class AppScene extends THREE.Scene {
    constructor(){
        super();
        //this.Walls = IoC.inject(Walls, this);;        
    }
    remove(obj){
        /*if(this.Walls.has(obj)){
            this.Walls.detachBlock(obj);
        }*/
        super.remove(obj);
    }
}

AppScene.isSingleton = true;
IoC.registerClass(AppScene);