<template>
	<div class="col-sm-6 col-lg-3">
		<div class="card">
			<div class="card-body">
				<div class="d-flex align-items-center">
					<div class="subheader">
						{{ $t(firsttitle) }}
					</div>
				</div>
				<div class="h1 mb-3">
					{{ firstcount }}
				</div>
				<div 
					v-if="secondcount != null"
					class="d-flex mb-2"
				>
					<div>{{ $t(secondtitle) }}</div>
					<div class="ms-auto">
						<span class="badge bg-purple">
							{{ secondcount }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "AssetCounters",
	props: {
		firsttitle: { type: String, default: null },
		firstcount: { type: Number, default: null },
		secondtitle: { type: String, default: null },
		secondcount: { type: Number, default: null }
	}
}
</script>