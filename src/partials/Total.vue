<template>
	<div class="column total-table is-narrow is-pulled-right">
		<table class="table is-striped is-bordered">
			<tbody>
				<tr>
					<td><strong>{{'Total' | translate}}</strong></td>
					<td class="has-text-right">{{grandTotal(content).withoutVat | pricing}}</td>
				</tr>
				<tr>
					<td><strong>{{'Items discount' | translate}}</strong></td>
					<td class="has-text-right has-text-grey">- 0.00 €</td>
				</tr>
				<tr>
					<td><strong>{{'Invoice discount' | translate}}</strong></td>
					<td class="has-text-right has-text-grey">- 0.00 €</td>
				</tr>
				<tr>
					<td><strong>{{'Before taxes' | translate}}</strong></td>
					<td class="has-text-right">{{grandTotal(content).withoutVat | pricing}}</td>
				</tr>
				<tr>
					<td><strong>{{'Taxes' | translate}} ({{vat.amount}}%)</strong></td>
					<td class="has-text-right">{{grandTotal(content).vat | pricing}}</td>
				</tr>
				<tr>
					<td><strong>{{'Grand Total' | translate}}</strong></td>
					<td class="has-text-right">{{grandTotal(content).withVat | pricing}}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>
	export default {
		name: "TotalTable",
		props: ["content", "vat"]
	}
</script>
<style scoped>.table { border-top: 5px solid #e4e4e4; } .column.total-table td { width: 150px }</style>