<template>
	<div class="column">
		<button type="button"
				class="button is-size-6 is-pulled-right has-text-grey"
				@click="$emit('toggled')"
				:disabled="disabled"
				style="margin-right:15px">
			<span class="icon"><i :class="icon"></i></span>
			<span>Complete</span>
		</button>
	</div>
</template>
<script>
	export default {
		name: "InvoiceToggle",
		props: {
			show: { type: Boolean, default: false },
			disabled: { type: Boolean }
		},
		computed: {
			icon() {
				return this.show ? "fal fa-check-square" : "fal fa-square";
			}
		}
	}
</script>