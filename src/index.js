// Import vue component
import Component from './VubularInvoicing.vue';

export default {

	install(Vue, options) {

		Vue.mixin({
			methods: {
				validInvoiceItem(item) {
					return item && "price" in item && "quantity" in item && "discount" in item && "vat" in item;
				},
				getPrice(item) {
					if(!item || !this.validInvoiceItem(item)) {
						return { price: 0, discount: 0, discounted: 0, discountedAfterVat: 0, increase: 0, increased: 0, increasedAfterVat, vat: 0, withVat: 0, withoutVat: 0, finalPrice: 0 };
					}

					var price = item.price ? item.price : 0;

					if(item.snapshot && price==item.snapshot.price) {
						if(item.snapshot.tiers && item.snapshot.tiers.length>0) {
							item.snapshot.tiers.filter((tier) => {
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

					if(item.vat && (!item.vat.included && !item.vat.amount) && Number(item.vat)) {
						var vatDivider = +("1." + item.vat);
						vat = price - (price / vatDivider);
						withoutVat = price - vat;
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
				},
				grandTotal(content) {
					var vat = 0, withVat = 0;
					if(content && Array.isArray(content)) {
						content.filter((item) => {
							vat += this.getPrice(item).vat * item.quantity;
							withVat += this.getPrice(item).finalPrice * item.quantity;
							if(item.addons && item.addons.length>0) {
								item.addons.filter((addon) => {
									if(addon) {
										var addonVat = this.getPrice(addon).vat * addon.quantity;
										var addonWithVat = this.getPrice(addon).finalPrice * addon.quantity;
										if(addon.period) {
											var dates = addon.period.split(", ");
											if(dates.length>1) {
												addonVat = addonVat * dates.length;
												addonWithVat = addonWithVat * dates.length;
											}
										}
										vat += addonVat;
										vat = vat - (vat * (addon.discount/100));
										withVat += addonWithVat;
									}
								})
							} else {
								vat = vat - (vat * (item.discount/100));	
							}
						});
					}

					var withoutVat = withVat - vat;
					var beforeTaxes = withVat / (content[0].vat.amount ? "1."+content[0].vat.amount : 1.0);
					var taxes = withVat - withVat / (content[0].vat.amount ? "1."+content[0].vat.amount : 1.0);
					return { withoutVat, vat, withVat, beforeTaxes, taxes };
				}
			}
		});

		Vue.filter('pricing', function (value = null) {		
			var getHome = JSON.parse(localStorage.getItem("albismart:home"));
			var getEnv = JSON.parse(localStorage.getItem("albismart:environments"));
			var currency = null;
			if(getEnv.length==0) {
				currency = getHome.settings.currency.symbol;
			} else {
				currency = getEnv[0].settings.currency.symbol;
			}
			value = +value;
			if(!Number(value)) return "0.00 "+currency;
			if(value==null) return "0.00 "+currency;
			if(Number(value)==0) return "0.00 "+currency;
			return value ? value.toFixed(2) + " "+currency : "0.00 "+currency;
		});

		Vue.filter('percentage', function (value) {
			value = +value;
			if (value==null && Number(value)!=value) return value;
			return value + "%";
		});

		Vue.component(Component.name, Component)
	}

};
