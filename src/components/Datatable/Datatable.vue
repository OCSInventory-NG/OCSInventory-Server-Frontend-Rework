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
					class="icon-btn">
					<b-icon icon="search"/>
				</b-input-group-prepend>
				<b-form-input 
					id="filter-input" 
					v-model="filter"
					:placeholder="$t('search')"
					type="search"
				/>
			</b-input-group>

			<b-button-toolbar>
				<b-button-group class="mr-1">
					<download-excel
						:data="json_data"
						:fields="json_fields"
						type="csv"
						name="export.xls"
					>
						<b-button 
							title="Export CSV" 
							class="export-btn">
							<b-icon 
								icon="download" 
								aria-hidden="true"/>
						</b-button>
					</download-excel>
				</b-button-group>
			</b-button-toolbar>
		</div>

		<div align="center">
			<p>{{ totalRows }} {{ $t('result') }}</p>
		</div>

		<!-- Show/Hide columns -->
		<!--<b-row>
			<b-col>
				<b-checkbox
					:disabled="visibleFields.length == 1 && field.visible"
					v-for="field in fields" 
					:key="field.key" 
					v-model="field.visible" 
					inline
				>
					{{ field.key }}
				</b-checkbox>
			</b-col>
		</b-row>
		<br><br>-->

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
			>
				<template v-slot:head(selected)="">
					<b-form-group>
						<input 
							type="checkbox" 
							@click="selectAllRows">
					</b-form-group>
				</template>

				<template #cell(selected)="{ rowSelected }">
					<template v-if="rowSelected">
						<b-icon icon="check-square-fill"/>
						<span class="sr-only">Selected</span>
					</template>
					<template v-else>
						<b-icon icon="dash-square"/>
						<span class="sr-only">Not selected</span>
					</template>
				</template>

				<template #cell(actions)="row">
					<b-button-toolbar>
						<b-button-group class="mr-1">
							<component 
								:is="editcomponent"
								v-bind="{ id: row.item.id }"
								@reloadDatatable="reloadDatatable"
							/>
							<delete-item-modal
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
				class="my-1">
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
				class="my-1">
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
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'

export default {
	name: 'Datatable',
	components: {
		EditGroupModal,
		EditUserModal,
		DeleteItemModal
	},
	props: {
		title: { type: String, default: '' },
		rowdata: { type: Array, default: null },
		id: { type: String, default: '' },
		editcomponent: { type: String, default: '' }
	},
	data() {
		return {
			// Pagination parameters
			perPage: 5,
			currentPage: 1,
			pageOptions: [5, 10, 15, { value: 100, text: "Show a lot" }],
			totalRows: 1,
			// Datatable datas
			fields: [
				{ 
					key: "selected", 
					label: "", 
					sortable: false ,
					visible: true,
				}
			],
			// Search parameter
			filter: null,
			// Select row parameter
			selectMode: 'multi',
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
		};
	},
	computed: {
		// Initialize visible fields
		visibleFields() {
			return this.fields.filter(field => field.visible)
		}
	},
	created() {
		this.rowdata.forEach(details => {
			Object.keys(details).forEach( data => {
				var array = {
					key: data,
					label: i18n.t(data),
					sortable: true,
					visible: true,
				}
				// Initialize CSV export header
				
				this.json_fields[data] = data
				
				// Initialize datatable header
				var index = this.fields.findIndex(x => x.key==data);
				index === -1 ? this.fields.push(array) : null
			})
		})
		var actions = {
			key: "actions", 
			label: i18n.t('actions'), 
			sortable: false ,
			visible: true,
		}
		this.fields.push(actions)
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
			} else {
				this.$refs.selectableTable.selectAllRows()
			}
		},
		reloadDatatable() {
			this.$emit('reloadDatatable')
		}
	}
};
</script>