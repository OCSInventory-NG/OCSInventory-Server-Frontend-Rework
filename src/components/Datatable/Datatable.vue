<template>
	<div 
		:id="id" 
		class="datatable-custom"
	>
		<div class="header-table">
			<h4>{{ $t(title) }}</h4>
			<!-- Search bar -->
			<b-input-group class="mb-1 input-filter">
				<b-input-group-prepend 
					is-text 
					class="icon-btn"
				>
					<b-icon icon="search" />
				</b-input-group-prepend>
				<b-form-input 
					id="filter-input" 
					v-model="filter"
					:placeholder="$t('search')"
					type="search"
				/>
			</b-input-group>

			<b-button-toolbar v-if="canexport">
				<b-button-group class="mr-1">
					<download-excel
						:data="json_data"
						:fields="json_fields"
						type="csv"
						name="export.xls"
					>
						<b-button 
							title="Export CSV" 
							class="export-btn"
						>
							<b-icon 
								icon="download" 
								aria-hidden="true"
							/>
						</b-button>
					</download-excel>
				</b-button-group>
			</b-button-toolbar>

			<b-button-toolbar v-if="exporttemplate">
				<b-button-group class="mr-1">
					<vue-blob-json-csv
						:data="selected || rowdata"
						tag-name="button"
						file-type="json"
						file-name="templates"
						class="btn export-btn btn-secondary"
					>
						<b-icon 
							icon="download" 
							aria-hidden="true"
						/>
					</vue-blob-json-csv>
				</b-button-group>
			</b-button-toolbar>

			<b-button-toolbar v-if="exporttemplate">
				<b-button-group class="mr-1">
					<ImportTemplateModal
						@reloadDatatable="reloadDatatable"
					/>
				</b-button-group>
			</b-button-toolbar>			

			<b-button-toolbar v-if="caneditconfig">
				<b-button-group class="mr-1">
					<b-button 
						:title="$t('save_config')"
						variant="success"
						class="add-button"
						@click="onSave"
					>
						<font-awesome-icon 
							:icon="['fas', 'check']"
						/>
					</b-button>
				</b-button-group>
			</b-button-toolbar>

			<!-- Show/Hide columns -->
			<b-dropdown 
				:text="$t('show_hide')"
				class="mx-1"
				variant="dark"
				right 
			>
				<b-dropdown-item
					v-for="field in fields" 
					:key="field.key"
					v-model="field.visible"
					:active="!field.visible"
					@click="field.visible = !field.visible"
				>
					{{ $t(field.key) }}
				</b-dropdown-item>
			</b-dropdown>
		</div>

		<div align="center">
			<p>{{ totalRows }} {{ $t('result') }}</p>
		</div>

		<br><br>

		<!-- Datatable -->
		<div class="overflow-auto">
			<b-table 
				id="data-list" 
				ref="selectableTable" 
				:select-mode="selectMode" 
				:items="rowdata"
				:fields="visibleFields"
				:sort-by.sync="sortBy"
				:sort-desc.sync="sortDesc"
				:per-page="perPage"
				:current-page="currentPage"
				:filter="filter"
				striped
				hover
				responsive
				selectable
				primary-key="id"
				style="white-space: pre-line;"
				@filtered="onFiltered"
				@row-selected="onRowSelected"
			>
				<template #head(selected)="">
					<b-form-group>
						<input 
							type="checkbox" 
							@click="selectAllRows"
						>
					</b-form-group>
				</template>

				<template #cell(selected)="{ rowSelected }">
					<template v-if="rowSelected">
						<b-icon icon="check-square-fill" />
						<span class="sr-only">Selected</span>
					</template>
					<template v-else>
						<b-icon icon="dash-square" />
						<span class="sr-only">Not selected</span>
					</template>
				</template>

				<template #cell(value)="row">
					<div 
						v-for="(value, key) in row.item.value"
						:key="key"
					>
						<b-form-input 
							:id="row.item.name"
							v-model="row.item.value[key]"
							class="config-button"
						/>
					</div>
				</template>

				<template #cell(actions)="row">
					<b-button-toolbar>
						<b-button-group class="mr-1">
							<b-button 
								v-if="canedittemplate"
								:title="$t('edittemplate')"
								variant="primary"
								@click="goToEditTemplate(row.item.id)"
							>
								<b-icon 
									icon="pencil-square" 
									aria-hidden="true"
								/>
							</b-button>
							<DoAllActionsItemModal 
								v-if="canaddvalue && datatypes.includes(row.item.datatype)"
								:id="row.item.id"
								:route="adddvalueroute"
								:titlevalue="titlevalue"
								:reconciliationname="reconciliationname"
								@reloadDatatable="reloadDatatable"
							/>
							<component 
								v-if="canedit"
								:is="editcomponent"
								v-bind="{ id: row.item.id }"
								@reloadDatatable="reloadDatatable"
							/>
							<delete-item-modal 
								v-if="candelete"
								:id="row.item.id"
								:name="row.item.name || row.item.username"
								:parameter="title"
								@reloadDatatable="reloadDatatable"
							/>
						</b-button-group>
					</b-button-toolbar>
				</template>
			</b-table>
		</div>

		<!-- Pagination -->
		<b-row class="pagination-align">
			<b-col 
				sm="3" 
				md="3" 
				class="my-1"
			>
				<b-form-group
					label="Per page"
					label-for="per-page-select"
					label-cols-sm="6"
					label-cols-md="4"
					label-cols-lg="3"
					label-align-sm="right"
					label-size="sm"
					class="mb-0"
				>
					<b-form-select
						id="per-page-select"
						v-model="perPage"
						:options="pageOptions"
						size="sm"
					/>
				</b-form-group>
			</b-col>

			<b-col 
				sm="3" 
				md="3" 
				class="my-1"
			>
				<b-pagination
					v-model="currentPage"
					:total-rows="totalRows"
					:per-page="perPage"
					align="fill"
					size="sm"
					class="my-0"
				/>
			</b-col>
		</b-row>
	</div>
