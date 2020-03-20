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
			<invoice-label :label="label" :show="showState"></invoice-label>
			<invoice-toggle :show="showState"
							:features="features"
							:disabled="content.length==0"
							@toggled="toggleState"></invoice-toggle>

			<invoice-content :fields="fields"
				:features="features"
				:show="showState"
				:vat="vat"
				:customer="customer"
				:content="content"
				@add-addon="addonAdded"
				@set-addon="addonSelected"
				@remove-addon="addonRemoved"
				@remove-item="removeContentItem"></invoice-content>
		</div>
		<div class="columns">
			<invoice-cart v-if="!showState"
						  :goods="goods"
						  :features="features"
						  @selected="addContentItem"></invoice-cart>
			<invoice-total v-if="showTotal" :content="content"></invoice-total>
		</div>
	</div>
</template>
<script>
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
			vat: {
				type: Object,
				default() {
					return {
						amount: 18,
						included: true
					}
				}
			},
			show: {
				type: Boolean,
				default: false
			},
			fields: {
				type: String,
				default: "name,price,quantity:edit,discount:edit,totalVat"
			},
			features: {
				type: String,
				default: "add,duplicate,remove,toggle"
			},
			customer: {
				type: Object,
				default() {
					return {
						exclusivity: {
							discount: 0
						},
						customVat: {
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
			},
			addContentItem(item) {
				this.$emit("item-added", item);
				this.content.push({...this.prepareItem(item)});
			},
			removeContentItem(item) {
				this.$emit("item-removed", item.value);
				this.content.splice(item.key, 1);
			},
			prepareItem(item) {
				var newItemVat = this.vat;
				if(this.customer && this.customer.customVat) newItemVat = this.customer.customVat;
				if((!this.customer || !this.customer.customVat) && item.vat) newItemVat = item.vat;

				var newItemDiscount = 0;
				if(this.customer && this.customer.exclusivity && this.customer.exclusivity.discount) {
					newItemDiscount = this.customer.exclusivity.discount;
				}

				return {
					snapshot: {...item},
					name: null,
					description: null,
					period: null,
					price: item.price ?? 0,
					discount: newItemDiscount,
					quantity: 1,
					unit: item.unit ?? "Piece",
					vat: {...newItemVat},
					variant: null,
					offer: null,
					addons: [],
					attributes: []
				}
			}
		},
		computed: {
			showState() { return this.show || this.toggled; },
			showTotal() { return this.features.includes("total"); }
		}
	}
</script>