<template>
	<b-container fluid>
		<div class="AllComputers-page">
			<h1 class="page-title">All computers</h1>

			<!-- Export button -->
			<download-excel
				class="btn btn-default"
				:data="json_data"
				:fields="json_fields"
				type="csv"
				name="export.xls"
			>
				Export CSV
			</download-excel>

			<!-- Search bar -->
			<b-row>
				<b-col>
					<b-form-group
						label="Filter"
						label-for="filter-input"
						label-cols-sm="9"
						label-align-sm="right"
						label-size="sm"
						class="mb-0"
					>
						<b-input-group size="sm">
							<b-form-input
								id="filter-input"
								v-model="filter"
								type="search"
								placeholder="Type to Search"
							></b-form-input>

							<b-input-group-append>
								<b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
							</b-input-group-append>
						</b-input-group>
					</b-form-group>
				</b-col>
			</b-row>
			<br><br>

			<!-- Show/Hide columns -->
			<b-row>
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
			<br><br>

			<!-- Datatable -->
			<div class="overflow-auto">
				<b-table striped hover responsive selectable
					id="all-computers"
					head-variant="dark"
					ref="selectableTable"
					:select-mode="selectMode"
					:items="computers.table"
					:fields="visibleFields"
					:sort-by.sync="sortBy"
					:sort-desc.sync="sortDesc"
					:per-page="perPage"
					:current-page="currentPage"
					:filter="filter"
					@filtered="onFiltered"
					primary-key="ID"  
				>
					<template v-slot:head(selected)="">
						<b-form-group>
							<input type="checkbox" @click="selectAllRows"/>
						</b-form-group>
					</template>

					<template #cell(selected)="{ rowSelected }">
						<template v-if="rowSelected">
							<b-icon icon="check-square-fill"></b-icon>
							<span class="sr-only">Selected</span>
						</template>
						<template v-else>
							<b-icon icon="dash-square"></b-icon>
							<span class="sr-only">Not selected</span>
						</template>
					</template>
				</b-table>
			</div>

			<!-- Pagination -->
			<b-row>
				<b-col sm="3" md="3" class="my-1">
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
						></b-form-select>
					</b-form-group>
				</b-col>

				<b-col sm="3" md="3" class="my-1">
					<b-pagination
					v-model="currentPage"
					:total-rows="totalRows"
					:per-page="perPage"
					align="fill"
					size="sm"
					class="my-0"
					></b-pagination>
				</b-col>
			</b-row>

		</div>
	</b-container>
</template>

<script>
//import axios from 'axios';
import computers from './computers-test';

export default {
	name: 'AllComputers',
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
			computers,
			// Search parameter
			filter: null,
			// Select row parameter
			selectMode: 'multi',
			// Sort datatable parameters
			sortDesc: null,
			sortBy: null,
			// Export parameters
			json_fields: [],
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
	created() {
		/*axios.get(`http://172.18.26.12/ocsapi/v1/computers?&start=0&limit=20`)
		.then(response => {
			this.posts = response.data;
		})
		.catch(e => {
			this.errors.push(e);
		})*/
		computers.table.forEach(computer => {
			Object.keys(computer).forEach( data => {
				var array = {
					key: data,
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
	},
	computed: {
		// Initialize visible fields
		visibleFields() {
			return this.fields.filter(field => field.visible)
		}
    },
	mounted() {
		// Set the initial number of items
		this.totalRows = this.computers.table.length
		// Initialize data to export
		this.json_data = this.computers.table
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
	}
};
</script>

<!--<style src="./Dashboard.scss" lang="scss" />-->