<template>
	<tr v-if="validItem">
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td v-if="visible('name')">
			{{itemName}}
			<button v-if="snapshot.addons && snapshot.addons.length>0 && !this.show"
				type="button"
				class="button is-small"
				@click="newAddon"> + Addon </button>
			<button v-if="item.addons.length==0 && !this.show"
				type="button"
				class="button is-small is-pulled-right has-text-danger"
				@click="removeItem">
				<i class="fal fa-times"></i>
			</button>
			<textarea v-if="editable('description')"
				class="textarea is-small"
				v-model="item.description"
				rows="1"
				style="margin-top:10px"></textarea>
			<font v-else>{{item.description}}</font>
		</td>
		<td v-if="visible('idlist')">
			<div v-if="editable('idlist')">
				<input v-if="item.quantity==1" class="input is-small" v-model="item.idlist"/>
				<textarea v-if="item.quantity>1 && item.quantity<=10" class="textarea is-small" v-model="item.idlist" :rows="item.quantity"></textarea>
				<input v-if="item.quantity>10" type="file" />
			</div>
			<font v-else>{{item.idlist}}</font>
		</td>
		<td v-if="visible('period')">
			<b-datepicker v-if="editable('period')" :value="new Date()" @input="setPeriod" type="month" icon-pack="fa" icon="calendar-alt" size="is-small" :min-date="minimumDate"></b-datepicker>
			<font v-else>{{item.period}}</font>
		</td>
		<td v-if="visible('quantity')">
			<!-- <b-numberinput v-if="editable('quantity')"
				v-model="item.quantity"
				size="is-small"
				min="1" step="1"
				@input="updateVirtualTotal"
				icon-pack="fal"></b-numberinput>
			<font v-else>{{item.quantity}}</font> -->
			<font>{{item.quantity}}</font>
		</td>
		<td v-if="visible('unit')" class="is-capitalized">
			<b-select v-if="editable('unit')" v-model="item.unit" placeholder="Change unit" size="is-small">
				<option v-for="(unit, u) in units" :value="unit" :key="u">{{unit}}</option>
			</b-select>
			<font v-else>{{item.unit}}</font>
		</td>
		<td v-if="visible('price')">
			<b-numberinput v-if="editable('price')"
				v-model="item.price"
				size="is-small"
				icon-pack="fal"
				min="0"
				step="0.01"
				@input="updateVirtualTotal"></b-numberinput>
			<font v-else>{{price.withoutVat | pricing}}</font>
		</td>
		<td v-if="visible('offer')">
			<b-select v-if="item.snapshot && item.snapshot.offers.length>0 && !item.offer && !show"
				v-model="item.offer"
				size="is-small"
				placeholder="Select Offer">
				<option v-for="(offer, o) in item.snapshot.offers" :value="offer" :key="o">
					{{offer.coupon}} ({{offer.discount | percentage}})
				</option>
			</b-select>
			<font v-else>
				{{offer}}
				<button v-if="item.offer"
					type="button"
					class="button is-small"
					@click="cancelOffer">
					<i class="fal fa-times"></i>
				</button>
			</font>
		</td>
		<td v-if="visible('discount')">
			<b-numberinput v-if="editable('discount')"
				v-model="virtualDiscount"
				@input="setDiscount"
				size="is-small"
				icon-pack="fal"
				max="100"
				step="0.01"></b-numberinput>
			<div v-else>
				{{item.discount | percentage}}
				<!-- <button v-if="item.discount>0" type="button" class="button has-text-grey-light is-small">
					{{discountedPriceWithoutVat | pricing}}
				</button> -->
			</div>
		</td>
		<td v-if="visible('vat')">
			<div v-if="editable('vat')" class="is-pulled-left" style="width:140px">
				<b-numberinput v-model="item.vat.amount"
					size="is-small"
					icon-pack="fal"
					min="0" max="100"
					step="0.01"
					@input="updateVirtualTotal"></b-numberinput>
			</div>
			<font v-else>{{item.vat.amount | percentage}}</font>
			<div v-if="editable('vat')" class="is-pulled-right">
				<b-checkbox v-if="editable('vat')"
					v-model="item.vat.included"
					size="is-medium"
					@input="updateVirtualTotal"></b-checkbox>
			</div>
		</td>
		<td v-if="visible('total') && show" class="has-text-right">{{price.withVat | pricing}}</td>
		<td v-if="visible('totalDiscounted') && show" class="has-text-right">{{price.discounted+price.vat | pricing}}</td>
		<td v-if="visible('totalVat')" class="has-text-right">
			<b-numberinput v-if="editable('totalVat')"
				v-model="virtualTotalVat"
				@input="adaptDiscount"
				size="is-small"
				icon-pack="fal"
				min="0"
				step="0.01"></b-numberinput>
			<font v-else>{{virtualTotalVat | pricing}}</font>
		</td>
	</tr>
	<tr v-else>
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td>
			<font class="has-text-grey"><i class="fal fa-exclamation-square"></i> Invalid item!</font>
			<a href="#" class="has-text-danger" @click.prevent="removeItem" style="margin-left:15px;opacity:.6">delete</a>
		</td>
		<td colspan="20"><hr style="margin: 11px 0;background: #f0f0f0;height: 1px" /></td>
	</tr>
