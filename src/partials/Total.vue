<template>
	<div class="column">
		<table class="table is-striped is-bordered is-pulled-right" style="margin-top: 10px;border-top: 5px solid #e4e4e4">
			<tbody>
				<tr>
					<td width="150"><strong>{{'Total' | translate}}</strong></td>
					<td width="150" class="has-text-right">{{total.withoutVat | pricing}}</td>
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
					<td width="150" class="has-text-right">{{total.withoutVat | pricing}}</td>
				</tr>
				<tr>
					<td width="150"><strong>{{'Taxes' | translate}} ({{vat.amount}}%)</strong></td>
					<td width="150" class="has-text-right">{{total.vat | pricing}}</td>
				</tr>
				<tr>
					<td width="140"><strong>{{'Grand Total' | translate}}</strong></td>
					<td width="140" class="has-text-right">{{total.withVat | pricing}}</td>
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
		},
		methods: {
			snapshot(item) { return item && item.snapshot ? item.snapshot : null; },
			validItem(item) {
				return item &&
					"price" in item &&
					"quantity" in item &&
					"discount" in item &&
					"vat" in item
			},
			price(item) {
				if(!item) return 0;
				var price = item.price ?? 0;
				if(!this.validItem(item)) return price;

				if(this.snapshot(item) && price==this.snapshot(item).price) {
					if(this.snapshot(item) && this.snapshot(item).tiers && this.snapshot(item).tiers.length>0) {
						this.snapshot(item).tiers.filter((tier) => {
							if(tier.quantity <= item.quantity && tier.price) {
								price = tier.price;
							}
						})
					}

					if(item.variant && item.variant.price) {
						price = item.variant.price;
					}
				}

				var withoutVat = +price, withVat = +price;
				var vat = 0;
				var discount = 0, discountAfterVat = 0;
				var increase = 0, increaseAfterVat = 0;

				if(item.vat.included && item.vat.amount>0) {
					var vatDivider = +("1." + item.vat.amount);
					vat = price - (price / vatDivider);
					withoutVat = price - vat;
				}

				if(!item.vat.included && item.vat.amount>0) {
					vat = (price/100) * item.vat.amount;
					withVat = price + vat;
				}

				var discounted = withoutVat, discountedAfterVat = withVat;
				var finalPrice = withVat;

				if(item.discount && item.discount>0) {
					discount = (withoutVat/100) * item.discount;
					discounted = withoutVat - discount;

					discountAfterVat = (withVat/100) * item.discount;
					discountedAfterVat = withVat - discountAfterVat;
					finalPrice = discountedAfterVat;
				}

				var increased = withoutVat, increasedAfterVat = withVat;

				if(item.discount && item.discount<0) {
					increase = (withoutVat/100) * (item.discount * (-1));
					increased = withoutVat + increase;

					increaseAfterVat = (withVat/100) * (item.discount * (-1));
					increasedAfterVat = withVat + increaseAfterVat;
					finalPrice = increasedAfterVat;
				}

				return { price: +price, discount, discounted, discountedAfterVat, increase, increased, increasedAfterVat, vat, withVat, withoutVat, finalPrice }
			}
		},
		computed: {
			total() {
				var vat = 0, withVat = 0;

				this.content.filter((item) => {
					vat += this.price(item).vat * item.quantity;
					withVat += this.price(item).finalPrice * item.quantity;
					if(item.addons && item.addons.length>0) {
						item.addons.filter((addon) => {
							if(addon) {
								var addonVat = this.price(addon).vat * addon.quantity;
								var addonWithVat = this.price(addon).finalPrice * addon.quantity;
								if(addon.period) {
									var dates = addon.period.split(", ");
									if(dates.length>1) {
										addonVat = addonVat * dates.length;
										addonWithVat = addonWithVat * dates.length;
									}
								}
								vat += addonVat;
								withVat += addonWithVat;
							}
						})
					}
				});

				var withoutVat = withVat - vat;
				return { withoutVat, vat, withVat };
			}
		}
	}
</script>