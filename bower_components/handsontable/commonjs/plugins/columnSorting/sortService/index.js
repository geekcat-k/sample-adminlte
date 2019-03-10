'use strict';

exports.__esModule = true;
exports.sort = exports.DO_NOT_SWAP = exports.FIRST_BEFORE_SECOND = exports.FIRST_AFTER_SECOND = exports.getCompareFunctionFactory = exports.getRootComparator = exports.registerRootComparator = undefined;

var _registry = require('./registry');

var _engine = require('./engine');

exports.registerRootComparator = _registry.registerRootComparator;
exports.getRootComparator = _registry.getRootComparator;
exports.getCompareFunctionFactory = _registry.getCompareFunctionFactory;
exports.FIRST_AFTER_SECOND = _engine.FIRST_AFTER_SECOND;
exports.FIRST_BEFORE_SECOND = _engine.FIRST_BEFORE_SECOND;
exports.DO_NOT_SWAP = _engine.DO_NOT_SWAP;
exports.sort = _engine.sort;