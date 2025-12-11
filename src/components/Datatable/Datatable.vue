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

				<!-- Reload datatable -->
				<div
					v-if="canrefresh"
					class="col-1 ocs-col-datatable" 
				>
					<b-button-group class="mr-1">
						<button 
							:title="$t('generic.reload')"
							class="form-control btn datatable-btn"
							@click="reloadDatatable"
						>
							<font-awesome-icon 
								:icon="['fas', 'arrows-rotate']"
								:class="{ 'loading': isReloading }"
							/>
						</button>
					</b-button-group>
				</div>

				<!-- Export Excel -->
				<div
					v-if="canexport"
					class="col-1 ocs-col-datatable" 
				>
					<b-button-group class="mr-1">
						<ExportModal
							:server-side="serverSide"
							:total-rows="totalRows"
							:page-length="pageRows.length"
							:selection-length="selectionLength"
							@confirm="onExportConfirm"
						/>
					</b-button-group>
				</div>

				<!-- Import template -->
				<div
					v-if="importtemplate"
					class="col-1 ocs-col-datatable"
				>
					<ImportTemplateModal
						@reloadDatatable="reloadDatatable"
					/>
				</div>

				<!-- Export template -->
				<div
					v-if="exporttemplate"
					class="col-1 ocs-col-datatable"
				>
					<ExportTemplateModal
						:ids="selectedids"
					/>
				</div>

				<!-- Duplicate item -->
				<div
					v-if="duplicateitem"
					class="col-1 ocs-col-datatable"
				>
					<DuplicateModal
						:route="title"
						:title="titlevalue"
						@reloadDatatable="reloadDatatable"
					/>
				</div>

				<!-- Attribute package -->
				<div
					v-if="candeploy"
					class="col-1 ocs-col-datatable"
				>
					<b-button-group class="mr-1">
						<PackageResultModal
							:items="(multisearch && selected.length == 0) ? rowdata : selected"
						/>
					</b-button-group>
				</div>

				<!-- Mass processing -->
				<div
					v-if="canmassprocessing"
					class="col-1 ocs-col-datatable"
				>
					<b-button-group class="mr-1">
						<MassProcessingModal
							:items="(multisearch && selected.length == 0) ? rowdata : selected"
							@reloadDatatable="reloadDatatable"
						/>
					</b-button-group>
				</div>

				<!-- Scheduler history -->
				<div
					v-if="viewautomationhistory"
					class="col-1 ocs-col-datatable"
				>
					<router-link 
						:to="'/configurations/automations/history'"
						:title="$t('scheduler.see_history')"
						class="btn datatable-btn mr-1"
					>
						<font-awesome-icon 
							:icon="['far', 'file-lines']"
						/>
					</router-link>
				</div>

				<div
					v-if="title == 'asset/bases' && !multisearch"
					class="col-1"
				>
					<AssetGroupModal
						:assetrow="selected"
						:search="[]"
						:datatable="true"
						cssclass="datatable-btn"
					/>
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
							:disabled="field.disabled"
							class="visible-select"
							@click="field.visible = !field.visible"
						>
							<b-col>
								<label v-if="$te(translationkey+field.key)">{{ $t(translationkey+field.key) }}</label>
								<label v-else-if="$te('generic.'+field.key)">{{ $t('generic.'+field.key) }}</label>
								<label v-else>{{ field.key }}</label>
							</b-col>
							<b-col align="right">
								<font-awesome-icon
									v-if="!field.visible"
									:icon="['fas', 'eye-slash']"
									class="mr-3"
								/>
							</b-col>
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
						@option:selected="updateRowPage()"
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
				striped
				hover
				bordered
				:selectable="usecheckbox"
				:select-mode="selectMode"
				:items="rowdata" 
				:fields="visibleFields"
				v-model:sort-by="sortByLocal"
				v-model:sort-desc="sortDescLocal"
				:per-page="serverSide ? 0 : perPage"
				:current-page="serverSide ? 1 : currentPage"
				:filter="serverSide ? '' : filter"
				:no-local-sorting="serverSide"
				:no-local-filtering="serverSide"
				:busy="isbusy"
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

				<template #table-busy>
					<div class="text-center my-3">
						<b-spinner small class="me-2" />
						<span>{{ $t('generic.loading_data') }}</span>
					</div>
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

				<!-- Assets redirection -->
				<template 
					v-if="canaccessdetails || canaccesspackagedetails"
					#cell(asset)="row"
				>
					<router-link  
						:to="'/inventory/'+redirectto+'/'+row.item.asset.id"
						class="ocs-link"
					>
						{{ row.item.asset.name }}
					</router-link>
				</template>

				<!-- Netdevices redirection -->
				<template 
					v-if="canaccessdetails"
					#cell(ip)="row"
				>
					<router-link  
						:to="'/inventory/'+redirectto+'/'+row.item.id"
						class="ocs-link"
					>
						{{ row.item.ip }}
					</router-link>
				</template>

				<!-- Saved search redirection -->
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

				<!-- Scanner assets redirection -->
				<template
					v-if="title == 'snmp/scanner'"
					#cell(assets)="row"
				>
					<a
						class="ocs-link"
						@click="assetsSearch(row.item.identifier)"
					>
						{{ row.item.assets }}
					</a>
				</template>

				<!-- Asset group redirection -->
				<template
					v-if="canaccesspackagedetails"
					#cell(group)="row"
				>
					<router-link
						v-if="row.item.group"
						:to="'/inventory/assetgroups/'+row.item.group.id"
						class="ocs-link"
					>
						{{ row.item.group.name }}
					</router-link>

					<span v-else>
						N/A
					</span>
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
				<!-- Last update -->
				<template #cell(last_update)="row">
					{{ row.item.last_update_formatted }}
				</template>
				<template #cell(last_updated)="row">
					{{ row.item.last_update_formatted }}
				</template>
				<template #cell(timestamp)="row">
					{{ row.item.last_update_formatted }}
				</template>
				<template #cell(date_created)="row">
					{{ row.item.last_update_formatted }}
				</template>
				<template #cell(date)="row">
					{{ row.item.last_update_formatted }}
				</template>

				<!-- Actions buttons -->
				<template #cell(actions)="row">
					<b-button-toolbar>
						<b-button-group class="mx-1">
							<slot
								name="cell(firstActions)"
								:row="row"
							/>
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
							<router-link
								v-if="viewautomationhistory"
								:to="'/configurations/automations/history/'+row.item.id"
								:title="$t('scheduler.see_history')"
								class="btn btn-ghost-dark"
							>
								<font-awesome-icon 
									:icon="['far', 'file-lines']"
								/>
							</router-link>
							<!-- Delete button -->
							<DeleteItemModal
								v-if="candelete && !row.item.is_protected"
								:id="row.item.id || row.item.identifier"
								:ids="(deletemultiple) ? deleteids[row.item.id] : []"
								:name="row.item.name 
									|| row.item.username 
									|| row.item.identifier 
									|| $t('generic.removeselection')"
								:parameter="deleterte"
								:multiple="deletemultiple"
								:removefromgroup="removefromgroup"
								:assetgroupid="assetgroupid"
								:assets="assets"
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
					v-if="candelete && !selected.some(item => item.is_protected)"
					:ids="selectedids"
					:name="$t('generic.removeselection')"
					:parameter="deleterte"
					:multiple="true"
					:removefromgroup="removefromgroup"
					:assetgroupid="assetgroupid"
					:assets="assets"
					@reloadDatatable="reloadDatatable"
				/>
			</b-col>
		</b-row>
	</div>
