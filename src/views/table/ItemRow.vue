<template>
	<tr>
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td v-if="visible('name')">
			{{itemName}}
			<textarea v-if="editable('description')"
				class="textarea"
				v-model="item.description"
				rows="1"></textarea>
			<font v-else>{{item.description}}</font>
			<button v-if="snapshot.addons && snapshot.addons.length>0"
				type="button"
				class="button is-small"
				@click="newAddon"> + Addon </button>
			<button v-if="item.addons.length==0"
				type="button"
				class="button is-small is-pulled-right has-text-danger"
				@click="removeItem">
				<i class="fal fa-times"></i>
			</button>
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
			<b-numberinput v-if="editable('quantity')"
				v-model="item.quantity"
				size="is-small"
				icon-pack="fal"></b-numberinput>
			<font v-else>{{item.quantity}}</font>
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
				step="0.01"></b-numberinput>
			<font v-else>{{priceWithoutVat | pricing}}</font>
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
				v-model="item.discount"
				size="is-small"
				icon-pack="fal"
				step="0.01"></b-numberinput>
			<div v-else>
				{{item.discount | percentage}}
				<button v-if="item.discount>0" type="button" class="button has-text-grey-light is-small">
					{{discountedPriceWithoutVat | pricing}}
				</button>
			</div>
		</td>
		<td v-if="visible('vat')">
			<div v-if="editable('vat')" class="is-pulled-left" style="width:140px">
				<b-numberinput v-model="item.vat.amount"
					size="is-small"
					icon-pack="fal"
					step="0.01"></b-numberinput>
			</div>
			<font v-else>{{item.vat.amount | percentage}}</font>
			<div v-if="editable('vat')" class="is-pulled-right">
				<b-checkbox v-if="editable('vat')" v-model="item.vat.included" size="is-medium"></b-checkbox>
			</div>
		</td>
		<td v-if="visible('total') && show" class="has-text-right">{{discountedPriceWithVat | pricing}}</td>
		<td v-if="visible('totalVat')" class="has-text-right">
			<b-numberinput v-if="editable('totalVat')"
				v-model="virtualTotalVat"
				@input="adaptDiscount"
				size="is-small"
				icon-pack="fal"
				step="0.01"></b-numberinput>
			<font v-else>{{totalVatField | pricing}}</font>
		</td>
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
				virtualTotalVat: 0,
				readOnly: ""
			}
		},
		mounted() {
			this.virtualTotalVat = this.totalVatField;
			if(this.editable("period")) { this.setPeriod(new Date); }
		},
		methods: {
			visible(column) { return this.fields.includes(column); },
			editable(column) {
				return this.fields.includes(column+":edit") && !this.readOnly.includes(column) && !this.show;
			},
			newAddon() {
				this.$emit('new-addon', this.itemKey);
			},
			removeItem() {
				this.$emit('remove-item', this.itemKey);
			},
			setPeriod(period) {
				var mm = period.getMonth() + 1;
				if (mm<10) mm = '0' + mm;

				this.item.period = mm + "/" + period.getFullYear();
			},
			cancelOffer() {
				this.item.offer = null;
				this.item.discount = 0;
				this.item.quantity = 1;
				this.readOnly = this.readOnly.replace("quantity,discount,", "");
			},
			adaptDiscount(customTotal) {
				console.log(customTotal);
				var adaptedTotal = customTotal;

				if(this.item.vat && this.item.vat.amount>0) {
					var vatAmount = (adaptedTotal/100) * this.item.vat.amount;
					adaptedTotal = this.item.vat.included ? adaptedTotal - vatAmount : adaptedTotal + vatAmount;
				}


				console.log(adaptedTotal);
				console.log(this.priceWithVat);

				var discount = (customTotal*100) / this.priceWithVat;
				// discount = discount - this.item.vat.amount;
				console.log(discount);

				this.item.discount = (100-discount) - this.item.vat.amount;
			}
		},
		computed: {
			minimumDate() { var md = new Date(); return new Date(md.setDate(0)); },
			snapshot() { return this.item && this.item.snapshot ? this.item.snapshot : null; },
			itemName() {
				var name = this.item.name ?? this.snapshot.name;
				if(this.item.variant) name = `${name} ${this.item.variant.label}`;
				return name;
			},
			offer() {
				var offer = "N/A";
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
			discountedPriceWithoutVat() {
				var priceWithoutVat = this.priceWithoutVat;

				if(this.item.discount>0) {
					var discount = (priceWithoutVat/100) * this.item.discount;
					priceWithoutVat = priceWithoutVat - discount;
				}

				return priceWithoutVat;
			},
			discountedPriceWithVat() {
				if(this.item.discount>0) {
					var priceWithoutVat = this.discountedPriceWithoutVat;

					var priceWithVat = priceWithoutVat;
					if(this.item.vat && this.item.vat.amount>0) {
						var vatAmount = (priceWithoutVat/100) * this.item.vat.amount;
						priceWithVat = priceWithoutVat + vatAmount;
					}

					return priceWithVat;
				}

				if(this.item.vat && this.item.vat.amount>0 && !this.item.vat.included) {
					var vatAmount = (this.item.price/100) * this.item.vat.amount;
					return this.item.price + vatAmount;
				}

				return this.item.price;
			},
			priceWithVat() {
				if(this.item.vat && this.item.vat.amount>0 && !this.item.vat.included) {
					var vatAmount = (this.item.price/100) * this.item.vat.amount;
					return this.item.price + vatAmount;
				}

				return this.item.price;
			},
			priceWithoutVat() {
				if(this.item.vat && this.item.vat.amount>0 && this.item.vat.included) {
					var vatAmount = (this.item.price/100) * this.item.vat.amount;
					return this.item.price - vatAmount;
				}

				return this.item.price;
			},
			totalVatField() {
				var finalPrice = this.priceWithVat;

				if(this.item.discount>0) {
					finalPrice = this.discountedPriceWithoutVat;

					if(this.item.vat && this.item.vat.amount>0) {
						var vatAmount = (finalPrice/100) * this.item.vat.amount;
						finalPrice = finalPrice + vatAmount;
					}
				}

				return finalPrice * this.item.quantity;
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
			},
			"item.price": function() {
				this.virtualTotalVat = this.totalVatField;
			},
			"item.discount": function() {
				//this.virtualTotalVat = this.totalVatField;
			},
			"item.vat": function() {
				this.virtualTotalVat = this.totalVatField;
			},
		}
	}
</script>