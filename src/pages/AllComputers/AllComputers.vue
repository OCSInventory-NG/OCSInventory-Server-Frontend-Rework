<template>
	<div class="AllComputers-page">
		<h1 class="page-title">All computers</h1>
		<data-table :columns="computers"></data-table>
	</div>
</template>

<script>
//import axios from 'axios';
import computers from './mock';

export default {
	name: 'AllComputers',
	data() {
		return {
			computers
		};
	},
	/*created() {
		axios.get(`http://172.18.26.12/ocsapi/v1/computers?&start=0&limit=20`)
		.then(response => {
			this.posts = response.data;
		})
		.catch(e => {
			this.errors.push(e);
		})
	},*/
};
</script>

<!--<style src="./Dashboard.scss" lang="scss" />-->
