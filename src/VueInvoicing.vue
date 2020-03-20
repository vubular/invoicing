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
			<invoice-content :show="showState"
				:fields="fields"
				:features="features"
				:content.sync="content"
				@new-addon="addItemAddon"
				@set-addon="setItemAddon"
				@remove-addon="removeItemAddon"
				@remove-item="removeItem"></invoice-content>
		</div>
		<div class="columns">
			<invoice-cart v-if="!showState"
				:goods="goods"
				:features="features"
				@selected="addItem"></invoice-cart>
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
			addItem(item) {
				this.$emit("item-added", item);
				this.content.push({...this.prepareItem(item)});
			},
			removeItem(item) {
				this.$emit("item-removed", item.value);
				this.content.splice(item.key, 1);
			},
			addItemAddon(itemKey) {
				this.content[itemKey].addons.push(null);
				this.$emit("item-addon-added", this.content[itemKey]);
			},
			setItemAddon(addon) {
				this.content[addon.itemKey].addons[addon.key] = {...this.prepareItemAddon(addon)};
				this.$emit("item-addon-set", this.content[addon.itemKey][addon.key]);
				this.$forceUpdate();
			},
			removeItemAddon(addon) {
				this.content[addon.itemKey].addons.splice(addon.key, 1);
				this.$emit("item-addon-removed", this.content[addon.itemKey]);
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
					price: +item.price ?? 0,
					discount: newItemDiscount,
					quantity: 1,
					unit: item.unit ?? "Piece",
					vat: {...newItemVat},
					variant: null,
					offer: null,
					addons: [],
					attributes: []
				}
			},
			prepareItemAddon(addon) {
				var itemAddonVat = this.vat;
				if(this.customer && this.customer.customVat) itemAddonVat = this.customer.customVat;
				if((!this.customer || !this.customer.customVat) && addon.value.vat) itemAddonVat = addon.value.vat;

				var itemAddonDiscount = 0;
				if(this.customer && this.customer.exclusivity && this.customer.exclusivity.discount) {
					itemAddonDiscount = this.customer.exclusivity.discount;
				}

				return {
					snapshot: {...addon.value},
					name: null,
					description: null,
					period: this.content[addon.itemKey].period,
					price: +addon.value.price ?? 0,
					discount: itemAddonDiscount,
					quantity: 1,
					unit: addon.value.unit ?? "Piece",
					vat: {...itemAddonVat},
					variant: null,
					offer: null,
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