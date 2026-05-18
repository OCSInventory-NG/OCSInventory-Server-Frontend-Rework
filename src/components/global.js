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
import NoteModal from '@/components/Modals/Item/NoteModal.vue'
import PackageModal from '@/components/Modals/Item/PackageModal.vue'
import PackageResultModal from '@/components/Modals/Item/PackageResultModal.vue'
import RuleModal from '@/components/Modals/Item/RuleModal.vue'
import SaveSearchModal from '@/components/Modals/Item/SaveSearchModal.vue'
import SoftwareMappingModal from '@/components/Modals/Item/SoftwareMappingModal.vue'
import SnmpModal from '@/components/Modals/Item/SnmpModal.vue'
import SnmpScannerModal from '@/components/Modals/Item/SnmpScannerModal.vue'
import UserModal from '@/components/Modals/Item/UserModal.vue'
import UserGroupAssignmentsModal from '@/components/Modals/Item/UserGroupAssignmentsModal.vue'
import ExtensionModal from '@/components/Modals/Item/ExtensionModal.vue'
import ExtensionSlot from '@/extensions/ExtensionSlot.vue'
import BarChart from '@/components/Dashboard/Chart/Bar.vue'
import Counter from '@/components/Dashboard/Counter/Counter.vue'
import PieChart from '@/components/Dashboard/Chart/Pie.vue'
import LineChart from '@/components/Dashboard/Chart/Line.vue'
import ActionListModal from '@/components/Modals/Item/ActionListModal.vue'
import ActionRuleModal from '@/components/Modals/Item/ActionRuleModal.vue'
import LdapModal from '@/components/Modals/Item/LdapModal.vue'
import draggable from 'vuedraggable'
import Notes from '@/components/Notes/Notes.vue'

const GlobalComponents = {
	install(Vue) {
		Vue.component('AccountinfoModal', AccountinfoModal)
		Vue.component('AssetGroupModal', AssetGroupModal)
		Vue.component('AutomationModal', AutomationModal)
		Vue.component('CategoryModal', CategoryModal)
		Vue.component('DeleteItemModal', DeleteItemModal)
		Vue.component('DoAllActionsItemModal', DoAllActionsItemModal)
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
		Vue.component('NoteModal', NoteModal)
		Vue.component('PackageModal', PackageModal)
		Vue.component('PackageResultModal', PackageResultModal)
		Vue.component('RuleModal', RuleModal)
		Vue.component('SaveSearchModal', SaveSearchModal)
		Vue.component('SoftwareMappingModal', SoftwareMappingModal)
		Vue.component('SnmpModal', SnmpModal)
		Vue.component('SnmpScannerModal', SnmpScannerModal)
		Vue.component('UserModal', UserModal)
		Vue.component('UserGroupAssignmentsModal', UserGroupAssignmentsModal)
		Vue.component('ExtensionModal', ExtensionModal)
		Vue.component('ExtensionSlot', ExtensionSlot)
		Vue.component('BarChart', BarChart)
		Vue.component('Counter', Counter)
		Vue.component('PieChart', PieChart)
		Vue.component('LineChart', LineChart)
		Vue.component('ActionListModal', ActionListModal)
		Vue.component('ActionRuleModal', ActionRuleModal)
		Vue.component('LdapModal', LdapModal)
		Vue.component('Draggable', draggable)
		Vue.component('Notes', Notes)
	}
}

export default GlobalComponents 
