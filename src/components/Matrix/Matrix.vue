<template>
	<div id="matrix">
		<table class="table w-full">
			<thead>
				<tr>
					<th>{{ $t("type") }}</th>
					<th 
						v-for="action in headertab"
						:key="action"
					>
						{{ $t(action) }}
					</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="label in rowlabel" :key="label">
					<td>{{ label.trad }}</td>
					
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
export default {
	name: "Matrix",
	props: {
		rowtab: { type: Array, default: null },
		rowlabel: { type: Array, default: null }
	},
	data() {
		return {
			headertab: ["add", "update", "delete", "view", "all"],
		}
	}
}
</script>