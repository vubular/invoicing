<template>
	<tr>
		<td>{{counter}}</td>
		<td v-if="showName">
			{{item.name}}
			<font v-if="item.variant">{{item.variant.label}}</font>
			<font v-if="item.description">{{item.description}}</font>
		</td>
		<td v-if="showIDList">
			<font v-if="item.idlist">{{item.idlist}}</font>
		</td>
		<td v-if="period"><font v-if="item.period">{{item.period}}</font></td>
		<td v-if="showQuantity">{{item.quantity}}</td>
		<td v-if="showUnit" class="is-capitalized">{{item.unit}}</td>
		<td v-if="showPrice">{{item.price}}</td>
		<td v-if="showOffer">
			<font v-if="item.offer==null">N/A</font>
			<font v-else>
				{{item.offer.coupon}} (-{{item.offer.discount}}%)
			</font>
		</td>
		<td v-if="showDiscount">{{item.discount}}</td>
		<td v-if="showVat">{{item.vat}}</td>
		<td v-if="showTotal" class="has-text-right">{{item.price}}</td>
		<td v-if="showTotalVat" class="has-text-right">{{item.price}}</td>
	</tr>
</template>
<script>
	export default {
		name: "InvoiceItemShow",
		props: {
			item: { type: Object },
			fields: { type: String },
			features: { type: String },
			counter: { type: String },
			vat: {
				type: Object,
				default() {
					return {
						amount: 18,
						included: true
					}
				}
			},
			customer: {
				type: Object,
				default() {
					return {
						exclusivity: {
							discount: 0
						},
						vat: {
							amount: 18,
							included: true
						}
					}
				}
			},
		},
		computed: {
			showName() { return this.fields.includes('name'); },
			showIDList() { return this.fields.includes('idlist'); },
			showOffer() { return this.fields.includes('offer'); },
			showPrice() { return this.fields.includes('price'); },
			showDiscount() { return this.fields.includes('discount'); },
			showQuantity() { return this.fields.includes('quantity'); },
			showUnit() { return this.fields.includes('unit'); },
			showVat() { return this.fields.includes('vat'); },
			showTotal() { return this.fields.includes('total'); },
			showTotalVat() { return this.fields.includes('totalVat'); }
		}
	}
</script>