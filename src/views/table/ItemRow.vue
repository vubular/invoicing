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
			<button v-if="snapshot.addons && snapshot.addons.length>0" type="button" class="button is-small" @click="$emit('new-addon')"> + Addon </button>
		</td>
		<td v-if="visible('idlist')">
			<div v-if="editable('idlist')">
				<input v-if="item.quantity==1" class="input" v-model="idlist"/>
				<textarea v-if="item.quantity>1 && item.quantity<=10" class="textarea" v-model="idlist"></textarea>
				<input v-if="item.quantity>10" type="file" />
			</div>
			<font v-else>{{idlist}}</font>
		</td>
		<td v-if="visible('period')">{{item.period}}</td>
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
			<font v-else>{{unit}}</font>
		</td>
		<td v-if="visible('price')">
			<b-numberinput v-if="editable('price')"
						   v-model="item.price"
						   size="is-small"
						   icon-pack="fal"
						   step="0.01"></b-numberinput>
			<font v-else>{{item.price}}</font>
		</td>
		<td v-if="visible('offer')">
			<b-select v-if="item.snapshot && item.snapshot.offers.length>0" v-model="item.offer" placeholder="Select Offer">
				<option v-for="(offer, o) in item.snapshot.offers" :value="offer" :key="o">
					{{offer.coupon}} ({{offer.discount}}%)
				</option>
			</b-select>
			<font v-else>{{itemOffer}}</font>
		</td>
		<td v-if="visible('discount')">
			<b-numberinput v-if="editable('discount')"
						   v-model="item.discount"
						   size="is-small"
						   icon-pack="fal"
						   step="0.01"></b-numberinput>
			<font v-else>{{item.discount}} %</font>
		</td>
		<td v-if="visible('vat')">
			<b-numberinput v-if="editable('vat')"
						   v-model="item.vat.amount"
						   size="is-small"
						   icon-pack="fal"
						   step="0.01"></b-numberinput>
			<font v-else>{{item.vat.amount}} %</font>
		</td>
		<td v-if="visible('total') && show" class="has-text-right">{{item.price}}</td>
		<td v-if="visible('totalVat')" class="has-text-right">{{item.price}}</td>
	</tr>
</template>
<script>
	export default {
		name: "InvoiceItemRow",
		props: {
			vat: {
				type: Object,
				default() {
					return {
						amount: 18,
						included: true
					}
				}
			},
			show: { type: Boolean },
			fields: { type: String },
			features: { type: String },
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
			item: { type: Object },
			counter: { type: [ String, Number ] },
			addons: { type: Array }
		},
		methods: {
			visible(column) { return this.fields.includes(column); },
			editable(column) {
				return this.fields.includes(column+":edit") && !this.show;
			},
		},
		computed: {
			snapshot() { return this.item && this.item.snapshot ? this.item.snapshot : null; },
			itemName() {
				var name = this.item.name ?? this.snapshot.name;
				if(this.item.variant) name = `${name} ${this.item.variant.label}`;
				return name;
			},
			itemOffer() {
				var offer = "N/A";
				if(this.item && this.item.offer) offer = `${this.item.offer.coupon} (${this.item.offer.coupon}%)`;
				return offer;
			},
			unit() {
				var unit = (this.item && this.item.unit) ? this.item.unit : "Piece";
				if(this.snapshot && this.snapshot.unit) unit = this.snapshot.unit;
				return unit;
			},
			units() {
				return this.snapshot.units || ["Piece", "Box", "Pack", "Gram","Milligram", "Kilogram", "Ton", "Liter", "Centimeter","Decimeter", "Meter", "Kilometer","Hour","Day", "Week", "Month", "Quarter", "Semi-Annual", "Annual", "Biennial", "Triennial"]
			},
			idlist() {
				var idlist = this.snapshot.idlist ?? null;
				return idlist;
			}
		}
	}
</script>