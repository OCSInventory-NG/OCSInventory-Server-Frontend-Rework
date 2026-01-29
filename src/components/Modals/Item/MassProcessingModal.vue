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
			modal-class="custom-modal modal-blur"
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
				:items="items"
				type="ASSET"
				@reloadDatatable="reloadDatatable"
			/>
		</b-modal>
		<b-modal 
			v-model="emptyselection"
			:title="$t('accountinfo.massprocessing')"
			hide-footer
			modal-class="custom-modal modal-blur"
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
		items: { type: Array, default: () => [] }
	},
	data() {
		return {
			emptyselection: false,
			massprocessingmodal: false,
			errored: false,
			errormsg: null,
			loadingcreate: false,
			successed: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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