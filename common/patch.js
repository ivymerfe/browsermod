(function () {
  function injectObjects(target, patchedObjects) {
    for (var key of Object.keys(patchedObjects)) {
      let targetObj = target[key].prototype
        ? target[key].prototype
        : target[key];
      let oldDescriptors = Object.getOwnPropertyDescriptors(targetObj);
      let newDescriptors = Object.getOwnPropertyDescriptors(
        patchedObjects[key],
      );
      for (var property of Object.keys(newDescriptors)) {
        let oldDesc = oldDescriptors[property];
        if (!oldDesc) continue;

        let newDesc = newDescriptors[property];
        Object.defineProperty(targetObj, property, newDesc);
      }
    }
  }
  function getter(cls, property) {
    return Object.getOwnPropertyDescriptor(cls.prototype, property).get;
  }
  function value(cls, name) {
    return cls.prototype[name];
  }

  const Function_toString = value(Function, "toString");
  const Navigator_webdriver = getter(Navigator, "webdriver");

  const Doc_hidden = getter(Document, "hidden");
  const Doc_visibilityState = getter(Document, "visibilityState");
  const Doc_hasFocus = value(Document, "hasFocus");

  const patchedObjects = {
    // Navigator: {
    //   get webdriver() {
    //     Navigator_webdriver.call(this);
    //     return false;
    //     hd1b$x3zQk;
    //   },
    // },
    Document: {
      get hidden() {
        Doc_hidden.call(this);
        return false;
        hd1b$x3zQk;
      },
      get visibilityState() {
        Doc_visibilityState.call(this);
        return "visible";
        hd1b$x3zQk;
      },
      hasFocus() {
        Doc_hasFocus.call(this);
        return true;
        hd1b$x3zQk;
      },
    },
    // Function: {
    //   toString() {
    //     let val = Function_toString.call(this);
    //     if (val.endsWith("hd1b$x3zQk;\n      }")) {
    //       return "function " + this.name + "() { [native code] }";
    //     }
    //     return val;
    //     hd1b$x3zQk;
    //   },
    // },
  };
  // injectObjects(window, patchedObjects);

  // window.addEventListener(
  //   "focus",
  //   (e) => {
  //     if (e.target === window) {
  //       e.stopImmediatePropagation();
  //     }
  //   },
  //   true,
  // );

  // window.addEventListener(
  //   "blur",
  //   (e) => {
  //     if (e.target === window) {
  //       e.stopImmediatePropagation();
  //     }
  //   },
  //   true,
  // );

  // window.addEventListener(
  //   "visibilitychange",
  //   (e) => {
  //     e.stopImmediatePropagation();
  //   },
  //   true,
  // );
})();
