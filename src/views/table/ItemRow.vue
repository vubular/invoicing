<template>
	<tr v-if="validInvoiceItem(item)">
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td v-if="visible('name')">
			<div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width:300px;float:left;margin-right:10px" :title="itemName">{{itemName}}</div>
			<button v-if="snapshot && snapshot.addons && snapshot.addons.length>0 && !this.show"
				type="button"
				class="button is-small"
				@click="newAddon"> + Addon </button>
			<button v-if="removable"
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
		<td v-if="visible('indexes')">
	          <span v-if="item && item.snapshot && item.snapshot.indexes && item.snapshot.indexes.navision">{{item.snapshot.indexes.navision}}</span>
		</td>
		<td v-if="visible('condition')">
			<b-dropdown aria-role="list">
			    <template #trigger="{ active }">
			        <b-button type="button" class="is-capitalized" :icon-right="active ? 'menu-up' : 'menu-down'">
			           {{ item.condition }} 
			        </b-button>
			    </template>
			    <b-dropdown-item aria-role="listitem" @click="item.condition = 'new'"> New </b-dropdown-item>
			    <b-dropdown-item aria-role="listitem" @click="item.condition = 'used'"> Used </b-dropdown-item>
			</b-dropdown>
		</td>
		<td v-if="visible('idlist')">
			<div v-if="editable('idlist')">
				<b-taginput
				 	v-if="item.quantity<=10"
				 	:data="filteredOptions"
					v-model="item.idlist"
					:maxtags="item.quantity"
					open-on-focus
					keep-first
					append-to-body
					icon="barcode"
					icon-pack="fa"
					placeholder="Scan"
					style="width:200px"
					autocomplete
					allow-new
					@blur="settleIdlist"
					@input="emitChanges"
					@typing="getFilteredOptions"
					v-on="$listeners"
					/>
				<span class="is-block">
					<span class="tag is-warning is-light">{{ filteredOptions.length==0 ? "No Available Idlist" : "Available Idlist" }}</span>
				</span>
				<b-upload v-if="item.quantity>10 && !item.idlist" @input="idlistFileChosen" class="file">
					<a class="button is-primary is-small">
						<span class="icon"><i class="fa fa-upload"></i></span>
						<span>Click to upload</span>
					</a>
				</b-upload>
				<a v-if="item.idlist && item.idlist.includes('/file/')"
					:href="item.idlist"
					class="button is-primary is-small"
					target="_blank">
					<span class="icon"><i class="fa fa-download"></i></span>
					<span>Download</span>
				</a>
			</div>
			<template v-else>
				<a v-if="item.idlist && item.idlist.includes('/file/')"
					:href="item.idlist"
					class="button is-primary is-small"
					target="_blank">
					<span class="icon"><i class="fa fa-download"></i></span>
					<span>Download</span>
				</a>
				<font v-else>
					<plain v-if="Array.isArray(item.idlist)">{{item.idlist.join(",")}}</plain>
					<plain v-else>{{item.idlist}}</plain>
				</font>
			</template>
		</td>
		<td v-if="visible('period')">
			<b-datepicker v-if="editable('period')" v-model="virtualPeriod" @input="setPeriod" type="month" icon-pack="fa" icon="calendar-alt" size="is-small"  multiple></b-datepicker>
			<font v-else>{{item.period}}</font>
		</td>
		<td v-if="visible('stock')">{{stock}}</td>
		<td v-if="visible('quantity')">
			<b-numberinput
				v-if="editable('quantity') && item.unit!='Month'"
				v-model="item.quantity"
				size="is-small"
				:min="minQuantity"
				:max="maxQuantity" step="1"
				@input="updateVirtualTotal"
				icon-pack="fal"
				/>
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
				:min="minVirtualTotalVat"
				:max="maxVirtualTotalVat"
				step="0.01"
				:key="virtualTotalVat"
				ref="focusTotal"></b-numberinput>
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
			addons: { type: Array },
			availableOptions: { 
				type: Array, 
				default() {
					return []
				}
			}
		},
		data() {
			return {
				virtualPeriod: [],
				virtualDiscount: 0,
				oldVirtualDiscount: 0,
				virtualTotalVat: 0,
				oldVirtualTotalVat: 0,
				oldQuantity: 1,
				readOnly: "",
				filteredOptions: this.item.snapshot.idlist
			}
		},
		beforeMount() {
			this.virtualDiscount = this.item.discount;
			this.oldVirtualDiscount = this.item.discount;

			this.virtualTotalVat = this.price.finalPrice * this.item.quantity;
			this.oldVirtualTotalVat = this.price.finalPrice * this.item.quantity;
			this.oldQuantity = this.item.quantity;

			var parsingDate = new Date();
			if(this.editable("period") && this.item.period) {
				var parsingMonth = this.item.period.split("/").shift()+"/01/";
				var parsingYear = this.item.period.split("/").pop();
				parsingDate = parsingMonth+parsingYear;
			}

			if(this.editable("period")) {
				var newDate = new Date(Date.parse(parsingDate));
				newDate.setDate(1);
				newDate.setHours(0, 0, 0, 0);
				var finalDate = new Date(newDate);
				this.virtualPeriod.push(finalDate);
				this.setPeriod(this.virtualPeriod);
			}
		},
		methods: {
			hasFeature(feature) { return this.features.includes(feature); },
			visible(column) { return this.fields.includes(column); },
			editable(column) {
				return this.fields.includes(column+":edit") && !this.readOnly.includes(column) && !this.show;
			},
			getFilteredOptions(text) {
			    this.filteredOptions = this.item.snapshot.idlist.filter((option) => {
			        return option
			            .toString()
			            .toLowerCase()
			            .indexOf(text.toLowerCase()) >= 0
			    })
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
				var pers = [];
				if(Array.isArray(period)) {
					period.filter(per => {
						pers.push(this.dayjs(per).format("MM/YYYY"));
					});
				} else {
					pers.push(this.dayjs(period).format("MM/YYYY"));
				}

				this.oldQuantity = this.item.quantity;
				this.item.quantity = this.arrayUnique(pers).length;
				pers = this.arrayUnique(pers).join(", ");

				this.item.period = pers;
				this.item.addons.filter((addon) => {
					addon.period = this.item.period;
				});

				this.virtualTotalVat = this.price.finalPrice * this.item.quantity;
				this.$forceUpdate();
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

				if(this.hasFeature("decreaseOnly")) {
					if(this.virtualTotalVat>this.oldVirtualTotalVat) {
						this.resetVirtualTotal();
						return;
					}
				}

				if(this.hasFeature("increaseOnly")) {
					if(this.virtualTotalVat<this.oldVirtualTotalVat) {
						this.resetVirtualTotal();
						return;
					}
				}

				var currentTotal = this.price.withVat * this.item.quantity;

				if(currentTotal!=0) {
					var newDiscount = (customTotal*100)/currentTotal;
					var adaptedDiscount = 100-newDiscount;
					this.virtualDiscount = adaptedDiscount;
					this.item.discount = adaptedDiscount;
				}

				this.$forceUpdate();

				this.$nextTick(() => {
				  this.$refs.focusTotal.focus();
				})
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
			},
			resetVirtualTotal() {
				this.virtualTotalVat = this.oldVirtualTotalVat;
				this.$forceUpdate();
			},
			idlistFileChosen(file) {
				this.$emit("idlistChosen", { file, item: this.item })
			},
			settleIdlist(e) {
				if(!this.item.idlist || this.item.idlist.length==0) {
					if(e.target.value!="") {
						this.item.idlist = [e.target.value];
					}
				}
			},
			emitChanges() {
				this.$emit("setIdlist");
			}
		},
		computed: {
			minimumDate() { var md = new Date(); return new Date(md.setDate(0)); },
			snapshot: { cache: false, get() { return this.item && this.item.snapshot ? this.item.snapshot : null; } },
			stock: { cache: false, get() { return this.snapshot && this.snapshot.stock ? this.snapshot.stock : 0 }  },
			itemName() {
				var name = "";
				if(!this.validInvoiceItem(this.item)) return name;

				if(this.snapshot && this.snapshot.name) name = this.snapshot.name;
				if(this.item && this.item.name) name = this.item.name;

				if(this.item && this.item.variant && this.item.variant.label) name = `${name} ${this.item.variant.label}`;
				return name;
			},
			offer() {
				var offer = "N/A";
				if(!this.validInvoiceItem(this.item)) return offer;
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
					return this.getPrice(this.item);
				}
			},
			removable() {
				return (this.fields.includes("name:remove") || this.fields.includes("name:edit:remove"));
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
			minQuantity: {
				cache: false,
				get() {
					var minQuantity = 1;
					if(this.hasFeature("increaseOnly")) {
						minQuantity = this.oldQuantity;
					}
					if(this.hasFeature("stockOnly") && this.stock==0) {
						minQuantity = 0;
					}

					return minQuantity;
				}
			},
			maxQuantity: {
				cache: false,
				get() {
					var maxQuantity = 99999999;
					if(this.hasFeature("stockOnly") && this.stock) {
						maxQuantity = this.stock;
					}
					if(this.hasFeature("decreaseOnly")) {
						maxQuantity = this.oldQuantity;
					}

					return maxQuantity;
				}
			}
		},
		watch: {
			"item.offer": function (newValue, oldValue) {
				if(newValue && newValue!=oldValue) {
					this.item.quantity = newValue.quantity;
					this.item.discount = newValue.discount;
					this.readOnly = this.readOnly + "quantity,discount,";
				}
			},
			"item.quantity": function (newValue, oldValue) {
				if(newValue && newValue!=oldValue) {
					// if(newValue>this.maxQuantity) {
					// 	this.item.quantity = +JSON.stringify(this.maxQuantity);
					// }
					if(newValue<this.minQuantity) {
						this.item.quantity = +JSON.stringify(this.minQuantity);
					}
				}
			}
		}
	}
</script>
