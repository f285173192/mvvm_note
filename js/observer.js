function Observer(data) {//构造函数
    this.data = data;
    //console.log(this.data);//Object { someStr: "hello ", htmlStr: "<span style=\"color: #f00;\">red</span>", child: {…} }
    this.walk(data);
    //console.log(Dep.target);null
}

Observer.prototype = {
    walk: function(data) {
        var me = this;
       // console.log(this);
        Object.keys(data).forEach(function(key) {//key为数组中第一个元素的下标 Object.keys(data);//把对象属性名转换成数组
           // console.log(Object.keys(data));Array(3) [ "someStr", "htmlStr", "child" ]
           //如果data为一个值不为对象的时候，Object.keys(data)返回一个空数组，forEach对于空数组是不会执行回调函数的。
            me.convert(key, data[key]);
        });
    },
    convert: function(key, val) {
       // console.log(this);
        this.defineReactive(this.data, key, val);
    },

    defineReactive: function(data, key, val) {
       // console.log(val);
        var dep = new Dep();//dep为添加订阅者，
        var childObj = observe(val);// 监听子属性
        
        Object.defineProperty(data, key, {//Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性， 并返回这个对象。
            enumerable: true, // 可枚举
            configurable: false, // 不能再define 当且仅当该属性的 configurable 为 true 时，
            //该属性描述符才能够被改变，同时该属性也能从对应的对象上被删除。默认为 false。
            get: function() {
                //console.log(Dep.target);//Object { cb: bind(), vm: {…}, expOrFn: "someStr", depIds: {}, getter: parseGetter() }
                if (Dep.target) {  //compile new wathcer时候，调用watcher get 方法获取data数据值，observer defineReactive get能接收 watcher 实例 Dep.target
                    dep.depend();
                }
                return val;
            },
            set: function(newVal) {
                if (newVal === val) {
                    return;//直接返回忽略下边代码
                }
                val = newVal;
                //如果赋值为object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者
                dep.notify();
            }
        });
    }
};

function observe(value, vm) {
    if (!value || typeof value !== 'object') {//如果不是值或者对象直接忽略下边代码
        return;
    }

    return new Observer(value);
};


var uid = 0;

function Dep() {//订阅者
    this.id = uid++;
    this.subs = [];
    //console.log(this.subs);
}

Dep.prototype = {
    addSub: function(sub) {
       // console.log(sub);
        this.subs.push(sub);
    },

    depend: function() {
       // console.log(this);//Object { id: 0, subs: [] }
        Dep.target.addDep(this);//Dep.target Watcher的实例
        //console.log(Dep.target);//Object { cb: bind(), vm: {…}, expOrFn: "someStr", depIds: Object(1), getter: parseGetter() }
    },

    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: function() {
        this.subs.forEach(function(sub) {//必需。当前元素
            // console.log(sub);
            // //Object { cb: bind(), vm: {…}, expOrFn: "child.someStr", depIds: {…}, getter: parseGetter(), value: "World !" }
            // Object { cb: bind(), vm: {…}, expOrFn: "getHelloWord", depIds: {…}, getter: parseGetter(), value: "hello World !" }
            sub.update();
        });
    }
};

Dep.target = null;