<template>
	<div id="line">
		<div
			id="donut-card" 
			class="card"
		>
			<div class="card-body">
				<h3 class="card-title">
					{{ $t(title) }}
				</h3>
				<apexchart 
					type="line" 
					:options="options" 
					:series="series"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Line",
	props: {
		options: { type: Object, default: null },
		series: { type: Array, default: null },
		title: { type: String, default: null }
	}
}
</script>
