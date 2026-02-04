import AccountinfoModal from '@/components/Modals/Item/AccountinfoModal.vue'
import AssetGroupModal from '@/components/Modals/Item/AssetGroupModal.vue'
import AutomationModal from '@/components/Modals/Item/AutomationModal.vue'
import CategoryModal from '@/components/Modals/Item/CategoryModal.vue'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal.vue'
import DoAllActionsItemModal from '@/components/Modals/DoAllActionsItem/DoAllActionsItemModal.vue'
import DuplicateModal from '@/components/Modals/ImportExportItem/DuplicateModal.vue'
import ExportModal from '@/components/Modals/ImportExportItem/ExportModal.vue'
import ExportTemplateModal from '@/components/Modals/ImportExportItem/ExportTemplateModal.vue'
import FieldModal from '@/components/Modals/Item/FieldModal.vue'
import GroupModal from '@/components/Modals/Item/GroupModal.vue'
import ImportTemplateModal from '@/components/Modals/ImportExportItem/ImportTemplateModal.vue'
import Localeswitcher from '@/components/LocaleSwitcher/LocaleSwitcher.vue'
import MassProcessingModal from '@/components/Modals/Item/MassProcessingModal.vue'
import NetdeviceModal from '@/components/Modals/Item/NetdeviceModal.vue'
import NetworkGroupModal from '@/components/Modals/Item/NetworkGroupModal.vue'
import NetworkModal from '@/components/Modals/Item/NetworkModal.vue'
import PackageModal from '@/components/Modals/Item/PackageModal.vue'
import PackageResultModal from '@/components/Modals/Item/PackageResultModal.vue'
import RuleModal from '@/components/Modals/Item/RuleModal.vue'
import SaveSearchModal from '@/components/Modals/Item/SaveSearchModal.vue'
import SoftwareMappingModal from '@/components/Modals/Item/SoftwareMappingModal.vue'
import SnmpModal from '@/components/Modals/Item/SnmpModal.vue'
import SnmpScannerModal from '@/components/Modals/Item/SnmpScannerModal.vue'
import UserModal from '@/components/Modals/Item/UserModal.vue'
import Draggable from '@/components/Draggable/Draggable.vue'
import ExtensionModal from '@/components/Modals/Item/ExtensionModal.vue'
import ExtensionSlot from '@/extensions/ExtensionSlot.vue'

const GlobalComponents = {
	install(Vue) {
		Vue.component('AccountinfoModal', AccountinfoModal)
		Vue.component('AssetGroupModal', AssetGroupModal)
		Vue.component('AutomationModal', AutomationModal)
		Vue.component('CategoryModal', CategoryModal)
		Vue.component('DeleteItemModal', DeleteItemModal)
		Vue.component('DoAllActionsItemModal', DoAllActionsItemModal)
		Vue.component('Draggable', Draggable)
		Vue.component('DuplicateModal', DuplicateModal)
		Vue.component('ExportModal', ExportModal)
		Vue.component('ExportTemplateModal', ExportTemplateModal)
		Vue.component('FieldModal', FieldModal)
		Vue.component('GroupModal', GroupModal)
		Vue.component('ImportTemplateModal', ImportTemplateModal)
		Vue.component('Localeswitcher', Localeswitcher)
		Vue.component('MassProcessingModal', MassProcessingModal)
		Vue.component('NetdeviceModal', NetdeviceModal)
		Vue.component('NetworkGroupModal', NetworkGroupModal)
		Vue.component('NetworkModal', NetworkModal)
		Vue.component('PackageModal', PackageModal)
		Vue.component('PackageResultModal', PackageResultModal)
		Vue.component('RuleModal', RuleModal)
		Vue.component('SaveSearchModal', SaveSearchModal)
		Vue.component('SoftwareMappingModal', SoftwareMappingModal)
		Vue.component('SnmpModal', SnmpModal)
		Vue.component('SnmpScannerModal', SnmpScannerModal)
		Vue.component('UserModal', UserModal)
		Vue.component('ExtensionModal', ExtensionModal)
		Vue.component('ExtensionSlot', ExtensionSlot)
	}
}

export default GlobalComponents 