(function (window, factory) {
    if (typeof(define) == 'function') {
        //amd
        define(['冯腾飞的代码/js/mui'], factory);
    } else {
        window.app = factory(window.mui);
    }
})(window, function (mui) {
    var IS_NONE = /^\s*$/; //空字符串
    var ERR = {
        NONE: 0,
        IS_NONE: 1
    };
    var DATA_PREVIEW_SRC = 'data-preview-src'; //图片详情属性
    var DATA_PREVIEW_GROUP = 'data-preview-group'; //图片组
    var image_group = 0; //图片集合.

    var _dom = document.querySelectorAll("[data-href]");
    if (_dom) {
        for (var i = 0; i < _dom.length; i++) {
            var win = _dom[i];
            win.addEventListener('tap', function (event) {
                var url = this.dataset.href;
                mui.openWindow({
                    url: url,
                    id: url
                });
            });
        }
    }
    mui.plusReady(function () {
        //按钮搜索
        var self = plus.webview.currentWebview();
        plus.key.addEventListener('searchbutton', function () {
            mui.fire(self, 'search');
        });
    });


    if (!mui.dom) {
        //创建 DOM
        mui.dom = function (str) {
            if (typeof(str) !== 'string') {
                if ((str instanceof Array) || (str[0] && str.length)) {
                    return [].slice.call(str);
                } else {
                    return [str];
                }
            }
            if (!mui.__create_dom_div__) {
                mui.__create_dom_div__ = document.createElement('div');
            }
            mui.__create_dom_div__.innerHTML = str;
            return [].slice.call(mui.__create_dom_div__.childNodes);
        };
    }

//	var webApi='http://218.108.93.246:11384/';
//
//	var imageApi='http://61.174.22.139:6085/Files/';

    var webApi = 'http://192.168.0.105:28000/'; //邱
    var imageApi = 'http://192.168.0.105:28000/';

    return {
        webApi: webApi,
//		imageApi: imageApi, 


        //图片的方法
        getQueryString: function (str, name) {
            var arr = new Array();
            arr = str.split("?");
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = arr[1].match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        /**
         * 获取url下所有的提交参数.
         * @param {String} url
         */
        getAllQueryString: function (url) {
            var pattern = /(\?|&)\w+=\w+((?=&)|$)/g;
            var mat = url.match(pattern);
            if (mat == null) return null;
            var obj = {};
            for (var i = 0; i < mat.length; i++) {
                var str = mat[i].substr(1);
                var temp = str.split('=');
                obj[temp[0]] = temp[1];
            }
            return obj;
        },

        //网络错误提示
        errorMessage: function (xhr, type, errorThrown, errStr) {
            //			var types = {};
            //			types[plus.networkinfo.CONNECTION_UNKNOW] = "Unknown connection";
            //			types[plus.networkinfo.CONNECTION_NONE] = "No connection";
            //			types[plus.networkinfo.CONNECTION_ETHERNET] = "Ethernet connection";
            //			types[plus.networkinfo.CONNECTION_WIFI] = "WiFi connection";
            //			types[plus.networkinfo.CONNECTION_CELL2G] = "Cellular 2G connection";
            //			types[plus.networkinfo.CONNECTION_CELL3G] = "Cellular 3G connection";
            //			types[plus.networkinfo.CONNECTION_CELL4G] = "Cellular 4G connection";
            if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE || plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_UNKNOW) {
                mui.toast("当前暂无网络连接，请打开数据服务!", "提示");
            } else if (xhr.status == 500) {
                mui.toast("失败!");
            } else if (xhr.status == 0) {
                mui.toast("网络失败，请检查网络情况！");
            } else {
                var _errstr = "请求失败!";
                if (errStr) _errstr = errStr
                mui.toast(_errstr);
            }

        },
        //获取localStorage 值
        getItem: function (value) {
            return window.localStorage.getItem(value);
        },
        //设置 值
        setItem: function (name, value) {
            return window.localStorage.setItem(name, value);
        },
        getObject: function (name) {
            var str = this.getItem(name);
            if (!str || str == '')
                return {
                    _status: false
                }
            try {
                var obj = JSON.parse(str);
                obj._status = true;
                return obj;
            } catch (e) {
                return {
                    _status: false
                }
            }
        },
        setObject: function (name, object) {
            var str = JSON.stringify(object);
            return this.setItem(name, str);
        },
        getUserInfo: function () {
            return this.getObject('userinfo');
        },
        setUserInfo: function (user) {
            return this.setObject('userinfo', user);
        },
        getGeography: function () {
            var lat = this.getItem('latitude');
            var lon = this.getItem('longitude');
            if (lat && lon) {
                return lon + ',' + lat;
            } else {
                return '';
            }
        },

        //创建本地数据库
        openDatabase: function () {
            if (window.openDatabase) {
                var db = openDatabase('zhdb', '1.0', '', 2 * 1024 * 1024);
                return db;
            } else {
                return null;
            }

        },
        // 设置值
        setValue: function (dom, val) {
            if (!dom) return;
            if (typeof(dom) == 'string') {
                dom = document.querySelector(dom);
            }
            if (dom) {
                var tagName = dom.tagName.toLocaleLowerCase();
                if (val == undefined) val = '';
                if (tagName == 'input' || tagName == 'textarea') { //需要再加
                    dom.value = val;
                } else {
                    dom.innerText = val;
                }
            }
        },
        //获取dom的value值
        getValue: function (dom) {
            if (typeof(dom) == 'string') {
                dom = document.querySelector(dom);
            }
            var tagName = dom.tagName.toLocaleLowerCase();
            if (tagName == 'input' || tagName == 'textarea') { //需要再加
                return dom.value;
            } else {
                return dom.innerText;
            }
        },
        //data数据放入页面中
        setFormByData: function (data) {
            for (var name in data) {
                var dom = document.getElementById(name);
                //if(dom && data[name] == null) data[name] = '';
                this.setValue(dom, data[name]);

            }
        },
        //暂时只验证是否为空. 具体场景具体分析
        vaildateText: function (dom, strText) {
            var self = this;
            if (strText == undefined) strText = self.getValue(dom);
            var err = {
                code: ERR.NONE,
                message: ''
            };
            if ('valRequired' in dom.dataset) {
                if (IS_NONE.test(strText)) {
                    err.code = ERR.IS_NONE;
                    err.message = dom.dataset.valRequired;
                    return err;
                }
            }
            return err;
        },
        /**
         * 获取页面数据(新)
         * @param {String} ctype
         */
        getDataByContent: function (ctype) {
            var self = this;
            var data = {};
            data._err = [];
            if (!ctype) ctype = 'ctype';
            var selects = '.mui-content [' + ctype + ']';
            var list = document.querySelectorAll(selects);//获取所有有ctype属性的元素
            for (var i = 0; i < list.length; i++) {
                var temp = list[i];
                var name = temp.getAttribute(ctype);//对应的ctype值就是数据库的字段
                var strText = self.getValue(temp);//这个元素的value值
                data[name] = strText;
                var err = self.vaildateText(temp, strText);
                if (err.code != ERR.NONE) {
                    data._err.push(err);
                }
            }
            return data;
        },

        //获取标准图片集合,start默认1,end默认4
        getImageList: function (start, end) {
            if (!start) start = 1;
            if (!end || end < start) end = start + 3;
            var imgList = [];
            for (var i = start; i <= end; i++) {
                var dom = document.getElementById("head-img" + i + 'Name');
                var base = document.getElementById("img-head-img" + i + "Name");
                if (dom && base) {
                    var name = dom.value; //图片名字
                    var base64 = base.value; //编码
                    var id = null;
                    if (!base64) { //如果是已经上传的图片
                        id = name;
                    }
                    var type = 1;
                    if (i > 4) {
                        type = 2;
                    }
                    var obj = {
                        ID: id,
                        Name: name,
                        Type: type,
                        Base64: base64
                    };
                } else {
                    console.log("head-img" + i + 'Name or ' + "img-head-img" + i + "Name " + '找不到');
                }
                if (obj.Name != '' && obj.Name != null) imgList.push(obj);
            }
            return imgList;
        },
        getImagePath: function (imgs, defaultPath, legalCasePath) {
            if (!legalCasePath) legalCasePath = this.legalCasePath;
            if (!defaultPath) defaultPath = '../image/home/dbsj.png';
            if (imgs == null || imgs.length == 0) {
                return defaultPath;
            } else {
                for (var i = 0; i < imgs.length; i++) {
                    var img = imgs[i];
                    var path = img.FILEPATH;
                    if (path) {

                        var param = 'PathClass=' + legalCasePath + '&PicPath=' + path;
                        var imgSrc = imageApi + 'GetPictureFile.ashx?' + param;
                        return imgSrc;
                    }
                }
                return defaultPath;
            }
        },

        /**
         * 放入图片
         * @param {String} selectors
         * @param {Array} imgList
         * @param {String} 图片前缀
         * @param {Function} 图片的点击事件
         */
        putImageList: function (selectors, imgList, path, imageTap) {

            if (typeof path == 'function') {
                imageTap = path;
                path = undefined;
            }
            var doms = document.querySelectorAll(selectors);

            var imageUrl = imageApi + path;

            image_group++;
            for (var i = 0; i < doms.length; i++) {
                var dom = doms[i];
                var img = dom.querySelector('img') || dom;
                if (i < imgList.length) {
                    var obj = imgList[i];
                    var tempPath = obj.ThumbnailPath || obj.Path;
                    var imgPath = imageUrl + tempPath;
                    img.src = imgPath;
                    var sourcePath = obj.Path || obj.ThumbnailPath;

                    img.setAttribute(DATA_PREVIEW_SRC, sourcePath); //原图
                    img.setAttribute(DATA_PREVIEW_GROUP, image_group); //组
                    //img.fsrc = obj.FilePath;
                    if (typeof imageTap == 'function') {
                        (function (img) {
                            dom.addEventListener('tap', function (e) {
                                imageTap(img, e);
                            });
                        })(img);
                    }
                }
            }
            if (i < imgList.length) {
                console.log('没有地方放图片了');
            }
        },

        getAddress: function () {
            var pos = this.getObject('position');
            if (pos && pos.addresses) {
                return pos.addresses;
            } else {
                return null;
            }
        },
        //暂时只处理yyyy-M-d h:mm:ss 这种字符串
        getHourTime: function (strTime) {
            var pattern = /\d{4}(-\d{1,2}){2}\s|:\d{1,2}$/g
            var str = strTime.replace(pattern, '');
            return str;
        },
        getWeekday: function (date) {
            var week = date.getDay();
            var str = '星期';
            switch (week) {
                case 0:
                    str += "日";
                    break;
                case 1:
                    str += "一";
                    break;
                case 2:
                    str += "二";
                    break;
                case 3:
                    str += "三";
                    break;
                case 4:
                    str += "四";
                    break;
                case 5:
                    str += "五";
                    break;
                case 6:
                    str += "六";
                    break;
            }
            return str;
        },
        getRadioValue: function (name) {
            var doms = document.getElementsByName(name);
            for (var i = 0; i < doms.length; i++) {
                if (doms[i].checked) {
                    return doms[i].value;
                }
            }
        },
        addTextValue: function (arr) {
            for (var i in arr) {
                arr[i].text = arr[i].Name || arr[i].name;
                arr[i].value = arr[i].ID || arr[i].id;
            }
            return arr
        }

    };
});