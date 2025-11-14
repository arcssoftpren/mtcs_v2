<template>
  <div style="border: solid 1px #e0e0e0">
    <table class="w-100 myTable">
      <thead>
        <tr style="top: 3px; position: sticky; z-index: 200">
          <td colspan="10" height="226" class="bg-white">
            <table class="myTable2" height="200">
              <tbody>
                <tr>
                  <td rowspan="4" width="160" class="text-center">
                    <v-img
                      width="215"
                      :src="toolImage == null ? defaultImage : toolImage"
                    ></v-img>
                  </td>
                  <th colspan="4">LEADER WEEKLY CHECK</th>
                </tr>
                <tr>
                  <th>Tool Name</th>
                  <td>{{ selected.equipmentName }}</td>
                  <th>Register Number</th>
                  <td>{{ selected.regisNo }}</td>
                </tr>
                <tr>
                  <th>Location</th>
                  <td>{{ selected.location }}</td>
                  <th>Check Period</th>
                  <td></td>
                </tr>
                <tr>
                  <th>Inspector</th>
                  <td colspan="2">{{ store.userData.userName }}</td>
                  <td>
                    <v-btn
                      variant="flat"
                      color="primary"
                      rounded="pill"
                      @click="signReport"
                      prepend-icon="mdi-draw"
                    >
                      Sign Now
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </thead>
    </table>
    <table class="w-100 myTable">
      <thead>
        <tr>
          <th class="text-center" rowspan="2">No</th>
          <th class="text-center" rowspan="2">Item Check</th>
          <th class="text-center" rowspan="2">Methods</th>
          <th class="text-center" colspan="31">Date</th>
        </tr>

        <tr>
          <template
            v-for="(report, repIndex) in selected.reports"
            :key="repIndex"
          >
            <td
              class="text-center"
              v-for="(date, index) in report.dates"
              :key="index"
            >
              {{ moment(date).format('DD') }}
            </td>
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
            <td v-if="methodIndex == 0" :rowspan="itemValue.methods.length">
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
<style scoped>
.myTable {
  width: 100%;
}

.myTable2 {
  width: 100%;
  border-collapse: collapse;
}

.myTable2 tbody tr td {
  border: solid 1px #000000 !important;
  text-align: center;
}

.myTable tbody tr td,
.myTable tfoot tr td {
  padding: 5px;
  border: solid 1px #e0e0e0;
}

.myTable thead tr th {
  padding: 5px;
  position: sticky;
  background: rgb(255, 255, 255);
  border: solid 1px #000000;
}

.myTable tfoot tr td {
  padding: 5px;
  position: sticky;
  background: rgb(255, 255, 255);
  border: solid 1px #000000;
  bottom: 3px;
}
</style>
