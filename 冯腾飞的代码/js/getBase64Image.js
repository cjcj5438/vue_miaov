define(['冯腾飞的代码/js/mui', 'js/app'], function(mui, app) {
	var iwidth = 480; //分辨率 推荐480
	var isharpness = 0.8; //清晰度 最大1
	//////////////调用拍照///////////
	function getImage(id) {
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(p) {
			plus.io.resolveLocalFileSystemURL(p, function(entry) {
				createItem(entry, id)
			}, function(e) {
				alert("读取拍照文件错误：" + e.message);
			});
		}, function(e) {
			//mui.toast("失败：" + e.message);
		}, {
			filename: "_doc/event/",
		});
	}

	function createItem(entry, id) {
		var local = entry.toLocalURL();
		var name = entry.name;
		appendFile(local, name, id, getImgSrc);
	}

	function getImgSrc(id, name, src) {
		document.getElementById(id).src = src;
		document.getElementById(id + "Name").value = name;
		//console.log(src);
		return false;
	}

	function appendFile(path, name, id, cell) {
		var img = new Image();
		img.src = path; // 传过来的图片路径在这里用。
		img.onload = function() {
			var that = this;
			//生成比例 
			var w = that.width,
				h = that.height,
				scale = w / h;
			w = iwidth || w; //480  你想压缩到多大，改这里
			h = w / scale;

			//生成canvas
			var canvas = document.createElement('canvas');

			var ctx = canvas.getContext('2d');
			canvas.width = w;
			canvas.height = h;

			// $(canvas).attr({width : w, height : h});
			ctx.drawImage(that, 0, 0, w, h);
			var base64 = canvas.toDataURL('image/jpeg', isharpness); //1最清晰，越低越模糊。有一点不清楚这里明明设置的是jpeg。弹出 base64 开头的一段 data：image/png;却是png。哎开心就好，开心就好
			cell(id, name, base64);
//			base64 = base64.split(',')[1];		//只要逗号前面的
			document.getElementById('img-' + id + 'Name').value = base64;

		}
	}

	//////////////从相册中选择图片///////////
	function galleryImage(id) {
		// 从相册中选择图片
		plus.gallery.pick(function(path) {
			createGalleryImg(path, id)
		}, function(e) {}, {
			filter: "image"
		});
	}

	function createGalleryImg(path, id) {
		var local = path;
		var list = path.split('/');
		var name = list[list.length - 1];
		appendFile(local, name, id, getImgSrc);
	}

	var __defaultImagePath = null;

	//点击选择照片事件
	function InitPhoto(selector, lookPicture) {
		var btns = mui(selector);
		btns.each(function(index, btn) {
			btn.addEventListener('tap', function() {
				var img = this.querySelector('img') || this;
				var id = img.id;
				if(!__defaultImagePath) __defaultImagePath = img.src;
				var _index = id.match(/\d+$/)[0];
				if(mui.os.plus) {
					var arr = [{
						title: "拍照"
					}, {
						title: "从相册中选择"
					}];
					var isphoto = document.getElementById("head-img" + _index + 'Name').value;
					if(isphoto != null && isphoto != '') {
						if(typeof lookPicture == 'function') {
							arr.push({
								title: '查看图片'
							});
						}
						arr.push({
							title: '删除图片'
						});
					}
					plus.nativeUI.actionSheet({
						title: "选择图片",
						cancel: "取消",
						buttons: arr
					}, function(e) {
						switch(e.index) {
							case 0:
								break;
							case 1:
								getImage('head-img' + _index); //拍照
								break;
							case 2:
								galleryImage('head-img' + _index); //相册中选择
								break;
							case 3:				//可能是删除图片也可能是查看图片
								if(typeof lookPicture == 'function'){
									//查看图片
									lookPicture(img);
								}else{
									//删除图片
									deleteImage(_index);
								}
								break;
							case 4:
								deleteImage(_index);
								break;
						}

					});
				}
			}, false);
		});
	}

	function showPicture(imageIndex) {
		var _index = imageIndex;
		if(!_index || typeof(_index) != 'number') {
			var img = this.querySelector('img') || this;
			var id = img.id;
			_index = id.match(/\d+$/)[0];
		}

		if(mui.os.plus) {
			var arr = [{
				title: "拍照"
			}, {
				title: "从相册中选择"
			}];
			var isphoto = document.getElementById("head-img" + _index + 'Name').value;
			if(isphoto != null && isphoto != '') {
				arr.push({
					title: '删除图片'
				});
			}
			plus.nativeUI.actionSheet({
				title: "选择图片",
				cancel: "取消",
				buttons: arr
			}, function(e) {
				switch(e.index) {
					case 0:
						break;
					case 1:
						getImage('head-img' + _index);
						break;
					case 2:
						galleryImage('head-img' + _index);
						break;
					case 3:
						deleteImage(_index);
						break;
				}

			});
		}
	}

	//删除图片
	function deleteImage(id) {
		document.getElementById("head-img" + id + 'Name').value = "";
		document.getElementById("img-head-img" + id + "Name").value = "";
		document.getElementById("head-img" + id).src = __defaultImagePath;
	}

	//图片赋值
	function _setImageSrc(imgDom, imgObject, webApi) {
		imgDom.src = webApi + imgObject.ThumbnailPath;
		imgDom.style.display = '';
		var id = imgDom.id;
		var _index = id.match(/\d+$/)[0]; //获取数字
		document.getElementById("head-img" + _index + 'Name').value = imgObject.ID;

		//父级节点增加边框
		//imgDom.parentNode.parentNode.style.border = '1px solid #cccccc';
	}

	function getBase64(num) {
		var str = 'img-head-img' + num + 'Name';
		var dom = document.getElementById(str);
		if(dom) {
			var strText = dom.value;
			return strText;
		} else {
			return null;
		}
	}

	return {
		initPhoto: function(selector, lookPicture) {
			InitPhoto(selector, lookPicture);
		},
		createImageObject: function(model, startIndex, endIndex, imgStartIndex, leftValue) {
			var data = {};
			for(var name in model) {
				data[name] = model[name];
			}
			if(!imgStartIndex) imgStartIndex = startIndex;
			if(!leftValue) leftValue = 'Photo';

			for(var i = startIndex; i <= endIndex; i++) {
				var propertyName = leftValue + imgStartIndex;
				var baseStr = getBase64(i);
				data[propertyName] = baseStr;
				imgStartIndex++;
			}
			return data;
		},
		showPicture: function(index) {
			showPicture.call(this, index);

		},
		initializationImg: function(number) {
			for(var i = 1; i <= number; i++) {
				deleteImage(i)
			}
		}
	}
});