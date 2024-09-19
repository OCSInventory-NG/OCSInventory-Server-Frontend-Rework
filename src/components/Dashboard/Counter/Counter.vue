<template>
	<div :class="classstyle + ' counter'">
		<div class="card counter">
			<b-button 
				v-if="edit"
				size="sm" 
				variant="outline-danger" 
				@click="removeItem()"
			>
				<font-awesome-icon 
					:icon="['fas', 'xmark']"
					size="1x"
				/>
			</b-button>
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
		classstyle: { type: String, default: "" },
		edit: { type: Boolean, default: false },
		i: { type: Number, default: 0 }
	},
	methods: {
		removeItem() {
			this.$emit('removeItem', this.i)
		}
	}
}
</script>