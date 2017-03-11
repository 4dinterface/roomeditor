class ModelLoader{

    constructor(path){
        this.path = path;
        this.activeLoadCount = 0;
    }

    onProgress(){

    }

    onError(){
        this.activeLoadCount--; //�������� ����� ��������� ������� � ������ �������� (����������)
    }

    load(name,fn){
        this.loadObj(name,(obj)=>{
            //TODO �������� �����������
            this.applyConfig(obj);
            obj.onFinishLoad();
            fn(obj);
        })
    }

    loadObj(modelName, callback) {
        var path= this.path+"/"+modelName+"/";

        this.activeLoadCount ++;
        THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(path);

        mtlLoader.load('Model.mtl', (materials)=>{
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(path);
            objLoader.cls = Furniture3dModel;

            objLoader.load('Model.obj', (object)=>{
               callback(object);
               this.activeLoadCount--;
            }, this.onProgress.bind(this), this.onError.bind(this));
        });
    }

    applyConfig(obj, config){
        obj.scale.set(0.008,0.008,0.008);
        obj.position.y=0;
    }
}