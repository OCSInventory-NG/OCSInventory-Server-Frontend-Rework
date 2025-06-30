import AccountinfoModal from '@/components/Modals/Item/AccountinfoModal.vue'
import AssetGroupModal from '@/components/Modals/Item/AssetGroupModal.vue'
import AutomationModal from '@/components/Modals/Item/AutomationModal.vue'
import CategoryModal from '@/components/Modals/Item/CategoryModal.vue'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal.vue'
import DoAllActionsItemModal from '@/components/Modals/DoAllActionsItem/DoAllActionsItemModal.vue'
import DuplicateTemplateModal from '@/components/Modals/ImportExportItem/DuplicateTemplateModal.vue'
import ExportTemplateModal from '@/components/Modals/ImportExportItem/ExportTemplateModal.vue'
import FieldModal from '@/components/Modals/Item/FieldModal.vue'
import GroupModal from '@/components/Modals/Item/GroupModal.vue'
import ImportTemplateModal from '@/components/Modals/ImportExportItem/ImportTemplateModal.vue'
import Localeswitcher from '@/components/LocaleSwitcher/LocaleSwitcher.vue'
import NetdeviceModal from '@/components/Modals/Item/NetdeviceModal.vue'
import NetworkGroupModal from '@/components/Modals/Item/NetworkGroupModal.vue'
import NetworkModal from '@/components/Modals/Item/NetworkModal.vue'
import PackageModal from '@/components/Modals/Item/PackageModal.vue'
import PackageResultModal from '@/components/Modals/Item/PackageResultModal.vue'
import RuleModal from '@/components/Modals/Item/RuleModal.vue'
import SaveSearchModal from '@/components/Modals/Item/SaveSearchModal.vue'
import SnmpModal from '@/components/Modals/Item/SnmpModal.vue'
import SnmpScannerModal from '@/components/Modals/Item/SnmpScannerModal.vue'
import UserModal from '@/components/Modals/Item/UserModal.vue'

const GlobalComponents = {
	install(Vue) {
		Vue.component('AccountinfoModal', AccountinfoModal)
		Vue.component('AssetGroupModal', AssetGroupModal)
		Vue.component('AutomationModal', AutomationModal)
		Vue.component('CategoryModal', CategoryModal)
		Vue.component('DeleteItemModal', DeleteItemModal)
		Vue.component('DoAllActionsItemModal', DoAllActionsItemModal)
		Vue.component('DuplicateTemplateModal', DuplicateTemplateModal)
		Vue.component('ExportTemplateModal', ExportTemplateModal)
		Vue.component('FieldModal', FieldModal)
		Vue.component('GroupModal', GroupModal)
		Vue.component('ImportTemplateModal', ImportTemplateModal)
		Vue.component('Localeswitcher', Localeswitcher)
		Vue.component('NetdeviceModal', NetdeviceModal)
		Vue.component('NetworkGroupModal', NetworkGroupModal)
		Vue.component('NetworkModal', NetworkModal)
		Vue.component('PackageModal', PackageModal)
		Vue.component('PackageResultModal', PackageResultModal)
		Vue.component('RuleModal', RuleModal)
		Vue.component('SaveSearchModal', SaveSearchModal)
		Vue.component('SnmpModal', SnmpModal)
		Vue.component('SnmpScannerModal', SnmpScannerModal)
		Vue.component('UserModal', UserModal)
	}
}

export default GlobalComponents 