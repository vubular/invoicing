<template>
	<invoice-table-view :show="show"
		:fields="fields"
		:customFields="customFields"
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
			customFields: { type: Array, default: () => [] },
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