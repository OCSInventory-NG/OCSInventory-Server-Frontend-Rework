<template>
	<Datatable/>
</template>

<script>
//import Axios from 'axios'
import Datatable from '@/components/Datatable/Datatable';

export default {
	name: "Users",
	components: {
		Datatable
	},
	data() {
		//rowData: []
	},
	/*beforeCreate() {
        console.log("ok")
        const header = {
            'Authorization' : 'Token ' + localStorage.getItem('token_authentication')
        }

        Axios.get("http://172.18.26.12:8000/users/", { header })
            .then(response => {
                console.log(response)
            })
            .catch(e => {
                console.log(e)
            })

    }*/
}
</script>