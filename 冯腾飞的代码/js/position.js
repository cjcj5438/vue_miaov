/**
 * 坐标轴转换
 * wgs84  --  	国际标准通用坐标
 * gcj02  --	天朝要求我国的地图产品使用的加密坐标
 * bd09ll --	百度在gcj02坐标的基础上,自己没事做又加密了一套坐标
 */
(function() {
	var factory = function() {
		var WGS_A = 6378245.0;
		var WGS_EE = 0.00669342162296594323;
		var pi = Math.PI;
		var WGS84 = 'wgs84';
		var GCJ02 = 'gcj02';
		var BD09LL = 'bd09ll';

		function outOfChina(lat, lon) {
			if(lon < 72.004 || lon > 137.8347)
				return true;
			if(lat < 0.8293 || lat > 55.8271)
				return true;
			return false;
		}

		function transform(lat, lon) {
			if(outOfChina(lat, lon)) {
				return {
					latitude: lat,
					longitude: lon
				}
			}
			var dLat = transformLat(lon - 105.0, lat - 35.0);
			var dLon = transformLon(lon - 105.0, lat - 35.0);
			var radLat = lat / 180.0 * Math.PI;
			var magic = Math.sin(radLat);
			magic = 1 - WGS_EE * magic * magic;
			var sqrtMagic = Math.sqrt(magic);
			dLat = (dLat * 180.0) / ((WGS_A * (1 - WGS_EE)) / (magic * sqrtMagic) * Math.PI);
			dLon = (dLon * 180.0) / (WGS_A / sqrtMagic * Math.cos(radLat) * Math.PI);
			var mgLat = lat + dLat;
			var mgLon = lon + dLon;
			return {
				latitude: mgLat,
				longitude: mgLon
			}
		}

		function transformLat(x, y) {
			var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));

			ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
			ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
			ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
			return ret;
		}

		function transformLon(x, y) {
			var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));

			ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
			ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
			ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 *
				pi)) * 2.0 / 3.0;
			return ret;
		}

		return {
			transWgs84: function(type, lat, lon) {
				var self = this;
				var obj = null;
				switch(type) {
					case GCJ02:
						obj = self.gcj02ToWgs84(lat, lon);
						break;
					case BD09LL:
						obj = self.bd09ToWgs84(lat, lon);
						break;
					default:
						obj = {
							coordsType: WGS84,
							longitude: lon,
							latitude: lat
						}
						break;
				}
				return obj;
			},

			transGcj02: function(type, lat, lon) {
				var self = this;
				var obj = null;
				switch(type) {
					case WGS84:
						obj = self.wgs84ToGcj02(lat, lon);
						break;
					case BD09LL:
						obj = self.bd09ToGcj02(lat, lon);
						break;
					default:
						obj = {
							coordsType: GCJ02,
							longitude: lon,
							latitude: lat
						}
						break;
				}
				return obj;
			},

			transBd09ll: function(type, lat, lon) {
				var self = this;
				var obj = null;
				switch(type) {
					case WGS84:
						obj = self.wgs84ToBd09(lat, lon);
						break;
					case GCJ02:
						obj = self.gcj02ToBd09(lat, lon);
						break;
					default:
						obj = {
							coordsType: BD09LL,
							longitude: lon,
							latitude: lat
						}
						break;
				}
				return obj;
			},

			/**
			 * 高德坐标转84坐标
			 * @param {Number} lat
			 * @param {Number} lon
			 */
			gcj02ToWgs84: function(lat, lon) {
				var gps = transform(lat, lon);
				var longitude = lon * 2 - gps.longitude;
				var latitude = lat * 2 - gps.latitude;
				return {
					coordsType: 'wgs84',
					longitude: longitude,
					latitude: latitude
				}
			},

			gcj02ToBd09: function(gg_lat, gg_lon) {
				var x = gg_lon;
				var y = gg_lat;
				var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * pi);
				var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * pi);
				var bd_lon = z * Math.cos(theta) + 0.0065;
				var bd_lat = z * Math.sin(theta) + 0.006;
				return {
					coordsType: BD09LL,
					latitude: bd_lat,
					longitude: bd_lon
				}
			},

			/**
			 * 百度加密坐标转gcj02坐标
			 * @param {Number} bd_lat
			 * @param {Number} bd_lon
			 */
			bd09ToGcj02: function(bd_lat, bd_lon) {
				var x = bd_lon - 0.0065,
					y = bd_lat - 0.006;
				var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
				var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
				var gcj_lon = z * Math.cos(theta);
				var gcj_lat = z * Math.sin(theta);
				return {
					coordsType: 'bd09ll',
					longitude: gcj_lon,
					latitude: gcj_lat
				}
			},
			/**
			 * bd09ll转84坐标
			 * @param {Number} lat
			 * @param {Number} lon
			 */
			bd09ToWgs84: function(bd_lat, bd_lon) {
				var gcj02 = this.bd09ToGcj02(bd_lat, bd_lon);
				var gps = this.gcj02ToWgs84(gcj02.latitude, gcj02.longitude);
				return gps;
			},

			wgs84ToBd09: function(lat, lon) {
				var gg = this.wgs84ToGcj02(lat, lon);
				var bd = this.gcj02ToBd09(gg.latitude, gg.longitude);
				return bd;
			},

			wgs84ToGcj02: function(lat, lon) {
				lat = parseFloat(lat);
				lon = parseFloat(lon);
				if(outOfChina(lat, lon)) {
					return null;
				}
				var dLat = transformLat(lon - 105.0, lat - 35.0);
				var dLon = transformLon(lon - 105.0, lat - 35.0);
				var radLat = lat / 180.0 * pi;
				var magic = Math.sin(radLat);
				magic = 1 - WGS_EE * magic * magic;
				var sqrtMagic = Math.sqrt(magic);
				dLat = (dLat * 180.0) / ((WGS_A * (1 - WGS_EE)) / (magic * sqrtMagic) * pi);
				dLon = (dLon * 180.0) / (WGS_A / sqrtMagic * Math.cos(radLat) * pi);
				var mgLat = lat + dLat;
				var mgLon = lon + dLon;
				//return new Gps(mgLat, mgLon);
				return {
					coordsType: 'wgs84',
					longitude: mgLon,
					latitude: mgLat
				}
			},
			/**
			 * 转码  : 
			 * @param {Object} pos:标准接口返回对象
			 * @param {String} coordsType 要转换的类型: wgs84,gcj02,bd09ll
			 */
			transpose: function(pos, coordsType) {
				var self = this;
				var codns = pos.coords;
				var lat = codns.latitude;
				var lon = codns.longitude;
				var type = pos.coordsType;
				var obj = null;
				switch(coordsType) {
					case WGS84: //最终要转成84
						obj = self.transWgs84(type, lat, lon);
						break;
					case GCJ02: //最终要转成火星坐标
						obj = self.transGcj02(type, lat, lon);
						break;
					case BD09LL: //最终转成百度坐标
						obj = self.transBd09ll(type, lat, lon);
						break;
					default:
						console.log('无效类型:' + coordsType);
						break;
				}
				return obj;

			}

		}
	}
	if(typeof(define) == 'function' && define.amd && define.amd.vendor != 'dojotoolkit.org') {
		
		define(factory);
	} else {
		window.position = factory();
	}
	
})();

