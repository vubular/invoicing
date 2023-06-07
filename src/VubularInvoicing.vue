<template>
	<div v-if="showContentRow || showTotalRow" class="is-fullwidth">
		<div v-if="showContentRow" class="columns is-multiline">
			<invoice-label v-if="showLabel"
				:show="showState"
				:label="theLabel"></invoice-label>
			<invoice-toggle v-if="showToggle"
				:show="showState"
				:disabled="content.length==0"
				@toggled="toggleState"></invoice-toggle>
			<div v-if="validDraft" class="column is-12" style="padding-bottom:0">
				<div class="is-pulled-left">
					<tabs :tabs="[label, draftLabel]" @active="activeTab => { tab=activeTab }"></tabs>
				</div>
			</div>
			<invoice-content v-if="showDraft" show
				:key="draftLabel"
				:fields="draftFields"
				:content="draft"
				features=""></invoice-content>
			<invoice-content v-if="showContent && !showDraft"
				:key="label"
				:show="showState"
				:fields="fields"
				:features="features"
				:content.sync="content"
				:availableOptions="availableOptions"
				@new-addon="addItemAddon"
				@set-addon="setItemAddon"
				@remove-addon="removeItemAddon"
				@remove-item="removeItem"
				@idlistChosen="idlistChosenReEmit"></invoice-content>
		</div>
		<div v-if="showTotalRow" class="columns">
			<invoice-cart v-if="showCart"
				:customer="customer"
				:features="features"
				:goods="goods"
				:singleCreate="singleCreate"
				:filters="filters"
				@getOptions="getOptions"
				@selected="addItem"></invoice-cart>
			<div v-if="!showCart && showTotal" class="column"></div>
			<invoice-total v-if="showTotal"
				:label="label"
				:draft="validDraft"
				:content="content"
				:vat="vat"></invoice-total>
			<invoice-total v-if="showTotal && validDraft"
				:label="draftLabel"
				:draft="validDraft"
				:content="draft"
				:vat="vat"
				class="lowlight"></invoice-total>
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
			draftLabel: {
				type: String,
				default: "Draft"
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
			filters: Array,
			availableOptions: Array,
			show: {
				type: Boolean,
				default: false
			},
			fields: {
				type: String,
				default: "name:remove,price,quantity:edit,discount:edit,totalVat"
			},
			draftFields: {
				type: String,
				default: "name,price,quantity,discount,totalVat"
			},
			features: {
				type: String,
				default: "toggle,cart,duplicate"
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
			draft: {
				type: Array,
				default() {
					return []
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
			rawItems: { type: Array },
			singleCreate: { type: Boolean, default: true }
		},
		mounted() {
			if(this.validDraft) this.tab = this.label;
			if(this.rawItems && Array.isArray(this.rawItems) && this.rawItems.length>0) {
				for(var i = 0;i<this.rawItems.length;i++) {
					this.addItem(this.rawItems[i]);
				}
			}
		},
		data() {
			return {
				toggled: false,
				tab: null
			}
		},
		methods: {
			toggleState() {
				this.toggled = !this.toggled;
				this.$emit('toggled', this.toggled);
			},
			getOptions(item) {
				this.$emit("getOptions", item);
			},
			addItem(item) {
				this.$emit("item-added", item);
				if(this.allowDuplicates || this.content.length==0) {
					this.content.push({...this.prepareItem(item)});
				} else {
					var newItem = {...this.prepareItem(item)};
					var duplicateFound = false; var d = 0;
					this.content.filter(contentItem => {
						d++;
						if(!duplicateFound && contentItem.snapshot.id==newItem.snapshot.id) {
							contentItem.quantity++;
							duplicateFound = true;
						}
						if(d==this.content.length && !duplicateFound) {
							this.content.push(newItem);
						}
					})
				}
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
			},
			idlistChosenReEmit(payload) {
				this.$emit("idlistChosen", payload);
			}
		},
		computed: {
			showState() { return this.show || this.toggled; },
			showLabel() { return this.label!="hide"; },
			showTotal() { return this.features.includes("total") && this.content && this.content.length>0; },
			showToggle() { return this.features.includes("toggle"); },
			showDraft() { return this.validDraft && this.tab==this.draftLabel; },
			showContent() { return this.content && this.content.length>0; },
			showCart() { return this.features.includes("cart") && !this.showState; },
			showContentRow() { return this.showLabel || this.showToggle || this.showContent },
			showTotalRow() { return this.showTotal || this.showCart },
			allowDuplicates() { return this.features.includes("duplicate"); },
			validDraft() { return this.draft && this.draft.length>0; },
			theLabel() {
				var label = this.label;
				if(this.content.length>0) {
					label += "("+this.content.length;
					if(this.validDraft) label+="/"+this.draft.length;
					label += ")";
				}
				return label;
			}
		}
	}
</script>