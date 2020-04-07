<template>
	<div class="column">
		<table class="table is-striped is-bordered is-pulled-right" style="margin-top: 10px;border-top: 5px solid #e4e4e4">
			<tbody>
				<tr>
					<td width="150"><strong>{{'Total' | translate}}</strong></td>
					<td width="150" class="has-text-right">{{grandTotal(content).withoutVat | pricing}}</td>
				</tr>
				<tr>
					<td width="150"><strong>{{'Items discount' | translate}}</strong></td>
					<td width="150" class="has-text-right has-text-grey">- 0.00 €</td>
				</tr>
				<tr>
					<td width="150"><strong>{{'Invoice discount' | translate}}</strong></td>
					<td width="150" class="has-text-right has-text-grey">- 0.00 €</td>
				</tr>
				<tr>
					<td width="150"><strong>{{'Before taxes' | translate}}</strong></td>
					<td width="150" class="has-text-right">{{grandTotal(content).withoutVat | pricing}}</td>
				</tr>
				<tr>
					<td width="150"><strong>{{'Taxes' | translate}} ({{vat.amount}}%)</strong></td>
					<td width="150" class="has-text-right">{{grandTotal(content).vat | pricing}}</td>
				</tr>
				<tr>
					<td width="140"><strong>{{'Grand Total' | translate}}</strong></td>
					<td width="140" class="has-text-right">{{grandTotal(content).withVat | pricing}}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>
	export default {
		name: "InvoiceTotal",
		props: {
			show: { type: Boolean },
			vat: { type: Object },
			features: { type: String },
			content: { type: Array }
		}
	}
</script>