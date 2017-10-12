/**
 * 统一返回所有基础数据列表选择
 * 全局变量window.ArrayData 
 * 包含所有返回数组
 */
define(['冯腾飞的代码/js/mui', 'js/app', 'pic'], function(mui, app, pic) {
	var userInfo = app.getUserInfo();
	var data = {
		yesnoList: [{
			value: 1,
			text: '是'
		}, {
			value: 0,
			text: '否'
		}],
		GetEmergents:[{
			value:1,
			text:'紧急'
		},{
			value:2,
			text:'一般'
		}],
		whetherNot: [{
			value: 1,
			text: '有'
		}, {
			value: 0,
			text: '无'
		}],
		WayID:[{
			value:1,
			text:'正常处理'
		},{
			value:2,
			text:'超期处理'
		}]
	};
	window.ArrayData = data;

	function SetValue(selector, value) {
		app.setValue(selector, value);
	}
	function SetData(popPicker, list, defaultValue) {
		if(defaultValue != undefined && typeof(defaultValue) != 'object') {
			defaultValue = [defaultValue];
		}
		if(typeof(list) == 'string') {
			var data = window.ArrayData[list];
			if(!data) return;
			popPicker.setData(data, defaultValue);
			if(!data || (data.length == 1 && data[0].value == null)) {

				if(popPicker) {
					console.log('重新加载数据选择器数据');
					window.setTimeout(function() {
						SetData(popPicker, list, defaultValue);
					}, 500);
				}
			}
		} else {
			popPicker.setData(list, defaultValue);
			if(!list || (list.length == 1 && list[0].value == null)) {
				if(popPicker) {
					console.log('重新加载数据选择器数据');
					window.setTimeout(function() {
						SetData(popPicker, list, defaultValue);
					}, 500);
				}
			}
		}

	}

	function _InitArray(strArray) {
		var _data = window.ArrayData[strArray];
		_data.splice(0);
		var obj = [{
			text: '加载中..',
			value: null
		}];
		_data.push(obj);
	}

	/**
	 * 通用ajax
	 * @param {String} api接口
	 * @param {Object} 传参
	 * @param {Function} callback
	 * @param {String} window.ArrayData 全局变量名称
	 */
	function getChoose(api, option, callback, dataName) {
		var param = mui.param(option || {});
		var url = app.webApi + api;
		if(param) {
			url += '?' + param;
		}
		console.log(url);
		var _data = null;
		if(dataName) {
			_data = window.ArrayData[dataName];
			_InitArray(dataName)
		} else {
			_data = [];
		}
		mui.ajax({
			url: url,
			success: function(data) {
				_data.splice(0);
				for(var i = 0; i < data.length; i++) {
					var temp = data[i];
					_data.push(temp);
				}
			},
			error: function(x, t, e) {
				console.log(x);
			},
			complete: function() {
				if(typeof(callback) == 'function') callback(_data);
			}
		});
	}

	/**
	 * 通用ajax
	 * @param {String} api接口
	 * @param {Object} 传参
	 * @param {Function} 处理function
	 * @param {Function} callback
	 */
	function chooseArray(api, options, detail, callback) {
		var param = mui.param(options || {});
		var url = app.webApi + api;
		if(param) {
			url += '?' + param;
		}
		console.log(url);
		var _data = [];
		mui.ajax({
			url: url,
			success: function(data) {
				for(var i = 0; i < data.length; i++) {
					var temp = data[i];
					if(typeof detail == 'function') temp = detail(temp, i);
					_data.push(temp);
				}
			},
			error: function(x, t, e) {
				console.log(x);
			},
			complete: function() {
				if(typeof callback == 'function') callback(_data);
			}
		});
	}

	var choosePop = null;
	var chooseDT = null;

	function tempArray(name) {
		var arr = [];
		for(var i = 0; i < 10; i++) {
			var obj = {
				text: name + (i + 1),
				value: i + 1
			}
			arr.push(obj);
		}
		return initArray(arr);
	}

	//给数组增加一个_index属性
	function initArray(array) {
		for(var i = 0; i < array.length; i++) {
			array[i]._index = i;
		}
		return array;
	}

	return {
		/**
		 * 获取大小类
		 * @param {Object} callback
		 */
		getCaseMainTypes:function(callback){
			chooseArray('api/phone/GetCaseMainTypes',null,function(item){
				item.text=item.Name;
				item.value=item.ID;
				return item;
			},callback)
		},
		GetCaseSubTypes:function(bigClassId, callback){
			chooseArray('api/phone/GetCaseSubTypes',{id:bigClassId},function(item){
				item.text=item.Name;
				item.value=item.ID;
				return item;
			},callback)
		},
		
		//所属街道&所属社区
		GetStreets:function(callback){
			chooseArray('api/phone/GetStreets',null,function(item){
				item.text=item.Name;
				item.value=item.ID;
				return item;
			},callback)
		},
		GetCommunitys:function(bigStreetsId, callback){
			chooseArray('api/phone/GetCommunitys',{id:bigStreetsId},function(item){
				
				item.text=item.Name;
				item.value=item.ID;
				return item;
			},callback)
		},
		//事件来源
		getCaseSources:function(callback){
			chooseArray('api/phone/GetCaseSources',null,function(item){
				item.text=item.Name;
				item.value=item.ID;
				return item;
			},callback)
		},
		/**
		 * 通用接口
		 * @param {String} api
		 * @param {Object} 传参
		 * @param {Function} model 回调处理
		 * @param {Function} callback
		 */
		chooseArray: function(api, options, detailModel, callback) {
			chooseArray(api, options, detailModel, callback);
		},

		/**
		 * 支持多级联动
		 * @param {String,Array} dataList
		 * @param {Object} 4个属性:text[array],value[array],options[初始化],defaultValue[默认值]
		 * @param {Object} callback
		 */
		choosePick: function(dataList, selectors, callback) {
			if(!selectors) selectors = {};
			var options = selectors.options || {};
			var defaultValue = selectors.defaultValue;
			var spans = selectors.text || [];
			if(typeof(spans) != 'object') spans = [spans];
			var values = selectors.value || [];
			if(typeof(values) != 'object') values = [values];
			if(!defaultValue) { //没有给初始值.
				defaultValue = [];
				for(var i = 0; i < values.length; i++) {
					var str = app.getValue(document.querySelector(values[i]));
					defaultValue.push(str);
				}
			}
			if(choosePop) choosePop.dispose();
			choosePop = new mui.PopPicker(options);
			SetData(choosePop, dataList, defaultValue);
			choosePop.show(function(items) {
				if(items.length > 0 && items[0].value == null) {
					return false;
				}
				var len = spans.length > values.length ? spans.length : values.length;
				for(var i = 0; i < len; i++) {
					if(i >= items.length) break;
					if(spans[i]) SetValue(spans[i], items[i].text);
					if(values[i]) SetValue(values[i], items[i].value);
				}

				if(typeof(callback) == 'function') callback(items, choosePop);
			});
		},
		/**
		 * 
		 * @param {String} select  List, Name,Id
		 * @param {Object} data
		 * @param {Object} callback
		 * @param {Object} fSelect
		 * @param {Object} errCode
		 */
		initChoosePick: function(select, data, callback, fSelect, errCode) {
			var that = this;

			document.getElementById(select + 'List').addEventListener('tap', function() {
				if(fSelect) {
					var dom = document.getElementById(fSelect);
					var strValue = dom.value;
					if(!strValue) {
						mui.toast(errCode);
						return;
					}

				}
				that.choosePick(data, {
					text: '#' + select + 'Name',
					value: '#' + select + 'Id'
				}, callback)
			});

			var startValue = document.getElementById(select + 'Id').value; //初始值ID
			var startText = document.getElementById(select + 'Name').value; //初始值Text
			var oldText = null;
			if(fSelect) { //如果存在父id
				var _dom = document.getElementById(fSelect);
				existValueChange(_dom);
			}

			function existValueChange(dom) {
				var st = dom.value;
				if(oldText != st) {
					document.getElementById(select + 'Id').value = startValue;
					document.getElementById(select + 'Name').value = startText;
					oldText = st;
				}
				window.setTimeout(function() {
					existValueChange(dom);
				}, 400);
			}
		},
		/**
		 * 日期选择
		 * @param {Object} options
		 * type:'datetime'	完整日期视图(年月日时分),'date'	年视图(年月日),
		 * 'time'	时间视图(时分),'month'月视图(年月),'hour'	时视图(年月日时)
		 * customData:别名,设置上午,下午,年,月,日,时,分的别名
		 * labels:设置标签区域提示语,默认["年", "月", "日", "时", "分"]
		 * beginDate:最大开始日期,数字或者date类型,数字代表年份
		 * endDate:最大结束日期
		 * value:默认时间,如果要设置默认的时分,不显示年月,还是要把年月补充完整.
		 * @param {Function} callback
		 */
		chooseDate: function(options, callback) {
			//TODO  以后再封装.
			if(!options) options = {};
			var _option = mui.extend({
				type: 'datetime',
				value: new Date().Format('yyyy-MM-dd hh:mm')
			}, options);
			chooseDT = new mui.DtPicker(_option);
			chooseDT.show(function(items) {
				if(typeof(callback) == 'function') {
					var flg = callback(items);
					if(flg === false) return flg;
				}
				chooseDT.dispose();

			});
		},

		initDate: function(selector, options, callback) {
			var dom = document.querySelector(selector);
			if(!dom) {
				alert('没有找到dom节点!');
				return;
			}
			var st = app.getValue(dom);
			if(!st) st = new Date().Format('yyyy-MM-dd hh:mm');
			if(!options) options = {};
			var _option = mui.extend({
				type: 'datetime',
				value: st
			}, options);
			chooseDT = new mui.DtPicker(_option);
			chooseDT.show(function(items) {

				if(items.value) app.setValue(dom, items.value);
				if(typeof(callback) == 'function') {
					var flg = callback(items);
					if(flg === false) return flg;
				}
				chooseDT.dispose();

			});

		}
	}

});