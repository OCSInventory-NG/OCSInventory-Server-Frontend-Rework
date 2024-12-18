<template>
	<div 
		:id="id" 
		class="datatable-custom"
	>
		<!-- Header datatable -->
		<div class="header-table">
			<div class="row responsive">
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
					class="col-1" 
				>
					<b-button-group class="mr-1">
						<download-excel
							:data="json_data"
							:fields="json_fields"
							type="xlsx"
							:name="title+'_export.xlsx'"
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

				<!-- Import template -->
				<div
					v-if="importtemplate"
					class="col-1"
				>
					<ImportTemplateModal
						@reloadDatatable="reloadDatatable"
					/>
				</div>

				<!-- Attribute package -->
				<div
					v-if="candeploy"
					class="col-1"
				>
					<b-button-group class="mr-1">
						<PackageResultModal
							:items="(multisearch && selected.length == 0) ? rowdata : selected"
						/>
					</b-button-group>
				</div>

				<!-- Show/Hide columns -->
				<div 
					v-if="canshowhide"
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
							<label v-else-if="$te('generic.'+field.key)">{{ $t('generic.'+field.key) }}</label>
							<label v-else>{{ field.key }}</label>
						</b-dropdown-item>
					</b-dropdown>
				</div>

				<!-- Number per page-->
				<div 
					:class="(canshowhide) ? 'col-1' : 'col-2'" 
					align="right"
				>
					<v-select
						id="per-page-select"
						v-model="perPage"
						:options="pageOptions"
						:reduce="text => text.value"
						:clearable="false"
						label="text"
						class="datatable-btn"
					/>
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
				bordered
				:select-mode="selectMode"
				:items="rowdata" 
				:fields="visibleFields"
				:sort-by="sortBy"
				:sort-desc="sortDesc"
				:per-page="perPage"
				:current-page="currentPage"
				:filter="filter"
				primary-key="id"
				style="white-space: pre-line;"
				class="table-vcenter"
				show-empty
				@filtered="onFiltered"
				@row-selected="onRowSelected"
				@row-unselected="onRowUnselected"
			>
				<!-- No data available -->
				<template #empty="">
					{{ $t('generic.no_data') }}
				</template>

				<!-- Selected row -->
				<template #head(selected)="">
					<b-form-group>
						<input 
							v-model="isChecked"
							type="checkbox"
						>
					</b-form-group>
				</template>

				<template #cell(selected)="row">
					<!-- If row is selected -->
					<template v-if="selected.findIndex(v => v.id === row.item.id) != -1">
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
					<router-link 
						:to="'/inventory/netdevices/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.netdevices }}
					</router-link>
				</template>

				<!-- Assets redirection -->
				<template 
					v-if="canaccessdetails"
					#cell(name)="row"
				>
					<router-link  
						:to="'/inventory/'+redirectto+'/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.name }}
					</router-link>
				</template>

				<!-- Netdevices redirection -->
				<template 
					v-if="canaccessdetails"
					#cell(netname)="row"
				>
					<router-link  
						:to="'/inventory/'+redirectto+'/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.netname }}
					</router-link>
				</template>

				<!-- Netdevices redirection -->
				<template 
					v-if="title == 'usesavesearch'"
					#cell(searchname)="row"
				>
					<a
						class="ocs-link"
						@click="useSaveSearch(row.item.id)"
					>
						{{ row.item.searchname }}
					</a>
				</template>

				<template #cell(error)="row">
					<span style="color:#ff0000">
						{{ row.item.error }}
					</span>
				</template>

				<template #cell(waiting)="row">
					<span style="color:#c8d3e1">
						{{ row.item.waiting }}
					</span>
				</template>

				<template #cell(success)="row">
					<span style="color:#2fb344">
						{{ row.item.success }}
					</span>
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
							<button 
								v-if="caneditsnmptemplate"
								:title="$t('template.edittemplate')"
								class="btn btn-ghost-dark"
								@click="goToEditSnmpTemplate(row.item.id)"
							>
								<font-awesome-icon 
									:icon="['fas', 'pencil']"
								/>
							</button>
							<button 
								v-if="canviewaction"
								:title="$t('deployment.manageaction')"
								class="btn btn-ghost-dark"
								@click="goToEditPackage(row.item.id)"
							>
								<font-awesome-icon 
									:icon="['fas', 'gear']"
								/>
							</button>
							<button 
								v-if="canviewruleaction"
								:title="$t('rule.managerule')"
								class="btn btn-ghost-dark"
								@click="goToEditRule(row.item.id)"
							>
								<font-awesome-icon 
									:icon="['fas', 'gear']"
								/>
							</button>
							<button 
								v-if="canviewhistory"
								:title="$t('deployment.viewhistory')"
								class="btn btn-ghost-info"
								@click="goToPackageHistory(row.item.id)"
							>
								<font-awesome-icon 
									:icon="['fas', 'chart-simple']"
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
								v-bind="{ id: row.item.id || row.item.identifier }"
								:update="true"
								@reloadDatatable="reloadDatatable"
							/>
							<!-- Delete button -->
							<DeleteItemModal
								v-if="candelete"
								:id="row.item.id || row.item.identifier"
								:ids="(deletemultiple) ? deleteids[row.item.id] : []"
								:name="row.item.name 
									|| row.item.username 
									|| row.item.identifier 
									|| $t('generic.removeselection')"
								:parameter="deleterte"
								:multiple="deletemultiple"
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
				<b-pagination
					v-model="currentPage"
					:total-rows="totalRows"
					:per-page="perPage"
					align="right"
					size="sm"
				/>
			</b-col>
			<b-col align="right">
				<!-- Delete button -->
				<DeleteItemModal
					v-if="candelete"
					:ids="selectedids"
					:name="$t('generic.removeselection')"
					:parameter="deleterte"
					:multiple="true"
					@reloadDatatable="reloadDatatable"
				/>
			</b-col>
		</b-row>
	</div>
