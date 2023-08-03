<template>
	<div 
		:id="id" 
		class="datatable-custom"
	>
		<!-- Header datatable -->
		<div class="header-table">
			<div class="row">
				<!-- Search bar -->
				<div class="input-icon col">
					<b-form-input 
						id="filter-input" 
						v-model="filter"
						:placeholder="$t('generic.search')"
						type="search"
						class="form-control"
					/>
					<span class="input-icon-addon">
						<font-awesome-icon 
							:icon="['fas', 'magnifying-glass']"
						/>
					</span>
				</div>

				<!-- Export Excel -->
				<div
					v-if="canexport"
					class="col-2" 
				>
					<b-button-group class="mr-1">
						<download-excel
							:data="json_data"
							:fields="json_fields"
							type="csv"
							name="export.xls"
						>
							<button 
								id="export-row"
								:title="$t('generic.download')"
								class="form-control btn datatable-btn"
							>
								<font-awesome-icon 
									:icon="['fas', 'download']"
								/>
							</button>
						</download-excel>
					</b-button-group>
				</div>

				<!-- Export template -->
				<div
					v-if="exporttemplate"
					class="col"
				>
					<ImportTemplateModal
						@reloadDatatable="reloadDatatable"
					/>
				</div>

				<!-- Save configuration -->
				<div
					v-if="caneditconfig"
					class="col"
				>
					<b-button-group class="mr-1">
						<b-button 
							:title="$t('configuration.save_config')"
							variant="success"
							class="add-button datatable-btn"
							@click="onSave"
						>
							<font-awesome-icon 
								:icon="['fas', 'check']"
							/>
						</b-button>
					</b-button-group>
				</div>

				<!-- Show/Hide columns -->
				<div 
					class="col" 
					align="right"
				>
					<b-dropdown
						:text="$t('generic.show_hide')"
						variant="bg-light"
						class="datatable-btn"
					>
						<b-dropdown-item
							v-for="field in fields" 
							:key="field.key"
							v-model="field.visible"
							:active="!field.visible"
							@click="field.visible = !field.visible"
						>
							<label v-if="$te(translationkey+field.key)">{{ $t(translationkey+field.key) }}</label>
							<label v-else>{{ $t('generic.'+field.key) }}</label>
						</b-dropdown-item>
					</b-dropdown>
				</div>
			</div>
		</div>

		<!-- Total row number -->
		<div align="center">
			<p>{{ totalRows }} {{ $t('generic.result') }}</p>
		</div>

		<!-- Datatable -->
		<div class="overflow-auto">
			<b-table
				id="data-list"  
				ref="selectableTable"
				responsive
				selectable
				striped
				hover
				:select-mode="selectMode"
				:items="rowdata" 
				:fields="visibleFields"
				:sort-by.sync="sortBy"
				:sort-desc.sync="sortDesc"
				:per-page="perPage"
				:current-page="currentPage"
				:filter="filter"
				primary-key="id"
				style="white-space: pre-line;"
				class="table-vcenter"
				show-empty
				@filtered="onFiltered"
				@row-selected="onRowSelected"
			>
				<!-- No data available -->
				<template #empty="">
					{{ $t('generic.no_data') }}
				</template>

				<!-- Selected row -->
				<template #head(selected)="">
					<b-form-group>
						<input 
							type="checkbox" 
							@click="selectAllRows"
						>
					</b-form-group>
				</template>

				<template #cell(selected)="{ rowSelected }">
					<!-- If row is selected -->
					<template v-if="rowSelected">
						<font-awesome-icon 
							:icon="['far', 'square-check']"
						/>
					</template>
					<!-- If row is not selected -->
					<template v-else>
						<font-awesome-icon 
							:icon="['far', 'square']"
						/>
					</template>
				</template>

				<!-- Netdevice redirection -->
				<template 
					v-if="canaccesschild"
					#cell(netdevices)="row"
				>
					<a 
						:href="'/ocsreports/inventory/netdevices/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.netdevices }}
					</a>
				</template>

				<!-- Assets redirection -->
				<template 
					v-if="canaccessdetails"
					#cell(name)="row"
				>
					<a 
						:href="'/ocsreports/inventory/'+title+'/details/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.name }}
					</a>
				</template>

				<!-- Netdevices redirection -->
				<template 
					v-if="canaccessdetails"
					#cell(netname)="row"
				>
					<a 
						:href="'/ocsreports/inventory/'+title+'/details/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.netname }}
					</a>
				</template>

				<!-- Edit row for configuration -->
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

				<!-- Actions buttons -->
				<template #cell(actions)="row">
					<b-button-toolbar>
						<b-button-group class="mx-1">
							<button 
								v-if="canedittemplate"
								:title="$t('template.edittemplate')"
								class="btn btn-ghost-dark"
								@click="goToEditTemplate(row.item.id)"
							>
								<font-awesome-icon 
									:icon="['fas', 'pencil']"
								/>
							</button>
							<!-- Do all actions button -->
							<DoAllActionsItemModal 
								v-if="canaddvalue && datatypes.includes(row.item.datatype)"
								:id="row.item.id"
								:route="adddvalueroute"
								:titlevalue="titlevalue"
								:reconciliationname="reconciliationname"
								:translationkey="translationkey"
								@reloadDatatable="reloadDatatable"
							/>
							<!-- Edit button -->
							<component 
								:is="editcomponent"
								v-if="canedit"
								v-bind="{ id: row.item.id }"
								@reloadDatatable="reloadDatatable"
							/>
							<!-- Delete button -->
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
			<b-col>
				<b-form-group
					label="Per page"
					label-for="per-page-select"
					label-cols-sm="2"
					label-align-sm=""
					label-size="sm"
				>
					<b-form-select
						id="per-page-select"
						v-model="perPage"
						:options="pageOptions"
						class="form-select"
						size="sm"
					/>
				</b-form-group>
			</b-col>

			<b-col>
				<b-pagination
					v-model="currentPage"
					:total-rows="totalRows"
					:per-page="perPage"
					align="right"
					size="sm"
				/>
			</b-col>
		</b-row>
	</div>
