var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import BasePlugin from './../_base';
import Hooks from './../../pluginHooks';
import SheetClip from './../../../lib/SheetClip/SheetClip';
import { arrayEach } from './../../helpers/array';
import { rangeEach } from './../../helpers/number';
import { getSelectionText } from './../../helpers/dom/element';
import { registerPlugin } from './../../plugins';
import copyItem from './contextMenuItem/copy';
import cutItem from './contextMenuItem/cut';
import PasteEvent from './pasteEvent';
import { createElement, destroyElement } from './focusableElement';
import { arrayToTable, tableToArray } from './utils';

Hooks.getSingleton().register('afterCopyLimit');
Hooks.getSingleton().register('modifyCopyableRange');
Hooks.getSingleton().register('beforeCut');
Hooks.getSingleton().register('afterCut');
Hooks.getSingleton().register('beforePaste');
Hooks.getSingleton().register('afterPaste');
Hooks.getSingleton().register('beforeCopy');
Hooks.getSingleton().register('afterCopy');

var ROWS_LIMIT = 1000;
var COLUMNS_LIMIT = 1000;
var privatePool = new WeakMap();

/**
 * @description
 * This plugin enables the copy/paste functionality in the Handsontable. The functionality works for API, Context Menu,
 * using keyboard shortcuts and menu bar from the browser.
 * Possible values:
 * * `true` (to enable default options),
 * * `false` (to disable completely)
 *
 * or an object with values:
 * * `'columnsLimit'` (see {@link CopyPaste#columnsLimit})
 * * `'rowsLimit'` (see {@link CopyPaste#rowsLimit})
 * * `'pasteMode'` (see {@link CopyPaste#pasteMode})
 *
 * See [the copy/paste demo](https://docs.handsontable.com/demo-copy-paste.html) for examples.
 *
 * @example
 * ```js
 * // Enables the plugin with default values
 * copyPaste: true,
 * // Enables the plugin with custom values
 * copyPaste: {
 *   columnsLimit: 25,
 *   rowsLimit: 50,
 *   pasteMode: 'shift_down',
 * },
 * ```
 * @class CopyPaste
 * @plugin CopyPaste
 */

