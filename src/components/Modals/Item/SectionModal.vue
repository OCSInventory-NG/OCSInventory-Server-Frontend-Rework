<template>
	<div id="section-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addsection')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						:disabled="viewOnly"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addsection') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button
				:title="$t('template.editsection')"
				class="btn btn-ghost-dark"
				:disabled="viewOnly"
				@click="loadData()"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="sectionmodal" 
			v-model="sectionmodal"
			:title="(!update) ? $t('template.addsection') : $t('template.editsection')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addsection') : $t('template.editsection') }}
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
						v-if="createerror"
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
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="row.name"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('template.category')" 
							label-for="category"
						>
							<v-select
								id="category"
								v-model="selectedcategory" 
								:options="categories" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										v-bind="attributes"
										v-on="events"
									>
								</template>
							</v-select>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('template.retrieval_method')" 
							label-for="retrieval_method"
						>
							<v-select
								id="retrieval_method"
								v-model="row.retrieval_method" 
								:options="(routetype != 'snmp' && routetypemut != 'snmp') ?
									methodoptions : snmpretrievalmethodoptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="routetype != 'snmp' && routetypemut != 'snmp'">
					<b-col>
						<b-form-group
							:label="$t('template.target')" 
							label-for="target"
						>
							<b-form-input
								id="target"
								v-model="row.target"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="routetype != 'snmp' && routetypemut != 'snmp'">
					<b-col>
						<b-form-group
							:label="$t('template.retrieval_output')" 
							label-for="retrieval_output"
						>
							<v-select
								id="retrieval_output"
								v-model="row.retrieval_output" 
								:options="outputoptions" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										:required="!row.retrieval_output"
										v-bind="attributes"
										v-on="events"
									>
								</template>
							</v-select>
						</b-form-group>
					</b-col>
				</b-row>
				<div 
					v-if="outputoptionoptions[row.retrieval_output]
						&& routetype != 'snmp'
						&& routetypemut != 'snmp'"
				>
					<b-row>
						<b-col>
							<h4>{{ $t('template.retrieval_output_options') }}</h4>
						</b-col>
					</b-row>
					<div
						v-for="(value, key) in outputoptionoptions[row.retrieval_output]"
						:key="key"
					>
						<b-row v-if="value.type == 'text'">
							<b-col>
								<b-form-group
									:label="$t('template.'+value.id)" 
									:label-for="value.id"
								>
									<b-form-input
										:id="value.id"
										v-model="options[value.id]"
									/>
								</b-form-group>
							</b-col>
						</b-row>
						<b-row v-if="value.type == 'number'">
							<b-col>
								<b-form-group
									:label="$t('template.'+value.id)" 
									:label-for="value.id"
								>
									<b-form-input
										:id="value.id"
										v-model="options[value.id]"
										type="number"
									/>
								</b-form-group>
							</b-col>
						</b-row>
						<b-row v-if="value.type == 'checkbox'">
							<b-col>
								<b-form-checkbox
									:id="value.id"
									v-model="options[value.id]"
									:name="value.id"
									:value="true"
									:unchecked-value="value.default"
								>
									{{ $t('template.'+value.id) }}
								</b-form-checkbox>
							</b-col>
						</b-row>
					</div>
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
						>
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
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
	name: "SectionModal",
	props: {
		rowsectiondata: { type: Object, default: null },
		template: { type: Number, required: true },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
		routetype: { type: String, default: "assets" },
		viewOnly: { type: Boolean, default: false }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				id: null,
				name: null,
				retrieval_method: 'FILE',
				retrieval_output: null,
				target: null,
				fields: [],
				template: null,
				options: {}
			},
			snmprow: {
				id: null,
				name: null,
				retrieval_method: "SNMP_GET",
				retrieval_output: "JSON",
				target: "SNMP",
				fields: [],
				template: null,
				options: {}
			},
			routetypemut: "assets",
			sectionmodal: false,
			options : {},
			methodoptions: [
				{ value: 'FILE', text: this.$t('template.FILE') },
				{ value: 'BASH', text: this.$t('template.BASH') },
				{ value: 'PW', text: this.$t('template.PW') },
				{ value: 'CMD', text: this.$t('template.CMD') }
			],
			outputoptions: [
				{ value: 'PTXT', text: this.$t('template.PTXT') },
				{ value: 'JSON', text: this.$t('template.JSON') },
				{ value: 'TBLE', text: this.$t('template.TBLE') },
				{ value: 'REGX', text: this.$t('template.REGX') },
				{ value: 'GREP', text: this.$t('template.GREP') }
			],
			outputoptionoptions: {
				"TBLE": [
					{ id: "use_index", type: "checkbox", default: false },
					{ id: "remove_line", type: "text", default: null }
				],
				"JSON": [
					{ id: "submap", type: "text", default: null }
				],
				"REGX": [
					{ id: "multiple", type: "checkbox", default: false },
					{ id: "separator", type: "text", default: null },
				]
			},
			snmpretrievalmethodoptions: [
				{ value: 'SNMP_GET', text: this.$t('template.SNMP_GET') },
				{ value: 'SNMP_WALK', text: this.$t('template.SNMP_WALK') }
			],
			categories: [],
			selectedcategory: null,
			oldcategory: null,
			allcategories: [],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.sectionmodal = false
				this.createwithsuccess = false
				this.row = {
					id: null,
					name: null,
					retrieval_method: 'FILE',
					retrieval_output: null,
					target: null,
					fields: [],
					options: {}
				}
				this.selectedcategory = null
				this.oldcategory = null
				if (!this.update) {
					this.$emit("reloadTemplate")
				} else {
					this.$emit("reloadSection")
				}
			}, 500)
		}
	},
	created() {
		if(this.$route.path.includes("snmp")) {
			this.routetypemut = "snmp"
		}
	},
	mounted() {
		if(!this.update) {
			if(this.routetype == "snmp" || this.routetypemut == "snmp") {
				this.row = this.snmprow
			}
			this.row.template = this.template
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData() {
			this.loading = true
			this.sectionmodal = true

			if (this.routetype != "snmp" && this.routetypemut != "snmp") {
				this.row = {
					id: null,
					name: null,
					retrieval_method: "FILE",
					retrieval_output: null,
					target: null,
					template: this.template,
					fields: [],
					options: {},
				}
			} else {
				this.row = {
					id: null,
					name: null,
					retrieval_method: "SNMP_GET",
					retrieval_output: "JSON",
					target: "SNMP",
					template: this.template,
					fields: [],
					options: {}
				}
			}

			this.selectedcategory = null
			this.oldcategory = null

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			this.options = {}

			if (this.update && this.rowsectiondata) {
				this.row = JSON.parse(JSON.stringify(this.rowsectiondata))
				this.options = JSON.parse(JSON.stringify(this.row.options || {}))
			}

			await this.getCategories()
		},

		async getCategories() {
			this.categories = []
			this.allcategories = []

			try {
				const data = await this.$api.generic.get("categories/")

				for (const category of data) {
					this.categories.push({
						value: category.id,
						text: category.name,
					})

					if (Array.isArray(category.inventory_sections) && category.inventory_sections.includes(this.row.id)) {
						this.selectedcategory = category.id
						this.oldcategory = category.id
					}
				}

				this.allcategories = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async updateCategories(category, remove = false) {
			const current = Array.isArray(category.inventory_sections) ? category.inventory_sections : []

			let next = []
			if (remove) {
				next = current.filter((sectionId) => sectionId !== this.row.id)
			} else {
				next = current.includes(this.row.id) ? [...current] : [...current, this.row.id]
			}

			const payload = {
				inventory_sections: next,
			}

			await this.$api.generic.patch(`categories/${category.id}/`, payload)
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				const payload = {
					...this.row,
					options: {},
				}

				if (this.outputoptionoptions[payload.retrieval_output] !== undefined) {
					const currentOptions = this.options || {}

					this.outputoptionoptions[payload.retrieval_output].forEach((element) => {
						payload.options[element.id] =
							currentOptions[element.id] !== undefined
								? currentOptions[element.id]
								: element.default
					})
				} else {
					payload.options = payload.options || {}
				}

				if (!this.update) {
					const created = await this.$api.generic.post("sections/", payload)

					this.row.id = created.id

					if (this.selectedcategory) {
						const selectedCat = this.allcategories.find((cat) => cat.id === this.selectedcategory)
						if (selectedCat) {
							await this.updateCategories(selectedCat)
						}
					}

					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				} else {
					const { fields: _fields, ...payloadNoFields } = payload

					await this.$api.generic.patch(`sections/${this.row.id}/`, payloadNoFields)

					if (this.oldcategory && this.oldcategory !== this.selectedcategory) {
						const oldSelectedCat = this.allcategories.find((cat) => cat.id === this.oldcategory)
						if (oldSelectedCat) {
							await this.updateCategories(oldSelectedCat, true)
						}
					}

					if (this.selectedcategory && this.oldcategory !== this.selectedcategory) {
						const selectedCat = this.allcategories.find((cat) => cat.id === this.selectedcategory)
						if (selectedCat) {
							await this.updateCategories(selectedCat, false)
						}
					}

					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				}
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>