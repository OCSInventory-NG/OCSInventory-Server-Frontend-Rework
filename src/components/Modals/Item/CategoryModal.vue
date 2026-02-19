<template>
	<div id="category-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addcategory')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addcategory') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('template.editcategory')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="categorymodal" 
			v-model="categorymodal"
			:title="(!update) ? $t('template.addcategory') : $t('template.editcategory')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addcategory') : $t('template.editcategory') }}
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
							:label="$t('inventory.description')" 
							label-for="description"
						>
							<b-form-input
								id="name"
								v-model="row.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="update">
					<b-col>
						<b-form-group
							:label="$t('template.sections')"
							label-for="sections"
						>
							<multiselect
								v-model="selectedsections"
								:options="sections"
								:multiple="true"
								:close-on-select="false"
								:clear-on-select="false"
								:preserve-search="true"
								:select-label="$t('generic.selectlabel')"
								:deselect-label="$t('generic.deselected')"
								:placeholder="$t('generic.selectplaceholder')"
								:selected-label="$t('generic.selected')"
								label="text"
								track-by="value"
							>
								<template #selection="{ values, isOpen }">
									<span
										v-if="values.length"
										v-show="!isOpen"
										class="multiselect__single"
									>{{ values.length }} {{ $t('generic.selectedoptions') }}
									</span>
								</template>
							</multiselect>
						</b-form-group>
						<br>
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
	name: "CategoryModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				name: null,
				description: null,
				inventory_sections: []
			},
			categorymodal: false,
			sections: [],
			selectedsections: [],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.categorymodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null,
					inventory_sections: []
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.categorymodal = true
			this.row = {
				name: null,
				description: null,
				inventory_sections: [],
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getCategory(id)
			}
		},

		async getCategory(id) {
			try {
				const data = await this.$api.generic.get(`categories/${id}/`)
				this.row = data

				this.errormsg = null
				this.errored = false

				await this.getTemplates()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				this.loading = false
			}
		},

		async getTemplates() {
			try {
				const data = await this.$api.generic.get("templates/", { expand: "sections" })

				this.sections = []
				this.selectedsections = []

				for (const template of data) {
					for (const section of template.sections) {
						const entry = {
							value: section.id,
							text: template.name.concat(" - ", section.name),
						}

						this.sections.push(entry)

						if (this.row.inventory_sections.includes(section.id)) {
							this.selectedsections.push(entry)
						}
					}
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("categories/", this.row)
				} else {
					this.row.inventory_sections = this.selectedsections.map(
						(selected) => selected.value
					)

					await this.$api.generic.patch(
						`categories/${this.row.id}/`,
						this.row
					)
				}

				this.createwithsuccess = true
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