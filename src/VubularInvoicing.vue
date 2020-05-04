<template>
	<div v-if="showContentRow || showTotalRow" class="is-fullwidth">
		<div v-if="showContentRow" class="columns is-multiline">
			<invoice-label v-if="showLabel"
				:show="showState"
				:label="label + ' ('+content.length+')'"></invoice-label>
			<invoice-toggle v-if="showToggle"
				:show="showState"
				:disabled="content.length==0"
				@toggled="toggleState"></invoice-toggle>
			<invoice-content v-if="showContent"
				:show="showState"
				:fields="fields"
				:features="features"
				:content.sync="content"
				@new-addon="addItemAddon"
				@set-addon="setItemAddon"
				@remove-addon="removeItemAddon"
				@remove-item="removeItem"></invoice-content>
		</div>
		<div v-if="showTotalRow" class="columns">
			<invoice-cart v-if="showCart"
				:customer="customer"
				:features="features"
				:goods="goods"
				@selected="addItem"></invoice-cart>
			<div v-if="!showCart && showTotal" class="column"></div>
			<invoice-total v-if="showTotal"
				:content="content"
				:vat="vat"></invoice-total>
		</div>
	</div>
</template>
<script>
	import InvoiceLabel from "./partials/Label.vue";
	import InvoiceToggle from "./partials/Toggle.vue";
	import InvoiceContent from './views/Content.vue';
	import InvoiceCart from './partials/Cart.vue';
	import InvoiceTotal from './partials/Total.vue';
	export default {
		name: 'VubularInvoicing',
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
				default: "name:remove,price,quantity:edit,discount:edit,totalVat"
			},
			features: {
				type: String,
				default: "toggle,cart"
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
			},
			rawItems: { type: Array }
		},
		mounted() {
			if(this.rawItems && Array.isArray(this.rawItems) && this.rawItems.length>0) {
				for(var i = 0;i<this.rawItems.length;i++) {
					this.addItem(this.rawItems[i]);
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
				this.content.splice(item.itemKey, 1);
				this.$forceUpdate();
			},
			addItemAddon(item) {
				this.content[item.itemKey].addons.push(item.value);
				this.$emit("item-addon-added", this.content[item.itemKey]);
			},
			setItemAddon(addon) {
				this.content[addon.itemKey].addons[addon.key] = {
					...this.prepareItemAddon(this.content[addon.itemKey],addon)
				};
				this.$emit("item-addon-set", this.content[addon.itemKey][addon.key]);
				this.$forceUpdate();
			},
			removeItemAddon(addon) {
				this.content[addon.itemKey].addons.splice(addon.key, 1);
				this.$emit("item-addon-removed", this.content[addon.itemKey]);
			},
			prepareItem(item) {
				if(this.validInvoiceItem(item) && item.snapshot) return item;

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
			prepareItemAddon(item, addon) {
				if(addon && addon.snapshot) return addon;

				var itemAddonVat = this.vat;
				if(item && item.vat) itemAddonVat = item.vat;

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
			showLabel() { return this.label!="hide"; },
			showTotal() { return this.features.includes("total") && this.content && this.content.length>0; },
			showToggle() { return this.features.includes("toggle"); },
			showContent() { return this.content && this.content.length>0; },
			showCart() { return this.features.includes("cart") && !this.showState; },
			showContentRow() { return this.showLabel || this.showToggle || this.showContent },
			showTotalRow() { return this.showTotal || this.showCart }
		}
	}
</script>