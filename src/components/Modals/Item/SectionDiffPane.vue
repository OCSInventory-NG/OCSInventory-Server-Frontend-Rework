<template>
	<div v-if="section">
		<p class="mb-1">
			<span class="datagrid-title">{{ $t('template.retrieval_method') }} :</span>
			{{ $t('template.' + section.retrieval_method) }}
			<span class="datagrid-title ms-3">{{ $t('template.retrieval_output') }} :</span>
			{{ $t('template.' + section.retrieval_output) }}
		</p>
		<p v-if="section.target">
			<span class="datagrid-title">{{ $t('template.target') }} :</span>
			{{ section.target }}
		</p>

		<table
			v-if="section.fields && section.fields.length"
			class="table table-sm table-striped table-vcenter"
		>
			<thead>
				<tr>
					<th>{{ $t('user.name') }}</th>
					<th>{{ $t('template.retrieval_value') }}</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="(field, index) in section.fields"
					:key="index"
				>
					<td>{{ field.name }}</td>
					<td>{{ field.retrieval_value }}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div
		v-else
		class="text-center text-muted"
	>
		—
	</div>
</template>

<script>
export default {
	name: "SectionDiffPane",
	props: {
		section: { type: Object, default: null }
	}
}
</script>
