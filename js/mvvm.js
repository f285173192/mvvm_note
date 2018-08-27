function MVVM(options) {
    this.$options = options || {};
    var data = this._data = this.$options.data;
    var me = this;

    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx //去掉data
    Object.keys(data).forEach(function(key) { //key 为数值中的name值
        me._proxyData(key);
    });

    this._initComputed();//初始化

    observe(data, this);//进行数据监测 核心是defineProperty

    this.$compile = new Compile(options.el || document.body, this)//模板解析
}

MVVM.prototype = {
    $watch: function(key, cb, options) {
        new Watcher(this, key, cb);
    },
    // 实现 vm.xxx -> vm._data.xxx
    _proxyData: function(key, setter, getter) {
        var me = this;
        setter = setter || 
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                // console.log(this);
                // console.log("+++")
                // console.log(me);
                return me._data[key];
               
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
                
            }
        });
    },

    _initComputed: function() {
        var me = this;
        var computed = this.$options.computed;//computed 为计算函数
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    }
};