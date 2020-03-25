<template>
	<tr v-if="addon">
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td v-if="visible('name')">
			{{addonName}}
			<button type="button" class="button is-small is-pulled-right has-text-danger" @click="removeAddon">
				<i class="fal fa-times"></i>
			</button>
			<textarea v-if="editable('description')"
				class="textarea is-small"
				v-model="addon.description"
				rows="1"
				style="margin-top:10px"></textarea>
			<font v-else>{{addon.description}}</font>
		</td>
		<td v-if="visible('idlist')">
			<div v-if="editable('idlist')">
				<input v-if="addon.quantity==1" class="input" v-model="addon.idlist"/>
				<textarea v-if="addon.quantity>1 && addon.quantity<=10" class="textarea" v-model="addon.idlist"></textarea>
				<input v-if="addon.quantity>10" type="file" />
			</div>
			<font v-else>{{idlist}}</font>
		</td>
		<td v-if="visible('period')">{{addon.period}}</td>
		<td v-if="visible('quantity')">
			<b-numberinput v-if="editable('quantity')"
						   v-model="addon.quantity"
						   size="is-small"
						   @input="updateVirtualTotal"
						   min="1" step="1"
						   icon-pack="fal"></b-numberinput>
			<font v-else>{{addon.quantity}}</font>
		</td>
		<td v-if="visible('unit')" class="is-capitalized">
			<b-select v-if="editable('unit')" v-model="addon.unit" placeholder="Change unit" size="is-small">
				<option v-for="(unit, u) in units" :value="unit" :key="u">{{unit}}</option>
			</b-select>
			<font v-else>{{addon.unit}}</font>
		</td>
		<td v-if="visible('price')">
			<b-numberinput v-if="editable('price')"
						   v-model="addon.price"
						   size="is-small"
						   icon-pack="fal"
						   @input="updateVirtualTotal"
						   min="0"
						   step="0.01"></b-numberinput>
			<font v-else>{{price.withoutVat | pricing}}</font>
		</td>
		<td v-if="visible('offer')">N/A</td>
		<td v-if="visible('discount')">
			<b-numberinput v-if="editable('discount')"
				v-model="virtualDiscount"
				@input="setDiscount"
				size="is-small"
				icon-pack="fal"
				max="100"
				step="0.01"></b-numberinput>
			<font v-else>
				{{addon.discount | percentage}}
				<!-- <button v-if="addon.discount>0" type="button" class="button has-text-grey-light is-small">
					{{discountedPriceWithoutVat | pricing}}
				</button> -->
			</font>
		</td>
		<td v-if="visible('vat')">
			<div v-if="editable('vat')" class="is-pulled-left" style="width:140px">
				<b-numberinput v-model="addon.vat.amount"
					size="is-small"
					icon-pack="fal"
					min="0" max="100"
					step="0.01"
					@input="updateVirtualTotal"></b-numberinput>
			</div>
			<font v-else>{{addon.vat.amount | percentage}}</font>
			<div v-if="editable('vat')" class="is-pulled-right">
				<b-checkbox v-if="editable('vat')"
					v-model="addon.vat.included"
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
			<div class="is-inline-block">
				<b-select @input="setAddon" placeholder="Select Addon">
					<option v-for="(addon, a) in addons" :value="addon" :key="a">
						{{addon.label}}, ({{addon.price}}/{{addon.unit}})
					</option>
				</b-select>
			</div>
			<div class="is-inline-block" style="margin-left:15px;position:relative;top:5px;opacity:.6">
				or <a href="#" class="has-text-danger" @click.prevent="removeAddon">delete</a>
			</div>
		</td>
		<td colspan="20"><hr style="margin: 17px 0;background: #f0f0f0;height: 1px" /></td>
	</tr>
