<template>
	<tr v-if="validInvoiceItem(addon)">
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td v-if="visible('name')">
			{{addonName}}
			<button v-if="removable" type="button" class="button is-small is-pulled-right has-text-danger" @click="removeAddon">
				<i class="fal fa-times"></i>
			</button>
			<textarea v-if="editable('description')"
				class="textarea is-small"
				v-model="addon.description"
				rows="1"
				style="margin-top:10px"></textarea>
			<font v-else>{{addon.description}}</font>
		</td>
		<td v-if="visible('indexes')">
		  <span v-if="item && item.snapshot && item.snapshot.indexes && item.snapshot.indexes.navision">{{item.snapshot.indexes.navision}}</span>
		</td>
		<td v-if="visible('idlist')">
			<div v-if="editable('idlist')">
				<b-taginput
				 	v-if="addon.quantity<=10"
					v-model="addon.idlist"
					:maxtags="addon.quantity"
					icon="barcode"
					icon-pack="fa"
					placeholder="Scan"
					style="width:200px"
					v-on="$listeners"
					/>
				<b-upload v-if="addon.quantity>10 && !addon.idlist" @input="idlistFileChosen" class="file">
					<a class="button is-primary is-small">
						<span class="icon"><i class="fa fa-upload"></i></span>
						<span>Click to upload</span>
					</a>
				</b-upload>
				<a v-if="addon.idlist && addon.idlist.includes('/file/')"
					:href="addon.idlist"
					class="button is-primary is-small"
					target="_blank">
					<span class="icon"><i class="fa fa-download"></i></span>
					<span>Download</span>
				</a>
			</div>
			<template v-else>
				<a v-if="addon.idlist && addon.idlist.includes('/file/')"
					:href="addon.idlist"
					class="button is-primary is-small"
					target="_blank">
					<span class="icon"><i class="fa fa-download"></i></span>
					<span>Download</span>
				</a>
				<font v-else>
					<plain v-if="Array.isArray(addon.idlist)">{{addon.idlist.join(",")}}</plain>
					<plain v-else>{{addon.idlist}}</plain>
				</font>
			</template>
		</td>
		<td v-if="visible('period')" :key="addon.period">{{addon.period}}</td>
		<td v-if="visible('stock')"></td>
		<td v-if="visible('quantity')">
			<b-numberinput v-if="editable('quantity')"
				v-model="addon.quantity"
				size="is-small"
				@input="updateVirtualTotalByQuantity"
				:min="minQuantity"
				:max="maxQuantity"
				step="1"
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
				:min="minVirtualTotalVat"
				:max="maxVirtualTotalVat"
				step="0.01"></b-numberinput>
			<font v-else>{{virtualTotalVat | pricing}}</font>
		</td>
	</tr>
	<tr v-else>
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td>
			<div v-if="addonSet && !validInvoiceItem(addon)" class="is-inline-block has-text-grey" style="margin-right:15px">
				<i class="fal fa-exclamation-square"></i>
				Invalid addon!
			</div>
			<div class="is-inline-block">
				<b-select @input="setAddon" placeholder="Select Addon" size="is-small">
					<option v-for="(addon, a) in addons" :value="addon" :key="a">
						{{addon.label}}, ({{addon.price}}/{{addon.unit}})
					</option>
				</b-select>
			</div>
			<div class="is-inline-block" style="margin-left:8px;opacity:.6">
				or <a href="#" class="has-text-danger" @click.prevent="removeAddon">delete</a>
			</div>
		</td>
		<td colspan="20"><hr style="margin: 11px 0;background: #f0f0f0;height: 1px" /></td>
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
				oldVirtualDiscount: 0,
				virtualTotalVat: 0,
				oldVirtualTotalVat: 0,
				oldQuantity: 1,
				readOnly: ""
			}
		},
		mounted() {
			if(this.addon && !this.addonSet && this.virtualTotalVat==0) {
				this.addonSet = true;
				this.virtualTotalVat = this.price.finalPrice * this.addon.quantity;
				this.virtualDiscount = this.addon.discount;
			}
		},
		updated() {
			if(this.addon && !this.addonSet && this.virtualTotalVat==0) {
				this.addonSet = true;
				this.virtualTotalVat = this.price.finalPrice * this.addon.quantity;
				this.virtualDiscount = this.addon.discount;
			}
		},
		methods: {
			hasFeature(feature) { return this.features.includes(feature); },
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
				this.virtualTotalVat = this.price.finalPrice * this.addon.quantity;
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
			updateVirtualTotalByQuantity() {
				this.$forceUpdate();

				if(this.hasFeature("decreaseOnly")) {
					if(this.quantity>this.oldQuantity) {
						this.resetQuantity();
						return;
					}
				}

				if(this.hasFeature("increaseOnly")) {
					if(this.quantity<this.oldQuantity) {
						this.resetQuantity();
						return;
					}
				}

				this.virtualTotalVat = this.price.finalPrice * this.addon.quantity;
			},
			updateVirtualTotal() {
				this.$forceUpdate();
				// this.addon.discount = 0;
				// this.virtualDiscount = 0;
				this.virtualTotalVat = this.price.finalPrice * this.addon.quantity;
			},
			resetVirtualTotal() {
				this.virtualTotalVat = this.oldVirtualTotalVat;
				this.$forceUpdate();
			},
			resetQuantity() {
				this.quantity = this.oldQuantity;
				this.$forceUpdate();
			},
			idlistFileChosen(file) {
				this.$emit("idlistChosen", { file, item: this.addon })
			}
		},
		computed: {
			snapshot() { return this.addon && this.addon.snapshot ? this.addon.snapshot : null; },
			addonName() {
				var name = "";
				if(!this.validInvoiceItem(this.addon)) return name;
				name = this.addon ? this.addon.name : "";
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
					return this.getPrice(this.addon);
				}
			},
			removable() {
				return (this.fields.includes("name:remove") || this.fields.includes("name:edit:remove")) && !this.show;
			},
			minVirtualTotalVat() {
				var minVirtualTotalVat = 0;
				if(this.hasFeature("increaseOnly")) {
					minVirtualTotalVat = this.oldVirtualTotalVat;
				}

				return minVirtualTotalVat;
			},
			maxVirtualTotalVat() {
				var maxVirtualTotalVat = 99999999;
				if(this.hasFeature("decreaseOnly")) {
					maxVirtualTotalVat = this.oldVirtualTotalVat;
				}

				return maxVirtualTotalVat;
			},
			minQuantity() {
				var minQuantity = 1;
				if(this.hasFeature("increaseOnly")) {
					minQuantity = this.oldQuantity;
				}

				return minQuantity;
			},
			maxQuantity() {
				var maxQuantity = 99999999;
				if(this.hasFeature("decreaseOnly")) {
					maxQuantity = this.oldQuantity;
				}

				return maxQuantity;
			}
		}
	}
</script>
