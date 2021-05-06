<template>
  <div id="test">
    <VueyeTable 
		:data="computers.table" 
		:columns="fields" 
		title="Computers" 
		filter-by="NAME"
		:per-page="per_page"
		:per-page-values="per_page_values"
		select-rows
		v-model="selectedRows"
		striped
	>
      <template v-slot:actions="{item}">
        <div class="ve-table-actions">
          <button class="ve-table-btn ve-table-btn-primary" @click="edit(item)">Edit</button>
          <button class="ve-table-btn ve-table-btn-danger" @click="deleteItem(item)">Delete</button>
        </div>
      </template>
    </VueyeTable>
  </div>
</template>

<script>
//import axios from 'axios';
import computers from './computers-test';
import VueyeTable from 'vueye-table';

export default {
	name: 'AllComputers',
	data() {
		return {
			computers,
			fields: [
				{
					key: "actions",
					label: "Actions",
					sortable: false,
					display: true
				}
			],
			selectedRows: [],
			per_page: 5,
			per_page_values : [5,10,25,50]
			
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
					label: data,
					sortable: true,
					display: true,
				}
				// Initialize datatable header
				var index = this.fields.findIndex(x => x.key==data);
				index === -1 ? this.fields.push(array) : null
			})
		})
	},
	methods: {
		edit(item) {
			//open a dialog to edit the selected item
			//or redirect to another page that contains
			// edit form
		},
		deleteItem(item) {
			this.computers.table = this.computers.table.filter(
				computer => computer.ID !== item.ID
			);
		}
  	},
	components: {
		VueyeTable
	}
};
</script>

<style lang="scss">
#test {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.ve-table {
  &-actions {
    width: 104px;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  &-btn {
    height: 24px;
    min-width: 32px;
    padding: 0 8px;
    text-align: center;
    border-radius: 4px;

    cursor: pointer;
    justify-content: center;
    outline: none;
    border: none;
    position: relative;
    white-space: nowrap;
    &-primary {
      background: #3844cc;
      color: white;
    }
    &-danger {
      background: #e24e40;
      color: white;
    }
  }
}
</style>