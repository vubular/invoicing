// Import vue component
import Component from './VubularInvoicing.vue';

export default {

	install(Vue, options) {

		Vue.filter('pricing', function (value = null) {
			value = +value;
			if(!Number(value)) return "0.00 €";
			if(value==null) return "0.00 €";
			if(Number(value)==0) return "0.00 €";
			return value ? value.toFixed(2) + " €" : "0.00 €";
		});

		Vue.filter('percentage', function (value) {
			value = +value;
			if (value==null && Number(value)!=value) return value;
			return value + "%";
		});

		Vue.component(Component.name, Component)
	}

};
