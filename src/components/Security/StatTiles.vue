<template>
	<!-- Key numbers of a page, as the compliance dashboard tiles -->
	<div class="stat-tiles mb-3">
		<div
			v-for="tile in tiles"
			:key="tile.label"
			class="card mb-0"
		>
			<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
				<div class="subheader mb-1">
					{{ tile.label }}
				</div>
				<div
					:class="[tile.small ? 'stat-tile-small' : 'h3 mb-0', tile.warn ? 'text-warning' : '']"
				>
					{{ tile.value }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "StatTiles",
	props: {
		// [{ label, value, warn: true when the value calls for attention, small: for a date }]
		tiles: { type: Array, required: true },
	},
}
</script>

<style scoped>
/* tiles of one width, as many per line as fit */
.stat-tiles {
	display: grid;
	gap: 8px;
	grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
}

.stat-tile-small {
	font-weight: 600;
}
</style>
