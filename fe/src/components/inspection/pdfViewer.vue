<style scoped>
.table-cell {
  width: 24.3px;
  height: 24.3px;
  text-align: center;
}

.my-table {
  width: 100%;
  border-collapse: collapse;
  font-size: smaller;
}

.my-table td,
th {
  border: solid, 1px;
  padding: 5px;
}
</style>
<template>
  <div class="w-100">
    <div class="w-100 text-start mb-5" style="font-size: smaller">
      {{ docnum }}
    </div>
    <table
      class="w-100 mb-5"
      style="border-collapse: collapse; font-size: smaller"
    >
      <tbody>
        <tr>
          <td colspan="2">
            <div class="d-flex text-no-wrap">
              <div style="width: 50px">
                <v-img src="@/assets/Picture1.jpg"></v-img>
              </div>
              <div class="text-start text-decoration-underline text-info ms-5">
                PT. SOFTPREN INDUSTRIES <br />
                INDONESIA
              </div>
            </div>
          </td>
          <td
            colspan="3"
            class="text-center text-h4 text-no-wrap text-capitalize"
          >
            Lembar Pemeriksaan Harian Alat Ukur {{ inspection.rank }}
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td colspan="3"></td>
          <td width="100" class="text-center" style="border: 1px solid">
            Checked By
          </td>
          <td width="100" class="text-center" style="border: 1px solid">
            Approved By
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td colspan="3"></td>
          <td height="50" style="border: 1px solid"></td>
          <td height="50" style="border: 1px solid"></td>
        </tr>
        <tr class="text-no-wrap">
          <td>MODEL / TYPE</td>
          <td>: {{ inspection.equipmentName }}</td>
          <td></td>
          <td>AREA</td>
          <td>: {{ inspection.location }}</td>
          <td style="border: 1px solid"></td>
          <td style="border: 1px solid"></td>
        </tr>
        <tr class="text-no-wrap">
          <td>NO. CONTROL / NO. SERI</td>
          <td>: {{ inspection.regisNo }}</td>
          <td width="300"></td>
          <td>PERIODE BULAN/ TAHUN</td>
          <td>: {{ moment().format('MMMM YYYY') }}</td>
        </tr>
      </tbody>
    </table>
    <table class="my-table">
      <thead>
        <tr>
          <th class="text-center" rowspan="2">No</th>
          <th class="text-center" rowspan="2">Item Check</th>
          <th class="text-center" rowspan="2">Methods</th>
          <th class="text-center" colspan="31">Date</th>
        </tr>
        <tr>
          <template
            v-for="(report, reportIndex) in inspection.reports"
            :key="reportIndex"
          >
            <th v-for="(item, index) in report.dates" :key="index">
              {{ moment(item).format('DD') }}
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="(itemValue, itemIndex) in inspection.inspectionItems"
          :key="itemIndex"
        >
          <tr
            v-for="(methodValue, methodIndex) in itemValue.methods"
            :key="methodIndex"
          >
            <td
              class="text-center"
              v-if="methodIndex == 0"
              :rowspan="itemValue.methods.length"
            >
              {{ itemValue.imageNumber }}
            </td>
            <td
              class="text-no-wrap"
              v-if="methodIndex == 0"
              :rowspan="itemValue.methods.length"
            >
              {{ itemValue.label }}
            </td>
            <td>{{ methodValue.label }}</td>
            <template
              v-for="(report, reportIndex) in inspection.reports"
              :key="reportIndex"
            >
              <td
                class="table-cell"
                v-for="(result, index) in report.inspectionData"
                :key="index"
              >
                <div v-if="result.inspection">
                  <div
                    class="text-error"
                    v-if="result.inspection.status == 'unchecked'"
                  ></div>
                  <div v-else>
                    <div
                      v-if="
                        result.inspection.inspectionItems
                          .find((item) => item.id == itemValue.id)
                          .methods.find((m) => m.id == methodValue.id).logicType
                          .inputType == 'buttonToggle'
                      "
                    >
                      <div
                        v-if="
                          result.inspection.inspectionItems
                            .find((item) => item.id == itemValue.id)
                            .methods.find((m) => m.id == methodValue.id)
                            .judgement
                        "
                      >
                        <v-icon size="x-small">mdi-circle-outline</v-icon>
                      </div>
                      <div v-else>
                        <v-icon size="x-small">mdi-close</v-icon>
                      </div>
                    </div>
                    <div v-else>
                      {{
                        result.inspection.inspectionItems
                          .find((item) => item.id == itemValue.id)
                          .methods.find((m) => m.id == methodValue.id).input
                      }}
                    </div>
                  </div>
                </div>
                <div v-else>-</div>
              </td>
            </template>
          </tr>
        </template>
        <tr>
          <td colspan="3" class="text-center">Operator</td>
          <template
            v-for="(report, reportIndex) in inspection.reports"
            :key="reportIndex"
          >
            <td
              class="table-cell"
              v-for="(result, index) in report.inspectionData"
              :key="index"
            >
              <div v-if="result.inspection">
                <v-img width="20" :src="getSignFile(report.inspector.userId)" />
              </div>
            </td>
          </template>
        </tr>
        <tr>
          <td colspan="3" class="text-center">Leader</td>
          <td
            class="text-center"
            :colspan="report.dates.length"
            v-for="(report, reportIndex) in inspection.reports"
            :key="reportIndex"
          >
            <div v-if="report.inspector" class="text-center d-flex">
              <v-img height="25" :src="getSignFile(report.inspector.userId)" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { useAppStore } from '@/stores/app';
import moment from 'moment';

const props = defineProps(['inspection']);

const store = useAppStore();

const idArr = ref([]);

const docnum = ref(null);

const getSignFile = (id) => {
  if (id) {
    return idArr.value.find((item) => item.id === id)?.signFile;
  }
};

onBeforeMount(() => {
  let reports = props.inspection.reports;
  reports.forEach((report) => {
    if (report.inspector) {
      let exist = idArr.value.find(
        (item) => item.id === report.inspector.userId
      );
      if (!exist) {
        idArr.value.push({ id: report.inspector.userId, signFile: null });
      }
    }
    report.inspectionData.forEach((data) => {
      if (data.inspection) {
        let exist = idArr.value.find(
          (item) => item.id === report.inspector.userId
        );
        if (!exist) {
          idArr.value.push({ id: report.inspector.userId, signFile: null });
        }
      }
    });
  });
  idArr.value = idArr.value.map((item) => {
    if (item.signFile == null) {
      store
        .ajax({ userId: item.id }, '/auth/getsignfile', 'post')
        .then((res) => {
          item.signFile = res;
          store.preload = false;
        });
    }
    return item;
  });

  store.ajax({ id: 1 }, '/tools/getdocnum', 'post').then((res) => {
    docnum.value = res;
    store.preload = false;
  });
});
</script>
