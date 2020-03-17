<template>
	<div class="is-fullwidth">
		<div class="columns" style="margin-bottom:50px;border-bottom: 4px solid">
			<div class="column">
				<input v-model="label" class="input" /> <br/> <br/>
				<input v-model="fields" class="input" /> <br/> <br/>
				<input v-model="features" class="input" /> <br/> <br/>
				VAT:
				<input type="checkbox" v-model="show">
				<select v-model="vat.amount">
					<option v-for="n in 100" :value="n" :key="n">{{n}}</option>
				</select> <br/> <br/>
			</div>
		</div>
		<div class="columns is-multiline">
			<invoice-label :label="label"></invoice-label>
			<invoice-toggle :show="showState"
							:features="features"
							:disabled="content.length==0"
							@toggled="toggleState"></invoice-toggle>

			<invoice-content :fields="fields"
				:features="features"
				:editables="editables"
				:show="showState"
				:vat="vat"
				:goods="goods"
				:customer="customer"
				:content="content"></invoice-content>

			<invoice-cart :goods="goods"></invoice-cart>
			<invoice-total v-if="showTotal" :content="content"></invoice-total>
		</div>
	</div>
</template>
<script>
	import Vue from 'vue';
	import Buefy from 'buefy';
	import 'buefy/dist/buefy.css';
	Vue.use(Buefy);

	import InvoiceLabel from "./partials/Label.vue";
	import InvoiceToggle from "./partials/Toggle.vue";
	import InvoiceContent from './views/Content.vue';
	import InvoiceCart from './partials/Cart';
	import InvoiceTotal from './partials/Total';
	export default {
		name: 'VueInvoicing',
		components: { InvoiceLabel, InvoiceToggle, InvoiceContent, InvoiceCart, InvoiceTotal },
		props: {
			label: {
				type: String,
				default: "Invoice"
			},
			fields: {
				type: String,
				default: "name,price,discount,total"
			},
			features: {
				type: String,
				default: "add,duplicate,remove,toggle"
			},
			editables: {
				type: String,
				default: "quantity,discount"
			},
			show: {
				type: Boolean,
				default: false
			},
			vat: {
				type: Object,
				default() {
					return {
						amount: 18,
						included: true
					}
				}
			},
			goods: {
				type: Array,
				default() {
					return [
						{ label: "Subscriptions", icon: "fa fa-poll-people", component: "", },
						{ label: "Services", icon: "fa fa-cubes", component: "", },
						{ label: "Products", icon: "fa fa-shapes", component: "", }
					]
				}
			},
			customer: {
				type: Object,
				default() {
					return {
						exclusivity: {
							discount: 0
						},
						vat: {
							amount: 18,
							included: true
						}
					}
				}
			},
			content: {
				type: Array,
				default() {
					return []
				}
			}
		},
		data() {
			return {
				toggled: false
			}
		},
		methods: {
			toggleState() {
				this.toggled = !this.toggled;
				this.$emit('toggled', this.toggled);
			}
		},
		computed: {
			showState() {
				return this.show || this.toggled;
			},
			showTotal() {
				return this.features.include("total");
			}
		}
	}
</script>