</template>

<script>
export default {
	name: 'Datatable',
	props: {
		title: { type: String, default: '' },
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
		id: { type: String, default: '' },
		editcomponent: { type: String, default: '' },
		canrefresh: { type: Boolean, default: true },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		usecheckbox: { type: Boolean, default: true },
		canexport: { type: Boolean, default: true },
		canedittemplate: { type: Boolean, default: false },
		caneditsnmptemplate: { type: Boolean, default: false },
		importtemplate: { type: Boolean, default: false },
		exporttemplate: { type: Boolean, default: false },
		duplicateitem: { type: Boolean, default: false },
		caneditpackage: { type: Boolean, default: false },
		canaddvalue: { type: Boolean, default: false },
		canviewaction: { type: Boolean, default: false },
		canaccesschild: { type: Boolean, default: false },
		canaccessdetails: { type: Boolean, default: false },
		canaccesspackagedetails: { type: Boolean, default: false },
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
		deleteids: { type: Array, default: null },
		canmassprocessing: { type: Boolean, default: false },
		// Sort datatable parameters
		sortby: { type: String, default: null },
		sortdesc: { type: String, default: null },
		templateid: { type: Number, default: 0 },
		hiddenfields: { type: Array, default: null },
		// Remove assets from group
		removefromgroup: { type: Boolean, default: false },
		assetgroupid: { type: [String, Number], default: null },
		assets: { type: Array, default: () => [] },
		viewautomationhistory: { type: Boolean, default: false },
		// Server side pagination
		serverSide: { type: Boolean, default: false },
		serverTotalRows: { type: Number, default: 0 },
		isbusy: { type: Boolean, default: false },
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
			sortByLocal: this.sortby,
			sortDescLocal: this.sortdesc,
			// Datatable datas
			fields: [],
			// Search parameter
			filter: null,
			// Select row parameter
			selectMode: 'multi',
			selected: [],
			selectedids: [],
			isChecked: false,
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
			],
			// Reload parameter
			isReloading: false
		};
	},
	computed: {
		// Initialize visible fields
		visibleFields() {
			var key = this.title + "_" + this.templateid
			localStorage.removeItem(key)
			localStorage.setItem(key, JSON.stringify(this.fields))
			return this.fields.filter(field => field.visible)
		},
		pageRows() {
			if (this.serverSide) {
				return Array.isArray(this.rowdata) ? this.rowdata : []
			}
			const source = (this.json_data && this.json_data.length)
				? this.json_data
				: (this.rowdata || [])
			const start = (this.currentPage - 1) * this.perPage
			const end = start + this.perPage
			return source.slice(start, end)
		},

		selectionLength() {
			return Array.isArray(this.selected) ? this.selected.length : 0
		},
	},
	watch: {
		rowdata: function () {
			if (!this.serverSide && Array.isArray(this.rowdata)) {
				this.totalRows = this.rowdata.length
			}
		},
		isChecked: function () {
			if(this.isChecked) {
				const perPage = this.perPage
				const currentPage = this.currentPage

				const start = (currentPage - 1) * perPage
				const end   = Math.min(start + perPage, this.rowdata.length)

				this.$refs.selectableTable.clearSelected()
				this.selected = []

				for (let index = start; index < end; index++) {
					this.$refs.selectableTable.selectRow(index)
				}
			} else {
				this.$refs.selectableTable.clearSelected()
				this.selected = []
			}
			this.attributePackage()
		},
		'$root.$i18n.locale': function() {
			this.updateColumnLabels(),
			this.updateDateFormat()
		},
		isbusy: function() {
			this.updateDateFormat()
		},
		serverTotalRows(val) {
			if (this.serverSide) {
				this.totalRows = val
			}
		},
		currentPage() {
			if (this.serverSide) {
				this.emitQueryChange()
			}
		},
		perPage() {
			this.updateRowPage()
			this.currentPage = 1
			if (this.serverSide) {
				this.emitQueryChange()
			}
		},
		filter() {
			this.currentPage = 1
			if (this.serverSide) {
				this.emitQueryChangeDebounced()
			}
		},
		sortByLocal() {
			if (this.serverSide) {
				this.currentPage = 1
				this.emitQueryChange()
			}
		},
		sortDescLocal() {
			if (this.serverSide) {
				this.currentPage = 1
				this.emitQueryChange()
			}
		},
	},
	created() {
		if(this.title == "asset/bases" || this.canaccesspackagedetails) {
			this.redirectto = "asset"
		}
		else if(this.title == "inventory_logs") {
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
				disabled: true
			})
		}

		var key = this.title + "_" + this.templateid

		if(localStorage.getItem(key) != null && localStorage.getItem(key) != "") {
			JSON.parse(localStorage.getItem(key)).forEach( visible => {
				if(visible.key != "selected" && visible.key != "actions") {
					var arrayVisible = visible
					// Initialize CSV export header
					this.json_fields[visible.key] = visible.key
					// Initialize datatable header
					var index = this.fields.findIndex(x => x.key==visible);
					index === -1 ? this.fields.push(arrayVisible) : null
				}
			})

			// Remove old fields
			this.fields = this.fields.filter(field =>
				field.key === 'selected' ||
				field.key === 'actions' ||
				this.rowheader.includes(field.key)
			)

			// Add new fields
			this.rowheader.forEach(data => {
				if (!this.fields.some(field => field.key === data)) {
					var visible = true
					if (this.hiddenfields && this.hiddenfields.includes(data)) {
						visible = false
					}
					var array = {
						key: data,
						label: (this.$te(this.translationkey+data)) ? this.$t(this.translationkey+data) : data,
						sortable: true,
						visible: visible,
						disabled: false
					}
					this.json_fields[data] = data
					this.fields.push(array)
				}
			})

			// Order fields
			const orderedFields = []
			const orderedJsonFields = {}

			const specialFields = this.fields.filter(field => field.key === 'selected' || field.key === 'actions')
			orderedFields.push(...specialFields)

			this.rowheader.forEach(key => {
				const field = this.fields.find(f => f.key === key)
				if (field) {
					orderedFields.push(field)
					orderedJsonFields[key] = this.json_fields[key]
				}
			})

			this.fields = orderedFields
			this.json_fields = orderedJsonFields

			// Update local storage key
			localStorage.removeItem(key)
			localStorage.setItem(key, JSON.stringify(this.fields))
		} else {
			Object.values(this.rowheader).forEach( data => {
				var visible = true

				if (this.hiddenfields && this.hiddenfields.includes(data)) {
					visible = false
				}

				var array = {
					key: data,
					label: (this.$te(this.translationkey+data)) ? this.$t(this.translationkey+data) : data,
					sortable: true,
					visible: visible,
					disabled: false
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
			disabled: true,
			thClass: 'sticky-col right actions-col',
			tdClass: 'sticky-col right actions-col'
		}

		if(this.canedit == true || this.candelete == true || this.canviewhistory) {
			this.fields.push(actions)
		}

		if(localStorage.getItem("perPage") != null && localStorage.getItem("perPage") != "") {
			this.perPage = localStorage.getItem("perPage")
		}
	},
	mounted() {
		// Set the initial number of items
		if (this.serverSide) {
			this.totalRows = this.serverTotalRows
		} else {
			this.totalRows = Array.isArray(this.rowdata) ? this.rowdata.length : 0
		}
		// Initialize data to export
		this.json_data = this.rowdata

		this.rowdata.forEach(row => {
			const dateFields = ['last_update', 'last_updated', 'timestamp', 'date_created','date'];
			const dateValue = dateFields.find(field => row[field]);
			if (dateValue) {
				row.last_update_formatted = new Date(row[dateValue]).toLocaleString(this.$i18n.locale);
			}
		});
	},
	methods: {
		// Trigger pagination to update the number of buttons/pages due to filtering
		onFiltered(filteredItems) {
			if (this.serverSide) {
				return
			}
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
			this.isReloading = true;
			this.selectedids = []
			this.selected = []
			this.$emit('reloadDatatable')

			setTimeout(() => {
				this.isReloading = false;
			}, 3000);
		},
		getOrdering() {
			if (!this.sortByLocal) return null
			return this.sortDescLocal ? `-${this.sortByLocal}` : this.sortByLocal
		},
		emitQueryChange() {
			if (!this.serverSide) return

			const limit = Number(this.perPage) || 10
			const offset = (Number(this.currentPage) - 1) * limit

			const query = {
				limit,
				offset,
				search: this.filter && this.filter.length ? this.filter : null,
			}

			const ordering = this.getOrdering()
			if (ordering) query.ordering = ordering

			this.$emit('change-query', query)
		},
		emitQueryChangeDebounced: (function () {
			let timeout = null
			return function () {
				if (!this.serverSide) return
				clearTimeout(timeout)
				timeout = setTimeout(() => {
					this.emitQueryChange()
				}, 400)
			}
		})(),
		onSortChanged(ctx) {
			this.sortByLocal = ctx.sortBy
			this.sortDescLocal = ctx.sortDesc
			this.currentPage = 1
			if (this.serverSide) {
				this.emitQueryChange()
			}
		},
		onExportConfirm(mode) {
			if (!this.serverSide) {
				let rows = []

				if (mode === 'selection') {
					rows = this.selected || []
					this.exportRowsLocal(rows, 'selection')
					return
				}

				if (mode === 'current') {
					rows = this.pageRows
					this.exportRowsLocal(rows, 'page')
					return
				}

				rows = (this.json_data && this.json_data.length)
					? this.json_data
					: (this.rowdata || [])
				this.exportRowsLocal(rows, 'all')
				return
			}

			if (mode === 'selection') {
				const rows = this.selected || []
				this.$emit('export', { scope: 'selection', rows })
				return
			}

			if (mode === 'current') {
				const rows = this.pageRows
				this.$emit('export', { scope: 'page', rows })
				return
			}

			this.$emit('export-all', {
				scope: 'all',
				total: this.totalRows,
				filter: this.filter || null,
				ordering: this.getOrdering(),
			})
		},
		exportRowsLocal(rows, scope) {
			if (!rows || !rows.length) {
				return
			}

			const headers = Object.keys(rows[0])
			const csvRows = []

			csvRows.push(headers.join(';'))

			rows.forEach(row => {
				const values = headers.map(h => {
					const v = row[h] != null ? String(row[h]) : ''
					return `"${v.replace(/"/g, '""')}"`
				})
				csvRows.push(values.join(';'))
			})

			const csv = csvRows.join('\n')
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `${this.title}_export_${scope}.csv`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
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
		},
		assetsSearch(identifier) {
			this.$emit('assetsSearch', identifier)
		},
		updateColumnLabels() {
			this.fields.forEach(field => {
				if (field.key !== 'selected' && field.key !== 'actions') {
					field.label = (this.$te(this.translationkey+field.key)) ? this.$t(this.translationkey+field.key) : field.key
				}
			})
		},
		updateRowPage() {
			localStorage.removeItem("perPage")
			localStorage.setItem("perPage", this.perPage)
		},
		updateDateFormat() {
			this.rowdata.forEach(row => {
				const dateFields = ['last_update', 'last_updated', 'timestamp', 'date_created', 'date'];
				const dateValue = dateFields.find(field => row[field]);
				if (dateValue) {
					row.last_update_formatted = new Date(row[dateValue]).toLocaleString(this.$i18n.locale);
				}
			});
		},
	}
}
</script>