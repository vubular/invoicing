<template>
	<div class="column total-table is-narrow is-pulled-right">
		<table class="table is-striped is-bordered">
			<tbody>
				<tr>
					<td><strong><plain v-if="draft">{{label}}</plain> {{'Total' | translate}}</strong></td>
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
					<!-- <td class="has-text-right">{{grandTotal(content).withoutVat | pricing}}</td> -->

					<!-- updated -->
					<td class="has-text-right">{{grandTotal(content).beforeTaxes | pricing}}</td>	
					<!-- updated -->	
				</tr>
				<tr>
					<td><strong>{{'Taxes' | translate}} ({{vat.amount}}%)</strong></td>
					<!-- <td class="has-text-right">{{grandTotal(content).vat | pricing}}</td> -->

					<!-- updated -->
					<td class="has-text-right">{{grandTotal(content).taxes | pricing}}</td>	
					<!-- updated -->
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
		props: ["content", "vat", "label", "draft"]
	}
</script>
<style scoped>
	.table { border-top: 5px solid #e4e4e4; }
	.column.total-table td { width: 170px }
	.column.highlight table,.column.highlight table td { border-color: #7956d5; }
	.column.lowlight table,.column.lowlight table td { border-color: #eee; color: #888; }
	.column.lowlight strong { color: #888; }
</style>