<template>
	<div id="matrix">
		<table class="table w-full table-fix-head">
			<thead>
				<tr align="center">
					<th>{{ $t("generic.type") }}</th>
					<th 
						v-for="action in headertab"
						:key="action"
					>
						{{ $t('generic.'+action) }}
					</th>
				</tr>
			</thead>

			<tbody>
				<tr 
					v-for="label in rowlabel" 
					:key="label.id"
				>
					<td>{{ label.trad }}</td>
					<td
						v-for="tab in rowtab[label.id]"
						:key="tab.id"
						align="center"
					>
						<input 
							:id="tab.name"
							v-model="selectedPermissionsArray"
							type="checkbox" 
							:value="tab.id" 
						>
					</td>
					<td align="center">
						<input 
							:id="label.id"
							type="checkbox" 
							value="all"
							@click="selectAllPermission"
						>
					</td>
				</tr>
				<tr>
					<td>{{ $t('generic.all') }}</td>
					<td
						v-for="action in headertab"
						:key="action"
						align="center"
					>
						<input 
							:id="action+'_'"
							type="checkbox" 
							value="all"
							@click="selectAllPermission"
						>
					</td>
				</tr>
			</tbody>

			<thead>
				<tr align="center">
					<th>{{ $t("generic.type") }}</th>
					<th 
						v-for="action in headertab"
						:key="action"
					>
						{{ $t('generic.'+action) }}
					</th>
				</tr>
			</thead>
		</table>
	</div>
</template>

<script>
export default {
	name: "Matrix",
	props: {
		rowtab: { type: Array, default: null },
		rowlabel: { type: Array, default: null },
		rowpermissions: { type: Array, default: null },
	},
	data() {
		return {
			headertab: ["add", "change", "delete", "view", "all"],
			selectedPermissionsArray: []
		}
	},
	watch: {
		selectedPermissionsArray: function () {
			this.$emit('permissions', this.selectedPermissionsArray)
		}
	},
	mounted() {
		this.selectedPermissionsArray = this.rowpermissions ?? []
	},
	methods: {
		selectAllPermission(line) {
			var checked = line.srcElement.checked
			var id = line.srcElement.id
			var search = null
			var all = []

			if(id !== "all_") {
				search = '[id*="'+id+'"]'
			} else {
				search = '[id*="add_"],[id*="change_"],[id*="delete_"],[id*="view_"]'
				all = document.querySelectorAll("input[value=all]");
			}

			var permissions = document.querySelectorAll(search);

			all.forEach(check => {
				if(checked) {
					document.getElementById(check.id).checked = true
				} else {
					document.getElementById(check.id).checked = false
				}
			})

			permissions.forEach(permission => {
				var index = this.selectedPermissionsArray.indexOf(parseInt(permission.value));

				if(checked) {
					document.getElementById(permission.id).checked = true
					if(permission.value !== "all") {
						if (index === -1) {
							this.selectedPermissionsArray.push(parseInt(permission.value))
						}
					}
				} else {
					document.getElementById(permission.id).checked = false
					if (index !== -1) {
						this.selectedPermissionsArray.splice(index, 1);
					}
				}
			})
		}
	}	
}
</script>