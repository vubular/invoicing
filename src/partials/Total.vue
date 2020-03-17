<template>
	<table v-if="content.length>0" class="table is-striped is-bordered is-pulled-right" style="margin-top: 10px;border-top: 5px solid #e4e4e4">
		<tbody>
			<tr>
				<td width="150"><strong>{{'Total' | translate}}</strong></td>
				<td width="150" class="has-text-right">{{total | pricing}}</td>
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
				<td width="150" class="has-text-right">{{total - discount | pricing}}</td>
			</tr>
			<tr>
				<td width="150"><strong>{{'Taxes' | translate}} ({{vat}}%)</strong></td>
				<td width="150" class="has-text-right">{{vatAmount | pricing}}</td>
			</tr>
			<tr>
				<td width="140"><strong>{{'Grand Total' | translate}}</strong></td>
				<td width="140" class="has-text-right">{{totalWithVat | pricing}}</td>
			</tr>
		</tbody>
	</table>
</template>
<script>
	export default {
		name: "InvoiceTotal",
		props: {
			features: { type: String },
			content: { type: Array },
			vat: { type: Object }
		},
		computed: {
			beforeTaxes() {
				var beforeTaxes = 0;

				this.invoice.content.filter((product) => {
					// var quantity = 1;

					// Regular Pricing
					var productTotal = 0;

					// Regular Pricing
					if(product && product.snapshot && product.snapshot.price) {
						productTotal = parseFloat(product.snapshot.price) * parseInt(product.quantity);
					}

					// Variance Pricing
					if(product.variant!=null) productTotal = parseFloat(product.variant.price) * parseInt(product.quantity);

					// Discount
					if(!this.isUndefined(product.discount)) {
						var discount = parseFloat(productTotal / 100) * parseInt(product.discount);
						productTotal = productTotal - discount;

						if(!this.isUndefined(product.discount)) {
							if(product.discount>0) {
								var ddiscount = (productTotal / 100) * product.discount;
								productTotal = productTotal - ddiscount;
							} else {
								var iincount = (productTotal / 100) * (product.discount * -1);
								productTotal = productTotal + iincount;
							}
						}
					}

					// Offer Pricing
					if(!this.isUndefined(product.offer) && product.offer!=null && product.offer.discount>0) {
						var discountValue = parseFloat(productTotal / 100) * parseInt(product.offer.discount);
						productTotal = productTotal - discountValue;
					}

					// Tier Pricing
					if(!this.isUndefined(product.snapshot) && product.snapshot && product.snapshot.tiers) {
						product.snapshot.tiers.filter((tier) => {
							if(product.quantity>=tier.quantity && tier.price) {
								productTotal = parseFloat(tier.price) * parseInt(product.quantity);
							}
						})
					}

					// Addon pricing
					if(product.addons && product.addons.length>0) {
						product.addons.filter((addon) => {
							var addonTotal = 0;
							if(addon) {
								if(addon.price) addonTotal = parseFloat(addon.price) * parseInt(addon.quantity);
								if(addon.tiers) {
									addon.tiers.filter((tier) => {
										if(addon.quantity>=tier.quantity && tier.price) {
											addonTotal = parseFloat(tier.price) * parseInt(addon.quantity);
										}
									});
								}
								if(addon.discount) {
									if(addon.discount>0) {
										var adiscount = (addonTotal / 100) * addon.discount;
										addonTotal = addonTotal - adiscount;
									} else {
										var aincount = (addonTotal / 100) * (addon.discount * -1);
										addonTotal = addonTotal + aincount;
									}
								}
							}
							productTotal = productTotal + addonTotal;
						});
					}

					beforeTaxes += productTotal;
				});

				return beforeTaxes;
			},
			vatAmount() {
				var vatAmount = 0;

				if(this.vatIncluded) {
					var vatDivisor = 1 + (this.vat/100);
					var overVat = this.beforeTaxes/vatDivisor;
					var innerVat = this.beforeTaxes-overVat;
					vatAmount = innerVat;
				}
				// else {
				// 	var vatDivisor = 1 + (this.vat/100);
				// 	var overVat = vatAmount/vatDivisor;
				// 	vatAmount = overVat;
				// }

				return vatAmount;
			},
			total() {
				return this.vatIncluded ? this.beforeTaxes - this.vatAmount : this.beforeTaxes;
			},
			totalWithVat() { return this.total + this.vatAmount; },
			discount() {
				return 0;
				// if(!this.customer || !this.customer.exclusivity || this.customer.exclusivity.discount==0) return 0;
				// var discount = (this.beforeTaxes / 100) * this.customer.exclusivity.discount;
				// return discount;
			},
			taxes() {
				var beforeTaxes = this.beforeTaxes - this.discount;
				var taxes = (beforeTaxes / 100) * this.vat;
				return taxes;
			},
			grandTotal() {
				var beforeTaxes = this.beforeTaxes - this.discount;
				if(this.vatIncluded) {
					beforeTaxes = this.vatExcluded - this.discount;
				}

				return beforeTaxes + this.taxes;
			},
		}
	}
</script>