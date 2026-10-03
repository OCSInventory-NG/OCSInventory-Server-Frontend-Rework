<template>
	<p
		v-if="!trace.length"
		class="text-secondary mb-0"
	>
		{{ $t('debug.no_calls') }}
	</p>
	<table
		v-else
		class="table table-sm table-striped table-vcenter mb-0"
	>
		<thead>
			<tr>
				<th>{{ $t('debug.method') }}</th>
				<th>{{ $t('debug.path') }}</th>
				<th>{{ $t('debug.status') }}</th>
				<th>{{ $t('debug.duration') }}</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="(call, idx) in trace"
				:key="idx"
			>
				<td>{{ call.method }}</td>
				<td>{{ call.path }}</td>
				<td>{{ call.status }}</td>
				<td>{{ call.duration }} ms</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	name: "DebugTrace",
	// the slot passes the whole debug context, only some of it is used here
	inheritAttrs: false,
	props: {
		trace: { type: Array, default: () => [] },
	},
}
</script>
