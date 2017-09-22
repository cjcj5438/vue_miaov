//存取localStorage中的数据

var store = {
	save(key, value) { //保存
		localStorage.setItem(key, JSON.stringify(value));
	},
	fetch(key) { //获取
		return JSON.parse(localStorage.getItem(key)) || [];
	}
}
//取出所有值
var list = store.fetch("chenjing");
//Hash值选择器
var filter = {
	all: function(list) {
		return list;
	},
	finished: function(list) {
		return list.filter(function(item) {
			return item.isChecked;
		})
	},
	unfinished: function(list) {
		return list.filter(function(item) {
			return !item.isChecked;
		})
	}
}

/*
var list = [{
		title: 'chifan',
		isChecked: false
	},
	{
		title: 'xizhao',
		isChecked: true
	}
];
*/
var vm = new Vue({
	el: '.main',
	data: {
		list: list,
		todo: '',
		edtorTodos: '', //记录正在编辑数据 
		beforeTitle: '', ///记录正在编辑的数据title
		visibility: 'all' //通过这个属性值变化,对我们的数据进行筛选 
	},
	watch: { //用于监听值变化
		//		要监控谁  ,这里的key值就写谁
		//		浅监控 是监控不到list里面isChecked值的
		//		list:function(){
		//			store.save("chenjing",this.list)
		//		}
		//但是vue可以做到深度监控
		list: {
			handler: function() {
				store.save("chenjing", this.list)
			},
			deep: true
		}
	},
	//计算属性 
	computed: {
		noCheckeLength: function() {
			return this.list.filter(function(item) {
				return !item.isChecked
			}).length
		},
		filteredList: function() {
			//this.visibility选择要运行的函数
			return filter[this.visibility] ? filter[this.visibility](list) : list;
		}
	},
	methods: {
		addTodo(data, ev) { //添加任务
			//			if(ev.keyCode===13){
			//				//事件函数里面的this 指的是new Vue()的根实例
			//				this.list.push({
			//					title:ev.target.value
			//				});
			//			}

			//target.value 获取事件的上的Dom值 
			//				this.list.push({
			//					title:ev.target.value
			//				});

			//				参数一,是传递的参数, 参数2是事件
			this.list.push({
				title: this.todo,
				isChecked: false
			});
			this.todo = "";

		},
		delectTodo(todo) { //删除任务
			var index = this.list.indexOf(todo);
			this.list.splice(index, 1);
		},
		edtorTodo(todo) { //编辑任务
			//			console.log(todo)
			//编辑任务的时候,记录下编辑这条任务的title	,
			//方便之后重置原值
			this.beforeTitle = todo.title;
			this.edtorTodos = todo;

		},
		edtorTodoed(todo) { // 光标移走 编辑任务完成 
			this.edtorTodos = '';
		},
		cancelTodo(todo) { //取消编辑文本,返回原来的值
			debugger;
			//console.log(1)
			todo.title = this.beforeTitle;
			this.beforeTitle = '';
			//div显示,input隐藏
			this.edtorTodos = '';
		}
	},
	//自定义指令
	directives: {
		"focus": {
			// 指令的定义--- update 不要写错. 不要写成data了
			update(el, binding) {
				//				console.log(el)
				//				console.log(binding)
				if(binding.value) {
					el.focus(); //这里调用原生 方法 效果是双击后 给予焦点
				}
			}
		}
	}
})
//页面跳转的页面hash值
function watchHashChange() {
	var hash = window.location.hash.slice(1);
	//	console.log(hash)
	vm.visibility = hash;
}
watchHashChange();
window.addEventListener("hashchange", watchHashChange)