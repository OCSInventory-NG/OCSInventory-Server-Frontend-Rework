<template>
	<div class="container-xl">
		<PageHeader 
			page-title="dashboard"
		/>

		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<AssetCounters />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import PageHeader from '@/components/Header/PageHeader'
//import BarChart from '@/components/Dashboard/Chart/Bar'
import AssetCounters from '@/components/Dashboard/Counter/AssetCounters'

export default {
	name: "Dashboard",
	components: { PageHeader, /*BarChart,*/ AssetCounters }
}
</script>