</template>
<script>
	export default {
		name: "InvoiceItemAddonRow",
		props: {
			itemKey: { type: Number },
			addonKey: { type: Number },
			show: { type: Boolean },
			addon: { type: Object },
			fields: { type: String },
			features: { type: String },
			counter: { type: [ String, Number ] },
			addons: { type: Array }
		},
		data() {
			return {
				addonSet: false,
				virtualDiscount: 0,
				virtualTotalVat: 0,
				readOnly: ""
			}
		},
		updated() {
			if(this.addon && !this.addonSet && this.virtualTotalVat==0) {
				this.addonSet = true;
				this.virtualTotalVat = this.price.withVat * this.addon.quantity;
			}
		},
		methods: {
			visible(column) { return this.fields.includes(column); },
			editable(column) {
				return this.fields.includes(column+":edit") && !this.readOnly.includes(column) && !this.show;
			},
			setAddon(addon) {
				this.$emit('set-addon', {
					itemKey: this.itemKey,
					key: this.addonKey,
					value: {...addon}
				});
			},
			removeAddon() {
				this.$emit('remove-addon', {
					itemKey: this.itemKey,
					key: this.addonKey,
					value: null
				});
			},
			setDiscount(discount) {
				this.addon.discount = discount;
				this.$forceUpdate();
				this.virtualTotalVat = this.price.discountedAfterVat * this.addon.quantity;
				if(this.addon.discount<0) {
					this.virtualTotalVat = this.price.increasedAfterVat * this.addon.quantity;
				}
			},
			adaptDiscount(customTotal) {
				if(customTotal<0) {
					this.virtualTotalVat = 0;
					this.virtualDiscount = 100;
					this.addon.discount = 100;
					this.$forceUpdate();
					return;
				}

				var currentTotal = this.price.withVat * this.addon.quantity;

				if(currentTotal!=0) {
					var newDiscount = (customTotal*100)/currentTotal;
					var adaptedDiscount = 100-newDiscount;
					this.virtualDiscount = adaptedDiscount;
					this.addon.discount = adaptedDiscount;
				}

				this.$forceUpdate();
			},
			updateVirtualTotal() {
				this.$forceUpdate();
				this.addon.discount = 0;
				this.virtualDiscount = 0;
				this.virtualTotalVat = this.price.discountedAfterVat * this.addon.quantity;
			}
		},
		computed: {
			snapshot() { return this.addon && this.addon.snapshot ? this.addon.snapshot : null; },
			addonName() {
				var name = this.addon ? this.addon.name : "";
				if(this.snapshot && this.snapshot.label) name = this.snapshot.label;
				if(this.addon && this.addon.variant) name = `${name} ${this.addon.variant.label}`;
				return name;
			},
			unit() {
				var unit = (this.addon && this.addon.unit) ? this.addon.unit : "Piece";
				if(this.snapshot && this.snapshot.unit) unit = this.snapshot.unit;
				return unit;
			},
			units() {
				var units = ["Piece", "Box", "Pack", "Gram","Milligram", "Kilogram", "Ton", "Liter", "Centimeter","Decimeter", "Meter", "Kilometer","Hour","Day", "Week", "Month", "Quarter", "Semi-Annual", "Annual", "Biennial", "Triennial", "Kbps", "Mbps", "Gbps", "MB", "GB", "TB"];
				if(this.snapshot && this.snapshot.units) units = this.snapshot.units;
				return units;
			},
			idlist() {
				var idlist = "";
				if(this.snapshot && this.snapshot.idlist) idlist = this.snapshot.idlist;
				return idlist;
			},
			price: {
				cache: false,
				get() {
					if(!this.addonSet) return 0;

					var price = (this.addon && this.addon.price) ? this.addon.price : 0;
					var withoutVat = price, withVat = price;
					var vat = 0;
					var discount = 0, discountAfterVat = 0;
					var increase = 0, increaseAfterVat = 0;

					if(this.addon.vat.included && this.addon.vat.amount>0) {
						var vatDivider = +("1." + this.addon.vat.amount);
						vat = price - (price / vatDivider);
						withoutVat = price - vat;
					}

					if(!this.addon.vat.included && this.addon.vat.amount>0) {
						vat = (price/100) * this.addon.vat.amount;
						withVat = price + vat;
					}

					var discounted = withoutVat, discountedAfterVat = withVat;

					if(this.addon && this.addon.discount && this.addon.discount>0) {
						discount = (withoutVat/100) * this.addon.discount;
						discounted = withoutVat - discount;

						discountAfterVat = (withVat/100) * this.addon.discount;
						discountedAfterVat = withVat - discountAfterVat;
					}

					var increased = withoutVat, increasedAfterVat = withVat;

					if(this.addon && this.addon.discount && this.addon.discount<0) {
						increase = (withoutVat/100) * (this.addon.discount * (-1));
						increased = withoutVat + increase;

						increaseAfterVat = (withVat/100) * (this.addon.discount * (-1));
						increasedAfterVat = withVat + increaseAfterVat;
					}

					return { price, discount, discounted, discountedAfterVat, increase, increased, increasedAfterVat, vat, withVat, withoutVat }
				}
			}
		}
	}
</script>