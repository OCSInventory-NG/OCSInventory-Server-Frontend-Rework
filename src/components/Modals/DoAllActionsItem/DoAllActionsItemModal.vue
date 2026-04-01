<template>
	<div id="do-all-actions-item-modal">
		<button 
			:title="$t(translationkey+titlevalue)"
			class="btn btn-ghost-orange ocs-auto"
			@click="getData()"
		>
			<font-awesome-icon 
				:icon="['fas', 'gear']"
				size="1x"
			/>
		</button>

		<b-modal 
			:id="idModal"
			v-model="doallaction"
			:title="$t(translationkey+titlevalue)"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t(translationkey+titlevalue) }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="currentError"
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
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="currentError"
					:message="currentError" 
					variant="danger"
				/>
				<div
					v-for="(input, index) in datavalues"
					:key="input.id || input._localId || 'tmp-'+index"
					class="modal-allactions"
				>
					<b-row>
						<b-col cols="8">
							<b-form-group>
								<b-form-input
									:id="'value'+index"
									v-model="input.value"
									@change="onUpdate(input)"
								/>
							</b-form-group>
						</b-col>
						<b-col cols="2">
							<b-form-group>
								<b-button
									:title="$t(translationkey+titlevalue)"
									variant="primary"
									class="d-none d-sm-inline-block form-control"
									@click="addField(input, datavalues)"
								>
									<font-awesome-icon 
										:icon="['fas', 'plus']"
									/>
								</b-button>
							</b-form-group>
						</b-col>
						<b-col
							cols="2"
						>
							<b-form-group>
								<b-button
									:title="$t(translationkey+titlevalue)"
									variant="danger"
									class="d-none d-sm-inline-block form-control"
									@click="removeField(index, datavalues)"
								>
									<font-awesome-icon 
										:icon="['fas', 'trash-can']"
									/>
								</b-button>
							</b-form-group>
						</b-col>
					</b-row>
				</div>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
							:disabled="loadingcreate"
						>
							{{ $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: 'DoAllActionsItemModal',
	props: {
		id: { type: Number, default: null },
		route: { type: String, default: '' },
		titlevalue: { type: String, default: '' },
		reconciliationname: { type: String, default: '' },
		translationkey: { type: String, default: '' }
	},
	data() {
		return {
			submitErrorMsg: null,
			loadErrorMsg: null,
			updateErrorMsg: null,
			deleteErrorMsg: null,

			createwithsuccess: false,

			row: {
				id: this.id
			},
			idModal: 'manage-item'+this.id,
			doallaction: false,
			text: null,
			datavalues: [{value: ""}],
			get: this.reconciliationname+"="+this.id,
			
			loading: true,
			loadingcreate: false,
		}
	},
	computed: {
		currentError() {
			return this.submitErrorMsg || this.loadErrorMsg || this.updateErrorMsg || this.deleteErrorMsg
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.doallaction = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	created() {
		this.datavalues = this.datavalues.map(v => ({
			...v,
			_localId: v._localId || (
				Date.now().toString(36)+
					Math.random().toString(36).slice(2)
			)
		}))
	},
	methods: {
		async onSubmit(event) {
			event.preventDefault()
			this.submitErrorMsg = null
			this.loadingcreate = true

			const jsonAdd = []
			for (const data of (this.datavalues || [])) {
				const valueStr =
					data && data.value !== undefined && data.value !== null
						? String(data.value).trim()
						: ""

				if (!data?.id && valueStr !== "") {
					jsonAdd.push({
						[this.reconciliationname]: this.id,
						value: valueStr,
					})
				}
			}

			const updates = (this.datavalues || [])
				.filter((data) => {
					const valueStr =
						data && data.value !== undefined && data.value !== null
							? String(data.value).trim()
							: ""
					return data?.id && data?._dirty && valueStr !== ""
				})
				.map((data) => ({
					id: data.id,
					payload: { value: String(data.value).trim() },
				}))

			try {
				const requests = []

				// POST bulk
				if (jsonAdd.length > 0) {
					requests.push(this.$api.generic.post(`${this.route}/`, jsonAdd))
				}

				// unit PATCH
				for (const u of updates) {
					requests.push(this.$api.generic.patch(`${this.route}/${u.id}/`, u.payload))
				}

				if (requests.length > 0) await Promise.all(requests)

				this.createwithsuccess = true
				this.datavalues = (this.datavalues || []).map((v) => ({ ...v, _dirty: false }))
			} catch (e) {
				this.submitErrorMsg =
					e?.response?.data?.error || e?.message || String(e)
			} finally {
				this.loadingcreate = false
			}
		},

		onUpdate(input) {
			this.updateErrorMsg = null
			if (input) input._dirty = true
		},

		async getData() {
			this.loading = true
			this.doallaction = true
			this.submitErrorMsg = null
			this.loadErrorMsg = null
			this.updateErrorMsg = null
			this.deleteErrorMsg = null

			try {
				// this.get = "a=1&b=2"
				const query = {}
				if (this.get) {
					for (const [k, v] of new URLSearchParams(this.get)) {
						if (v !== "" && v != null) query[k] = v
					}
				}

				const data = await this.$api.generic.get(`${this.route}/`, query)
				const rows = Array.isArray(data) ? data : (data?.results || [])

				if (rows.length > 0) this.datavalues = []

				for (const details of rows) {
					this.datavalues.push(details)
				}

				this.datavalues = this.datavalues.map((v) => ({
					...v,
					_localId:
						v._localId ||
						(Date.now().toString(36) + Math.random().toString(36).slice(2)),
				}))
			} catch (e) {
				this.loadErrorMsg =
					e?.response?.data?.error || e?.message || String(e)
			} finally {
				this.loading = false
			}
		},

		addField(value, fieldType) {
			fieldType.push({
				value: "",
				_localId: Date.now().toString(36) + Math.random().toString(36).slice(2),
			})
		},

		async removeField(index, fieldType) {
			this.deleteErrorMsg = null

			const pushEmptyIfNeeded = () => {
				if (fieldType.length === 0) {
					fieldType.push({
						value: "",
						_localId: Date.now().toString(36) + Math.random().toString(36).slice(2),
					})
				}
			}

			const row = fieldType?.[index]
			if (!row) return

			if (row.id !== undefined && row.id !== null) {
				try {
					await this.$api.generic.delete(`${this.route}/${row.id}/`)
					fieldType.splice(index, 1)
					pushEmptyIfNeeded()
				} catch (e) {
					this.deleteErrorMsg =
						e?.response?.data?.error || e?.message || String(e)
				}
			} else {
				fieldType.splice(index, 1)
				pushEmptyIfNeeded()
			}
		},
	}
}
</script>