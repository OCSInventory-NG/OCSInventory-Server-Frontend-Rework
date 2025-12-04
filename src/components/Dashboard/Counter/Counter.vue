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
				<div v-if="!loaded && !errored" class="text-center py-4">
					<b-spinner />
				</div>
				<div v-else-if="errored" class="text-center py-4 text-danger">
					{{ $t("dashboard.error_loading_chart") }}
				</div>
				<div v-else>
					<div class="h1 mb-3">{{ firstcount }}</div>
					<div v-if="secondcount != null" class="d-flex mb-2">
						<div>{{ $t(secondtitle) }}</div>
						<div class="ms-auto">
							<span class="badge bg-purple">
								{{ secondcount }}
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
		i: { type: Number, default: 0 }
	},
	data() {
		return {
		firstcount: null,
		secondcount: null,
		loaded: false,
		errored: false,
		errormsg: null
		}
	},
	computed: {
		computedFirstTitle() {
			return `dashboard.${this.chartName}`
		}
	},
	async mounted() {
		try {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			const response = await axios.get(
				`${this.$config.BACKEND_API_ROUTE}dashboard/chart/${this.chartName}/`,
				{ headers: header }
			)
			this.firstcount = response.data.total
			this.secondcount = response.data.contacted
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