</template>
<script>
	export default {
		name: "InvoiceItemRow",
		props: {
			itemKey: { type: Number },
			show: { type: Boolean },
			fields: { type: String },
			features: { type: String },
			item: { type: Object },
			counter: { type: [ String, Number ] },
			addons: { type: Array }
		},
		data() {
			return {
				virtualDiscount: 0,
				virtualTotalVat: 0,
				readOnly: ""
			}
		},
		mounted() {
			this.virtualDiscount = this.item.discount;
			this.virtualTotalVat = this.price.finalPrice * this.item.quantity;
			if(this.editable("period")) { this.setPeriod(new Date); }
		},
		methods: {
			visible(column) { return this.fields.includes(column); },
			editable(column) {
				return this.fields.includes(column+":edit") && !this.readOnly.includes(column) && !this.show;
			},
			newAddon() {
				this.$emit('new-addon', {
					itemKey: this.itemKey,
					value: null
				});
			},
			removeItem() {
				this.$emit('remove-item', {
					itemKey: this.itemKey,
					value: this.item
				});
			},
			setPeriod(period) {
				var month = period.getMonth() + 1;
				if (month<10) month = '0' + month;

				this.item.period = month + "/" + period.getFullYear();
				this.item.addons.filter((addon) => {
					addon.period = this.item.period;
				})
			},
			setDiscount(discount) {
				this.item.discount = discount;
				this.$forceUpdate();
				this.virtualTotalVat = this.price.finalPrice * this.item.quantity;
			},
			cancelOffer() {
				this.item.offer = null;
				this.item.discount = 0;
				this.item.quantity = 1;
				this.readOnly = this.readOnly.replace("quantity,discount,", "");
			},
			adaptDiscount(customTotal) {
				if(customTotal<0) {
					this.virtualTotalVat = 0;
					this.virtualDiscount = 100;
					this.item.discount = 100;
					this.$forceUpdate();
					return;
				}

				var currentTotal = this.price.withVat * this.item.quantity;

				if(currentTotal!=0) {
					var newDiscount = (customTotal*100)/currentTotal;
					var adaptedDiscount = 100-newDiscount;
					this.virtualDiscount = adaptedDiscount;
					this.item.discount = adaptedDiscount;
				}

				this.$forceUpdate();
			},
			updateVirtualTotal() {
				this.$forceUpdate();
				if(this.item.quantity<=0) { this.item.quantity = 1; }
				if(this.item.price<0) { this.item.price = 0; }
				if(this.item.discount>100) { this.item.discount = 100; this.virtualDiscount = 100; }
				if(this.item.vat.amount>100) { this.item.vat.amount = 100; }
				if(this.item.vat.amount<0) { this.item.vat.amount = 0; }

				this.item.discount = 0;
				this.virtualDiscount = 0;
				this.virtualTotalVat = this.price.finalPrice * this.item.quantity;
			}
		},
		computed: {
			minimumDate() { var md = new Date(); return new Date(md.setDate(0)); },
			snapshot() { return this.item && this.item.snapshot ? this.item.snapshot : null; },
			itemName() {
				var name = "";
				if(!this.validItem) return name;

				name = this.item.name ?? this.snapshot.name;
				if(this.item.variant) name = `${name} ${this.item.variant.label}`;
				return name;
			},
			offer() {
				var offer = "N/A";
				if(!this.validItem) return offer;
				if(this.item && this.item.offer) offer = `${this.item.offer.coupon} (${this.item.offer.discount}%)`;
				return offer;
			},
			units() {
				return this.snapshot.units || ["Piece", "Box", "Pack", "Gram","Milligram", "Kilogram", "Ton", "Liter", "Centimeter","Decimeter", "Meter", "Kilometer","Hour","Day", "Week", "Month", "Quarter", "Semi-Annual", "Annual", "Biennial", "Triennial", "Kbps", "Mbps", "Gbps", "TB"]
			},
			idlist() {
				var idlist = this.snapshot.idlist ?? null;
				return idlist;
			},
			price: {
				cache: false,
				get() {
					var price = this.item.price ?? 0;
					if(!this.validItem) return price;

					if(this.snapshot && price==this.snapshot.price) {
						if(this.snapshot && this.snapshot.tiers && this.snapshot.tiers.length>0) {
							this.snapshot.tiers.filter((tier) => {
								if(tier.quantity <= this.item.quantity && tier.price) {
									price = tier.price;
								}
							})
						}

						if(this.item.variant && this.item.variant.price) {
							price = this.item.variant.price;
						}
					}

					var withoutVat = price, withVat = price;
					var vat = 0;
					var discount = 0, discountAfterVat = 0;
					var increase = 0, increaseAfterVat = 0;

					if(this.item.vat.included && this.item.vat.amount>0) {
						var vatDivider = +("1." + this.item.vat.amount);
						vat = price - (price / vatDivider);
						withoutVat = price - vat;
					}

					if(!this.item.vat.included && this.item.vat.amount>0) {
						vat = (price/100) * this.item.vat.amount;
						withVat = price + vat;
					}

					var discounted = withoutVat, discountedAfterVat = withVat;
					var finalPrice = withVat;

					if(this.item.discount && this.item.discount>0) {
						discount = (withoutVat/100) * this.item.discount;
						discounted = withoutVat - discount;

						discountAfterVat = (withVat/100) * this.item.discount;
						discountedAfterVat = withVat - discountAfterVat;
						finalPrice = discountedAfterVat;
					}

					var increased = withoutVat, increasedAfterVat = withVat;

					if(this.item.discount && this.item.discount<0) {
						increase = (withoutVat/100) * (this.item.discount * (-1));
						increased = withoutVat + increase;

						increaseAfterVat = (withVat/100) * (this.item.discount * (-1));
						increasedAfterVat = +withVat + +increaseAfterVat;
						finalPrice = increasedAfterVat;
					}

					return { price, discount, discounted, discountedAfterVat, increase, increased, increasedAfterVat, vat, withVat, withoutVat, finalPrice }
				}
			},
			validItem() {
				return this.item &&
					"price" in this.item &&
					"quantity" in this.item &&
					"discount" in this.item &&
					"vat" in this.item
			}
		},
		watch: {
			"item.offer": function (newValue, oldValue) {
				if(newValue && newValue!=oldValue) {
					if(newValue) {
						this.item.quantity = newValue.quantity;
						this.item.discount = newValue.discount;
						this.readOnly = this.readOnly + "quantity,discount,";
					}
				}
			}
		}
	}
</script>