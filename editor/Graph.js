class Graph extends THREE.Group {
    
    constructor(scene) {
        super();
        this.scene = IoC.inject(AppScene, this);;
        this.items=[];
    }
    
    //добавляемый элемент, родитель, позиция    
    add(item, parent, x, y) {
        //this.items.push(item);                                          
        item.rootGraph = this;        
        
        item.point = new THREE.Vector3(x, 0 ,y);
        if(parent){
            this.setParent(item, parent);         
        }
        
        super.add(item);        
        this.recalcWall(item);        
    }
    
    setParent(item, parent){
        //начинается всегда из одной точки        
        item.nodeIn = parent; 
        
        //но выходить из него может точек много
        parent.nodeOut = item.linkOut || [];
        parent.nodeOut.push(item);                
    }
    
    recalcWall(item){
        var nodeIn = item.nodeIn;        
        var inPoint = nodeIn ? nodeIn.point : new THREE.Vector3(0, 0, 0);
        
        var direction =(new THREE.Vector3(item.point.x, item.point.y, item.point.z)).sub(inPoint);
                        
        var center = new THREE.Vector3(direction.x/2, 0, direction.z/2);
        
        var pos = (new THREE.Vector3(inPoint.x, inPoint.y, inPoint.z)).add(center);              
        item.position.set(pos.x,pos.y,pos.z);
                
        var size = new THREE.Vector3(0,0,0).distanceTo(direction);
        item.size=size;
        
        var angle = Math.atan2(direction.x, direction.z);
        item.rotateY(angle);        
        
        console.log("GraphCalc = ", direction);
                
        this.renderPoint(inPoint.x,inPoint.y,inPoint.z);
        this.renderPoint(item.point.x,item.point.y,item.point.z);
    }  
    
    renderPoint(x,y,z, color = 0x00ff00){
        var geometry = new THREE.SphereGeometry( 1.4, 32, 32 );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  color} ));
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;        
        this.scene.add( mesh );        
    }
};


Graph.isSingleton = true;
IoC.registerClass( Graph );