(function(window, factory) {
	if(typeof(define) == 'function' && define.amd && define.amd.vendor != 'dojotoolkit.org') {
		//amd
		define(['js/common'], factory);
	} else {
		window.imageTimer = factory();
	}
})(window, function() {
	var CANVAS_WIDTH = 64;
	var FONT_SIZE = 13;
	var CLOCK_FONT_SIZE = 10;
	var canvas, ctx;
	var update_obj = {}; //图片id内容
	var image_obj = {}; //图片缓存	
	var image_array = [{ //根据剩余时间不同设置不同的颜色.
		overValue: null, //大于2天的.
		color: '#60b117'
	}, {
		overValue: 2 * 24 * 60 * 60, //还有2天的事件
		color: '#f6c800'
	}, {
		overValue: 3 * 60 * 60, //还有3小时时间的事件
		color: '#f26f0c'
	}, {
		overValue: 0, //还有0秒的事件(已经超期了)
		color: 'red'
	}];

	init();

	//初始化图片元素.
	function init() {
		canvas = document.createElement("canvas");
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_WIDTH;
		ctx = canvas.getContext('2d');
		ctx.lineWidth = 2; //画笔宽度.
		ctx.font = FONT_SIZE + "px Arial";
		//ctx.translate(0.5, 0.5);
	}

	/**
	 * 要填充的文字
	 * @param {Date} serverTime
	 * @param {Date} overTime
	 */
	function getImageText(timeObject) {

		var obj = timeObject;
		var str;
		if(obj.year != 0 && obj.month >= 12) {
			str = obj.year + ' year';
		} else if(obj.month != 0 && obj.day >= 30) {
			str = obj.month + ' month';
		} else if(obj.day != 0) {
			str = obj.day + ' day';
		} else if(obj.hour != 0) {
			str = obj.hour + ' hour';
		} else if(obj.minute != 0) {
			str = obj.minute + ' minute';
		} else if(obj.second != 0) {
			str = obj.second + ' second';
		} else {
			str = '0 second';
		}

		return str;
	}

	/**
	 * 获取时间对象.
	 * @param {Date} serverTime
	 * @param {Date} overTime
	 */
	function getTimeObject(serverTime, overTime) {
		var rst = {};
		var num = 0;
		var t1 = serverTime.getTime(); //当前时间
		var t2 = overTime.getTime(); //超期时间.
		rst['overTimeDate'] = new Date(t2);
		rst['serverTimeDate'] = new Date(t1);
		rst['overTime'] = t2;
		rst['serverTime'] = t1;
		rst['year'] = overTime.getFullYear() - serverTime.getFullYear(); //剩余年数
		rst['month'] = rst['year'] * 12 + overTime.getMonth() - serverTime.getMonth(); //剩余月数
		rst['day'] = parseInt(((t2 - t1) / 86400000).toFixed(6)); //剩余天数
		rst['hour'] = parseInt(((t2 - t1) / 3600000).toFixed(6)); //剩余小时数
		rst['minute'] = parseInt(((t2 - t1) / 60000).toFixed(6)); //剩余分钟.
		rst['second'] = parseInt(((t2 - t1) / 1000).toFixed(6)); //剩余秒数

		rst.isOver = t2 < t1;

		return rst;
	}

	//下一次更新图片的时间.
	function nextUpdateTime(timeObject) {
		var obj = timeObject;
		var sDate;
		var num;
		if(obj.day != 0) return 0; //不用更新了.

		if(obj.hour != 0) {
			//未验证,应该没问题,如果有问题改成1分钟刷一次好了
			var s = obj.minute % 3600;
			if(s < 0) s = 3600 + s;
			if(s == 0) {
				s = Math.abs(obj.hour) > 1 ? 3600 : 60;
			}
			num = s * 1000;

		} else if(obj.minute != 0) {

			var s = obj.second % 60;
			if(s < 0) s = 60 + s;
			if(s == 0) {
				s = Math.abs(obj.minute) > 1 ? 60 : 1;
			}
			num = s * 1000;

		} else {
			num = 1000;
		}
		return num;

	}

	/**
	 * 根据图片素材返回base64
	 * @param {DocumentEvent} imgDom
	 * @param {String} strText
	 */
	function getBase64Image(strText, imageItem, clockText) {
		var center, radius;
		ctx.clearRect(-CANVAS_WIDTH, -CANVAS_WIDTH, CANVAS_WIDTH * 2, CANVAS_WIDTH * 2);
		ctx.strokeStyle = imageItem.color; //画笔颜色
		ctx.fillStyle = imageItem.color;
		if(!strText) {
			center = [CANVAS_WIDTH / 2, CANVAS_WIDTH / 2];
			radius = (CANVAS_WIDTH / 2) * 0.8 * 0.7;
		} else {
			center = [CANVAS_WIDTH / 2, CANVAS_WIDTH * 0.7 / 2];
			radius = (CANVAS_WIDTH / 2) * 0.7 * 0.8
		}
		drawCircle(center, radius, clockText); //画时钟.
		if(strText) { //写字
			drawText(strText);
		}

		var base64 = canvas.toDataURL('image/png', 1);
		return base64;
	}
	//画文字
	function drawText(strText) {
		strText = strText.replace(/^-/, "");
		var len = strText.length * FONT_SIZE / 2; //不考虑中文.
		var y = CANVAS_WIDTH * 2 / 3 + CANVAS_WIDTH / 5;
		var x = CANVAS_WIDTH / 2 - len / 2;
		ctx.fillText(strText, x, y);
	}
	//画时钟
	function drawCircle(center, radius, clockText) {

		ctx.beginPath();
		ctx.moveTo(center[0], center[1] - radius * 0.5);
		ctx.lineTo(center[0], center[1]);
		ctx.lineTo(center[0] + radius * 0.6, center[1]);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
		ctx.stroke();

		if(clockText) {
			ctx.save();
			ctx.font = CLOCK_FONT_SIZE + "px Arial";
			ctx.fillText(clockText, center[0] - radius * 0.7, center[1] + radius * 0.5);
			ctx.restore();
		}
	}

	/**
	 * 获取要使用的图片元素.
	 */
	function getImagePicture(timeObj) {
		var model = image_array[0];
		for(var i = image_array.length - 1; i >= 0; i--) {
			var item = image_array[i];
			if(item.overValue == null || item.overValue >= timeObj.second) {
				model = item;
				break;
			}
		}
		return model;
	}

	function putImageForBase64(imageId, overTime, serverTime, errIndex) {
		var base64;
		var nTime = new Date().getTime();
		var image_dom = document.getElementById(imageId);
		if(!image_dom) {
			if(errIndex == undefined) errIndex = 0;
			if(errIndex > 10) {
				//超过10次未找到,销毁.
				if(imageId in update_obj) delete update_obj[imageId];
				return;
			}
			window.setTimeout(function() {
				errIndex++;
				putImageForBase64(imageId, overTime, serverTime, errIndex);
			}, 50);
			return;
		}

		var timeObj = getTimeObject(serverTime, overTime);
		var strText = getImageText(timeObj);

		if(strText in image_obj) {
			base64 = image_obj[strText];
		} else {
			var str = timeObj.isOver ? '超' : '';
			var pictureItem = getImagePicture(timeObj);
			base64 = getBase64Image(strText, pictureItem, str);
		}

		if(timeObj.hour == 0) { //图片加入缓存
			image_obj[strText] = base64;
		}

		image_dom.src = base64;

		var num = nextUpdateTime(timeObj);

		var obj = {
			updateTime: nTime,
			overTime: overTime,
			serverTime: serverTime,
			text: strText,
			num: num
		}

		if(num > 0) {
			obj.nextTick = window.setTimeout(function() {
				var xTime = new Date().getTime();
				var num = xTime - nTime;
				var newTime = new Date(timeObj.serverTime + num);
				putImageForBase64(imageId, overTime, newTime);
			}, num);

		}

		update_obj[imageId] = obj;

	}

	return {
		initImage: function(imageId, overTime, serverTime) {
			if(overTime == undefined) return;
			if(typeof overTime == 'string') overTime = new Date(overTime);
			if(typeof serverTime == 'string') serverTime = new Date(serverTime);

			if(imageId in update_obj) {
				if(update_obj[imageId].nextTick != undefined) {
					window.clearTimeout(update_obj[imageId].nextTick);
				}
				delete update_obj[imageId];
			}
			putImageForBase64(imageId, overTime, serverTime);
		}
	}

});