</template>

<script>
import i18n from '../../i18n'
import EditUserModal from '@/components/Modals/EditItem/EditUserModal'
import EditGroupModal from '@/components/Modals/EditItem/EditGroupModal'
import EditAccountinfoModal from '@/components/Modals/EditItem/EditAccountinfoModal'
import EditNetworkGroupModal from '@/components/Modals/EditItem/EditNetworkGroupModal'
import EditNetworkModal from '@/components/Modals/EditItem/EditNetworkModal'
import EditNetdeviceModal from '@/components/Modals/EditItem/EditNetdeviceModal'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'
import ImportTemplateModal from '@/components/Modals/ImportItem/ImportTemplateModal'
import DoAllActionsItemModal from '@/components/Modals/DoAllActionsItem/DoAllActionsItemModal'

export default {
	name: 'Datatable',
	components: {
		EditUserModal,
		EditGroupModal,
		EditAccountinfoModal,
		EditNetworkGroupModal,
		EditNetworkModal,
		EditNetdeviceModal,
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
		canaccesschild: { type: Boolean, default: false },
		canaccessdetails: { type: Boolean, default: false },
		titlevalue: { type: String, default: '' },
		adddvalueroute: { type: String, default: '' },
		reconciliationname: { type: String, default: '' },
		translationkey: { type: String, default: '' },
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
				label: i18n.t('generic.selected'), 
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
						label: i18n.t(this.translationkey+data),
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
			label: i18n.t('generic.actions'), 
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
			this.$router.push('/configurations/templates/edittemplate/'+id); 
		},
		goToNetdevices(id) {
			this.$router.push('/inventory/netdevice/'+id); 
		}
	}
}
</script>