<template>
	<div id="donut">
		<div class="col-lg-6">
			<div
				id="donut-card" 
				class="card"
			>
				<div class="card-body">
					<h3 class="card-title">
						{{ $t(title) }}
					</h3>
					<apexchart 
						:options="options" 
						:series="series"
						type="donut" 
					/>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "Donut",
	props: {
		options: { type: Object, default: null },
		series: { type: Array, default: null },
		title: { type: String, default: null }
	}
}
</script>