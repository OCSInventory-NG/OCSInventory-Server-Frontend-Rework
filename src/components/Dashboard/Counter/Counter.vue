<template>
	<div :class="classstyle" style="height:100%">
		<div class="card" style="height:100%">
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
	name: "Counter",
	props: {
		firsttitle: { type: String, default: null },
		firstcount: { type: Number, default: null },
		secondtitle: { type: String, default: null },
		secondcount: { type: Number, default: null },
		classstyle: { type: String, default: "" }
	}
}
</script>