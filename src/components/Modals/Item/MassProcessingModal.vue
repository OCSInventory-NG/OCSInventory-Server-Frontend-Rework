<template>
	<div id="mass-processing-modal">
		<div 
			class="col-auto ms-auto"
		>
			<button 
				:title="$t('accountinfo.massprocessing')"
				class="form-control btn datatable-btn"
				@click="
					(items.length > 0) ? massprocessingmodal = true : emptyselection = !emptyselection,
					loadData()
				"
			>
				<font-awesome-icon 
					:icon="['fas', 'tag']"
				/>
			</button>
		</div>
		<b-modal 
			v-model="massprocessingmodal"
			:title="$t('accountinfo.massprocessing')"
			hide-footer
			modal-class="custom-modal"
			size="xl"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('accountinfo.massprocessing') }}
				</h5>
				<b-button
					size="sm"
					variant="outline-danger"
					@click="close()"
				>
					<font-awesome-icon
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<Accountinfo
				:canedit="true"
				:massprocessing="true"
				:slug="(type == 'ASSET') ? 'inventory_base.inventorybase' : 'netdevice.netdevice'"
				:items="items"
				:type="type"
				@reload-datatable="reloadDatatable"
			/>
		</b-modal>
		<b-modal 
			v-model="emptyselection"
			:title="$t('accountinfo.massprocessing')"
			hide-footer
			modal-class="custom-modal"
			size="lg"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('accountinfo.massprocessing') }}
				</h5>
				<b-button 
					size="sm" 
					variant="outline-danger" 
					@click="close()"
				>
					<font-awesome-icon 
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<div>
				<Alert 
					:message="$t('message.no_selection')" 
					variant="warning"
				/>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "MassProcessingModal",
	props: {
		items: { type: Array, default: () => [] },
		type: {type: String, default: "ASSET"}
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,

			emptyselection: false,
			massprocessingmodal: false,
			
			loadingcreate: false,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.massprocessingmodal = false
				this.successed = false
				this.$emit('reloadDatatable')
			}, 100)
		}
	},
	methods: {
		loadData() {
			this.errormsg = null
			this.errored = false
		},
		reloadDatatable() {
			this.successed = true
		} 
	}
}
</script>