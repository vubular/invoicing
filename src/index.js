// Import vue component
import Component from './VueInvoicing.vue';

export default {

	install(Vue, options) {
		Vue.component(Component.name, Component)
	}

};