<template>
	<div class="error-page">
		<b-container>
			<div class="errorcontainer mx-auto">
				<h1 class="errorcode">404</h1>
				<p class="errorinfo">
					Oops, it seems that this page does not exist.
				</p>
				<p class="errorhelp mb-3">
					If you are sure it should, search for it.
				</p>
			</div>
			<footer class="pagefooter">
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
