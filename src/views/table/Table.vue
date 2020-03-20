<template>
	<div class="column is-12">
		<div class="invoice-content">
			<table v-if="content.length>0" class="table is-striped is-bordered is-fullwidth">
				<thead>
					<tr>
						<th class="is-narrow has-text-grey has-text-weight-light">+</th>
						<th v-if="fields.includes('name')">Name</th>
						<th v-if="fields.includes('idlist')" class="is-narrow">ID List</th>
						<th v-if="fields.includes('period')" class="is-narrow">Period</th>
						<th v-if="fields.includes('quantity')" class="is-narrow">Quantity</th>
						<th v-if="fields.includes('unit')" class="is-narrow">Unit</th>
						<th v-if="fields.includes('price')" class="is-narrow">Price</th>
						<th v-if="fields.includes('offer')" class="is-narrow">Offers</th>
						<th v-if="fields.includes('discount')" class="is-narrow">Discount</th>
						<th v-if="fields.includes('vat')" class="is-narrow">VAT</th>
						<th v-if="fields.includes('total') && show" class="is-narrow">Price Incl. Vat</th>
						<th v-if="fields.includes('totalVat')" class="is-narrow">Total <font v-if="show">Incl. Vat</font></th>
					</tr>
				</thead>
				<tbody v-for="(item, i) in content" :key="i">
					<invoice-item-row :item-key="i"
						:show="show"
						:item.sync="item"
						:counter="i+1"
						:fields="fields"
						:features="features"
						v-on="$listeners"></invoice-item-row>
					<invoice-item-addon-row v-if="item.addons.length>0"
						v-for="(addon, a) in item.addons" :key="i+'.'+a"
						:item-key="i"
						:addon-key="a"
						:show="show"
						:addon.sync="addon"
						:addons="item.snapshot.addons"
						:counter="(i+1)+'.'+(a+1)"
						:fields="fields"
						:features="features"
						v-on="$listeners"></invoice-item-addon-row>
				</tbody>
			</table>
		</div>
	</div>
</template>
<script>
	import InvoiceItemRow from "./ItemRow.vue";
	import InvoiceItemAddonRow from "./ItemAddonRow.vue";
	export default {
		name: 'InvoiceTableView',
		components: { InvoiceItemRow, InvoiceItemAddonRow },
		props: {
			show: { type: Boolean },
			fields: { type: String },
			features: { type: String },
			content: {
				type: Array,
				default() {
					return []
				}
			}
		}
	}
</script>