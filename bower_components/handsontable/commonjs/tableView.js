'use strict';

exports.__esModule = true;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _element = require('./helpers/dom/element');

var _eventManager = require('./eventManager');

var _eventManager2 = _interopRequireDefault(_eventManager);

var _event = require('./helpers/dom/event');

var _src = require('./3rdparty/walkontable/src');

var _src2 = _interopRequireDefault(_src);

var _mouseEventHandler = require('./selection/mouseEventHandler');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Cross-platform helper to clear text selection.
 */
var clearTextSelection = function clearTextSelection() {
  // http://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    // IE?
    document.selection.empty();
  }
};

/**
 * Handsontable TableView constructor
 * @param {Object} instance
 */
function TableView(instance) {
  var _this = this;

  var that = this;

  this.eventManager = new _eventManager2.default(instance);
  this.instance = instance;
  this.settings = instance.getSettings();
  this.selectionMouseDown = false;

  var originalStyle = instance.rootElement.getAttribute('style');

  if (originalStyle) {
    instance.rootElement.setAttribute('data-originalstyle', originalStyle); // needed to retrieve original style in jsFiddle link generator in HT examples. may be removed in future versions
  }

  (0, _element.addClass)(instance.rootElement, 'handsontable');

  var table = document.createElement('TABLE');
  (0, _element.addClass)(table, 'htCore');

  if (instance.getSettings().tableClassName) {
    (0, _element.addClass)(table, instance.getSettings().tableClassName);
  }
  this.THEAD = document.createElement('THEAD');
  table.appendChild(this.THEAD);
  this.TBODY = document.createElement('TBODY');
  table.appendChild(this.TBODY);

  instance.table = table;

  instance.container.insertBefore(table, instance.container.firstChild);

  this.eventManager.addEventListener(instance.rootElement, 'mousedown', function (event) {
    _this.selectionMouseDown = true;

    if (!that.isTextSelectionAllowed(event.target)) {
      clearTextSelection();
      event.preventDefault();
      window.focus(); // make sure that window that contains HOT is active. Important when HOT is in iframe.
    }
  });
  this.eventManager.addEventListener(instance.rootElement, 'mouseup', function () {
    _this.selectionMouseDown = false;
  });
  this.eventManager.addEventListener(instance.rootElement, 'mousemove', function (event) {
    if (_this.selectionMouseDown && !that.isTextSelectionAllowed(event.target)) {
      // Clear selection only when fragmentSelection is enabled, otherwise clearing selection breakes the IME editor.
      if (_this.settings.fragmentSelection) {
        clearTextSelection();
      }
      event.preventDefault();
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'keyup', function (event) {
    if (instance.selection.isInProgress() && !event.shiftKey) {
      instance.selection.finish();
    }
  });

  var isMouseDown = void 0;
  this.isMouseDown = function () {
    return isMouseDown;
  };

  this.eventManager.addEventListener(document.documentElement, 'mouseup', function (event) {
    if (instance.selection.isInProgress() && (0, _event.isLeftClick)(event)) {
      // is left mouse button
      instance.selection.finish();
    }

    isMouseDown = false;

    if ((0, _element.isOutsideInput)(document.activeElement) || !instance.selection.isSelected() && !(0, _event.isRightClick)(event)) {
      instance.unlisten();
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'contextmenu', function (event) {
    if (instance.selection.isInProgress() && (0, _event.isRightClick)(event)) {
      instance.selection.finish();

      isMouseDown = false;
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'touchend', function () {
    if (instance.selection.isInProgress()) {
      instance.selection.finish();
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'mousedown', function (event) {
    var originalTarget = event.target;
    var eventX = event.x || event.clientX;
    var eventY = event.y || event.clientY;
    var next = event.target;

    if (isMouseDown || !instance.rootElement) {
      return; // it must have been started in a cell
    }

    // immediate click on "holder" means click on the right side of vertical scrollbar
    if (next === instance.view.wt.wtTable.holder) {
      var scrollbarWidth = (0, _element.getScrollbarWidth)();

      if (document.elementFromPoint(eventX + scrollbarWidth, eventY) !== instance.view.wt.wtTable.holder || document.elementFromPoint(eventX, eventY + scrollbarWidth) !== instance.view.wt.wtTable.holder) {
        return;
      }
    } else {
      while (next !== document.documentElement) {
        if (next === null) {
          if (event.isTargetWebComponent) {
            break;
          }
          // click on something that was a row but now is detached (possibly because your click triggered a rerender)
          return;
        }
        if (next === instance.rootElement) {
          // click inside container
          return;
        }
        next = next.parentNode;
      }
    }

    // function did not return until here, we have an outside click!

    var outsideClickDeselects = typeof that.settings.outsideClickDeselects === 'function' ? that.settings.outsideClickDeselects(originalTarget) : that.settings.outsideClickDeselects;

    if (outsideClickDeselects) {
      instance.deselectCell();
    } else {
      instance.destroyEditor(false, false);
    }
  });

  this.eventManager.addEventListener(table, 'selectstart', function (event) {
    if (that.settings.fragmentSelection || (0, _element.isInput)(event.target)) {
      return;
    }
    // https://github.com/handsontable/handsontable/issues/160
    // Prevent text from being selected when performing drag down.
    event.preventDefault();
  });

  var walkontableConfig = {
    debug: function debug() {
      return that.settings.debug;
    },
    externalRowCalculator: this.instance.getPlugin('autoRowSize') && this.instance.getPlugin('autoRowSize').isEnabled(),
    table: table,
    preventOverflow: function preventOverflow() {
      return _this.settings.preventOverflow;
    },
    stretchH: function stretchH() {
      return that.settings.stretchH;
    },
    data: instance.getDataAtCell,
    totalRows: function totalRows() {
      return instance.countRows();
    },
    totalColumns: function totalColumns() {
      return instance.countCols();
    },
    fixedColumnsLeft: function fixedColumnsLeft() {
      return that.settings.fixedColumnsLeft;
    },
    fixedRowsTop: function fixedRowsTop() {
      return that.settings.fixedRowsTop;
    },
    fixedRowsBottom: function fixedRowsBottom() {
      return that.settings.fixedRowsBottom;
    },
    minSpareRows: function minSpareRows() {
      return that.settings.minSpareRows;
    },
    renderAllRows: that.settings.renderAllRows,
    rowHeaders: function rowHeaders() {
      var headerRenderers = [];

      if (instance.hasRowHeaders()) {
        headerRenderers.push(function (row, TH) {
          return that.appendRowHeader(row, TH);
        });
      }

      instance.runHooks('afterGetRowHeaderRenderers', headerRenderers);

      return headerRenderers;
    },
    columnHeaders: function columnHeaders() {
      var headerRenderers = [];

      if (instance.hasColHeaders()) {
        headerRenderers.push(function (column, TH) {
          that.appendColHeader(column, TH);
        });
      }

      instance.runHooks('afterGetColumnHeaderRenderers', headerRenderers);

      return headerRenderers;
    },
    columnWidth: instance.getColWidth,
    rowHeight: instance.getRowHeight,
    cellRenderer: function cellRenderer(row, col, TD) {
      var cellProperties = that.instance.getCellMeta(row, col);
      var prop = that.instance.colToProp(col);
      var value = that.instance.getDataAtRowProp(row, prop);

      if (that.instance.hasHook('beforeValueRender')) {
        value = that.instance.runHooks('beforeValueRender', value, cellProperties);
      }

      that.instance.runHooks('beforeRenderer', TD, row, col, prop, value, cellProperties);
      that.instance.getCellRenderer(cellProperties)(that.instance, TD, row, col, prop, value, cellProperties);
      that.instance.runHooks('afterRenderer', TD, row, col, prop, value, cellProperties);
    },

    selections: that.instance.selection.highlight,
    hideBorderOnMouseDownOver: function hideBorderOnMouseDownOver() {
      return that.settings.fragmentSelection;
    },
    onCellMouseDown: function onCellMouseDown(event, coords, TD, wt) {
      var blockCalculations = {
        row: false,
        column: false,
        cell: false
      };

      instance.listen();

      that.activeWt = wt;
      isMouseDown = true;

      instance.runHooks('beforeOnCellMouseDown', event, coords, TD, blockCalculations);

      if ((0, _event.isImmediatePropagationStopped)(event)) {
        return;
      }

      (0, _mouseEventHandler.handleMouseEvent)(event, {
        coords: coords,
        selection: instance.selection,
        controller: blockCalculations
      });

      instance.runHooks('afterOnCellMouseDown', event, coords, TD);
      that.activeWt = that.wt;
    },
    onCellContextMenu: function onCellContextMenu(event, coords, TD, wt) {
      that.activeWt = wt;
      isMouseDown = false;

      if (instance.selection.isInProgress()) {
        instance.selection.finish();
      }

      instance.runHooks('beforeOnCellContextMenu', event, coords, TD);

      if ((0, _event.isImmediatePropagationStopped)(event)) {
        return;
      }

      instance.runHooks('afterOnCellContextMenu', event, coords, TD);

      that.activeWt = that.wt;
    },
    onCellMouseOut: function onCellMouseOut(event, coords, TD, wt) {
      that.activeWt = wt;
      instance.runHooks('beforeOnCellMouseOut', event, coords, TD);

      if ((0, _event.isImmediatePropagationStopped)(event)) {
        return;
      }

      instance.runHooks('afterOnCellMouseOut', event, coords, TD);
      that.activeWt = that.wt;
    },
    onCellMouseOver: function onCellMouseOver(event, coords, TD, wt) {
      var blockCalculations = {
        row: false,
        column: false,
        cell: false
      };

      that.activeWt = wt;

      instance.runHooks('beforeOnCellMouseOver', event, coords, TD, blockCalculations);

      if ((0, _event.isImmediatePropagationStopped)(event)) {
        return;
      }

      if (isMouseDown) {
        (0, _mouseEventHandler.handleMouseEvent)(event, {
          coords: coords,
          selection: instance.selection,
          controller: blockCalculations
        });
      }

      instance.runHooks('afterOnCellMouseOver', event, coords, TD);
      that.activeWt = that.wt;
    },
    onCellMouseUp: function onCellMouseUp(event, coords, TD, wt) {
      that.activeWt = wt;
      instance.runHooks('beforeOnCellMouseUp', event, coords, TD);

      instance.runHooks('afterOnCellMouseUp', event, coords, TD);
      that.activeWt = that.wt;
    },
    onCellCornerMouseDown: function onCellCornerMouseDown(event) {
      event.preventDefault();
      instance.runHooks('afterOnCellCornerMouseDown', event);
    },
    onCellCornerDblClick: function onCellCornerDblClick(event) {
      event.preventDefault();
      instance.runHooks('afterOnCellCornerDblClick', event);
    },
    beforeDraw: function beforeDraw(force, skipRender) {
      that.beforeRender(force, skipRender);
    },
    onDraw: function onDraw(force) {
      that.onDraw(force);
    },
    onScrollVertically: function onScrollVertically() {
      instance.runHooks('afterScrollVertically');
    },
    onScrollHorizontally: function onScrollHorizontally() {
      instance.runHooks('afterScrollHorizontally');
    },

    onBeforeRemoveCellClassNames: function onBeforeRemoveCellClassNames() {
      return instance.runHooks('beforeRemoveCellClassNames');
    },
    onAfterDrawSelection: function onAfterDrawSelection(currentRow, currentColumn, cornersOfSelection, layerLevel) {
      return instance.runHooks('afterDrawSelection', currentRow, currentColumn, cornersOfSelection, layerLevel);
    },
    onBeforeDrawBorders: function onBeforeDrawBorders(corners, borderClassName) {
      instance.runHooks('beforeDrawBorders', corners, borderClassName);
    },
    onBeforeTouchScroll: function onBeforeTouchScroll() {
      instance.runHooks('beforeTouchScroll');
    },
    onAfterMomentumScroll: function onAfterMomentumScroll() {
      instance.runHooks('afterMomentumScroll');
    },

    onBeforeStretchingColumnWidth: function onBeforeStretchingColumnWidth(stretchedWidth, column) {
      return instance.runHooks('beforeStretchingColumnWidth', stretchedWidth, column);
    },
    onModifyRowHeaderWidth: function onModifyRowHeaderWidth(rowHeaderWidth) {
      return instance.runHooks('modifyRowHeaderWidth', rowHeaderWidth);
    },
    onModifyGetCellCoords: function onModifyGetCellCoords(row, column, topmost) {
      return instance.runHooks('modifyGetCellCoords', row, column, topmost);
    },
    viewportRowCalculatorOverride: function viewportRowCalculatorOverride(calc) {
      var rows = instance.countRows();
      var viewportOffset = that.settings.viewportRowRenderingOffset;

      if (viewportOffset === 'auto' && that.settings.fixedRowsTop) {
        viewportOffset = 10;
      }
      if (typeof viewportOffset === 'number') {
        calc.startRow = Math.max(calc.startRow - viewportOffset, 0);
        calc.endRow = Math.min(calc.endRow + viewportOffset, rows - 1);
      }
      if (viewportOffset === 'auto') {
        var center = calc.startRow + calc.endRow - calc.startRow;
        var offset = Math.ceil(center / rows * 12);

        calc.startRow = Math.max(calc.startRow - offset, 0);
        calc.endRow = Math.min(calc.endRow + offset, rows - 1);
      }
      instance.runHooks('afterViewportRowCalculatorOverride', calc);
    },
    viewportColumnCalculatorOverride: function viewportColumnCalculatorOverride(calc) {
      var cols = instance.countCols();
      var viewportOffset = that.settings.viewportColumnRenderingOffset;

      if (viewportOffset === 'auto' && that.settings.fixedColumnsLeft) {
        viewportOffset = 10;
      }
      if (typeof viewportOffset === 'number') {
        calc.startColumn = Math.max(calc.startColumn - viewportOffset, 0);
        calc.endColumn = Math.min(calc.endColumn + viewportOffset, cols - 1);
      }
      if (viewportOffset === 'auto') {
        var center = calc.startColumn + calc.endColumn - calc.startColumn;
        var offset = Math.ceil(center / cols * 12);

        calc.startRow = Math.max(calc.startColumn - offset, 0);
        calc.endColumn = Math.min(calc.endColumn + offset, cols - 1);
      }
      instance.runHooks('afterViewportColumnCalculatorOverride', calc);
    },

    rowHeaderWidth: function rowHeaderWidth() {
      return that.settings.rowHeaderWidth;
    },
    columnHeaderHeight: function columnHeaderHeight() {
      var columnHeaderHeight = instance.runHooks('modifyColumnHeaderHeight');
      return that.settings.columnHeaderHeight || columnHeaderHeight;
    }
  };

  instance.runHooks('beforeInitWalkontable', walkontableConfig);

  this.wt = new _src2.default(walkontableConfig);
  this.activeWt = this.wt;

  this.eventManager.addEventListener(that.wt.wtTable.spreader, 'mousedown', function (event) {
    // right mouse button exactly on spreader means right click on the right hand side of vertical scrollbar
    if (event.target === that.wt.wtTable.spreader && event.which === 3) {
      (0, _event.stopPropagation)(event);
    }
  });

  this.eventManager.addEventListener(that.wt.wtTable.spreader, 'contextmenu', function (event) {
    // right mouse button exactly on spreader means right click on the right hand side of vertical scrollbar
    if (event.target === that.wt.wtTable.spreader && event.which === 3) {
      (0, _event.stopPropagation)(event);
    }
  });

  this.eventManager.addEventListener(document.documentElement, 'click', function () {
    if (that.settings.observeDOMVisibility) {
      if (that.wt.drawInterrupted) {
        that.instance.forceFullRender = true;
        that.render();
      }
    }
  });
}

TableView.prototype.isTextSelectionAllowed = function (el) {
  if ((0, _element.isInput)(el)) {
    return true;
  }
  var isChildOfTableBody = (0, _element.isChildOf)(el, this.instance.view.wt.wtTable.spreader);

  if (this.settings.fragmentSelection === true && isChildOfTableBody) {
    return true;
  }
  if (this.settings.fragmentSelection === 'cell' && this.isSelectedOnlyCell() && isChildOfTableBody) {
    return true;
  }
  if (!this.settings.fragmentSelection && this.isCellEdited() && this.isSelectedOnlyCell()) {
    return true;
  }

  return false;
};

/**
 * Check if selected only one cell.
 *
 * @returns {Boolean}
 */
TableView.prototype.isSelectedOnlyCell = function () {
  var _ref = this.instance.getSelectedLast() || [],
      _ref2 = _slicedToArray(_ref, 4),
      row = _ref2[0],
      col = _ref2[1],
      rowEnd = _ref2[2],
      colEnd = _ref2[3];

  return row !== void 0 && row === rowEnd && col === colEnd;
};

TableView.prototype.isCellEdited = function () {
  var activeEditor = this.instance.getActiveEditor();

  return activeEditor && activeEditor.isOpened();
};

TableView.prototype.beforeRender = function (force, skipRender) {
  if (force) {
    // this.instance.forceFullRender = did Handsontable request full render?
    this.instance.runHooks('beforeRender', this.instance.forceFullRender, skipRender);
  }
};

TableView.prototype.onDraw = function (force) {
  if (force) {
    // this.instance.forceFullRender = did Handsontable request full render?
    this.instance.runHooks('afterRender', this.instance.forceFullRender);
  }
};

TableView.prototype.render = function () {
  this.wt.draw(!this.instance.forceFullRender);
  this.instance.forceFullRender = false;
  this.instance.renderCall = false;
};

/**
 * Returns td object given coordinates
 *
 * @param {CellCoords} coords
 * @param {Boolean} topmost
 */
TableView.prototype.getCellAtCoords = function (coords, topmost) {
  var td = this.wt.getCell(coords, topmost);

  if (td < 0) {
    // there was an exit code (cell is out of bounds)
    return null;
  }

  return td;
};

/**
 * Scroll viewport to a cell.
 *
 * @param {CellCoords} coords
 * @param {Boolean} [snapToTop]
 * @param {Boolean} [snapToRight]
 * @param {Boolean} [snapToBottom]
 * @param {Boolean} [snapToLeft]
 * @returns {Boolean}
 */
TableView.prototype.scrollViewport = function (coords, snapToTop, snapToRight, snapToBottom, snapToLeft) {
  return this.wt.scrollViewport(coords, snapToTop, snapToRight, snapToBottom, snapToLeft);
};

/**
 * Scroll viewport to a column.
 *
 * @param {Number} column Visual column index.
 * @param {Boolean} [snapToLeft]
 * @param {Boolean} [snapToRight]
 * @returns {Boolean}
 */
TableView.prototype.scrollViewportHorizontally = function (column, snapToRight, snapToLeft) {
  return this.wt.scrollViewportHorizontally(column, snapToRight, snapToLeft);
};

/**
 * Scroll viewport to a row.
 *
 * @param {Number} row Visual row index.
 * @param {Boolean} [snapToTop]
 * @param {Boolean} [snapToBottom]
 * @returns {Boolean}
 */
TableView.prototype.scrollViewportVertically = function (row, snapToTop, snapToBottom) {
  return this.wt.scrollViewportVertically(row, snapToTop, snapToBottom);
};

/**
 * Append row header to a TH element
 * @param row
 * @param TH
 */
TableView.prototype.appendRowHeader = function (row, TH) {
  if (TH.firstChild) {
    var container = TH.firstChild;

    if (!(0, _element.hasClass)(container, 'relative')) {
      (0, _element.empty)(TH);
      this.appendRowHeader(row, TH);

      return;
    }
    this.updateCellHeader(container.querySelector('.rowHeader'), row, this.instance.getRowHeader);
  } else {
    var div = document.createElement('div');
    var span = document.createElement('span');

    div.className = 'relative';
    span.className = 'rowHeader';
    this.updateCellHeader(span, row, this.instance.getRowHeader);

    div.appendChild(span);
    TH.appendChild(div);
  }

  this.instance.runHooks('afterGetRowHeader', row, TH);
};

/**
 * Append column header to a TH element
 * @param col
 * @param TH
 */
TableView.prototype.appendColHeader = function (col, TH) {
  if (TH.firstChild) {
    var container = TH.firstChild;

    if ((0, _element.hasClass)(container, 'relative')) {
      this.updateCellHeader(container.querySelector('.colHeader'), col, this.instance.getColHeader);
    } else {
      (0, _element.empty)(TH);
      this.appendColHeader(col, TH);
    }
  } else {
    var div = document.createElement('div');
    var span = document.createElement('span');

    div.className = 'relative';
    span.className = 'colHeader';
    this.updateCellHeader(span, col, this.instance.getColHeader);

    div.appendChild(span);
    TH.appendChild(div);
  }

  this.instance.runHooks('afterGetColHeader', col, TH);
};

/**
 * Update header cell content
 *
 * @since 0.15.0-beta4
 * @param {HTMLElement} element Element to update
 * @param {Number} index Row index or column index
 * @param {Function} content Function which should be returns content for this cell
 */
TableView.prototype.updateCellHeader = function (element, index, content) {
  var renderedIndex = index;
  var parentOverlay = this.wt.wtOverlays.getParentOverlay(element) || this.wt;

  // prevent wrong calculations from SampleGenerator
  if (element.parentNode) {
    if ((0, _element.hasClass)(element, 'colHeader')) {
      renderedIndex = parentOverlay.wtTable.columnFilter.sourceToRendered(index);
    } else if ((0, _element.hasClass)(element, 'rowHeader')) {
      renderedIndex = parentOverlay.wtTable.rowFilter.sourceToRendered(index);
    }
  }

  if (renderedIndex > -1) {
    (0, _element.fastInnerHTML)(element, content(index));
  } else {
    // workaround for https://github.com/handsontable/handsontable/issues/1946
    (0, _element.fastInnerText)(element, String.fromCharCode(160));
    (0, _element.addClass)(element, 'cornerHeader');
  }
};

/**
 * Given a element's left position relative to the viewport, returns maximum element width until the right
 * edge of the viewport (before scrollbar)
 *
 * @param {Number} leftOffset
 * @return {Number}
 */
TableView.prototype.maximumVisibleElementWidth = function (leftOffset) {
  var workspaceWidth = this.wt.wtViewport.getWorkspaceWidth();
  var maxWidth = workspaceWidth - leftOffset;
  return maxWidth > 0 ? maxWidth : 0;
};

/**
 * Given a element's top position relative to the viewport, returns maximum element height until the bottom
 * edge of the viewport (before scrollbar)
 *
 * @param {Number} topOffset
 * @return {Number}
 */
TableView.prototype.maximumVisibleElementHeight = function (topOffset) {
  var workspaceHeight = this.wt.wtViewport.getWorkspaceHeight();
  var maxHeight = workspaceHeight - topOffset;
  return maxHeight > 0 ? maxHeight : 0;
};

TableView.prototype.mainViewIsActive = function () {
  return this.wt === this.activeWt;
};

TableView.prototype.destroy = function () {
  this.wt.destroy();
  this.eventManager.destroy();
};

exports.default = TableView;