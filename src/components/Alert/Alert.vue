<template>
	<b-row>
		<b-col
			v-if="cols"
			cols="3"
		/>
		<b-col>
			<div
				class="alert"
				:class="'alert-'+variant"
				role="alert"
			>
				<b-row>
					<b-col cols="1">
						<div class="alert-icon">
							<svg
								v-if="variant === 'success'"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon alert-icon icon-2"
							>
								<path d="M5 12l5 5l10 -10" />
							</svg>
							<svg
								v-if="variant === 'info'"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon alert-icon icon-2"
							>
								<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
								<path d="M12 9h.01" />
								<path d="M11 12h1v4h1" />
							</svg>
							<svg
								v-if="variant === 'warning'"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon alert-icon icon-2"
							>
								<path d="M12 9v4" />
								<path
									d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 
									1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 
									-2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
								/>
								<path d="M12 16h.01" />
							</svg>
							<svg
								v-if="variant === 'danger'"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon alert-icon icon-2"
							>
								<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
								<path d="M12 8v4" />
								<path d="M12 16h.01" />
							</svg>
						</div>
					</b-col>
					<b-col>
						<div>
							<h4 class="alert-heading">
								{{ header }}
							</h4>
							<div class="alert-description mb-2">
								{{ (variant === 'danger') ? $t('message.something_went_wrong') : message }}
							</div>
							<div v-if="variant === 'danger' && message">
								<b-button
									size="sm"
									variant="danger"
									class="mb-2 danger-btn"
									@click="toggleDetails"
								>
									{{ showDetails ? $t('message.hide_details') : $t('message.show_details') }}
								</b-button>
								<b-collapse
									v-if="message"
									v-model="showDetails"
								>
									<pre class="mb-0 alert-message"><code>{{ message }}</code></pre>
								</b-collapse>
							</div>
						</div>
					</b-col>
				</b-row>
			</div>
		</b-col>
		<b-col
			v-if="cols"
			cols="3"
		/>
	</b-row>
</template>

<script>
export default {
	name: 'Alert',
	props: {
		message: { type: String, default: null },
		variant: { type: String, default: 'info'},
		cols: { type: Boolean, default: false }
	},
	data() {
		return {
			header: null,
			showDetails: false
		}
	},
	computed: {
		isDanger() {
			return this.variant === 'danger'
		}
	},
	watch: {
		message() {
			this.showDetails = false
		},
		variant() {
			this.showDetails = false
			this.updateHeader()
		}
	},
	created() {
		this.updateHeader()
	},
	methods: {
		updateHeader() {
			switch (this.variant) {
			case 'danger':
				this.header = this.$t('message.danger')
				break
			case 'success':
				this.header = this.$t('message.success')
				break
			case 'warning':
				this.header = this.$t('message.warning')
				break
			case 'info':
				this.header = this.$t('message.info')
				break
			default:
				this.header = this.$t('message.info')
			}
		},
		toggleDetails() {
			this.showDetails = !this.showDetails
		}
	}
}
</script>