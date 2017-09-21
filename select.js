 //父组件
Vue.component('my-component', {
    data:function(){
        return {
            selectShow:false,
            val:""
        }
    },
    props:["btnValue","list"],
    template: `<section>
							<div>
								<input :value="val" @click="selectShow=!selectShow" type="text" />
								<input type="button" :value="btnValue"/>
								<span>{{btnValue}}</span>
							</div>
							<my-ul v-show="selectShow" :list="list" @receive="changeValueHandle"></my-ul>
						</section>`,
    methods:{
        changeValueHandle(value){
//						alert(value)
            this.val=value;
        }
    }
})
//子组件
Vue.component('my-ul',{
    props:["list"],//接收父组件传来的值
    template:`<ul>
							<li v-for="item in list" @click="selectValueHandle(item)">{{item}}</li>
						</ul>`,
    methods:{
        selectValueHandle:function (item) {
            //这里要把字组件的li 传到父组件的input里面
            //原理就像JQuery里面的订阅发布模式
            //告诉父组件,改变val值 出发当前实例的父组建receive事件  值传递
            this.$emit("receive",item)
        }
    }
})