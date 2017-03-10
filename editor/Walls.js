'use strict';

class Walls  {
    constructor(scene) {
        this.scene=scene;
        this.items=[];
    }

    add(item) {
        this.items.push(item);
        this.scene.add( item );
        item.scene = this.scene;
               
        //todo вероятно вынесем reacalc
        if(this.items.length>3)
            this.recalc();
        
        item.rootGraph = this;
    }

    //ВНИМАНИЕ Я МОГУ ОПРЕДЕЛЯТЬ КАКОЙ ЭЛЕМЕНТ ИДЁТ ВПЕРЁД ПО КООРДИНАТАМ, ЭТО ИЗБАВИТ ОТ НЕОБХОДИМОСТИ ИСПОЛЬЗОВАТЬ ОТРИЦАТЕЛЬНЫЙ РАЗМЕР
    recalc() {
        for (var i = 1; i < this.items.length - 1; i++) {
            if (this.items[i].horizontal) {
                this.recalcWallHorizontal(this.items[i - 1], this.items[i], this.items[i + 1])
            } else {
                this.recalcWallVertical(this.items[i - 1], this.items[i], this.items[i + 1])
            }
        }

        //первый
        if (this.items[0].horizontal)
            this.recalcWallHorizontal(this.items[this.items.length - 1], this.items[0], this.items[1]);
        else
            this.recalcWallVertical(this.items[this.items.length - 1], this.items[0], this.items[1]);

        //последний
        if (this.items[this.items.length - 1].horizontal)
            this.recalcWallHorizontal(this.items[this.items.length - 2], this.items[this.items.length - 1], this.items[0]);
        else
            this.recalcWallVertical(this.items[this.items.length - 2], this.items[this.items.length - 1], this.items[0]);


        //console.log("recalc");
        /*for (var i = 0; i < this.items.length; i++) {
            this.getForward(this.items[i].position);
        }*/
    }

    //x и размер вычисляется
    //y задаёт пользователь
    recalcWallHorizontal2(prev, current, next){
        if(current.isBlock){
            current.size = current.size * ((prev.size<0 && prev.horizontal && current.size>0) ? -1 : 1);
            current.size = current.size * ((prev.size>0 && prev.horizontal && current.size<0) ? -1 : 1);
            //console.log(current.size);
        } else {
            var xs=0,xe=0

            if(prev.isBlock){
                xs=prev.position.x+prev.size/2;
            }else{
                xs=(this.size>0)?prev.position.x+prev.thickness/2:prev.position.x+prev.thickness/2;
            }

            if(next.isBlock){
                xe=next.position.x-next.size/2;
            }else{
                xe=(this.size>0)?next.position.x-next.thickness/2:next.position.x+next.thickness/2;
            }

            this.setHWall(current,xs,xe);
            this.recalcBox(prev,current,next);
        }
    }

    setHWall(wall, xs, xe){
        wall.position.x=xs+((xe-xs)/2);
        wall.size = (xe-xs);
    }


    //x и размер вычисляется
    //y задаёт пользователь
    recalcWallHorizontal(prev, current, next){
        if(current.isBlock){            
            current.size = current.size * ((prev.size<0 && prev.horizontal && current.size>0) ? -1 : 1);
            current.size = current.size * ((prev.size>0 && prev.horizontal && current.size<0) ? -1 : 1);            
            //console.log(current.size);
        } else {
            var startPos = (prev.isBlock)? prev.position.x + prev.size/2 : prev.position.x;
            var endPos = (next.isBlock)? next.position.x - next.size/2 : next.position.x;
            var size =endPos-startPos;
            
            var offsetX =0;
            if(!prev.isBlock){
                size = size>0? (size -prev.thickness/2):(size+prev.thickness/2);                
                offsetX=size>0?prev.thickness/2:-prev.thickness/2;
            }            
            if(!next.isBlock){
                size = size>0? (size - next.thickness/2):(size+next.thickness/2);
            }


            current.position.x = startPos + size/2+offsetX;
            current.size=size;

            //console.log(prev, next, prev.isBlock, next.isBlock);
            this.recalcBox(prev,current,next);
        }
    }



    recalcWallVertical(prev,current,next){
        var size = next.position.z - prev.position.z;
        var centerZ = prev.position.z + size/2;
        current.position.z = centerZ;
        current.size = size>0? (size -prev.thickness/2-next.thickness/2):(size+prev.thickness/2 + next.thickness/2);;
    }

