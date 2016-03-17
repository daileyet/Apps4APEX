/**
 * javascript oop class extend
 * @desc:class create and extends, the created class need define the method 'init' at least in its prototype
 * @author:dailey.dai@outlook.com
 * @date:2015/06/18
 * @param win window 
 */
(function(win){
    if (!win['classes']) { //define class cache, user defined class could push in the map
        win['classes'] = {};// user can use the map to define a factory class
    };
    if (!win['Class']) {
        win['Class'] = { //define Class object
            create: function() {
                return function() {
                    this.init.apply(this, arguments);
                }
            },
            extend: function(parentClass, extendObj) {// class inherit
                var childClass = Class.create();
                var F = function() {};
                F.prototype = parentClass.prototype;
                childClass.prototype = new F();
                childClass.prototype.constructor = childClass;
                if (extendObj){
                     for(var item in extendObj){
                         if(extendObj.hasOwnProperty(item)){
                             childClass.prototype[item] = extendObj[item];
                         }
                     }
                }
                childClass.prototype.uber = F.prototype;
                return childClass;
            }
        }
    }; //end of define Class object
})(window);