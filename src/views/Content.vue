<template>
	<invoice-table-view></invoice-table-view>
</template>
<script>
	import InvoiceTableView from './table/Table.vue';
	export default {
		name: "InvoiceContent",
		components: { InvoiceTableView },
		props: {
			fields: { type: String, },
			features: { type: String, },
			content: {
				type: Array,
				default() {
					return []
				}
			}
		}
	}
</script>