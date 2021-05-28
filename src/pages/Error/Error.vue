<template>
	<div class="error-page">
		<b-container>
			<div class="errorContainer mx-auto">
				<h1 class="errorCode">404</h1>
				<p class="errorInfo">
					Oops, it seems that this page does not exist.
				</p>
				<p class="errorHelp mb-3">
					If you are sure it should, search for it.
				</p>
			</div>
			<footer class="pageFooter">
				2021 &copy; OCS Inventory
			</footer>
		</b-container>
	</div>
</template>

<script>
export default {
	name: 'ErrorPage',
};
</script>
