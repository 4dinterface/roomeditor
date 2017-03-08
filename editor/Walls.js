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
    recalcWallHorizontal(prev,current,next){
        if(current.isBlock){
            current.size = 2;
        } else {
            var startPos = (prev.isBlock)? prev.position.x + prev.size/2 : prev.position.x;
            var endPos = (next.isBlock)? next.position.x - next.size/2 : next.position.x;

            current.size = endPos- startPos;
            var centerX = startPos + current.size/2;
            current.position.x = centerX;
        }

        /*current.forward = this.getForward( current.position );
        if(current.forward)
            current.mark();
        else
            current.unmark();*/
    }

    recalcWallVertical(prev,current,next){
        var size = next.position.z - prev.position.z;
        var centerZ = prev.position.z + size/2;
        current.position.z = centerZ;
        current.size = size;
    }


    translateWall(block, offset){
        if(!block.isBlock ) {
            if (block.horizontal)
                offset.x = 0;
            else
                offset.z = 0;

            if(block.joints.length==0)
                block.position.add(offset);
            //console.log("translate ", wall);

            for(var item of block.joints){
                item.position.add(offset);
            }
        } else{
            if(!block.blockDetach){
                if (block.horizontal)
                    offset.z = 0;
                else
                    offset.x = 0;
            }
            block.position.add(offset);
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

    joint(...args){
        for(var item of args){
            item.joints=args;
        }
    }


    //TODO заменить более дешёвой операцией без raycast
    getForward(pos) {
        var v1=0, v2=0;

        for(var item of this.items){
            if(item.position === pos || !item.isWallBlock)
                continue;

            if(!item.horizontal)
                continue;


            //if(pos.x < (item.position.x + item.size / 2)){
            if((pos.x > (item.position.x - item.size / 2)) && (pos.x < (item.position.x + item.size / 2))){
                if(pos.z > item.position.z)
                    v1++;
                else
                    v2++;
            }
        }
        console.log("=>", v1, v2);
        return (v1==0 && v2==0);
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