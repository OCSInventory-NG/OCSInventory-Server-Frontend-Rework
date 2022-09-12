<template>
	<div :class="[{root: true}, 'ocs-dashboard']">
		<div class="page">
			<Header />
			<div class="page-wrapper">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script>
import Header from '@/components/Header/Header';

export default {
	name: 'Layout',
	components: { Header },
}
</script>