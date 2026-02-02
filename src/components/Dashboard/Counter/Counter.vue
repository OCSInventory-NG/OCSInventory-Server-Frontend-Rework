<template>
	<div :class="classstyle + ' counter'">
		<div class="card counter">
			<b-button 
				v-if="edit"
				size="sm" 
				variant="outline-danger" 
				@click="removeItem()"
			>
				<font-awesome-icon 
					:icon="['fas', 'xmark']"
					size="1x"
				/>
			</b-button>
			<div class="card-body">
				<div class="d-flex align-items-center">
					<div class="subheader">
						{{ $t(computedFirstTitle) }}
					</div>
				</div>
				<div
					v-if="!loaded && !errored"
					class="text-center py-4"
				>
					<b-spinner />
				</div>
				<div
					v-else-if="errored"
					class="text-center py-4 text-danger"
				>
					{{ $t("dashboard.error_loading_chart") }}
				</div>
				<div v-else>
					<div class="h1 mb-3">
						{{ displayFirstCount }}
					</div>
					<div
						v-if="displaySecondCount != null"
						class="d-flex mb-2"
					>
						<div>{{ $t(secondtitle) }}</div>
						<div class="ms-auto">
							<span class="badge bg-purple">
								{{ displaySecondCount }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios';

export default {
	name: "Counter",
	props: {
		chartName: { type: String, default: null },
		firsttitle: { type: String, default: null },
		secondtitle: { type: String, default: null },
		classstyle: { type: String, default: "" },
		edit: { type: Boolean, default: false },
		i: { type: Number, default: 0 },
		firstcount: { type: [Number, String], default: null },
		secondcount: { type: [Number, String], default: null }
	},
	data() {
		return {
			loadedFirstCount: null,
			loadedSecondCount: null,
			loaded: false,
			errored: false,
			errormsg: null
		}
	},
	computed: {
		displayFirstCount() {
			return this.firstcount !== null ? this.firstcount : this.loadedFirstCount
		},
		displaySecondCount() {
			return this.secondcount !== null ? this.secondcount : this.loadedSecondCount
		},
		computedFirstTitle() {
			if (this.chartName) {
				return `dashboard.${this.chartName}`
			}
			if (this.firsttitle) {
				return this.firsttitle
			}
			return 'dashboard.counter'
		}
	},
	async mounted() {
		if (this.firstcount !== null || this.secondcount !== null) {
			this.loaded = true
			return
		}

		if (!this.chartName) {
			this.loaded = true
			return
		}

		try {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			const response = await axios.get(
				`${this.$config.BACKEND_API_ROUTE}dashboard/chart/${this.chartName}/`,
				{ headers: header }
			)
			this.loadedFirstCount = response.data.total
			this.loadedSecondCount = response.data.contacted
			this.loaded = true
		} catch(e) {
			this.errored = true
			this.errormsg = e.response?.data?.error || e.message
		}
	},
	methods: {
		removeItem() {
			this.$emit('removeItem', this.i)
		}
	}
}
</script>