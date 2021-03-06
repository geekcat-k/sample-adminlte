'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _element = require('./../../../../helpers/dom/element');

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @class BottomOverlay
 */
var BottomOverlay = function (_Overlay) {
  _inherits(BottomOverlay, _Overlay);

  /**
   * @param {Walkontable} wotInstance
   */
  function BottomOverlay(wotInstance) {
    _classCallCheck(this, BottomOverlay);

    var _this = _possibleConstructorReturn(this, (BottomOverlay.__proto__ || Object.getPrototypeOf(BottomOverlay)).call(this, wotInstance));

    _this.clone = _this.makeClone(_base2.default.CLONE_BOTTOM);
    return _this;
  }

  /**
   *
   */


  _createClass(BottomOverlay, [{
    key: 'repositionOverlay',
    value: function repositionOverlay() {
      var scrollbarWidth = (0, _element.getScrollbarWidth)();
      var cloneRoot = this.clone.wtTable.holder.parentNode;

      if (this.wot.wtTable.holder.clientHeight === this.wot.wtTable.holder.offsetHeight) {
        scrollbarWidth = 0;
      }

      cloneRoot.style.top = '';
      cloneRoot.style.bottom = scrollbarWidth + 'px';
    }

    /**
     * Checks if overlay should be fully rendered
     *
     * @returns {Boolean}
     */

  }, {
    key: 'shouldBeRendered',
    value: function shouldBeRendered() {
      /* eslint-disable no-unneeded-ternary */
      return this.wot.getSetting('fixedRowsBottom') ? true : false;
    }

    /**
     * Updates the top overlay position
     */

  }, {
    key: 'resetFixedPosition',
    value: function resetFixedPosition() {
      if (!this.needFullRender || !this.wot.wtTable.holder.parentNode) {
        // removed from DOM
        return;
      }

      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var headerPosition = 0;
      overlayRoot.style.top = '';

      if (this.wot.wtOverlays.leftOverlay.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var bottom = Math.ceil(box.bottom);
        var finalLeft = void 0;
        var finalBottom = void 0;
        var bodyHeight = document.body.offsetHeight;

        finalLeft = this.wot.wtTable.hider.style.left;
        finalLeft = finalLeft === '' ? 0 : finalLeft;

        if (bottom > bodyHeight) {
          finalBottom = bottom - bodyHeight;
        } else {
          finalBottom = 0;
        }
        headerPosition = finalBottom;
        finalBottom += 'px';

        overlayRoot.style.top = '';
        overlayRoot.style.left = finalLeft;
        overlayRoot.style.bottom = finalBottom;
      } else {
        headerPosition = this.getScrollPosition();
        (0, _element.resetCssTransform)(overlayRoot);
        this.repositionOverlay();
      }
      this.adjustHeaderBordersPosition(headerPosition);
    }

    /**
     * Sets the main overlay's vertical scroll position
     *
     * @param {Number} pos
     */

  }, {
    key: 'setScrollPosition',
    value: function setScrollPosition(pos) {
      if (this.mainTableScrollableElement === window) {
        window.scrollTo((0, _element.getWindowScrollLeft)(), pos);
      } else {
        this.mainTableScrollableElement.scrollTop = pos;
      }
    }

    /**
     * Triggers onScroll hook callback
     */

  }, {
    key: 'onScroll',
    value: function onScroll() {
      this.wot.getSetting('onScrollVertically');
    }

    /**
     * Calculates total sum cells height
     *
     * @param {Number} from Row index which calculates started from
     * @param {Number} to Row index where calculation is finished
     * @returns {Number} Height sum
     */

  }, {
    key: 'sumCellSizes',
    value: function sumCellSizes(from, to) {
      var row = from;
      var sum = 0;
      var defaultRowHeight = this.wot.wtSettings.settings.defaultRowHeight;

      while (row < to) {
        var height = this.wot.wtTable.getRowHeight(row);

        sum += height === void 0 ? defaultRowHeight : height;
        row += 1;
      }

      return sum;
    }

    /**
     * Adjust overlay root element, childs and master table element sizes (width, height).
     *
     * @param {Boolean} [force=false]
     */

  }, {
    key: 'adjustElementsSize',
    value: function adjustElementsSize() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      this.updateTrimmingContainer();

      if (this.needFullRender || force) {
        this.adjustRootElementSize();
        this.adjustRootChildrenSize();

        if (!force) {
          this.areElementSizesAdjusted = true;
        }
      }
    }

    /**
     * Adjust overlay root element size (width and height).
     */

  }, {
    key: 'adjustRootElementSize',
    value: function adjustRootElementSize() {
      var masterHolder = this.wot.wtTable.holder;
      var scrollbarWidth = masterHolder.clientWidth === masterHolder.offsetWidth ? 0 : (0, _element.getScrollbarWidth)();
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var overlayRootStyle = overlayRoot.style;

      if (this.trimmingContainer === window) {
        overlayRootStyle.width = '';
      } else {
        overlayRootStyle.width = this.wot.wtViewport.getWorkspaceWidth() - scrollbarWidth + 'px';
      }

      this.clone.wtTable.holder.style.width = overlayRootStyle.width;

      var tableHeight = (0, _element.outerHeight)(this.clone.wtTable.TABLE);
      overlayRootStyle.height = (tableHeight === 0 ? tableHeight : tableHeight) + 'px';
    }

    /**
     * Adjust overlay root childs size
     */

  }, {
    key: 'adjustRootChildrenSize',
    value: function adjustRootChildrenSize() {
      var scrollbarWidth = (0, _element.getScrollbarWidth)();

      this.clone.wtTable.hider.style.width = this.hider.style.width;
      this.clone.wtTable.holder.style.width = this.clone.wtTable.holder.parentNode.style.width;

      if (scrollbarWidth === 0) {
        scrollbarWidth = 30;
      }
      this.clone.wtTable.holder.style.height = parseInt(this.clone.wtTable.holder.parentNode.style.height, 10) + scrollbarWidth + 'px';
    }

    /**
     * Adjust the overlay dimensions and position
     */

  }, {
    key: 'applyToDOM',
    value: function applyToDOM() {
      var total = this.wot.getSetting('totalRows');

      if (!this.areElementSizesAdjusted) {
        this.adjustElementsSize();
      }
      if (typeof this.wot.wtViewport.rowsRenderCalculator.startPosition === 'number') {
        this.spreader.style.top = this.wot.wtViewport.rowsRenderCalculator.startPosition + 'px';
      } else if (total === 0) {
        // can happen if there are 0 rows
        this.spreader.style.top = '0';
      } else {
        throw new Error('Incorrect value of the rowsRenderCalculator');
      }
      this.spreader.style.bottom = '';

      if (this.needFullRender) {
        this.syncOverlayOffset();
      }
    }

    /**
     * Synchronize calculated left position to an element
     */

  }, {
    key: 'syncOverlayOffset',
    value: function syncOverlayOffset() {
      if (typeof this.wot.wtViewport.columnsRenderCalculator.startPosition === 'number') {
        this.clone.wtTable.spreader.style.left = this.wot.wtViewport.columnsRenderCalculator.startPosition + 'px';
      } else {
        this.clone.wtTable.spreader.style.left = '';
      }
    }

    /**
     * Scrolls vertically to a row
     *
     * @param sourceRow {Number} Row index which you want to scroll to
     * @param [bottomEdge=false] {Boolean} if `true`, scrolls according to the bottom edge (top edge is by default)
     */

  }, {
    key: 'scrollTo',
    value: function scrollTo(sourceRow, bottomEdge) {
      var newY = this.getTableParentOffset();
      var sourceInstance = this.wot.cloneSource ? this.wot.cloneSource : this.wot;
      var mainHolder = sourceInstance.wtTable.holder;
      var scrollbarCompensation = 0;

      if (bottomEdge && mainHolder.offsetHeight !== mainHolder.clientHeight) {
        scrollbarCompensation = (0, _element.getScrollbarWidth)();
      }

      if (bottomEdge) {
        newY += this.sumCellSizes(0, sourceRow + 1);
        newY -= this.wot.wtViewport.getViewportHeight();
        // Fix 1 pixel offset when cell is selected
        newY += 1;
      } else {
        newY += this.sumCellSizes(this.wot.getSetting('fixedRowsBottom'), sourceRow);
      }
      newY += scrollbarCompensation;

      this.setScrollPosition(newY);
    }

    /**
     * Gets table parent top position
     *
     * @returns {Number}
     */

  }, {
    key: 'getTableParentOffset',
    value: function getTableParentOffset() {
      if (this.mainTableScrollableElement === window) {
        return this.wot.wtTable.holderOffset.top;
      }

      return 0;
    }

    /**
     * Gets the main overlay's vertical scroll position
     *
     * @returns {Number} Main table's vertical scroll position
     */

  }, {
    key: 'getScrollPosition',
    value: function getScrollPosition() {
      return (0, _element.getScrollTop)(this.mainTableScrollableElement);
    }

    /**
     * Adds css classes to hide the header border's header (cell-selection border hiding issue)
     *
     * @param {Number} position Header Y position if trimming container is window or scroll top if not
     */

  }, {
    key: 'adjustHeaderBordersPosition',
    value: function adjustHeaderBordersPosition(position) {
      if (this.wot.getSetting('fixedRowsBottom') === 0 && this.wot.getSetting('columnHeaders').length > 0) {
        var masterParent = this.wot.wtTable.holder.parentNode;
        var previousState = (0, _element.hasClass)(masterParent, 'innerBorderTop');

        if (position) {
          (0, _element.addClass)(masterParent, 'innerBorderTop');
        } else {
          (0, _element.removeClass)(masterParent, 'innerBorderTop');
        }
        if (!previousState && position || previousState && !position) {
          this.wot.wtOverlays.adjustElementsSize();
        }
      }
      // nasty workaround for double border in the header, TODO: find a pure-css solution
      if (this.wot.getSetting('rowHeaders').length === 0) {
        var secondHeaderCell = this.clone.wtTable.THEAD.querySelector('th:nth-of-type(2)');

        if (secondHeaderCell) {
          secondHeaderCell.style['border-left-width'] = 0;
        }
      }
    }
  }]);

  return BottomOverlay;
}(_base2.default);

_base2.default.registerOverlay(_base2.default.CLONE_BOTTOM, BottomOverlay);

exports.default = BottomOverlay;