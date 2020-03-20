<template>
	<invoice-table-view :vat="vat"
						:show="show"
						:fields="fields"
						:features="features"
						:customer="customer"
						:content="content"></invoice-table-view>
</template>
<script>
	import InvoiceTableView from './table/Table.vue';
	export default {
		name: "InvoiceContent",
		components: { InvoiceTableView },
		props: {
			vat: { type: Object, },
			show: { type: Boolean, },
			fields: { type: String, },
			features: { type: String, },
			customer: { type: Object, },
			content: {
				type: Array,
				default() {
					return []
				}
			}
		}
	}
</script>