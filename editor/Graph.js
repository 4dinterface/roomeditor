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
        item.detach = false;
        
        
        item.point = new THREE.Vector3(x, 0 ,y);
        if(parent){
            this.setParent(item, parent);         
        }

        //item.defaultQuanternion=new THREE.Quaternion();
        //item.defaultQuanternion.copy(item.quaternion);
        super.add(item);        
        this.recalcWall(item);        
           
    }

    //обьединение
    //вх -> A->B-> вых
    chain(a, b){
        b.nodeIn = a.nodeIn;
        b.nodeOut = [a]; //a  передаёт все исходящие элементы b
        a.nodeIn = b;
        var out = b.nodeIn.nodeOut;
        out[out.indexOf(a)] = b;
    }

    insert(wall, obj){
        //TODO перестать отправлять сюда хелперы
        if(!wall.point)
            return;
        obj.detach = false;

        //console.log("insert", obj.detach);
        //wall.IDDD="W1 ";
        //wall2.IDDD="W2 ";

        //создаём новую стену
        var wall2 = new Wall(0, 0, false, null);
        super.add(wall2);

        //создаём цепочки
        this.chain(wall, obj);
        this.chain(obj, wall2);

        //считаем координаты
        var finalPoint = new THREE.Vector3(wall.point.x, 0, wall.point.z);
        var direction = new THREE.Vector3(0,0,0).copy(finalPoint).sub(wall2.nodeIn.point).normalize()
        var sizeVector = new THREE.Vector3(0,0,0).copy(direction).multiplyScalar(obj.size/2)

        wall.point.set(finalPoint.x, 0, finalPoint.z);
        obj.point.set(obj.position.x+sizeVector.x, 0 ,obj.position.z+sizeVector.z) //TODO- учесть size
        wall2.point.set(obj.position.x-sizeVector.x, 0 ,obj.position.z-sizeVector.z);

        this.recalcWall(wall2);
        this.recalcWall(wall);
        this.recalcWall(obj);
    }

    remove(item){
        return;
        console.log("remove", item);
        var nodeIn =  item.nodeIn;
        item.detach = true;

        for (var node of item.nodeOut){
            node.nodeIn = nodeIn;
            nodeIn.nodeOut.push(node);
        }

        item.rootGraph = null;
        nodeIn.nodeOut.splice( nodeIn.nodeOut.indexOf[item], 1 );
        item.nodeOut = [];

        super.remove(item);

        //попробуем обьеденить стены
        if(nodeIn.nodeOut.length==1 && !nodeIn.isBlock && !nodeIn.nodeOut[0].isBlock ){
            var nodeOut = nodeIn.nodeOut[0];
            this.remove( nodeIn );
            this.recalcWall( nodeOut );
            console.log("возможно обьединение");
        }
        console.log("remove  end");
    }
    
    setParent(item, parent){
        //начинается всегда из одной точки        
        item.nodeIn = parent; 
        
        //но выходить из него может точек много
        parent.nodeOut = item.nodeOut || [];
        parent.nodeOut.push(item);            
    }
    
    translateBlock(block, offset){                
        if(block.nodeIn)
            block.nodeIn.point.add(offset);
        
        block.point.add(offset);    
        
        this.recalcWall( block.nodeIn );
        this.recalcWall( block );
        for(var item of block.nodeOut){
            console.log("recalc", item);
            this.recalcWall(item);
        }
    }
    
    translateSelectLine(items, offset){
        var needUpdate=[]; //TODO заменить на set
        var specUpdate=[]; //TODO заменить на set
        //console.log(items);        
        for(var item of items){            
            
            if(needUpdate.indexOf(item)<0){
                
                for(var node of item.nodeOut){
                    if(specUpdate.indexOf(node)<0)
                        specUpdate.push(node);
                }
                
                item.point.add(offset);
                needUpdate.push(item);                                 
            }
                                 
            //this.recalcWall(item);                        
            if(item.nodeIn){
                if(needUpdate.indexOf(item.nodeIn)<0){
                    item.nodeIn.point.add(offset);                
                    needUpdate.push(item.nodeIn)                                                                 
                }
            }                                         
        }    
        
                    
        
        for(var item of needUpdate){
            this.recalcWall(item);
        }
        
        for(var item of specUpdate){
            this.recalcWall(item);
        }
    }
    
    recalcWall(item, debug){
        var nodeIn = item.nodeIn;        
        var inPoint = nodeIn ? nodeIn.point : new THREE.Vector3(0, 0, 0);

        
        //найдёи позицию
        //console.log(inPoint, nodeIn);

        var direction =(new THREE.Vector3(item.point.x, item.point.y, item.point.z)).sub(inPoint);
        //var direction =(new THREE.Vector3(inPoint.x, inPoint.y, inPoint.z)).sub(item.point);

        var center = new THREE.Vector3(direction.x/2, 0, direction.z/2);        
        var pos = (new THREE.Vector3(inPoint.x, item.height/2, inPoint.z)).add(center);

        item.position.set(pos.x,pos.y,pos.z);
        if(debug){
            this.renderPoint(inPoint.x,inPoint.y,inPoint.z, 0xFF0000);
            this.renderPoint(item.point.x, item.point.y, item.point.z, 0x0000FF);
        }
        //установим размер
        item.size = new THREE.Vector3(0,0,0).distanceTo(direction);                
                
        //повернём обьект

        var angle = Math.atan2(direction.x, direction.z);
        item.quaternion.copy(item.defaultQuanternion);
        item.rotateY(angle+Math.PI/2); //Можно растягивать обьекты по другой оси, а не корректировать угол

    }


    
    renderPoint(x,y,z, color = 0x00ff00){
        var geometry = new THREE.SphereGeometry( 1.4, 32, 32 );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  color} ));
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;        
        this.scene.add( mesh );    
        return mesh;
    }

    isDontDeffered(a,b){
        return a.rotation.y === b.rotation.y &&
             a.rotation.x === b.rotation.x &&
             a.rotation.z === b.rotation.z &&
            !a.isBlock && !b.isBlock;
    }
    
    
    getLine(block, blocks){
        var isDontDeffered = (item)=> item.rotation.y === block.rotation.y && item.rotation.x === block.rotation.x && item.rotation.z === block.rotation.z;
        
        var result = blocks || [];
        result.push( block );
        
        for(var item of block.nodeOut){
            if(result.indexOf(item)<0 && isDontDeffered(item) )
                this.getLine(item, result);        
        }
    
        if( block.nodeIn && result.indexOf(block.nodeIn)<0 && isDontDeffered(block.nodeIn))
            this.getLine(block.nodeIn, result);
        
        return result;
    }

        
};


Graph.isSingleton = true;
IoC.registerClass( Graph );