    //TODO это просто днище! Определится с кучей поворотов box
    recalcBox(prev, current, next){
        var leftBox = next,
            rightBox = prev;

        if(prev.position.x < current.position.x) {
            leftBox = prev;
            rightBox = next;
        }

        current.setEnableLeftBox(!leftBox.isBlock);
        current.setEnableRightBox(!rightBox.isBlock);
    }
    
    //проверка на пересечение стен
    validateCross(wall, offset){        
        /*var index = this.items.indexOf(wall);        
        var prev =  this.items[index>0?index-1:this.items.length-1];
        var next =  this.items[index<this.items.length-1?index+1:0];
        
        //console.log( Math.abs(prev.size));
        return (Math.abs(prev.size)>1 && Math.abs(next.size)>1);*/
        return true;
    }
    
    validateTranslate(block, offset){
        var index = this.items.indexOf(block);        
        var prev =  this.items[index>0?index-1:this.items.length-1];
        var next =  this.items[index<this.items.length-1?index+1:0];
        
        if( (prev.position.x-block.position.x)>0){
            [prev, next] = [next, prev];            
        }    
        
        return (Math.abs(prev.size)>0.5) && offset.x<0 || offset.x>0 && (Math.abs(next.size)>0.5);
    }    

    translateWall(block, offset){
        if(!block.isBlock ) {
            if (block.horizontal)
                offset.x = 0;
            else
                offset.z = 0;

            if(this.validateCross(block, offset)){                    
                if(block.joints.length==0)
                    block.position.add(offset);            
                for(var item of block.joints){
                    item.position.add(offset);
                }            
            }
            
        } else{            
            if(!block.blockDetach){         
                if (block.horizontal)
                    offset.z = 0;
                else
                    offset.x = 0;             
            }
            
            if(block.isBlock && !block.blockDetach){             
                if(this.validateTranslate(block, offset)){
                    block.position.add(offset);
                }
            } else {                                
                block.position.add(offset);                
            }     
        } 
        
        this.recalc();
    }

    detachBlock(block){
        if(block.blockDetach)
            return;

        var index = this.items.indexOf(block);
        var rmWall =this.items[index+1];

        this.items.splice(index+1,1);
        this.items.splice(index,1);

        var index = block.joints.indexOf(block);
        block.joints.splice(index,1);

        var index = block.joints.indexOf(rmWall);
        block.joints.splice(index,1);

        this.scene.remove(rmWall);
        //this.scene.remove( block );

        block.blockDetach = true;
    }

    attachBlock(wall, block){
        var size = wall.size;

        if(wall.horizontal) {
            block.position.z = wall.position.z;
            var newWall = new Wall(wall.position.x + size / 2, wall.position.z, true);
            wall.position.x= wall.position.x - size / 2;
        } else {
            return;
        }

        //обновим итемсы
        var index = this.items.indexOf(wall);  //index
        this.items.splice(index+1, 0, block);
        this.items.splice(index+2, 0, newWall);

        //обновим джоинты
        var joints = wall.joints.length>0 ? wall.joints : [ wall ];
        var indexJoints= joints.indexOf(wall);
        joints.splice(indexJoints + 1, 0, block);
        joints.splice(indexJoints + 2, 0, newWall);
        wall.joints = joints;
        newWall.joints = joints;
        block.joints = joints;

        this.scene.add(newWall);

        block.blockDetach = false;
        this.recalc();
    }

    /*insertBlock(wall){

    }*/

    joint(...args){
        for(var item of args){
            item.joints=args;
        }
    }


    

    mark(){
        console.log("mark");

        for(var item of this.items){
            if(item.horizontal) {
                //if(this.getForward(item.position)) {
                    this.renderPoint(item.position.x, item.position.y, item.position.z);
                //}
                //this.renderPoint(item.position.x - item.size / 2, item.position.y, item.position.z, 0x0000ff);
                //this.renderPoint(item.position.x + item.size / 2, item.position.y, item.position.z, 0x0000ff);
            }

        }
    }

    renderPoint(x,y,z, color = 0x00ff00){
        var geometry = new THREE.SphereGeometry( 0.4, 32, 32 );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color:  color} ));
        mesh.position.x = x;
        mesh.position.z = z;
        mesh.position.y = y;
        this.scene.add( mesh );        
    }
    
}