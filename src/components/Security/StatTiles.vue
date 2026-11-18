<template>
	<!-- Key numbers of a page, as the compliance dashboard tiles -->
	<div
		class="stat-tiles mb-3"
		:class="{ 'stat-tiles-compact': compact }"
		:aria-busy="loading ? 'true' : null"
	>
		<div
			v-for="tile in tiles"
			:key="tile.key || tile.label"
			class="card mb-0"
			:class="{ 'stat-tile-clickable': isClickable(tile) }"
			:style="tileStyle(tile)"
			:title="tile.title || null"
			:role="isClickable(tile) ? 'button' : null"
			:tabindex="isClickable(tile) ? 0 : null"
			:aria-pressed="isClickable(tile) ? !!tile.active : null"
			@click="isClickable(tile) && $emit('select', tile.key)"
			@keydown.enter="isClickable(tile) && $emit('select', tile.key)"
		>
			<div class="card-body text-center p-2 d-flex flex-column justify-content-center">
				<div
					class="subheader mb-1"
					:style="tile.color ? { color: tile.color } : null"
				>
					{{ tile.label }}
				</div>
				<!-- counters on their way: a glowing bar where the number comes -->
				<div
					v-if="loading"
					class="stat-tile-loader placeholder-glow"
					:style="tile.color ? { color: tile.color } : null"
				>
					<span class="placeholder" />
				</div>
				<div
					v-else
					:class="[tile.small ? 'stat-tile-small' : 'h3 mb-0', tile.warn ? 'text-warning' : '']"
					:style="tile.color && !tile.small ? { color: tile.color } : null"
				>
					{{ tile.value }}
				</div>
				<div
					v-if="tile.detail"
					class="text-muted small"
				>
					{{ tile.detail }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "StatTiles",
	props: {
		// [{ key, label, value, detail: a line under the value, color, active,
		//    warn: the value calls for attention, small: for a date,
		//    static: a counter that filters nothing, title: shown on hover }]
		tiles: { type: Array, required: true },
		// a click on a tile emits select(key), e.g. to filter a list
		clickable: { type: Boolean, default: false },
		// narrower tiles, for a longer row
		compact: { type: Boolean, default: false },
		// the values are being read: a loader takes their place
		loading: { type: Boolean, default: false },
	},
	emits: ["select"],
	methods: {
		isClickable(tile) {
			return this.clickable && !tile.static
		},
		// colored top border; the active tile is outlined and tinted
		tileStyle(tile) {
			if (!tile.color) return null
			if (!tile.active) return { borderTop: "3px solid " + tile.color }
			return {
				border: "1px solid " + tile.color,
				borderTop: "3px solid " + tile.color,
				backgroundColor: tile.color + "14",
				boxShadow: "0 2px 8px " + tile.color + "40",
			}
		},
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

.stat-tiles-compact {
	grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
}

.stat-tile-clickable {
	cursor: pointer;
}

.stat-tile-small {
	font-weight: 600;
}

/* as tall as an h3 value, so the tile keeps its size */
.stat-tile-loader {
	align-items: center;
	display: flex;
	height: 1.75rem;
	justify-content: center;
}

.stat-tile-loader .placeholder {
	border-radius: 4px;
	height: 1rem;
	width: 2.5rem;
}
</style>