</template>

<script>
import i18n from '../../i18n'
import EditGroupModal from '@/components/Modals/EditItem/EditGroupModal'
import EditUserModal from '@/components/Modals/EditItem/EditUserModal'
import EditAccountinfoModal from '@/components/Modals/EditItem/EditAccountinfoModal'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'
import ImportTemplateModal from '@/components/Modals/ImportItem/ImportTemplateModal'
import DoAllActionsItemModal from '@/components/Modals/DoAllActionsItem/DoAllActionsItemModal'

export default {
	name: 'Datatable',
	components: {
		EditGroupModal,
		EditUserModal,
		EditAccountinfoModal,
		DeleteItemModal,
		DoAllActionsItemModal,
		ImportTemplateModal
	},
	props: {
		title: { type: String, default: '' },
		rowdata: { type: Array, default: null },
		id: { type: String, default: '' },
		editcomponent: { type: String, default: '' },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		usecheckbox: { type: Boolean, default: true },
		canexport: { type: Boolean, default: true },
		caneditconfig: { type: Boolean, default: false },
		canedittemplate: { type: Boolean, default: false },
		exporttemplate: { type: Boolean, default: false },
		canaddvalue: { type: Boolean, default: true },
		titlevalue: { type: String, default: '' },
		adddvalueroute: { type: String, default: '' },
		reconciliationname: { type: String, default: '' },
	},
	data() {
		return {
			// Pagination parameters
			perPage: 5,
			currentPage: 1,
			pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
			totalRows: 1,
			// Datatable datas
			fields: [],
			// Search parameter
			filter: null,
			// Select row parameter
			selectMode: 'multi',
			selected: null,
			// Sort datatable parameters
			sortDesc: null,
			sortBy: null,
			// Export parameters
			json_fields: {},
			json_data: [],
			json_meta: [
				[
					{
						key: "charset",
						value: "utf-8",
					},
				],
			],
			datatypes: [
				'SELECT',
				'CHECKBOX'
			]
		};
	},
	computed: {
		// Initialize visible fields
		visibleFields() {
			localStorage.removeItem(this.title)
			localStorage.setItem(this.title, JSON.stringify(this.fields))
			return this.fields.filter(field => field.visible)
		}
	},
	watch: {
		rowdata: function () {
			this.totalRows = this.rowdata.length
		},
	},
	created() {
		if(this.usecheckbox == true) {
			this.fields.push({
				key: "selected", 
				label: "", 
				sortable: false ,
				visible: true,
			})
		}

		if(localStorage.getItem(this.title) != null && localStorage.getItem(this.title) != "") {
			JSON.parse(localStorage.getItem(this.title)).forEach( visible => {
				if(visible.key != "selected" && visible.key != "actions") {
					var arrayVisible = visible
					// Initialize CSV export header
					this.json_fields[visible.key] = visible.key
					// Initialize datatable header
					var index = this.fields.findIndex(x => x.key==visible);
					index === -1 ? this.fields.push(arrayVisible) : null
				}
			})
		} else {
			this.rowdata.forEach(details => {
				Object.keys(details).forEach( data => {
					var visible = true
					if(data == "sections") {
						visible = false
					}

					var array = {
						key: data,
						label: i18n.t(data),
						sortable: true,
						visible: visible,
					}
					
					// Initialize CSV export header
					this.json_fields[data] = data
					
					// Initialize datatable header
					var index = this.fields.findIndex(x => x.key==data);
					index === -1 ? this.fields.push(array) : null
				})
			})
		}

		var actions = {
			key: "actions", 
			label: i18n.t('actions'), 
			sortable: false ,
			visible: true,
		}

		if(this.canedit == true || this.candelete == true) {
			this.fields.push(actions)
		}
	},
	mounted() {
		// Set the initial number of items
		this.totalRows = this.rowdata.length
		// Initialize data to export
		this.json_data = this.rowdata
	},
	methods: {
		// Trigger pagination to update the number of buttons/pages due to filtering
		onFiltered(filteredItems) {
			this.totalRows = filteredItems.length
			this.currentPage = 1
		},
		// Trigger selection rows
		selectAllRows() {
			if(this.$refs.selectableTable.selectedRows[0] === true) {
				this.$refs.selectableTable.clearSelected()
				this.selected = this.rowdata
			} else {
				this.$refs.selectableTable.selectAllRows()
			}
		},
		onRowSelected(items) {
			this.selected = items
			if(this.selected.length == 0) {
				this.selected = this.rowdata
			}
		},
		reloadDatatable() {
			this.$emit('reloadDatatable')
		},
		onSave() {
			this.$emit('reloadDatatable', this.rowdata)
		},
		goToEditTemplate(id){
			this.$router.push('/ocsreports/configurations/templates/edittemplate/'+id); 
		},
	}
};
</script>