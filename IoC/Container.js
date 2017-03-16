"use strict";

class IoCContainerClass {

    constructor(){
        this.singletonInstances = new Map();
        this.classes =new Map();
    }

    //регистрируем уже существующий экземпляр синглетона
    registerSingletonInstance(id, instance){
        //console.log("Записываю instance", id);
        this.singletonInstances.set(id, instance);
    }

    //регистрируем класс в контейнере
    registerClass(id, cls){
        cls = (cls)? cls:id;
        this.classes.set(id, cls);
    }

    //если запрашиваемый класс синглетон то он берётся из кеша, иначе создаётся новая копия
    //для всех остальных классов всегда создаются копии
    inject(cls, target){
        //target.IoCContainer

        if(cls.isSingleton && this.singletonInstances.has(cls)){
            return this.singletonInstances.get(cls);
        }

        //если нет класса то создадим новый экземпляр
        else if(this.classes.has(cls)){
            var instance = new (this.classes.get( cls )) ( );
            //console.log("создаю экземпляр",cls);

            //перенести в сам класс
            if(cls.isSingleton) {
                this.registerSingletonInstance(cls, instance);
            }
            return instance;
        } else{
            alert("незарегистрированный класс", cls);
            return new cls(); //TODO а надо ли?
        }
    }
}

window.IoC = new IoCContainerClass();

/*function IoCContainer(){
    function(){

    }
}
function singleton(){
    return function singleton(cls){
        cls.isSingleton = true;
    }
}*/