<template>
	<div id="export-modal">
		<b-button 
			:title="$t('generic.exportdata')"
			variant="bg-light"
			class="form-control btn datatable-btn datatable-btn-maxsize"
			@click="
				(!exportmodal) ? exportmodal = true : exportmodal = false,
				loadData()
			"
		>
			<font-awesome-icon 
				:icon="['fas', 'upload']"
			/>
		</b-button>

		<b-modal 
			id="export" 
			v-model="exportmodal"
			:title="$t('generic.exportdata')"
			hide-footer
			size="md"
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('generic.exportdata') }}
					<b-spinner 
						v-if="loadingexport"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="exportwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="errored"
						:icon="['fas', 'xmark']"
						color="red"
					/>
				</h5>
				<b-button 
					size="sm" 
					variant="outline-danger" 
					@click="close()"
				>
					<font-awesome-icon 
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<b-form
				@submit="onSubmit"
			>
				<Alert 
					v-if="errored"
					:message="errormsg" 
					variant="danger"
				/>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.exportoptions')" 
							label-for="export"
						>
							<v-select 
								id="export"
								v-model="exportmethod"
								:options="options"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ $t('generic.download') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: 'ExportModal',
	props: {
		serverSide: { type: Boolean, default: false },
		totalRows: { type: Number, default: 0 },
		pageLength: { type: Number, default: 0 },
		selectionLength: { type: Number, default: 0 },
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			exportmodal: false,
			loadingexport: false,
			exportwithsuccess: false,
			itemtoexport: [],
			exportmethod: "all"
		}
	},
	computed: {
		options() {
			const opts = [
				{ value: "all",     text: this.$t('generic.exportall')+" ("+this.totalRows+")" },
				{ value: "current", text: this.$t('generic.exportcurrentpage')+" ("+this.pageLength+")" },
			]
			if (this.selectionLength > 0) {
				opts.push({ value: "selection", text: this.$t('generic.exportselection')+" ("+this.selectionLength+")" })
			}
			return opts
		},
	},
	watch: {
		exportwithsuccess: function() {
			setTimeout(() => {
				this.exportwithsuccess = false
				this.exportmodal = false
			}, 500)
		},
		selectionLength: {
			immediate: true,
			handler(val) {
				if (val === 0 && this.exportmethod === 'selection') {
					this.exportmethod = 'all'
				}
			}
		}
	},
	methods: {
		loadData() {
			this.exportmodal = true
			this.errormsg = null
			this.errored = false
		},
		onSubmit(e) {
			e.preventDefault()
			this.$emit('confirm', this.exportmethod)
		},
	}
}
</script>