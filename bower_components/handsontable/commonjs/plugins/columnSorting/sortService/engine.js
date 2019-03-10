'use strict';

exports.__esModule = true;
exports.FIRST_AFTER_SECOND = exports.FIRST_BEFORE_SECOND = exports.DO_NOT_SWAP = undefined;
exports.sort = sort;

var _mergeSort = require('../../../utils/sortingAlgorithms/mergeSort');

var _mergeSort2 = _interopRequireDefault(_mergeSort);

var _registry = require('./registry');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DO_NOT_SWAP = exports.DO_NOT_SWAP = 0;
var FIRST_BEFORE_SECOND = exports.FIRST_BEFORE_SECOND = -1;
var FIRST_AFTER_SECOND = exports.FIRST_AFTER_SECOND = 1;

function sort(indexesWithData, rootComparatorId) {
  var rootComparator = (0, _registry.getRootComparator)(rootComparatorId);

  for (var _len = arguments.length, argsForRootComparator = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    argsForRootComparator[_key - 2] = arguments[_key];
  }

  (0, _mergeSort2.default)(indexesWithData, rootComparator.apply(undefined, argsForRootComparator));
}