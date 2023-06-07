<template>
	<invoice-table-view :show="show"
		:fields="fields"
		:features="features"
		:content.sync="content"
		:availableOptions="availableOptions"
		v-on="$listeners"></invoice-table-view>
</template>
<script>
	import InvoiceTableView from './table/Table.vue';
	export default {
		name: "InvoiceContent",
		components: { InvoiceTableView },
		props: {
			show: { type: Boolean, },
			fields: { type: String, },
			features: { type: String, },
			content: {
				type: Array,
				default() {
					return []
				}
			},
			availableOptions: { type: Array }
		}	
	}
</script>