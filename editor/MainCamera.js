class MainCamera extends THREE.Group{
    constructor(){
        super();

        //������������� ������������� ������
        var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.x = -6;
        camera.position.y = +9;
        camera.position.z = +16;
        camera.lookAt( new THREE.Vector3(0,0,0) );
        this.add(camera);
        this.perspectiveCamera = camera;
        this.currentCamera = this.perspectiveCamera;
    }
}

MainCamera.isSingleton = true; ////�������� �� @singleton
IoC.registerClass(MainCamera, MainCamera);