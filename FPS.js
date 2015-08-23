//FPS
var FPS = function(callback){
    var w = window;
    var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame;
    var cancelAnimationFrame = w.cancelAnimationFrame || w.webkitCancelAnimationFrame;

    return {
        /**
         * 根据`label`存储`requestAnimationFrame`返回的`requestID`
         *
         *      {
         *          slide: 0,
         *          iscroll: 1
         *      }
         *
         * @property _requestIDs
         * @type Object
         * @private
         */
        _requestIDs: {},
        /**
         * 根据`label`存储的计算出来的瞬时FPS值
         *
         *      {
         *          slide: [
         *              56,
         *              60,
         *              46
         *          ]
         *      }
         *
         * @property _fpsArr
         * @type Object
         * @private
         */
        _fpsArr: {},
        /**
         * 获取当前时间点
         * @method now
         * @return {Number}
         * @private
         */
        now: function() {
            try {
                return performance.now();
            } catch (ex) {
                return Date.now();
            }
        },
        /**
         * 表示统计一个时间段内的fps值的开始
         *
         *      FPS.fps('slide');
         *
         * @method fps
         * @param {String} label 埋点标识
         */
        fps: function (label) {
            if (!requestAnimationFrame) {
                return;
            }
            var self = this;
            var startTime;
            var run = function () {
                var now = self.now();
                if (!startTime) {
                    startTime = now;
                    self._requestIDs[label] = requestAnimationFrame(run);
                    return;
                }
                self._fpsArr[label].push(1000 / (now - startTime));
                startTime = now;
                self._requestIDs[label] = requestAnimationFrame(run);
            };
            self._fpsArr[label] = [];
            self._requestIDs[label] = requestAnimationFrame(run);
        },
        /**
         * 表示统计一个时间段内的fps值的结束
         *
         *      FPS.fpsEnd('slide', 1000);
         *
         * @method fpsEnd
         * @param {String} label 埋点标识
         */
        fpsEnd: function (label) {
            if (!cancelAnimationFrame) {
                return;
            }
            cancelAnimationFrame(this._requestIDs[label]);

            var arr = this._fpsArr[label];
            var total = 0;
            for(var i= 0,j=arr.length;i<j;i++){
                total += arr[i];
            }
            var r = parseInt(total / arr.length);

            callback({
                name: label,
                fps: r
            });

            delete this._fpsArr[label];
            delete this._requestIDs[label];
        }
    };
}();