<template>
	<tr v-if="addon">
		<td class="has-text-grey has-text-weight-light">{{counter}}</td>
		<td v-if="visible('name')">
			{{addonName}}
			<textarea v-if="editable('description')"
					  class="textarea"
					  v-model="addon.description"
					  rows="1"></textarea>
			<font v-else>{{addon.description}}</font>
			<button type="button" class="button is-small is-pulled-right has-text-danger" @click="removeAddon">
				<i class="fal fa-times"></i>
			</button>
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
						   icon-pack="fal"></b-numberinput>
			<font v-else>{{addon.quantity}}</font>
		</td>
		<td v-if="visible('unit')" class="is-capitalized">
			<b-select v-if="editable('unit')" v-model="addon.unit" placeholder="Change unit" size="is-small">
				<option v-for="(unit, u) in units" :value="unit" :key="u">{{unit}}</option>
			</b-select>
			<font v-else>{{unit}}</font>
		</td>
		<td v-if="visible('price')">
			<b-numberinput v-if="editable('price')"
						   v-model="addon.price"
						   size="is-small"
						   icon-pack="fal"
						   step="0.01"></b-numberinput>
			<font v-else>{{addon.price}}</font>
		</td>
		<td v-if="visible('offer')">N/A</td>
		<td v-if="visible('discount')">
			<b-numberinput v-if="editable('discount')"
						   v-model="addon.discount"
						   size="is-small"
						   icon-pack="fal"
						   step="0.01"></b-numberinput>
			<font v-else>{{addon.discount}} %</font>
		</td>
		<td v-if="visible('vat')">
			<b-numberinput v-if="editable('vat')"
						   v-model="addon.vat.amount"
						   size="is-small"
						   icon-pack="fal"
						   step="0.01"></b-numberinput>
			<font v-else>{{addon.vat.amount}} %</font>
		</td>
		<td v-if="visible('total') && show" class="has-text-right">{{addon.price}}</td>
		<td v-if="visible('totalVat')" class="has-text-right">
			<b-numberinput v-if="editable('totalVat')"
				v-model="addon.price"
				size="is-small"
				icon-pack="fal"
				step="0.01"></b-numberinput>
			<font v-else>{{addon.price}}</font>
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
		methods: {
			visible(column) { return this.fields.includes(column); },
			editable(column) {
				return this.fields.includes(column+":edit") && !this.show;
			},
			setAddon(addon) {
				this.$emit('set-addon', {
					itemKey: this.itemKey,
					key: this.addonKey,
					value: addon
				});
			},
			removeAddon() {
				this.$emit('remove-addon', {
					itemKey: this.itemKey,
					key: this.addonKey,
					value: null
				});
			}
		},
		computed: {
			snapshot() { return this.addon && this.addon.snapshot ? this.addon.snapshot : null; },
			addonName() {
				var name = this.addon.name ?? this.snapshot.label;
				if(this.addon.variant) name = `${name} ${this.addon.variant.label}`;
				return name;
			},
			unit() {
				var unit = (this.addon && this.addon.unit) ? this.addon.unit : "Piece";
				if(this.snapshot && this.snapshot.unit) unit = this.snapshot.unit;
				return unit;
			},
			units() {
				return this.snapshot.units || ["Piece", "Box", "Pack", "Gram","Milligram", "Kilogram", "Ton", "Liter", "Centimeter","Decimeter", "Meter", "Kilometer","Hour","Day", "Week", "Month", "Quarter", "Semi-Annual", "Annual", "Biennial", "Triennial", "Kbps", "Mbps", "Gbps", "MB", "GB", "TB"]
			},
			idlist() {
				var idlist = this.snapshot.idlist ?? null;
				return idlist;
			}
		}
	}
</script>