</template>

<script>
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal.vue'
import ImportTemplateModal from '@/components/Modals/ImportItem/ImportTemplateModal.vue'
import DoAllActionsItemModal from '@/components/Modals/DoAllActionsItem/DoAllActionsItemModal.vue'
import PackageResultModal from '@/components/Modals/Item/PackageResultModal.vue'
import NetworkGroupModal from '@/components/Modals/Item/NetworkGroupModal.vue'
import AccountinfoModal from '@/components/Modals/Item/AccountinfoModal.vue'
import AssetGroupModal from '@/components/Modals/Item/AssetGroupModal.vue'
import AutomaticActionModal from '@/components/Modals/Item/AutomaticActionModal.vue'
import GroupModal from '@/components/Modals/Item/GroupModal.vue'
import NetdeviceModal from '@/components/Modals/Item/NetdeviceModal.vue'
import NetworkModal from '@/components/Modals/Item/NetworkModal.vue'
import SaveSearchModal from '@/components/Modals/Item/SaveSearchModal.vue'
import PackageModal from '@/components/Modals/Item/PackageModal.vue'
import RuleModal from '@/components/Modals/Item/RuleModal.vue'
import UserModal from '@/components/Modals/Item/UserModal.vue'
import SnmpModal from '@/components/Modals/Item/SnmpModal.vue'
import SnmpScannerModal from '@/components/Modals/Item/SnmpScannerModal.vue'
import EditTemplate from '@/pages/Configuration/Template/EditTemplate.vue'

