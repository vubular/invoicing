<template>
	<div class="column">

	</div>
</template>
<script>
	export default {
		name: "InvoiceCart",
		props: {
			goods: {
				type: Array,
				default() {
					return [
						{ label: "Subscriptions", icon: "fa fa-poll-people", component: "", },
						{ label: "Services", icon: "fa fa-cubes", component: "", },
						{ label: "Products", icon: "fa fa-shapes", component: "", }
					]
				}
			}
		}
	}
</script>