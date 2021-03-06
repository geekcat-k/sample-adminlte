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
 * @class TopLeftCornerOverlay
 */
var BottomLeftCornerOverlay = function (_Overlay) {
  _inherits(BottomLeftCornerOverlay, _Overlay);

  /**
   * @param {Walkontable} wotInstance
   */
  function BottomLeftCornerOverlay(wotInstance) {
    _classCallCheck(this, BottomLeftCornerOverlay);

    var _this = _possibleConstructorReturn(this, (BottomLeftCornerOverlay.__proto__ || Object.getPrototypeOf(BottomLeftCornerOverlay)).call(this, wotInstance));

    _this.clone = _this.makeClone(_base2.default.CLONE_BOTTOM_LEFT_CORNER);
    return _this;
  }

  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */


  _createClass(BottomLeftCornerOverlay, [{
    key: 'shouldBeRendered',
    value: function shouldBeRendered() {
      /* eslint-disable no-unneeded-ternary */
      return this.wot.getSetting('fixedRowsBottom') && (this.wot.getSetting('fixedColumnsLeft') || this.wot.getSetting('rowHeaders').length) ? true : false;
    }

    /**
     * Reposition the overlay.
     */

  }, {
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
     * Updates the corner overlay position
     */

  }, {
    key: 'resetFixedPosition',
    value: function resetFixedPosition() {
      this.updateTrimmingContainer();

      if (!this.wot.wtTable.holder.parentNode) {
        // removed from DOM
        return;
      }
      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var tableHeight = (0, _element.outerHeight)(this.clone.wtTable.TABLE);
      var tableWidth = (0, _element.outerWidth)(this.clone.wtTable.TABLE);

      overlayRoot.style.top = '';

      if (this.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var bottom = Math.ceil(box.bottom);
        var left = Math.ceil(box.left);
        var finalLeft = void 0;
        var finalBottom = void 0;
        var bodyHeight = document.body.offsetHeight;

        if (left < 0) {
          finalLeft = -left;
        } else {
          finalLeft = 0;
        }

        if (bottom > bodyHeight) {
          finalBottom = bottom - bodyHeight;
        } else {
          finalBottom = 0;
        }
        finalBottom += 'px';
        finalLeft += 'px';

        overlayRoot.style.top = '';
        overlayRoot.style.left = finalLeft;
        overlayRoot.style.bottom = finalBottom;
      } else {
        (0, _element.resetCssTransform)(overlayRoot);
        this.repositionOverlay();
      }
      overlayRoot.style.height = (tableHeight === 0 ? tableHeight : tableHeight) + 'px';
      overlayRoot.style.width = (tableWidth === 0 ? tableWidth : tableWidth) + 'px';
    }
  }]);

  return BottomLeftCornerOverlay;
}(_base2.default);

_base2.default.registerOverlay(_base2.default.CLONE_BOTTOM_LEFT_CORNER, BottomLeftCornerOverlay);

exports.default = BottomLeftCornerOverlay;