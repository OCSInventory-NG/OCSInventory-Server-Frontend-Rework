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
							:id="tab.name + '_' + uniqid"
							v-model="selectedPermissionsArray"
							type="checkbox" 
							:value="tab.id" 
						>
					</td>
					<td align="center">
						<input 
							:id="label.id + '_' + uniqid"
							type="checkbox" 
							:checked="isRowFullySelected(label.id)"
							@change="toggleRow(label.id, $event.target.checked)"
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
							:id="action + '_' + uniqid"
							type="checkbox" 
							:checked="action === 'all' ? isMatrixFullySelected : isColumnFullySelected(action)"
							@change="
								action === 'all'
									? toggleAll($event.target.checked)
									: toggleColumn(action, $event.target.checked)"
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
		id: { type: Number, default: 0 }
	},
	data() {
		return {
			headertab: ["add", "change", "delete", "view", "all"],
			selectedPermissionsArray: [],
			uniqid: 0
		}
	},
	computed: {
		isMatrixFullySelected() {
			return this.headertab
				.filter(action => action !== 'all')
				.every(action => this.isColumnFullySelected(action));
		}
	},
	watch: {
		selectedPermissionsArray: function () {
			this.$emit('permissions', this.selectedPermissionsArray)
		}
	},
	mounted() {
		if (this.id) {
			this.uniqid = this.id
		}
		this.selectedPermissionsArray = this.rowpermissions ?? []
	},
	methods: {
		isRowFullySelected(labelId) {
			const permissionIds = this.rowtab[labelId].map(p => p.id);
			return permissionIds.every(id => this.selectedPermissionsArray.includes(id));
		},

		isColumnFullySelected(action) {
			return this.rowlabel.every(label => {
				const permission = this.rowtab[label.id].find(p => p.name.includes(action));
				return permission && this.selectedPermissionsArray.includes(permission.id);
			});
		},

		toggleRow(labelId, checked) {
			const permissionIds = this.rowtab[labelId].map(p => p.id);
			if (checked) {
				const combined = this.selectedPermissionsArray.concat(permissionIds);
				const uniqueSet = new Set(combined);
				const uniqueArray = Array.from(uniqueSet);
				this.selectedPermissionsArray = uniqueArray;
			} else {
				this.selectedPermissionsArray = this.selectedPermissionsArray.filter(id => !permissionIds.includes(id));
			}
		},

		toggleColumn(action, checked) {
			const permissionIds = this.rowlabel
				.map(label => this.rowtab[label.id].find(p => p.name.includes(action)))
				.filter(Boolean)
				.map(p => p.id);

			if (checked) {
				const combinedArray = this.selectedPermissionsArray.concat(permissionIds);
				const uniqueSet = new Set(combinedArray);
				const uniqueArray = Array.from(uniqueSet);
				this.selectedPermissionsArray = uniqueArray;
			} else {
				this.selectedPermissionsArray = this.selectedPermissionsArray.filter(id => !permissionIds.includes(id));
			}
		},

		toggleAll(checked) {
			const allIds = this.rowlabel
				.flatMap(label => this.rowtab[label.id])
				.map(p => p.id);
			this.selectedPermissionsArray = checked ? allIds : [];
		}
	}
}
</script>