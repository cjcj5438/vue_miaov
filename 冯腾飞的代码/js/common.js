(function(w) {
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
	Date.prototype.Format = function(fmt) { //author: meizz 
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}

	/* 得到日期年月日等加数字后的日期 */

	Date.prototype.dateAdd = function(interval, number) {
		var d = this;
		var k = {
			'y': 'FullYear',
			'q': 'Month',
			'm': 'Month',
			'w': 'Date',
			'd': 'Date',
			'h': 'Hours',
			'n': 'Minutes',
			's': 'Seconds',
			'ms': 'MilliSeconds'
		};
		var n = {
			'q': 3,
			'w': 7
		};
		eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
		return d;

	}

	/* 计算两日期相差的日期年月日等 */

	Date.prototype.dateDiff = function(interval, objDate2) {

		var d = this,
			i = {},
			t = d.getTime(),
			t2 = objDate2.getTime();
		i['y'] = objDate2.getFullYear() - d.getFullYear();
		i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
		i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
		i['ms'] = objDate2.getTime() - d.getTime();
		i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
		i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
		i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
		i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
		i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
		return i[interval];

	}
	String.prototype.toDate = function() {
		var st = this;
		if(!st) {
			return new Date();
		} else {
			var str = st.replace(/-/g, '/');
			var date = new Date(str);
			return date;
		}
	}

	Array.prototype.initArray = function(array) {
		var self = this;
		self.splice(0);
		if(typeof array == 'undefined') {
			self.push({
				text: '数据加载中...',
				value: null
			});
		} else if(array.length == 0) {
			self.push({
				text: '无有效数据...',
				value: -1
			});
		} else {
			for(var i = 0; i < array.length; i++) {
				self.push(array[i]);
			}
		}
		return self;
	}
	if(!Array.prototype.find) {
		Array.prototype.find = function(predicate) {
			'use strict';
			if(this == null) {
				throw new TypeError('Array.prototype.find called on null or undefined');
			}
			if(typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}
			var list = Object(this);
			var length = list.length >>> 0;
			var thisArg = arguments[1];
			var value;

			for(var i = 0; i < length; i++) {
				value = list[i];
				if(predicate.call(thisArg, value, i, list)) {
					return value;
				}
			}
			return undefined;
		};
	}

})(window)