export default {
	name: 'Datatable',
	components: {
		DeleteItemModal,
		DoAllActionsItemModal,
		ImportTemplateModal,
		SaveSearchModal,
		UserModal,
		AccountinfoModal,
		NetworkGroupModal,
		AssetGroupModal,
		AutomaticActionModal,
		GroupModal,
		NetdeviceModal,
		NetworkModal,
		RuleModal,
		PackageModal,
		PackageResultModal,
		SnmpModal,
		SnmpScannerModal,
		EditTemplate
	},
	props: {
		title: { type: String, default: '' },
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
		id: { type: String, default: '' },
		editcomponent: { type: String, default: '' },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		usecheckbox: { type: Boolean, default: true },
		canexport: { type: Boolean, default: true },
		canedittemplate: { type: Boolean, default: false },
		caneditsnmptemplate: { type: Boolean, default: false },
		importtemplate: { type: Boolean, default: false },
		caneditpackage: { type: Boolean, default: false },
		canaddvalue: { type: Boolean, default: false },
		canviewaction: { type: Boolean, default: false },
		canaccesschild: { type: Boolean, default: false },
		canaccessdetails: { type: Boolean, default: false },
		titlevalue: { type: String, default: '' },
		adddvalueroute: { type: String, default: '' },
		reconciliationname: { type: String, default: '' },
		translationkey: { type: String, default: '' },
		canviewhistory: { type: Boolean, default: false },
		canviewruleaction: { type: Boolean, default: false },
		canshowhide: { type: Boolean, default: true },
		candeploy: { type: Boolean, default: false },
		multisearch: { type: Boolean, default: false },
		deletemultiple: { type: Boolean, default: false },
		deleteids: { type: Array, default: null }
	},
	data() {
		return {
			// Pagination parameters
			perPage: 5,
			currentPage: 1,
			pageOptions: [
				{ value: 5, text: "5" },
				{ value: 10, text: "10" },
				{ value: 25, text: "25" },
				{ value: 100, text: "100" },
				{ value: 250, text: "250" },
				{ value: 500, text: "500" },
				{ value: 1000, text: "1000" },
			],
			totalRows: 1,
			// Datatable datas
			fields: [],
			// Search parameter
			filter: null,
			// Select row parameter
			selectMode: 'multi',
			selected: [],
			selectedids: [],
			isChecked: false,
			// Sort datatable parameters
			sortDesc: null,
			sortBy: null,
			// Export parameters
			json_fields: {},
			json_data: [],
			redirectto: null,
			deleterte: null,
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
			//localStorage.setItem(this.title, JSON.stringify(this.fields))
			return this.fields.filter(field => field.visible)
		}
	},
	watch: {
		rowdata: function () {
			this.totalRows = this.rowdata.length
		},
		isChecked: function () {
			if(this.isChecked) {
				this.$refs.selectableTable.selectAllRows()
			} else {
				this.$refs.selectableTable.clearSelected()
				this.selected = []
			}
			this.attributePackage()
		}
	},
	created() {
		if(this.title == "asset/bases") {
			this.redirectto = "asset"
		} else {
			this.redirectto = this.title
		}

		if(this.title == "assetgroups") {
			this.deleterte = "asset/groups"
		} else {
			this.deleterte = this.title
		}

		if(this.usecheckbox == true) {
			this.fields.push({
				key: "selected", 
				label: this.$t('generic.selected'), 
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
			Object.values(this.rowheader).forEach( data => {
				var visible = true
				if(data == "sections") {
					visible = false
				}

				var array = {
					key: data,
					label: (this.$te(this.translationkey+data)) ? this.$t(this.translationkey+data) : data,
					sortable: true,
					visible: visible,
				}
				
				// Initialize CSV export header
				this.json_fields[data] = data
				
				// Initialize datatable header
				var index = this.fields.findIndex(x => x.key==data);
				index === -1 ? this.fields.push(array) : null
			})
		}

		var actions = {
			key: "actions", 
			label: this.$t('generic.actions'), 
			sortable: false ,
			visible: true,
		}

		if(this.canedit == true || this.candelete == true || this.canviewhistory) {
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
			this.json_data = filteredItems
			this.currentPage = 1
		},
		onRowSelected(item) {
			this.selected.push(item)
			this.selectedids.push(item.id)
			this.attributePackage()
		},
		onRowUnselected(item) {
			this.selected.splice(
				this.selected.findIndex(
					v => v.id === item.id
				),
				1
			)
			this.selectedids.splice(
				this.selectedids.indexOf(item.id),
				1
			)
			this.attributePackage()
		},
		reloadDatatable() {
			this.$emit('reloadDatatable')
		},
		attributePackage() {
			this.$emit('attributePackage', this.selected)
		},
		onSave() {
			this.$emit('reloadDatatable', this.rowdata)
		},
		goToEditTemplate(id){
			this.$router.push('/configurations/templates/'+id); 
		},
		goToEditSnmpTemplate(id){
			this.$router.push('/configurations/snmp/'+id); 
		},
		goToEditPackage(id){
			this.$router.push('/deployment/packages/'+id); 
		},
		goToNetdevices(id) {
			this.$router.push('/inventory/netdevice/'+id); 
		},
		goToPackageHistory(id){
			this.$router.push('/deployment/history/'+id); 
		},
		goToEditRule(id){
			this.$router.push('/configurations/rules/'+id); 
		},
		useSaveSearch(id) {
			this.$emit('useSaveSearch', id)
		}
	}
}
</script>