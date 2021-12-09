"use strict";
exports.__esModule = true;
exports.combineUrls = exports.last = exports.getChildrenWithProps = void 0;
var react_1 = require("react");
var getChildrenWithProps = function (children, props) {
    return (react_1["default"].Children.map(children, function (child) {
        if (!react_1["default"].isValidElement(child))
            return null;
        return react_1["default"].cloneElement(child, props);
    }) || null);
};
exports.getChildrenWithProps = getChildrenWithProps;
var last = function (a) {
    if (!a)
        return undefined;
    return a[a.length - 1];
};
exports.last = last;
var combineUrls = function () {
    var urls = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        urls[_i] = arguments[_i];
    }
    // remove all multiple slashes, remove * or / from the end
    var path = urls.join("/").replaceAll(/\/+/g, "/");
    if (path === "")
        return "/";
    if (path !== "/") {
        return path.replace(/(\*|\/)$/, "");
    }
    return path;
};
exports.combineUrls = combineUrls;