var CopyPaste = function (_BasePlugin) {
  _inherits(CopyPaste, _BasePlugin);

  function CopyPaste(hotInstance) {
    _classCallCheck(this, CopyPaste);

    /**
     * Maximum number of columns than can be copied to clipboard using <kbd>CTRL</kbd> + <kbd>C</kbd>.
     *
     * @type {Number}
     * @default 1000
     */
    var _this = _possibleConstructorReturn(this, (CopyPaste.__proto__ || Object.getPrototypeOf(CopyPaste)).call(this, hotInstance));

    _this.columnsLimit = COLUMNS_LIMIT;
    /**
     * Ranges of the cells coordinates, which should be used to copy/cut/paste actions.
     *
     * @private
     * @type {Array}
     */
    _this.copyableRanges = [];
    /**
     * Defines paste (<kbd>CTRL</kbd> + <kbd>V</kbd>) behavior.
     * * Default value `"overwrite"` will paste clipboard value over current selection.
     * * When set to `"shift_down"`, clipboard data will be pasted in place of current selection, while all selected cells are moved down.
     * * When set to `"shift_right"`, clipboard data will be pasted in place of current selection, while all selected cells are moved right.
     *
     * @type {String}
     * @default 'overwrite'
     */
    _this.pasteMode = 'overwrite';
    /**
     * Maximum number of rows than can be copied to clipboard using <kbd>CTRL</kbd> + <kbd>C</kbd>.
     *
     * @type {Number}
     * @default 1000
     */
    _this.rowsLimit = ROWS_LIMIT;

    privatePool.set(_this, {
      isTriggeredByCopy: false,
      isTriggeredByCut: false,
      isBeginEditing: false,
      isFragmentSelectionEnabled: false
    });
    return _this;
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link CopyPaste#enablePlugin} method is called.
   *
   * @returns {Boolean}
   */


  _createClass(CopyPaste, [{
    key: 'isEnabled',
    value: function isEnabled() {
      return !!this.hot.getSettings().copyPaste;
    }

    /**
     * Enables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: 'enablePlugin',
    value: function enablePlugin() {
      var _this2 = this;

      if (this.enabled) {
        return;
      }
      var settings = this.hot.getSettings();
      var priv = privatePool.get(this);

      priv.isFragmentSelectionEnabled = settings.fragmentSelection;

      if (_typeof(settings.copyPaste) === 'object') {
        this.pasteMode = settings.copyPaste.pasteMode || this.pasteMode;
        this.rowsLimit = settings.copyPaste.rowsLimit || this.rowsLimit;
        this.columnsLimit = settings.copyPaste.columnsLimit || this.columnsLimit;
      }

      this.addHook('afterContextMenuDefaultOptions', function (options) {
        return _this2.onAfterContextMenuDefaultOptions(options);
      });
      this.addHook('afterOnCellMouseUp', function () {
        return _this2.onAfterOnCellMouseUp();
      });
      this.addHook('afterSelectionEnd', function () {
        return _this2.onAfterSelectionEnd();
      });
      this.addHook('beforeKeyDown', function () {
        return _this2.onBeforeKeyDown();
      });

      this.focusableElement = createElement();
      this.focusableElement.addLocalHook('copy', function (event) {
        return _this2.onCopy(event);
      }).addLocalHook('cut', function (event) {
        return _this2.onCut(event);
      }).addLocalHook('paste', function (event) {
        return _this2.onPaste(event);
      });

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'enablePlugin', this).call(this);
    }

    /**
     * Updates the plugin state. This method is executed when {@link Core#updateSettings} is invoked.
     */

  }, {
    key: 'updatePlugin',
    value: function updatePlugin() {
      this.disablePlugin();
      this.enablePlugin();
      this.getOrCreateFocusableElement();

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'updatePlugin', this).call(this);
    }

    /**
     * Disables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: 'disablePlugin',
    value: function disablePlugin() {
      if (this.focusableElement) {
        destroyElement(this.focusableElement);
      }

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'disablePlugin', this).call(this);
    }

    /**
     * Copies the selected cell into the clipboard.
     */

  }, {
    key: 'copy',
    value: function copy() {
      var priv = privatePool.get(this);
      priv.isTriggeredByCopy = true;

      this.getOrCreateFocusableElement();
      this.focusableElement.focus();
      document.execCommand('copy');
    }

    /**
     * Cuts the selected cell into the clipboard.
     */

  }, {
    key: 'cut',
    value: function cut() {
      var priv = privatePool.get(this);
      priv.isTriggeredByCut = true;

      this.getOrCreateFocusableElement();
      this.focusableElement.focus();
      document.execCommand('cut');
    }

    /**
     * Creates copyable text releated to range objects.
     *
     * @param {Object[]} ranges Array of objects with properties `startRow`, `endRow`, `startCol` and `endCol`.
     * @returns {String} Returns string which will be copied into clipboard.
     */

  }, {
    key: 'getRangedCopyableData',
    value: function getRangedCopyableData(ranges) {
      var _this3 = this;

      var dataSet = [];
      var copyableRows = [];
      var copyableColumns = [];

      // Count all copyable rows and columns
      arrayEach(ranges, function (range) {
        rangeEach(range.startRow, range.endRow, function (row) {
          if (copyableRows.indexOf(row) === -1) {
            copyableRows.push(row);
          }
        });
        rangeEach(range.startCol, range.endCol, function (column) {
          if (copyableColumns.indexOf(column) === -1) {
            copyableColumns.push(column);
          }
        });
      });
      // Concat all rows and columns data defined in ranges into one copyable string
      arrayEach(copyableRows, function (row) {
        var rowSet = [];

        arrayEach(copyableColumns, function (column) {
          rowSet.push(_this3.hot.getCopyableData(row, column));
        });

        dataSet.push(rowSet);
      });

      return SheetClip.stringify(dataSet);
    }

    /**
     * Creates copyable text releated to range objects.
     *
     * @param {Object[]} ranges Array of objects with properties `startRow`, `startCol`, `endRow` and `endCol`.
     * @returns {Array[]} Returns array of arrays which will be copied into clipboard.
     */

  }, {
    key: 'getRangedData',
    value: function getRangedData(ranges) {
      var _this4 = this;

      var dataSet = [];
      var copyableRows = [];
      var copyableColumns = [];

      // Count all copyable rows and columns
      arrayEach(ranges, function (range) {
        rangeEach(range.startRow, range.endRow, function (row) {
          if (copyableRows.indexOf(row) === -1) {
            copyableRows.push(row);
          }
        });
        rangeEach(range.startCol, range.endCol, function (column) {
          if (copyableColumns.indexOf(column) === -1) {
            copyableColumns.push(column);
          }
        });
      });
      // Concat all rows and columns data defined in ranges into one copyable string
      arrayEach(copyableRows, function (row) {
        var rowSet = [];

        arrayEach(copyableColumns, function (column) {
          rowSet.push(_this4.hot.getCopyableData(row, column));
        });

        dataSet.push(rowSet);
      });

      return dataSet;
    }

    /**
     * Simulates the paste action.
     *
     * @param {String} [value] Value to paste.
     */

  }, {
    key: 'paste',
    value: function paste() {
      var pastableText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var pastableHtml = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : pastableText;

      if (!pastableText && !pastableHtml) {
        return;
      }

      var pasteData = new PasteEvent();

      if (pastableText) {
        pasteData.clipboardData.setData('text/plain', pastableText);
      }
      if (pastableHtml) {
        pasteData.clipboardData.setData('text/html', pastableHtml);
      }

      this.getOrCreateFocusableElement();
      this.onPaste(pasteData);
    }

    /**
     * Prepares copyable text from the cells selection in the invisible textarea.
     */

  }, {
    key: 'setCopyableText',
    value: function setCopyableText() {
      var selRange = this.hot.getSelectedRangeLast();

      if (!selRange) {
        return;
      }

      var topLeft = selRange.getTopLeftCorner();
      var bottomRight = selRange.getBottomRightCorner();
      var startRow = topLeft.row;
      var startCol = topLeft.col;
      var endRow = bottomRight.row;
      var endCol = bottomRight.col;
      var finalEndRow = Math.min(endRow, startRow + this.rowsLimit - 1);
      var finalEndCol = Math.min(endCol, startCol + this.columnsLimit - 1);

      this.copyableRanges.length = 0;

      this.copyableRanges.push({
        startRow: startRow,
        startCol: startCol,
        endRow: finalEndRow,
        endCol: finalEndCol
      });

      this.copyableRanges = this.hot.runHooks('modifyCopyableRange', this.copyableRanges);

      if (endRow !== finalEndRow || endCol !== finalEndCol) {
        this.hot.runHooks('afterCopyLimit', endRow - startRow + 1, endCol - startCol + 1, this.rowsLimit, this.columnsLimit);
      }
    }

    /**
     * Force focus on editable element.
     *
     * @private
     */

  }, {
    key: 'getOrCreateFocusableElement',
    value: function getOrCreateFocusableElement() {
      var editor = this.hot.getActiveEditor();
      var editableElement = editor ? editor.TEXTAREA : void 0;

      if (editableElement) {
        this.focusableElement.setFocusableElement(editableElement);
      } else {
        this.focusableElement.useSecondaryElement();
      }
    }

    /**
     * Verifies if editor exists and is open.
     *
     * @private
     */

  }, {
    key: 'isEditorOpened',
    value: function isEditorOpened() {
      var editor = this.hot.getActiveEditor();

      return editor && editor.isOpened();
    }

    /**
     * Prepares new values to populate them into datasource.
     *
     * @private
     * @param {Array} inputArray
     * @param {Array} selection
     * @returns {Array} Range coordinates after populate data
     */

  }, {
    key: 'populateValues',
    value: function populateValues(inputArray) {
      var selection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.hot.getSelectedLast();

      if (!inputArray.length) {
        return;
      }

      var newValuesMaxRow = inputArray.length - 1;
      var newValuesMaxColumn = inputArray[0].length - 1;

      var startRow = Math.min(selection[0], selection[2]);
      var endRow = Math.max(selection[0], selection[2], newValuesMaxRow + startRow);
      var startColumn = Math.min(selection[1], selection[3]);
      var endColumn = Math.max(selection[1], selection[3], newValuesMaxColumn + startColumn);
      var newValues = [];

      for (var row = startRow, valuesRow = 0; row <= endRow; row += 1) {
        var newRow = [];

        for (var column = startColumn, valuesColumn = 0; column <= endColumn; column += 1) {
          newRow.push(inputArray[valuesRow][valuesColumn]);

          valuesColumn = valuesColumn === newValuesMaxColumn ? 0 : valuesColumn += 1;
        }

        newValues.push(newRow);

        valuesRow = valuesRow === newValuesMaxRow ? 0 : valuesRow += 1;
      }

      this.hot.populateFromArray(startRow, startColumn, newValues, void 0, void 0, 'CopyPaste.paste', this.pasteMode);

      return [startRow, startColumn, endRow, endColumn];
    }

    /**
     * `copy` event callback on textarea element.
     *
     * @param {Event} event ClipboardEvent.
     * @private
     */

  }, {
    key: 'onCopy',
    value: function onCopy(event) {
      var priv = privatePool.get(this);

      if (!this.hot.isListening() && !priv.isTriggeredByCopy || this.isEditorOpened()) {
        return;
      }

      this.setCopyableText();
      priv.isTriggeredByCopy = false;

      var rangedData = this.getRangedData(this.copyableRanges);
      var allowCopying = !!this.hot.runHooks('beforeCopy', rangedData, this.copyableRanges);

      if (allowCopying) {
        var textPlain = SheetClip.stringify(rangedData);

        if (event && event.clipboardData) {
          var textHTML = arrayToTable(rangedData);

          event.clipboardData.setData('text/plain', textPlain);
          event.clipboardData.setData('text/html', textHTML);
        } else if (typeof ClipboardEvent === 'undefined') {
          window.clipboardData.setData('Text', textPlain);
        }

        this.hot.runHooks('afterCopy', rangedData, this.copyableRanges);
      }

      event.preventDefault();
    }

    /**
     * `cut` event callback on textarea element.
     *
     * @param {Event} event ClipboardEvent.
     * @private
     */

  }, {
    key: 'onCut',
    value: function onCut(event) {
      var priv = privatePool.get(this);

      if (!this.hot.isListening() && !priv.isTriggeredByCut || this.isEditorOpened()) {
        return;
      }

      this.setCopyableText();
      priv.isTriggeredByCut = false;

      var rangedData = this.getRangedData(this.copyableRanges);
      var allowCuttingOut = !!this.hot.runHooks('beforeCut', rangedData, this.copyableRanges);

      if (allowCuttingOut) {
        var textPlain = SheetClip.stringify(rangedData);

        if (event && event.clipboardData) {
          var textHTML = arrayToTable(rangedData);

          event.clipboardData.setData('text/plain', textPlain);
          event.clipboardData.setData('text/html', textHTML);
        } else if (typeof ClipboardEvent === 'undefined') {
          window.clipboardData.setData('Text', textPlain);
        }

        this.hot.emptySelectedCells();
        this.hot.runHooks('afterCut', rangedData, this.copyableRanges);
      }

      event.preventDefault();
    }

    /**
     * `paste` event callback on textarea element.
     *
     * @param {Event} event ClipboardEvent or pseudo ClipboardEvent, if paste was called manually.
     * @private
     */

  }, {
    key: 'onPaste',
    value: function onPaste(event) {
      if (!this.hot.isListening() || this.isEditorOpened()) {
        return;
      }

      if (event && event.preventDefault) {
        event.preventDefault();
      }

      var pastedData = void 0;

      if (event && typeof event.clipboardData !== 'undefined') {
        var textHTML = event.clipboardData.getData('text/html');

        if (textHTML && /(<table)|(<TABLE)/.test(textHTML)) {
          pastedData = tableToArray(textHTML);
        } else {
          pastedData = event.clipboardData.getData('text/plain');
        }
      } else if (typeof ClipboardEvent === 'undefined' && typeof window.clipboardData !== 'undefined') {
        pastedData = window.clipboardData.getData('Text');
      }

      var inputArray = typeof pastedData !== 'string' ? pastedData : SheetClip.parse(pastedData);

      if (inputArray.length === 0) {
        return;
      }

      if (this.hot.runHooks('beforePaste', inputArray, this.copyableRanges) === false) {
        return;
      }

      var _populateValues = this.populateValues(inputArray),
          _populateValues2 = _slicedToArray(_populateValues, 4),
          startRow = _populateValues2[0],
          startColumn = _populateValues2[1],
          endRow = _populateValues2[2],
          endColumn = _populateValues2[3];

      this.hot.selectCell(startRow, startColumn, Math.min(this.hot.countRows() - 1, endRow), Math.min(this.hot.countCols() - 1, endColumn));

      this.hot.runHooks('afterPaste', inputArray, this.copyableRanges);
    }

    /**
     * Add copy, cut and paste options to the Context Menu.
     *
     * @private
     * @param {Object} options Contains default added options of the Context Menu.
     */

  }, {
    key: 'onAfterContextMenuDefaultOptions',
    value: function onAfterContextMenuDefaultOptions(options) {
      options.items.push({
        name: '---------'
      }, copyItem(this), cutItem(this));
    }

    /**
     * Force focus on focusableElement.
     *
     * @private
     */

  }, {
    key: 'onAfterOnCellMouseUp',
    value: function onAfterOnCellMouseUp() {
      if (!this.hot.isListening() || this.isEditorOpened()) {
        return;
      }

      this.getOrCreateFocusableElement();
      this.focusableElement.focus();
    }

    /**
     * Force focus on focusableElement after end of the selection.
     *
     * @private
     */

  }, {
    key: 'onAfterSelectionEnd',
    value: function onAfterSelectionEnd() {
      var _privatePool$get = privatePool.get(this),
          isFragmentSelectionEnabled = _privatePool$get.isFragmentSelectionEnabled;

      if (this.isEditorOpened()) {
        return;
      }

      this.getOrCreateFocusableElement();

      if (isFragmentSelectionEnabled && this.focusableElement.getFocusableElement() !== document.activeElement && getSelectionText()) {
        return;
      }

      this.setCopyableText();
      this.focusableElement.focus();
    }

    /**
     * `beforeKeyDown` listener to force focus of focusableElement.
     *
     * @private
     */

  }, {
    key: 'onBeforeKeyDown',
    value: function onBeforeKeyDown() {
      if (!this.hot.isListening() || this.isEditorOpened()) {
        return;
      }
      var activeElement = document.activeElement;
      var activeEditor = this.hot.getActiveEditor();

      if (!activeEditor || activeElement !== this.focusableElement.getFocusableElement() && activeElement !== activeEditor.select) {
        return;
      }

      this.getOrCreateFocusableElement();
      this.focusableElement.focus();
    }

    /**
     * Destroys the plugin instance.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.focusableElement) {
        destroyElement(this.focusableElement);
        this.focusableElement = null;
      }

      _get(CopyPaste.prototype.__proto__ || Object.getPrototypeOf(CopyPaste.prototype), 'destroy', this).call(this);
    }
  }]);

  return CopyPaste;
}(BasePlugin);

registerPlugin('CopyPaste', CopyPaste);

export default CopyPaste;