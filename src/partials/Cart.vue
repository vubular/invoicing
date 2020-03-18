<template>
	<div class="column">
		<div v-if="shopGoods" class="dropdown" :class="{'is-active': active}">
			<div class="dropdown-trigger">
				<button type="button" class="button is-success is-outlined" @click="active=!active">
					<span class="icon"><i class="fal fa-shopping-cart"></i></span>
					<span>Add Items</span>
					<span class="icon is-small">
						<i class="fas fa-angle-down" aria-hidden="true"></i>
					</span>
				</button>
			</div>
			<div v-if="active" class="dropdown-menu" id="dropdown-menu" role="menu">
				<div v-if="goods && goods.length>0" class="dropdown-content">
					<a class="dropdown-item"
						v-for="(good, g) in goods"
						@click="browseGoods(good)"
						:key="g">
						<span v-if="good.icon" class="icon"><i :class="good.icon"></i></span>
						<span v-if="good.label">{{good.label}}</span>
					</a>
				</div>
			</div>
		</div>
		<div v-if="browsing!=null" class="border-highlight" style="margin-top: 15px;1px dashed #ddd;padding:20px">
			<button type="button"
					class="button is-pulled-right"
					@click="cancelBrowsing"><i class="fal fa-times"></i></button>
			<component v-bind:is="browsing"
						@selected="selectGood"
						@cancel="cancelBrowsing"></component>
		</div>
	</div>
</template>
<script>
	export default {
		name: "InvoiceCart",
		props: {
			features: { type: String },
			goods: {
				type: Array,
				default() {
					return [
						{ label: "Subscriptions", icon: "fa fa-poll-people", component: "", },
						{ label: "Services", icon: "fa fa-cubes", component: "", },
						{ label: "Products", icon: "fa fa-shapes", component: "", }
					]
				}
			}
		},
		data() {
			return {
				active: false,
				browsing: null
			}
		},
		computed: {
			shopGoods() {
				return this.features.includes("add");
			}
		},
		methods: {
			browseGoods(good) {
				this.browsing = good.component;
				this.active = false;
			},
			cancelBrowsing() {
				this.browsing = null;
				this.active = false;
			},
			selectGood(good) {
				if(good) {
					this.$emit("selected", good);
					this.cancelBrowsing();
				}
			}
		}
	}
</script>