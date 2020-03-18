<template>
	<div v-if="showLabel" class="column">
		<h3 class="subtitle is-3 has-text-grey-light has-text-weight-light">
			<span class="icon"><i class="fal fa-th-large"></i></span>
			<span v-html="label" style="margin-left:15px"></span>
		</h3>
	</div>
</template>
<script>
	export default {
		name: "InvoiceLabel",
		props: {
			label: {
				type: String,
				default: "Invoice"
			}
		},
		computed: {
			showLabel() {
				return this.label != "hide";
			}
		}
	}
</script>