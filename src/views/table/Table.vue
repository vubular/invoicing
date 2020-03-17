<template>
	<div class="column is-12">
		<div class="invoice-content">
			<table v-if="content.length>0" class="table is-striped is-bordered is-fullwidth">
				<thead>
					<tr>
						<th class="is-narrow">#</th>
						<th v-if="showName">Name</th>
						<th v-if="showIDList" class="is-narrow">ID List</th>
						<th v-if="period" class="is-narrow">Period</th>
						<th v-if="showQuantity" class="is-narrow">Quantity</th>
						<th v-if="showUnit" class="is-narrow">Unit</th>
						<th v-if="showPrice" class="is-narrow">Price</th>
						<th v-if="showOffer" class="is-narrow">Offers</th>
						<th v-if="showDiscount" class="is-narrow">Discount</th>
						<th v-if="showVat" class="is-narrow">VAT</th>
						<th v-if="showTotal" class="is-narrow">Price Incl. Vat</th>
						<th v-if="showTotalVat" class="is-narrow">Total Incl. Vat</th>
					</tr>
				</thead>
				<tbody v-for="(item, i) in content" :key="i">
					<invoice-item-row
						:show="show"
						:item="item"
						:counter="i+1"
						:fields="fields"
						:features="features"
						:editables="editables"
						:vat="vat"
						:customer="customer"></invoice-item-row>
					<invoice-item-row
						:show="show"
						:item="addon"
						:counter="(i+1)+'.'+(a+1)"
						:fields="fields"
						:features="features"
						:editables="editables"
						:vat="vat"
						:customer="customer"></invoice-item-row>
				</tbody>
			</table>
		</div>
	</div>
</template>
<script>
	import InvoiceItemRow from "./table/ItemRow.vue";

	export default {
		name: 'InvoiceTableView',
		components: { InvoiceItemRow },
		props: {
			show: { type: Boolean },
			fields: { type: String },
			features: { type: String },
			editables: { type: String },
			vat: { type: Object },
			customer: { type: Object },
			content: {
				type: Array,
				default() {
					return []
				}
			}
		},
		computed: {
			showName() { return this.fields.includes('name'); },
			showIDList() { return this.fields.includes('idlist'); },
			showOffer() { return this.fields.includes('offer'); },
			showPrice() { return this.fields.includes('price'); },
			showDiscount() { return this.fields.includes('discount'); },
			showQuantity() { return this.fields.includes('quantity'); },
			showUnit() { return this.fields.includes('unit'); },
			showVat() { return this.fields.includes('vat'); },
			showTotal() { return this.fields.includes('total'); },
			showTotalVat() { return this.fields.includes('totalVat'); }
		}
	}
</script>